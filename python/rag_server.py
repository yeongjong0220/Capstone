import os
from fastapi import FastAPI
from pydantic import BaseModel
from uvicorn import run
from dotenv import load_dotenv

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain.chains import ConversationalRetrievalChain 
from langchain.prompts import PromptTemplate
from langchain.retrievers import EnsembleRetriever # ⭐️ 핵심 모듈 추가
from typing import List, Dict, Any

# --- 1. .env 파일에서 API 키 로드 ---
load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
if not os.getenv("PINECONE_API_KEY"):
    raise ValueError("PINECONE_API_KEY가 .env 파일에 설정되지 않았습니다.")


# --- 2. ✌️ 두 개의 인덱스 설정 ---
INDEX_NAME_POLICY = "policy-chatbot"      # 기존 정책 데이터
INDEX_NAME_JOB = "job-postings-index"     # 신규 채용 공고 데이터
# ---------------------------------------------


# --- 3. RAG 챗봇 핵심 구성 요소 초기화 ---
try:
    print("RAG 챗봇 구성 요소를 초기화합니다...")

    llm = ChatOpenAI(
        model_name="gpt-3.5-turbo",
        temperature=0.0
    )

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    # ---------------------------------------------------------
    # 🔍 1번 검색기: 정책 데이터 (policy-chatbot)
    # ---------------------------------------------------------
    print(f"📡 인덱스 1 연결 중: {INDEX_NAME_POLICY}")
    vectorstore_policy = PineconeVectorStore.from_existing_index(
        index_name=INDEX_NAME_POLICY,
        embedding=embeddings,
        text_key="embedding_text" # ⚠️ 기존 정책 데이터의 키 (변경 금지)
    )
    retriever_policy = vectorstore_policy.as_retriever(
        search_type="similarity",
        search_kwargs={'k': 2} # 정책에서 2개 검색
    )

    # ---------------------------------------------------------
    # 🔍 2번 검색기: 채용 공고 (job-postings-index)
    # ---------------------------------------------------------
    print(f"📡 인덱스 2 연결 중: {INDEX_NAME_JOB}")
    vectorstore_job = PineconeVectorStore.from_existing_index(
        index_name=INDEX_NAME_JOB,
        embedding=embeddings,
        text_key="context_text" # ⚠️ 신규 채용 데이터의 키 (변경 금지)
    )
    retriever_job = vectorstore_job.as_retriever(
        search_type="similarity",
        search_kwargs={'k': 2} # 채용 공고에서 2개 검색
    )

    # ---------------------------------------------------------
    # 🤝 앙상블 검색기 (두 결과를 합침)
    # ---------------------------------------------------------
    print("🔗 두 검색기를 하나로 통합(Ensemble)합니다...")
    ensemble_retriever = EnsembleRetriever(
        retrievers=[retriever_policy, retriever_job],
        weights=[0.5, 0.5] # 중요도를 5:5로 설정
    )


    # 프롬프트 템플릿 (7원칙 유지)
    prompt_template = """
    당신은 사용자에게 '지역 정책' 및 '채용 공고'를 쉽고 친절하게 안내하는 전문 AI 챗봇입니다.
    항상 사용자의 관점에서 생각하며, 명확하고 신뢰할 수 있는 말투로 답변해 주세요.

    [답변 생성 7원칙]
    1.  **친절하고 전문적인 말투:** 항상 상냥하고 친절한 어조를 유지하며, 내용을 전달할 때는 **객관적이고 권위 있는** 용어를 사용해 신뢰감을 주세요.
    2.  **가독성 있는 형식:** 답변이 길어질 경우, **줄바꿈**, **글머리 기호(•)**, **번호 매기기**를 적극적으로 사용해 내용을 명확하게 구분하여 가독성을 높여야 합니다.
    
    3.  **(🚨정보 직접 제시 및 완전성):**
        * **절대로 답변 내용에 내부 용어인 '[정책 데이터]', '[참고 자료]', 또는 '자세한 내용은 자료를 확인하세요'와 같은 회피성 문구를 언급하거나 포함해서는 안 됩니다.**
        * **[정책 데이터]에 포함된 '제목(정책명)', '대상', '내용', '신청방법', '문의처', '링크' 등**의 **모든 상세 정보를 찾아서 사용자 답변에 직접, 완전하게 포함**시켜야 합니다.
    
    4.  **(🌟통합 및 적합성 검토):**
        * **[다중 결과 통합]:** 만약 여러 개의 관련 정보(`{context}`)가 검색되었다면, 이를 통합하여 사용자 질문에 가장 적합한 **핵심 정보 1~2개**를 우선순위로 명확하게 제시하세요.
        * **[유효성 검토]:** 정보에 유효 기간이나 마감일이 명시되어 있다면, 현재 유효한지 언급하거나 확인이 필요함을 안내하세요.

    5.  **(✅정확성 및 안전성 확보):**
        * 답변은 반드시 아래 [정책 데이터]에 근거해야 하며, 자료에 없는 내용을 추측하거나 지어내지 마세요.
        * **[링크 규칙]:** '신청방법'이나 '링크' 등에 'http://' 또는 'https://'로 시작하는 실제 URL이 명확히 포함된 경우에만 해당 링크를 제시하며, **자료에 실제 URL이 없다면 절대 가상의 링크를 지어내지 마세요.**

    6.  **정중한 거절:** [정책 데이터]를 검토해도 질문에 대한 적절한 정보를 찾을 수 없다면, "죄송합니다. 문의하신 내용에 대한 정보를 찾지 못했습니다. 더 구체적인 키워드로 질문해 주시겠어요?"와 같이 정중하게 답변하세요.

    7.  **(➡️다음 행동 유도):** 답변을 완료한 후, 사용자에게 가장 유용할 만한 **다음 단계(Next Step)**를 제안하며 대화를 마무리합니다.

    ---
    (참고: 아래 [이전 대화 기록]은 답변 생성을 위한 맥락 정보입니다.)
    
    [이전 대화 기록]
    {chat_history}
    
    (참고: 아래 [정책 데이터]는 현재 질문에 대한 검색 결과입니다.)

    [정책 데이터]
    {context}

    [질문]
    {question}

    [친절한 답변]
    """
    PROMPT = PromptTemplate(
        template=prompt_template, input_variables=["context", "chat_history", "question"]
    )

    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        # ⭐️ 여기서 앙상블 검색기를 사용합니다.
        retriever=ensemble_retriever,
        combine_docs_chain_kwargs={"prompt": PROMPT},
        return_source_documents=True
    )

    print("✅ RAG 챗봇 체인 초기화 완료 (정책+채용 통합).")

except Exception as e:
    print(f"🚨 RAG 초기화 중 심각한 오류 발생: {e}")
    print("API 키, Pinecone 인덱스 이름, 라이브러리 설치를 확인하세요.")
    exit(1)


# --- 4. FastAPI 서버 설정 ---
app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]] = []

class ChatResponse(BaseModel):
    answer: str
    source: str | None = None

@app.post("/ask", response_model=ChatResponse)
async def ask_question(request: ChatRequest):
    try:
        user_message = request.message
        chat_history_list = request.history
        
        print(f"Node.js로부터 받은 질문: {user_message}")

        formatted_history = []
        user_msg = None
        for turn in chat_history_list:
            if turn.get("sender") == "user":
                user_msg = turn.get("text", "")
            elif turn.get("sender") == "bot" and user_msg is not None:
                formatted_history.append((user_msg, turn.get("text", "")))
                user_msg = None 

        response = qa_chain.invoke({
            "question": user_message, 
            "chat_history": formatted_history
        })
        
        bot_reply = response['answer']
        
        # 출처 표시 로직 개선 (여러 인덱스에서 섞여 나올 수 있음)
        source_doc = "출처 정보 없음"
        if response.get('source_documents'):
            # 가장 관련성 높은 첫 번째 문서의 메타데이터 확인
            metadata = response['source_documents'][0].metadata
            # 1. 채용 공고인 경우 'title'
            # 2. 정책 데이터인 경우 'policy_name'
            source_doc = metadata.get('title') or metadata.get('policy_name', '출처 정보 없음')

        print(f"LLM이 생성한 답변: {bot_reply}")
        print(f"답변 근거: {source_doc}")

        return {"answer": bot_reply, "source": source_doc}

    except Exception as e:
        print(f"🚨 RAG 서버 처리 중 오류: {e}")
        return {"answer": "죄송합니다, Python RAG 서버에서 답변 생성 중 오류가 발생했습니다.", "source": None}


# --- 5. API 서버 실행 ---
if __name__ == "__main__":
    
    print("--- [RAG 체인 통합 테스트 시작] ---")
    try:
        # 테스트 1: 정책 질문
        test_query_1 = "광주 청년 정책 알려줘"
        print(f"\n[테스트 1] 질문: {test_query_1}")
        resp1 = qa_chain.invoke({"question": test_query_1, "chat_history": []})
        print(f"답변: {resp1['answer'][:50]}...") # 너무 기니까 앞부분만

        # 테스트 2: 채용 질문 (시연용 공고가 있다고 가정)
        test_query_2 = "신입 개발자 채용 공고 있어?"
        print(f"\n[테스트 2] 질문: {test_query_2}")
        resp2 = qa_chain.invoke({"question": test_query_2, "chat_history": []})
        print(f"답변: {resp2['answer'][:50]}...")

        print("\n--- [✅ RAG 체인 통합 테스트 성공] ---")

    except Exception as e:
        print(f"--- [🚨 RAG 체인 통합 테스트 실패] ---")
        print(f"오류 발생: {e}")
        print("-----------------------------------")

    print(f"Python RAG API 서버를 8001번 포트에서 시작합니다 (http://localhost:8001)")
    run(app, host="0.0.0.0", port=8001)