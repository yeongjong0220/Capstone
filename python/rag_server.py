import os
from fastapi import FastAPI
from pydantic import BaseModel
from uvicorn import run
from dotenv import load_dotenv

# LangChain 관련 모듈 임포트
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# --- 1. .env 파일에서 API 키 로드 ---
load_dotenv()

# .env 파일에 키가 설정되었는지 확인
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
if not os.getenv("PINECONE_API_KEY"):
    raise ValueError("PINECONE_API_KEY가 .env 파일에 설정되지 않았습니다.")


# --- 2. Pinecone 인덱스 이름 설정 ---
PINECONE_INDEX_NAME = "policy-chatbot"


# --- 3. RAG 챗봇 핵심 구성 요소 초기화 ---
try:
    print("RAG 챗봇 구성 요소를 초기화합니다...")

    # 1. LLM (언어 모델)
    llm = ChatOpenAI(
        model_name="gpt-3.5-turbo",
        temperature=0.0
    )

    # 2. Embedding Model (친구분의 스크립트와 동일 모델)
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    # 3. Vector Store (Pinecone 인덱스에 연결)
    vectorstore = PineconeVectorStore.from_existing_index(
        index_name=PINECONE_INDEX_NAME,
        embedding=embeddings,
        text_key='embedding_text'  # 친구분의 업로드 스크립트와 맞춤
    )

    # 4. Retriever (벡터 저장소에서 관련 문서를 검색)
    
    # [ ⭐️ 수정된 부분 (오타 수정) ⭐️ ]
    # 'as_retrieve' (X) -> 'as_retriever' (O)
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={'k': 3}
    )
    # [ ⭐️ 수정 끝 ⭐️ ]

    # 5. Prompt Template (LLM에게 보낼 지시문 양식)
    prompt_template = """
    안녕하세요! 당신은 사용자에게 '지역 정책' 정보를 친절하고 정확하게 안내하는 AI 챗봇입니다.
    당신의 임무는 아래 [참고 자료]와 [질문]을 바탕으로 명확하고 가독성 높은 답변을 생성하는 것입니다.

    [지침]
    1.  **친절한 안내:** 항상 친절하고 전문적인 어조를 유지하며, 사용자에게 도움이 되는 방향으로 답변합니다.
    2.  **오타 유연성:** 사용자의 [질문]에 오타가 있더라도, 문맥을 최대한 파악하여 가장 관련성이 높은 정책을 [참고 자료]에서 찾아 답변해 주세요.
    3.  **핵심 정보 활용:** [참고 자료] (metadata)에 포함된 'policy_name'(정책명), 'target'(대상), 'details'(주요내용), 'application_method'(신청방법) 정보를 모두 활용하여 구체적인 답변을 생성합니다.
    
    4.  **가독성 높은 재구성 (매우 중요!):**
        * [참고 자료]에는 "대상: 구직단념청년", "주요내용: 심리상담"과 같이 '키: 값' 형식의 텍스트가 포함되어 있습니다.
        * 답변을 생성할 때, 이 "대상:", "주요내용:" 같은 **키워드와 콜론(:)을 절대로 그대로 출력하면 안 됩니다.**
        * [참고 자료]의 내용을 완벽히 이해한 뒤, **완전히 새로운 문장과 목록으로 재구성**해야 합니다.
        * 항상 **적절한 줄 바꿈(newlines)**과 **글머리 기호(- 또는 *)**를 사용하여 항목을 명확하게 구분하고, 사용자가 읽기 편한 형식으로 만드세요.
        * (좋은 예시): 
            "네, '청년도전 지원사업'에 대해 안내해 드릴게요.
            이 사업은 ...을 지원하는 프로그램입니다.

            ■ 지원 대상
            - 구직단념청년
            - 자립준비 청년 (18~34세)
            
            ■ 주요 혜택
            - 심리상담
            - 진로탐색 프로그램"
        * (나쁜 예시): "...자세한 내용은 다음과 같습니다: - **대상:** 구직단념, 자립준비 청년"

    5.  **링크/연락처 제공:** [참고 자료]의 'application_method'나 'details' 항목에 공식 웹사이트 URL, 연락처 또는 신청 장소가 포함되어 있다면, 이를 **반드시** 답변에 포함시켜 사용자가 다음 행동을 할 수 있도록 안내해 주세요. (예: "신청은 ...에서 하실 수 있습니다.")
    
    6.  **정보가 없을 경우:**
        * [참고 자료]에서 [질문]과 관련된 내용을 찾을 수 없다면, "알 수 없습니다."라고 딱딱하게 말하지 마세요.
        * 대신, "죄송합니다, 현재 제가 가진 정보 중에는 문의하신 '{question}' 관련 내용을 찾을 수 없습니다. 더 정확한 정보는 전라남도 공식 웹사이트나 관련 부서(예: 일자리경제진흥원 등)에 직접 문의해 보시는 것을 권해드립니다."와 같이 정중하게 공식 정보를 찾을 수 있는 경로를 안내해 주세요.

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
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": PROMPT},
        return_source_documents=True 
    )

    print("✅ RAG 챗봇 체인 초기화 완료.")

except Exception as e:
    print(f"🚨 RAG 초기화 중 심각한 오류 발생: {e}")
    print("API 키, Pinecone 인덱스 이름, 라이브러리 설치를 확인하세요.")
    exit(1)


# --- 4. FastAPI 서버 설정 ---
app = FastAPI()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
    source: str | None = None

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
        
        # 답변 근거: 친구분의 스크립트가 저장한 'policy_name'을 가져옴
        source_doc_name = "출처 정보 없음"
        if response.get('source_documents'):
            metadata = response['source_documents'][0].metadata
            source_doc_name = metadata.get('policy_name', '출처 정보 없음') 

        print(f"LLM이 생성한 답변: {bot_reply}")
        print(f"답변 근거: {source_doc_name}")

        # Node.js에게 JSON 형태로 답변 반환
        return {"answer": bot_reply, "source": source_doc_name}

    except Exception as e:
        print(f"🚨 RAG 서버 처리 중 오류: {e}")
        return {"answer": "죄송합니다, Python RAG 서버에서 답변 생성 중 오류가 발생했습니다.", "source": None}


# --- 5. API 서버 실행 ---
if __name__ == "__main__":
    # Render.com 배포를 위한 포트 설정
    port_str = os.getenv("PORT", "8001")
    port_num = int(port_str)

    print(f"Python RAG API 서버를 {port_num}번 포트에서 시작합니다.")
    run(app, host="0.0.0.0", port=port_num)