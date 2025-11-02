# 캡스톤 프로젝트: 지역 정책 AI 챗봇

이 프로젝트는 React(프론트엔드), Node.js(백엔드), Python(AI) 3개의 서버를 동시에 실행해야 정상적으로 작동합니다.

---

## ⚠️ 1. 필수 설정 (`.env` 파일)

프로젝트를 실행하기 전, **Python AI 서버**에 API 키를 설정해야 합니다.

1.  `python` 폴더 (`rag_server.py`가 있는 곳)로 이동합니다.
2.  `.env`라는 이름의 **새 파일을 생성**합니다.
3.  아래 내용을 복사하여 붙여넣고, **자신의 API 키**로 값을 채워주세요. (API 키는 담당자에게 받으세요.)

**`python/.env` 파일 내용:**
```ini
# OpenAI API 키
OPENAI_API_KEY="sk-..."

# Pinecone API 키
PINECONE_API_KEY="..."
```
*(참고: `node` 폴더의 `.env` 파일은 포트 설정용이며, 이미 포함되어 있으므로 수정할 필요 없습니다.)*

---

## 🚀 2. 프로젝트 실행 방법

아래 3개의 서버를 **각각 다른 터미널 창**에서 실행해야 합니다.

### 1. (터미널 1) 백엔드 (Node.js) 서버 실행

```bash
# 1. node 폴더로 이동
cd node

# 2. 필요한 라이브러리 설치 (최초 1회)
npm install

# 3. 서버 실행
# (Windows)
npx nodemon server.js
# (macOS)
npx nodemon server.js
```
> ✅ **성공 확인:** `서버 실행 중 http://localhost:8000` 메시지가 뜨면 성공입니다.

### 2. (터미널 2) 프론트엔드 (React) 서버 실행

```bash
# 1. react 폴더로 이동
cd react

# 2. 필요한 라이브러리 설치 (최초 1회)
npm install

# 3. 서버 실행
npm run dev
```
> ✅ **성공 확인:** `http://localhost:5173` 주소가 터미널에 뜨면 성공입니다.

### 3. (터미널 3) AI 챗봇 (Python) 서버 실행

Python 환경은 충돌(ModuleNotFoundError)을 피하기 위해 **가상환경(`venv`)**을 사용해야 합니다. **VS Code로 실행하는 것을 강력히 권장합니다.**

#### (권장) VS Code로 실행하는 법 (macOS & Windows 공통)

1.  **Visual Studio Code**로 이 `Capstone` 폴더를 엽니다.
2.  `python/rag_server.py` 파일을 클릭합니다.
3.  VS Code가 하단에 **"가상 환경(.venv)을 만들어 종속성을 격리하시겠습니까?"**라는 알림을 띄우면 **"예(Create Virtual Environment)"**를 클릭합니다.
    * 환경 관리자는 **`Venv`**를 선택합니다.
    * Python 인터프리터는 **Conda가 아닌** `Python 3.10` 이상의 '순정' 버전을 선택합니다.
4.  `.venv` 폴더가 생성되면, VS Code 상단 메뉴에서 `Terminal` > `New Terminal`을 켭니다.
5.  터미널 맨 앞에 **`(.venv)`**가 자동으로 뜨는지 확인합니다. (이것으로 '전용 방'에 들어온 것입니다.)
6.  **바로 그 터미널**에서 아래 명령어를 입력해 라이브러리를 설치합니다.
    ```bash
    # (Capstone 루트 폴더에서 실행)
    pip install -r python/requirements.txt
    ```
7.  설치가 완료되면, 서버를 실행합니다.
    ```bash
    python python/rag_server.py
    ```

#### (수동) 터미널에서 직접 실행하는 법 (macOS 기준)

1.  `python` 폴더로 이동합니다.
    ```bash
    cd python
    ```
2.  `venv` 가상환경을 만듭니다. (최초 1회)
    ```bash
    python3 -m venv .venv 
    ```
3.  가상환경을 활성화합니다.
    ```bash
    source .venv/bin/activate
    ```
4.  터미널 맨 앞에 `(.venv)`가 뜨면, 라이브러리를 설치합니다.
    ```bash
    pip install -r requirements.txt
    ```
5.  서버를 실행합니다.
    ```bash
    python rag_server.py
    ```

> ✅ **성공 확인:** `Uvicorn running on http://0.0.0.0:8001` 메시지가 뜨면 성공입니다.

---

## 💻 3. 접속

3개의 서버가 모두 켜진 상태에서, 웹 브라우저를 열고 아래 주소로 접속하세요.

**http://localhost:5173**