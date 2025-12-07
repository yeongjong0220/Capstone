import google.generativeai as genai
import os
from dotenv import load_dotenv

# .env 로드
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ GOOGLE_API_KEY가 없습니다. .env 파일을 확인하세요.")
else:
    print(f"🔑 API Key 확인됨: {api_key[:5]}...")
    
    try:
        genai.configure(api_key=api_key)
        
        print("\n📋 [사용 가능한 모델 목록]")
        print("--------------------------------------------------")
        found_flash = False
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
                if "gemini-1.5-flash" in m.name:
                    found_flash = True
        print("--------------------------------------------------")
        
        if found_flash:
            print("✅ 'gemini-1.5-flash' 모델이 목록에 있습니다! 코드 문제는 다른 곳에 있습니다.")
        else:
            print("❌ 목록에 'gemini-1.5-flash'가 안 보입니다. API 키 설정을 다시 해야 합니다.")

    except Exception as e:
        print(f"\n🚨 에러 발생: {e}")
        print("API 키 자체가 잘못되었거나, 인터넷 연결 문제일 수 있습니다.")