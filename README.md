chat 페이지 생성, 파이썬 코드로 gpt API와 파인콘 연결 <br>
노드 리액트 파일도  이게 맞게 수정 완료<br>
아래는 실행 방법<br>

1. python 폴더에 .env 파일 만들기
   <code>
OPENAI_API_KEY="sk-..."
PINECONE_API_KEY="..." </code>

2. 노드, 리액트 터미널 이전과 동일하게 실행

3. 파이썬 터미널 실행
   <code>
cd python
pip install fastapi uvicorn langchain langchain-openai langchain-pinecone python-dotenv
python rag_server.py</code>

주의! npx nodemon server.js 가 잘 안되면 Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process 실행 <br>
주의! 모듈관련 오류가 뜨면 노드 터미널에 npm install node-fetch 실행
