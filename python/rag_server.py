import os
from fastapi import FastAPI
from pydantic import BaseModel
from uvicorn import run
from dotenv import load_dotenv

# 1. 임베딩은 OpenAI 유지
from langchain_openai import OpenAIEmbeddings 

# 2. LLM은 Google Gemini 사용
from langchain_google_genai import ChatGoogleGenerativeAI 

from langchain_pinecone import PineconeVectorStore
from langchain.chains import ConversationalRetrievalChain 
from langchain.prompts import PromptTemplate
from langchain.retrievers import EnsembleRetriever 
from typing import List, Dict, Any

# --- 1. .env 파일에서 API 키 로드 ---
load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
if not os.getenv("PINECONE_API_KEY"):
    raise ValueError("PINECONE_API_KEY가 .env 파일에 설정되지 않았습니다.")
if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY가 .env 파일에 설정되지 않았습니다.")


# --- 2. ✌️ 두 개의 인덱스 설정 ---
INDEX_NAME_POLICY = "policy-chatbot"      # 기존 정책 데이터
INDEX_NAME_JOB = "job-postings-index"     # 신규 채용 공고
# ---------------------------------------------


# --- 3. RAG 챗봇 핵심 구성 요소 초기화 ---
try:
    print("RAG 챗봇 구성 요소를 초기화합니다...")

    # 🌟 [모델] Gemini 2.0 Flash Exp
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash-exp", 
        temperature=0.0
    )

    # ⚠️ [임베딩] OpenAI
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    # ---------------------------------------------------------
    # 🔍 1번 검색기: 정책 데이터
    # ---------------------------------------------------------
    print(f"📡 인덱스 1 연결 중: {INDEX_NAME_POLICY}")
    vectorstore_policy = PineconeVectorStore.from_existing_index(
        index_name=INDEX_NAME_POLICY,
        embedding=embeddings,
        text_key="embedding_text"
    )
    retriever_policy = vectorstore_policy.as_retriever(
        search_type="similarity",
        search_kwargs={'k': 3} 
    )

    # ---------------------------------------------------------
    # 🔍 2번 검색기: 채용 공고
    # ---------------------------------------------------------
    print(f"📡 인덱스 2 연결 중: {INDEX_NAME_JOB}")
    vectorstore_job = PineconeVectorStore.from_existing_index(
        index_name=INDEX_NAME_JOB,
        embedding=embeddings,
        text_key="context_text"
    )
    retriever_job = vectorstore_job.as_retriever(
        search_type="similarity",
        search_kwargs={'k': 3} 
    )

    # ---------------------------------------------------------
    # 🤝 앙상블 검색기 (통합)
    # ---------------------------------------------------------
    print("🔗 두 검색기를 하나로 통합(Ensemble)합니다...")
    ensemble_retriever = EnsembleRetriever(
        retrievers=[retriever_policy, retriever_job],
        weights=[0.5, 0.5]
    )


    # 🌟 [프롬프트 수정] 'Jobs' 페르소나 주입
    prompt_template = """
    당신의 이름은 **'Jobs'**입니다.
    당신은 사용자에게 '지역 정책' 및 '채용 공고'를 명확하고 신뢰감 있게 안내하는 AI 어시스턴트입니다.
    사용자의 화면에는 텍스트만 표시되므로, **특수문자나 마크다운(Markdown) 형식을 절대 사용하지 말고** 줄글 형태로 답변해 주세요.

    [🔴 특별 지침: 인사 및 자기소개]
    * 사용자가 "안녕", "반가워", "누구니" 등 단순 인사를 하거나 자기소개를 요청할 경우:
        1. **절대** [정책 데이터]나 [검색 결과]를 억지로 언급하지 마세요.
        2. **"안녕하세요, Jobs입니다. 찾으시는 정책이나 혜택이 있다면 무엇이든 물어봐 주세요."** 라고 답변하세요.

    [🚫 데이터 필터링 및 관련성 검증 규칙]
    1.  **알파벳 코드 삭제:** '분야', '신청방법' 등이 'A', 'B', 'C' 등 의미 없는 알파벳으로만 된 경우 답변에서 아예 생략하세요.
    2.  **동문서답 금지:** 주제가 맞지 않는 정보(예: 정책 질문에 채용 공고 답변)는 추천하지 말고 과감히 "관련 정보를 찾을 수 없다"고 하세요.

    [👤 사용자 프로필 정보]
    {user_context_prompt}

    [답변 생성 원칙]
    1.  **맞춤형 추천:** 사용자 프로필(나이, 지역)과 일치하는 정보를 우선적으로 설명하세요.
    2.  **가독성:** 마크다운 태그(bold, header 등) 사용 금지. 줄바꿈만 사용.
    3.  **정확성:** 검색된 데이터([정책 데이터])에 기반하되, 위 [🚫 관련성 검증 규칙]을 통과한 정보만 말하세요.

    ---
    [이전 대화 기록]
    {chat_history}
    
    [정책 데이터 (검색 결과)]
    {context}

    [질문]
    {question}

    [Jobs의 답변 (마크다운 없이)]
    """
    
    PROMPT = PromptTemplate(
        template=prompt_template, 
        input_variables=["context", "chat_history", "question", "user_context_prompt"]
    )

    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm, # Gemini 2.0 Flash Exp
        retriever=ensemble_retriever,
        combine_docs_chain_kwargs={"prompt": PROMPT},
        return_source_documents=True
    )

    print("✅ RAG 챗봇 체인 초기화 완료 (Gemini 2.0 Exp + OpenAI Embedding).")

except Exception as e:
    print(f"🚨 RAG 초기화 중 심각한 오류 발생: {e}")
    print("API 키(.env), Pinecone 인덱스 이름, 라이브러리 설치를 확인하세요.")
    exit(1)


# --- 4. FastAPI 서버 설정 ---
app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]] = []
    user_profile: Dict[str, Any] = {}

class ChatResponse(BaseModel):
    answer: str
    source: str | None = None

@app.post("/ask", response_model=ChatResponse)
async def ask_question(request: ChatRequest):
    try:
        user_message = request.message
        chat_history_list = request.history
        user_profile = request.user_profile 
        
        print(f"Node.js로부터 받은 질문: {user_message}")
        print(f"사용자 프로필: {user_profile}") 

        # 사용자 정보 포매팅
        user_context_str = ""
        if user_profile and (user_profile.get("age") or user_profile.get("region")):
            info_list = []
            if user_profile.get("age") and user_profile.get("age") != "알 수 없음":
                info_list.append(f"- 나이: {user_profile['age']}")
            if user_profile.get("region") and user_profile.get("region") != "알 수 없음":
                info_list.append(f"- 거주지: {user_profile['region']}")
            
            if info_list:
                user_context_str = "\n".join(info_list)
            else:
                user_context_str = "(사용자 정보 없음)"
        else:
            user_context_str = "(로그인하지 않은 사용자 또는 정보 없음)"

        formatted_history = []
        user_msg = None
        for turn in chat_history_list:
            if turn.get("sender") == "user":
                user_msg = turn.get("text", "")
            elif turn.get("sender") == "bot" and user_msg is not None:
                formatted_history.append((user_msg, turn.get("text", "")))
                user_msg = None 

        # LLM 호출
        response = qa_chain.invoke({
            "question": user_message, 
            "chat_history": formatted_history,
            "user_context_prompt": user_context_str 
        })
        
        bot_reply = response['answer']
        
        # 출처 표시 로직
        source_doc = "출처 정보 없음"
        if response.get('source_documents'):
            metadata = response['source_documents'][0].metadata
            source_doc = metadata.get('title') or metadata.get('policy_name', '출처 정보 없음')

        print(f"Gemini 답변: {bot_reply}")
        print(f"답변 근거: {source_doc}")

        return {"answer": bot_reply, "source": source_doc}

    except Exception as e:
        print(f"🚨 RAG 서버 처리 중 오류: {e}")
        return {"answer": "죄송합니다, 답변 생성 중 오류가 발생했습니다.", "source": None}


# --- 5. API 서버 실행 ---
if __name__ == "__main__":
    print(f"Python RAG API 서버를 8001번 포트에서 시작합니다 (http://localhost:8001)")
    run(app, host="0.0.0.0", port=8001)