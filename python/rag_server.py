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
        search_kwargs={'k': 4} 
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
        weights=[0.6, 0.4] 
    )


    # 🌟 [프롬프트 수정] '알파벳 제거' 규칙을 최상단 강력 지침으로 이동
    prompt_template = """
    당신은 사용자에게 '지역 정책' 및 '채용 공고'를 안내하는 똑똑한 AI 어시스턴트, **'Jobs(잡스)'**입니다.
    
    [🧹 데이터 정제 및 필터링 규칙 (최우선 적용)]
    1. **무의미한 알파벳/기호 절대 발설 금지:** - 데이터에 "신청방법: A", "분야: B", "비고: -" 처럼 의미 없는 알파벳이나 기호만 적혀 있다면, **해당 항목은 아예 언급하지 마세요.**
       - ❌ 나쁜 예: "신청 방법은 A입니다."
       - ⭕ 좋은 예: (신청 방법 자체를 언급하지 않음)
    2. 정보가 없는 경우 억지로 끼워 맞추지 말고, 확실한 내용만 전달하세요.

    [✨ 상황별 답변 가이드]
    **Case 1. 사용자가 "안녕", "누구야" 등 인사를 할 때:**
    - "안녕하세요! 저는 Jobs입니다. 사용자님의 나이와 사는 곳을 분석해서 딱 맞는 정책과 일자리를 찾아드리는 역할을 합니다." 라고 자신을 소개하세요.
    - 이때는 검색된 정책 정보를 억지로 말하지 마세요.
    
    **Case 2. 사용자가 정책이나 일자리 정보를 물어볼 때:**
    - **자기소개를 생략**하고 바로 본론(정보)으로 들어가세요.
    - 답변 예시: "네, (지역)에 거주하시는 (나이) 사용자님을 위한 정보를 찾아보았습니다."

    [🔍 상세 정보 답변 규칙]
    사용자가 "구체적으로 어떤 거야?"라고 되물었을 때:
    1. 데이터에 구체적 예시가 있으면 나열하세요.
    2. 데이터에 내용이 없으면 "죄송합니다. 현재 문서에는 상세 내용이 명시되지 않았습니다."라고 솔직하게 답하세요.

    [🔵 맞춤형 매칭 지침]
    1. [👤 사용자 프로필 정보]와 [정책 데이터]의 자격요건을 비교하여 매칭 여부를 판단하세요.
    2. 조건이 맞는 정보를 우선적으로 추천하세요.

    [🚫 형식 제한]
    * 마크다운(Markdown), 특수문자, **볼드체** 사용 금지. 오직 줄글(Text)로만 답하세요.

    ---
    [👤 사용자 프로필 정보]
    {user_context_prompt}

    [이전 대화 기록]
    {chat_history}
    
    [정책 및 채용 데이터 (검색 결과)]
    {context}

    [질문]
    {question}

    [Jobs의 답변 (위 데이터 정제 규칙 엄수)]
    """
    
    PROMPT = PromptTemplate(
        template=prompt_template, 
        input_variables=["context", "chat_history", "question", "user_context_prompt"]
    )

    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm, 
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
        user_keywords = "" 
        
        if user_profile and (user_profile.get("age") or user_profile.get("region")):
            info_list = []
            if user_profile.get("age") and user_profile.get("age") != "알 수 없음":
                age_val = user_profile['age']
                info_list.append(f"- 나이: {age_val}")
                user_keywords += f" {age_val}" 
            if user_profile.get("region") and user_profile.get("region") != "알 수 없음":
                region_val = user_profile['region']
                info_list.append(f"- 거주지: {region_val}")
                user_keywords += f" {region_val}" 
            
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

        # 🌟 검색어 보정 (Query Augmentation)
        search_query = user_message
        if "나" in user_message or "내" in user_message or "조건" in user_message or "추천" in user_message:
            search_query += f" {user_keywords}"
            print(f"🔍 보정된 검색 쿼리: {search_query}")

        # LLM 호출
        response = qa_chain.invoke({
            "question": search_query, 
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