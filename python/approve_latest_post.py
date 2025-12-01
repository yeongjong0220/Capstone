import mysql.connector
import os
from dotenv import load_dotenv

# 0. 설정 로드
load_dotenv()

db_config = {
    'host': os.getenv("DB_HOST"),
    'port': int(os.getenv("DB_PORT", 3306)),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'database': os.getenv("DB_NAME") 
}

def approve_latest_post():
    conn = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # 1. 가장 최근에 작성된 글 1개 찾기
        print("🔍 가장 최근에 작성된 게시물을 찾고 있습니다...")
        find_sql = "SELECT * FROM post ORDER BY post_id DESC LIMIT 1"
        cursor.execute(find_sql)
        latest_post = cursor.fetchone()

        if not latest_post:
            print("❌ 게시물이 하나도 없습니다. 웹사이트에서 먼저 글을 작성해주세요!")
            return

        print(f"\n[발견된 게시물]")
        print(f"ID: {latest_post['post_id']}")
        print(f"제목: {latest_post['title']}")
        print(f"현재 상태: status={latest_post['status']}, approved={latest_post['approved']}")

        # 2. 조건에 맞게 강제 업데이트 (승인 처리)
        # 조건: status='published', approved='Y', del='N', is_embedded='N'
        print("\n🚀 관리자 승인 처리 중...")
        update_sql = """
            UPDATE post 
            SET status = 'published', 
                approved = 'Y', 
                del = 'N', 
                is_embedded = 'N' 
            WHERE post_id = %s
        """
        cursor.execute(update_sql, (latest_post['post_id'],))
        conn.commit()

        print("✅ 승인 완료! 이제 파이썬 자동화 코드가 이 글을 가져갈 수 있습니다.")

    except mysql.connector.Error as err:
        print(f"⚠️ 에러 발생: {err}")
    finally:
        if conn and conn.is_connected():
            conn.close()

if __name__ == "__main__":
    approve_latest_post()