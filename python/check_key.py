from pinecone import Pinecone
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("PINECONE_API_KEY")
pc = Pinecone(api_key=api_key)

# 1. 옛날 정책 인덱스 연결
index_name = "policy-chatbot" 
index = pc.Index(index_name)

print(f"🕵️ '{index_name}' 인덱스 내부 데이터를 확인합니다...")

# 2. 아무 데이터나 하나 검색해서 가져오기
# (임의의 벡터로 1개 검색)
dummy_vector = [0.1] * 1536  # OpenAI 차원수
results = index.query(
    vector=dummy_vector,
    top_k=1,
    include_metadata=True
)

if results['matches']:
    match = results['matches'][0]
    print("\n✅ 데이터 발견! 메타데이터 키 목록:")
    print("--------------------------------------------------")
    print(f"ID: {match['id']}")
    print("Keys:", list(match['metadata'].keys()))
    print("--------------------------------------------------")
    print("내용 예시 (일부):")
    print(match['metadata'])
else:
    print("❌ 데이터가 없습니다.")