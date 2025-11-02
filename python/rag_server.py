import os
from fastapi import FastAPI
from pydantic import BaseModel
from uvicorn import run
from dotenv import load_dotenv

# LangChain 관련 모듈 임포트 111
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
# 🚨🚨🚨 이 부분이 최신 라이브러리에 맞게 수정되었습니다.
from langchain_pinecone import Pinecone as PineconeVectorStore
# from langchain_pinecone import PineconeVectorStore <-- (수정 전)

from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# --- 1. .env 파일에서 API 키 로드 ---
load_dotenv()

# .env 파일에 키가 설정되었는지 확인
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
if not os.getenv("PINECONE_API_KEY"):
    raise ValueError("PINECONE_API_KEY가 .env 파일에 설정되지 않았습니다.")


# --- 2. (⚠️ 중요) 사용자가 직접 수정할 부분 ---
# Pinecone에서 미리 생성해 둔 "인덱스 이름"을 입력하세요
# (데이터가 이미 업로드되어 있어야 합니다)
PINECONE_INDEX_NAME = "policy-chatbot"
# ---------------------------------------------

if PINECONE_INDEX_NAME == "your-pinecone-index-name-here":
    raise ValueError("PINECONE_INDEX_NAME을 rag_server.py 코드 내에서 직접 수정해야 합니다.")


# --- 3. RAG 챗봇 핵심 구성 요소 초기화 ---
try:
    print("RAG 챗봇 구성 요소를 초기화합니다...")

    # 1. LLM (언어 모델, 예: GPT-3.5)
    llm = ChatOpenAI(
        model_name="gpt-3.5-turbo",
        temperature=0.0 # 답변의 일관성을 위해 0.0으로 설정
    )

    # 2. Embedding Model (텍스트를 벡터로 변환)
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    # 3. Vector Store (Pinecone 인덱스에 연결)
    vectorstore = PineconeVectorStore.from_existing_index(
        index_name=PINECONE_INDEX_NAME,
        embedding=embeddings
    )

    # 4. Retriever (벡터 저장소에서 관련 문서를 검색)
    retriever = vectorstore.as_retriever(
        search_type="similarity", # 유사도 기반 검색
        search_kwargs={'k': 3}  # 상위 3개의 관련 문서를 가져옴
    )

    # 5. Prompt Template (LLM에게 보낼 지시문 양식)
    # (이 프롬프트를 수정하여 챗봇의 말투나 역할을 바꿀 수 있습니다)
    prompt_template = """
    당신은 '지역 정책' 전문 AI 챗봇입니다.
    반드시 아래에 제공된 [참고 자료]에 근거해서만 답변해야 합니다.
    [참고 자료]에 없는 내용은 "알 수 없습니다."라고 답변하세요.

    [참고 자료]
    {context}

    [질문]
    {question}

    [답변]
    """
    PROMPT = PromptTemplate(
        template=prompt_template, input_variables=["context", "question"]
    )

    # 6. RAG Chain (모든 구성 요소를 하나로 묶기)
    # 이 체인이 1)질문받기 2)문서검색 3)프롬프트조합 4)LLM답변생성 을 모두 처리
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff", # 'stuff'는 찾은 문서를 모두 context에 넣는 방식
        retriever=retriever,
        chain_type_kwargs={"prompt": PROMPT},
        return_source_documents=True # (선택) 답변의 근거가 된 문서를 함께 반환
    )

    print("✅ RAG 챗봇 체인 초기화 완료.")

except Exception as e:
    print(f"🚨 RAG 초기화 중 심각한 오류 발생: {e}")
    print("API 키, Pinecone 인덱스 이름, 라이브러리 설치를 확인하세요.")
    exit(1)


# --- 4. FastAPI 서버 설정 ---
app = FastAPI()

# Node.js로부터 받을 데이터 모델
class ChatRequest(BaseModel):
    message: str

# Node.js에게 보낼 데이터 모델
class ChatResponse(BaseModel):
    answer: str
    source: str | None = None # (선택) 답변의 출처

@app.post("/ask", response_model=ChatResponse)
async def ask_question(request: ChatRequest):
    """
    Node.js 백엔드로부터 질문을 받아 RAG 챗봇을 실행하고 답변을 반환합니다.
    """
    try:
        user_message = request.message
        print(f"Node.js로부터 받은 질문: {user_message}")

        # [실제 RAG 실행]
        response = qa_chain.invoke(user_message)
        
        bot_reply = response['result']
        
        # (선택) 답변의 근거가 된 문서 찾기
        source_doc = "출처 정보 없음"
        if response.get('source_documents'):
            # 첫 번째 근거 문서의 메타데이터(예: 파일명)를 가져옴
            source_doc = response['source_documents'][0].metadata.get('source', '출처 정보 없음')

        print(f"LLM이 생성한 답변: {bot_reply}")
        print(f"답변 근거: {source_doc}")

        # Node.js에게 JSON 형태로 답변 반환
        return {"answer": bot_reply, "source": source_doc}

    except Exception as e:
        print(f"🚨 RAG 서버 처리 중 오류: {e}")
        return {"answer": "죄송합니다, Python RAG 서버에서 답변 생성 중 오류가 발생했습니다.", "source": None}


# --- 5. API 서버 실행 ---
if __name__ == "__main__":
    print(f"Python RAG API 서버를 8001번 포트에서 시작합니다 (http://localhost:8001)")
    run(app, host="0.0.0.0", port=8001)