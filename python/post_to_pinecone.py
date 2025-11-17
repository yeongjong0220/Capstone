import mysql.connector
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
import os
from dotenv import load_dotenv
import time
from datetime import datetime

# -----------------------------------------------
# 0. 설정 로드
# -----------------------------------------------
print("설정을 로드합니다...")
load_dotenv()

# OpenAI 설정
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSION = 1536

# Pinecone 설정
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = "job-postings-index"

# DB 설정
db_config = {
    'host': 'capstone-choi.c21iu2qqwmva.us-east-1.rds.amazonaws.com',
    'user': 'root',
    'password': os.getenv("DB_PASSWORD"),
    'database': os.getenv("DB_NAME") 
}
TABLE_NAME = "job_postings"
BATCH_SIZE = 100 
CHECK_INTERVAL = 60 # 60초(1분)마다 확인

# -----------------------------------------------
# 1. Pinecone 초기화 (최초 1회)
# -----------------------------------------------
pc = Pinecone(api_key=PINECONE_API_KEY)

if PINECONE_INDEX_NAME not in pc.list_indexes().names():
    print(f"'{PINECONE_INDEX_NAME}' 인덱스 생성 중...")
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=EMBEDDING_DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(cloud='aws', region='us-east-1')
    )
    while not pc.describe_index(PINECONE_INDEX_NAME).status['ready']:
        time.sleep(1)

index = pc.Index(PINECONE_INDEX_NAME)
print("✅ Pinecone 인덱스 연결 완료. 자동화 시스템을 가동합니다.\n")

# -----------------------------------------------
# 2. 공고 처리 함수
# -----------------------------------------------
def process_new_postings():
    conn = None
    try:
        conn = mysql.connector.connect(**db_config)
        # dictionary=True: DB 결과를 딕셔너리 {key: value} 형태로 가져옴
        cursor = conn.cursor(dictionary=True)

        # [핵심 쿼리 수정]
        # status가 'published' 인 것만 가져옵니다. (draft 제외)
        # approved='Y', del='N', is_embedded='N' 조건도 포함
        query = f"""
            SELECT * FROM {TABLE_NAME} 
            WHERE status = 'published' 
            AND approved = 'Y' 
            AND del = 'N' 
            AND (is_embedded = 'N' OR is_embedded IS NULL)
        """
        cursor.execute(query)
        new_data = cursor.fetchall()

        if not new_data:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 새로운 게시 공고 없음. 대기 중...")
            return

        print(f"\n📢 {len(new_data)}개의 '게시됨(published)' 공고 발견! 처리 시작...")

        vectors_to_upsert = []
        processed_ids = [] 

        for row in new_data:
            try:
                # (A) 임베딩 텍스트 조합
                text_to_embed = f"제목: {row['title']}\n요약: {row.get('summary', '')}\n내용: {row['content']}"

                # (B) 임베딩 생성
                response = openai_client.embeddings.create(
                    input=text_to_embed,
                    model=EMBEDDING_MODEL
                )
                vector = response.data[0].embedding

                # (C) 메타데이터 준비 (리스트 변환 포함)
                tags_list = [t.strip() for t in row['tags'].split(',')] if row.get('tags') else []
                audience_list = [a.strip() for a in row['target_audience'].split(',')] if row.get('target_audience') else []

                metadata = {
                    "title": row.get('title'),
                    "status": row.get('status'), # 메타데이터에도 status 포함
                    "summary": row.get('summary'),
                    "job_category": row.get('job_category'),
                    "employment_type": row.get('employment_type'),
                    "required_experience": row.get('required_experience'),
                    "region": row.get('region'),
                    "company_name": row.get('company_name'),
                    "source_url": row.get('source_url'),
                    "apply_method": row.get('apply_method'),
                    "apply_link": row.get('apply_link'),
                    "tags": tags_list,
                    "target_audience": audience_list,
                    "apply_start_date": row['apply_start_date'].isoformat() if row.get('apply_start_date') else None,
                    "apply_end_date": row['apply_end_date'].isoformat() if row.get('apply_end_date') else None,
                }

                vectors_to_upsert.append({
                    "id": str(row['post_id']),
                    "values": vector,
                    "metadata": metadata
                })
                
                processed_ids.append(row['post_id'])

            except Exception as e:
                print(f"❌ ID {row['post_id']} 처리 중 에러: {e}")

        # (D) Pinecone 업로드 & DB 업데이트
        if vectors_to_upsert:
            index.upsert(vectors=vectors_to_upsert)
            print(f"✅ Pinecone에 {len(vectors_to_upsert)}개 데이터 업로드 완료.")

            # DB에 '처리완료(Y)' 표시 -> 다음에 다시 안 가져오게 함
            if processed_ids:
                format_strings = ','.join(['%s'] * len(processed_ids))
                update_query = f"UPDATE {TABLE_NAME} SET is_embedded = 'Y' WHERE post_id IN ({format_strings})"
                
                cursor = conn.cursor() # 딕셔너리 커서 말고 일반 커서 사용
                cursor.execute(update_query, tuple(processed_ids))
                conn.commit()
                print(f"✅ DB 업데이트 완료: {len(processed_ids)}개 공고 'is_embedded' -> 'Y'")

    except mysql.connector.Error as err:
        print(f"⚠️ DB 연결 오류: {err}")
    finally:
        if conn and conn.is_connected():
            conn.close()

# -----------------------------------------------
# 3. 메인 실행 (무한 루프)
# -----------------------------------------------
if __name__ == "__main__":
    print("🚀 실시간 공고 감시 시스템(Status 필터 적용) 시작 (Ctrl+C로 종료)")
    
    try:
        while True:
            process_new_postings()
            time.sleep(CHECK_INTERVAL) # 60초마다 반복
    except KeyboardInterrupt:
        print("\n🛑 시스템을 종료합니다.")