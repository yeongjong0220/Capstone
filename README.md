실행 가이드
이 프로젝트는 프론트엔드(React), 백엔드(Node.js), AI 챗봇(Python) 3개의 서버를 동시에 실행해야 정상적으로 작동합니다.

## ⚠️ 중요! .env 파일 설정
실행하기 전, 각 서버 폴더에 API 키와 포트 정보를 담은 .env 파일을 생성해야 합니다. 이 파일은 보안상 GitHub에 업로드되지 않습니다.

1. node 폴더
node 폴더 최상위에 .env 파일을 생성하고 아래 내용을 입력하세요. (백엔드 8000번, 프론트엔드 5173번 포트 기준입니다.)

Ini, TOML

# Node.js 백엔드 서버가 실행될 포트
BACK_PORT=8000

# React 프론트엔드 서버 주소 (CORS 허용 목적)
FRONT_SERVER=http://localhost:5173
2. python 폴더 (AI 챗봇 서버)
python 폴더(<code>rag_server.py</code>가 있는 곳) 최상위에 .env 파일을 생성하고 아래 내용을 입력하세요.

Ini, TOML

# OpenAI API 키
OPENAI_API_KEY="sk-..."

# Pinecone API 키
PINECONE_API_KEY="..."
## 🚀 프로젝트 실행 방법
아래 3개의 서버를 각각 다른 터미널 창에서 실행해야 합니다.

1. (터미널 1) 백엔드 (Node.js) 서버 실행
Bash

# 1. node 폴더로 이동
cd node

# 2. 필요한 라이브러리 설치 (최초 1회)
npm install

# 3. 서버 실행 (nodemon 기준)
npx nodemon server.js
✅ 성공 확인: 서버 실행 중 http://localhost:8000 메시지가 뜨면 성공입니다.

2. (터미널 2) 프론트엔드 (React) 서버 실행
Bash

# 1. react 폴더로 이동
cd react

# 2. 필요한 라이브러리 설치 (최초 1회)
npm install

# 3. 서버 실행
npm run dev
✅ 성공 확인: http://localhost:5173 주소가 터미널에 뜨면 성공입니다.

3. (터미널 3) AI 챗봇 (Python) 서버 실행
Bash

# 1. python 폴더로 이동
cd python_rag_server

# 2. 필요한 라이브러리 설치 (최초 1회)
pip install -r requirements.txt
# (만약 requirements.txt가 없다면: pip install fastapi uvicorn langchain langchain-openai langchain-pinecone python-dotenv)

# 3. 서버 실행
python rag_server.py
✅ 성공 확인: Uvicorn running on http://0.0.0.0:8001 메시지가 뜨면 성공입니다.

## 💻 접속
3개의 서버가 모두 켜진 상태에서, 웹 브라우저를 열고 아래 주소로 접속하세요.

http://localhost:5173
