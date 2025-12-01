import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# AWS DB 접속 설정 (.env 파일 사용)
db_config = {
    'host': os.getenv("DB_HOST"),
    'port': int(os.getenv("DB_PORT", 3306)),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'database': os.getenv("DB_NAME") 
}

try:
    print("DB에 접속 중...")
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    # 1. user 테이블의 컬럼 정보(구조) 가져오기
    print("\n[ user 테이블의 컬럼 목록 ]")
    cursor.execute("DESCRIBE user")
    columns = cursor.fetchall()
    
    for col in columns:
        print(f"- {col['Field']}") # 컬럼 이름만 출력

    # 2. 내 아이디 정보 확인해보기 (가입한 아이디가 있다면)
    # 여기에 본인이 가입한 아이디를 넣어보세요. 없으면 그냥 넘어갑니다.
    my_id = "test_corp" 
    
    # *주의: 실제 컬럼명을 아직 모르니 일단 전체(*)를 가져옵니다.
    print(f"\n[ 아이디 '{my_id}'의 현재 정보 ]")
    # 'id'라는 컬럼이 아이디인지, 'email'이 아이디인지 모르므로 일단 전체 5명만 출력해봅니다.
    cursor.execute("SELECT * FROM user LIMIT 5")
    users = cursor.fetchall()
    for u in users:
        print(u)

except mysql.connector.Error as err:
    print(f"⚠️ 에러 발생: {err}")
finally:
    if 'conn' in locals() and conn.is_connected():
        conn.close()