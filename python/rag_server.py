import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # 🌟 [추가] CORS 미들웨어
from pydantic import BaseModel
from uvicorn import run
from dotenv import load_dotenv
from operator import itemgetter

# 1. 임베딩은 OpenAI 유지
from langchain_openai import OpenAIEmbeddings 

# 2. LLM은 Google Gemini 사용
from langchain_google_genai import ChatGoogleGenerativeAI 

from langchain_pinecone import PineconeVectorStore
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
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

    # ---------------------------------------------------------
    # 🌟 [핵심 기능] 메타데이터 포맷팅 함수
    # Pinecone의 'metadata' 필드를 끄집어내어 텍스트로 변환합니다.
    # ---------------------------------------------------------
    def format_docs_with_metadata(docs):
        formatted_results = []
        for i, doc in enumerate(docs):
            meta = doc.metadata
            content = doc.page_content
            
            # 메타데이터에서 안전하게 값 가져오기 (없으면 '정보 없음' 등)
            title = meta.get('title') or meta.get('policy_name') or "제목 없음"
            
            # 채용 공고 관련 필드
            end_date = meta.get('apply_end_date', '')
            method = meta.get('apply_method', '')
            link = meta.get('apply_link', '')
            category = meta.get('job_category', '')
            
            # 정책 관련 필드 (필요시 추가)
            target = meta.get('target_audience', '')

            # LLM에게 보여줄 텍스트 블록 조립
            doc_str = (
                f"--- [문서 {i+1}: {title}] ---\n"
                f"내용: {content}\n"
            )
            
            # 정보가 있는 경우에만 라인 추가 (깔끔하게)
            if end_date: doc_str += f"마감일: {end_date}\n"
            if method: doc_str += f"신청방법: {method}\n"
            if link: doc_str += f"링크: {link}\n"
            if category: doc_str += f"분야: {category}\n"
            if target: doc_str += f"대상: {target}\n"
            
            formatted_results.append(doc_str)
        
        return "\n\n".join(formatted_results)


    # 🌟 [프롬프트] 메타데이터 활용 지침 추가
    prompt_template = """
    당신은 사용자에게 '지역 정책' 및 '채용 공고'를 안내하는 똑똑한 AI 어시스턴트, **'Jobs(잡스)'**입니다.
    
    [🧹 데이터 정제 및 필터링 규칙 (최우선 적용)]
    1. **무의미한 알파벳/기호 절대 발설 금지:** 데이터에 "신청방법: A", "분야: B" 처럼 의미 없는 값이 있다면 언급하지 마세요.
    2. **메타데이터 적극 활용:** 제공된 [검색 결과]에는 '마감일', '링크', '신청방법' 등의 정보가 포함되어 있습니다. 질문에 답변할 때 이 세부 정보를 빠짐없이 포함하세요.

    [✨ 상황별 답변 가이드]
    **Case 1. 인사 ("안녕", "누구야"):**
    - "안녕하세요! 저는 Jobs입니다. 사용자님의 나이와 사는 곳을 분석해서 딱 맞는 정책과 일자리를 찾아드리는 역할을 합니다." (검색 결과 언급 X)
    
    **Case 2. 정보 요청:**
    - 자기소개 생략.
    - 예: "네, (지역)의 (나이)세 청년이 지원 가능한 (제목)입니다. 마감일은 (날짜)까지이며, (방법)으로 신청하실 수 있습니다."
    - **링크가 있다면 반드시 제공하세요.**

    [🔍 상세 정보 답변 규칙]
    - 사용자가 "구체적으로?"라고 물으면, 문서 내용을 바탕으로 상세히 설명하되, 없으면 솔직히 없다고 말하세요.

    [🔵 맞춤형 매칭 지침]
    - [👤 사용자 프로필 정보]와 비교하여 적합성을 판단하세요.

    [🚫 형식 제한]
    - 마크다운(Markdown), **볼드체** 사용 금지. 줄글로만 작성.

    ---
    [👤 사용자 프로필 정보]
    {user_context_prompt}

    [이전 대화 기록]
    {chat_history}
    
    [정책 및 채용 데이터 (검색 결과)]
    {context}

    [질문]
    {question}

    [Jobs의 답변]
    """
    
    PROMPT = PromptTemplate.from_template(prompt_template)

    # 🌟 [LCEL 체인 구성] (기존 ConversationalRetrievalChain 대체)
    # 1. 질문이 들어오면 -> 2. 검색기(retriever)가 문서를 찾고 -> 
    # 3. format_docs_with_metadata가 메타데이터를 텍스트로 변환 -> 4. 프롬프트 -> 5. LLM
    rag_chain = (
        {
            "context": itemgetter("question") | ensemble_retriever | format_docs_with_metadata,
            "question": itemgetter("question"),
            "chat_history": itemgetter("chat_history"),
            "user_context_prompt": itemgetter("user_context_prompt"),
        }
        | PROMPT
        | llm
        | StrOutputParser()
    )

    print("✅ RAG 챗봇 체인 초기화 완료 (LCEL 방식 + 메타데이터 연동).")

except Exception as e:
    print(f"🚨 RAG 초기화 중 심각한 오류 발생: {e}")
    print("API 키(.env), Pinecone 인덱스 이름, 라이브러리 설치를 확인하세요.")
    exit(1)


# --- 4. FastAPI 서버 설정 ---
app = FastAPI()

# 🌟 [추가] CORS 미들웨어 설정
# 모든 도메인(origins=["*"])에서의 접근을 허용합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

        # 대화 기록 포매팅 (String으로 변환)
        formatted_history_str = ""
        user_msg = None
        for turn in chat_history_list:
            if turn.get("sender") == "user":
                user_msg = turn.get("text", "")
            elif turn.get("sender") == "bot" and user_msg is not None:
                formatted_history_str += f"User: {user_msg}\nBot: {turn.get('text', '')}\n"
                user_msg = None 

        # 🌟 검색어 보정 (Query Augmentation)
        search_query = user_message
        if "나" in user_message or "내" in user_message or "조건" in user_message or "추천" in user_message:
            search_query += f" {user_keywords}"
            print(f"🔍 보정된 검색 쿼리: {search_query}")

        # 🌟 [LCEL 호출] invoke 사용
        # 이제 chain 내부에서 검색(Retriever)과 포맷팅이 자동으로 일어납니다.
        bot_reply = rag_chain.invoke({
            "question": search_query, 
            "chat_history": formatted_history_str,
            "user_context_prompt": user_context_str 
        })
        
        # 출처 표시 로직
        source_doc = "검색된 문서 기반"

        print(f"Gemini 답변: {bot_reply}")

        return {"answer": bot_reply, "source": source_doc}

    except Exception as e:
        print(f"🚨 RAG 서버 처리 중 오류: {e}")
        import traceback
        traceback.print_exc()
        return {"answer": "죄송합니다, 답변 생성 중 오류가 발생했습니다.", "source": None}


# — 5. API 서버 실행 —
if __name__ == "__main__":
    print(f"Python RAG API 서버를 8001번 포트에서 시작합니다 (http://localhost:8001)")
    run(app, host="0.0.0.0", port=8001)