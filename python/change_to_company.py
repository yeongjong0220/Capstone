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

def upgrade_to_company():
    conn = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # 1. 사용자에게 이메일 입력받기
        print("\n🚀 기업 회원으로 등업할 계정의 '이메일'을 입력해주세요.")
        target_email = input("이메일 입력: ").strip()

        if not target_email:
            print("❌ 이메일이 입력되지 않았습니다.")
            return

        # 2. 업데이트 실행 (type -> enterprise, approved -> Y)
        sql = """
            UPDATE user 
            SET type = 'enterprise', approved = 'Y' 
            WHERE email = %s
        """
        cursor.execute(sql, (target_email,))
        conn.commit()

        # 3. 결과 확인
        if cursor.rowcount > 0:
            print(f"\n✅ 성공! '{target_email}' 계정이 [기업 회원(enterprise)]으로 변경되었습니다.")
            print("이제 웹사이트에서 로그아웃 후 다시 로그인해서 확인해보세요!")
        else:
            print(f"\n⚠️ 실패: '{target_email}' 이메일을 가진 회원을 찾을 수 없습니다.")
            print("이메일을 정확히 입력했는지 확인해주세요.")

    except mysql.connector.Error as err:
        print(f"⚠️ 에러 발생: {err}")
    finally:
        if conn and conn.is_connected():
            conn.close()

if __name__ == "__main__":
    upgrade_to_company()