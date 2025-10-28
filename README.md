chat 페이지 생성, 파이썬 코드로 gpt API와 파인콘 연결,노드 리액트 파일도 수정
아래는 실행 방법입니다.

1. python 폴더에 .env 파일 만들기
   <code>
OPENAI_API_KEY="sk-..."
PINECONE_API_KEY="..." </code>

2. 노드, 리액트 터미널 이전과 동일하게 실행

3. 파이썬 터미널 실행
   <code>
cd python_rag_server
pip install fastapi uvicorn langchain langchain-openai langchain-pinecone python-dotenv
python rag_server.py</code>
