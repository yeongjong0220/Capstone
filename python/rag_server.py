import os
from fastapi import FastAPI
from pydantic import BaseModel
from uvicorn import run
from dotenv import load_dotenv

# LangChain 관련 모듈 임포트
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
# 🚨 'langchain_pinecone.Pinecone' -> 'langchain_pinecone.PineconeVectorStore'로
# 최신 라이브러리 이름에 맞게 수정되었습니다.
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


# --- 2. (⚠️ 중요) 사용자가 직접 수정할 부분 ---
# Pinecone에서 미리 생성해 둔 "인덱스 이름"을 입력하세요
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
    #
    # ⬇️ ⭐️ [수정됨 1/2] ⭐️
    # 'text_key'를 업로드 시 사용한 'embedding_text'로 명시
    #
    vectorstore = PineconeVectorStore.from_existing_index(
        index_name=PINECONE_INDEX_NAME,
        embedding=embeddings,
        text_key="embedding_text"  # 👈 (중요!) vector_db 2.py와 일치시킴
    )

    # 4. Retriever (벡터 저장소에서 관련 문서를 검색)
    retriever = vectorstore.as_retriever(
        search_type="similarity", # 유사도 기반 검색
        search_kwargs={'k': 3}  # 상위 3개의 관련 문서를 가져옴
    )

    # 5. Prompt Template (LLM에게 보낼 지시문 양식)
    prompt_template = """
    당신은 사용자에게 '지역 정책'을 쉽고 친절하게 안내하는 전문 AI 챗봇입니다.
    항상 사용자의 관점에서 생각하며, 명확하고 따뜻한 말투로 답변해 주세요.

    [답변 생성 5원칙]
    1.  **친절한 말투:** 항상 상냥하고 친절한 어조를 유지하며, 사용자가 이해하기 쉬운 용어를 사용해 주세요. (예: "문의하신 내용은...")
    2.  **깔끔한 형식:** 답변이 길어질 경우, 사용자가 읽기 편하도록 **줄바꿈**, **글머리 기호(•)**, **번호 매기기**를 적극적으로 사용해 내용을 명확하게 구분해 주세요.
    3.  **근거 기반 답변:** 답변은 반드시 아래 [참고 자료]에 근거해야 합니다. 자료에 없는 내용을 추측하거나 지어내지 마세요.
    
    4.  **(⚠️수정됨) 핵심 정보 강조:**
        * [참고 자료]에 '신청방법', '문의처', '대상' 등 사용자가 궁금해할 만한 정보가 있다면 답변에 알기 쉽게 포함시켜 주세요.
        * **[중요] 만약 [참고 자료]의 '신청방법' 등에 'http://' 또는 'https://'로 시작하는 실제 웹 주소(URL)가 명확히 포함되어 있는 경우에만, 해당 링크를 제시해 주세요.**
        * **자료에 실제 URL이 없다면, 절대 가상의 링크(예: '[바로가기]')를 지어내거나 만들지 마세요.**

    5.  **정중한 거절:** [참고 자료]를 검토해도 사용자의 질문에 대한 적절한 정보를 찾을 수 없다면, "알 수 없습니다."라고 딱딱하게 말하지 말고, "죄송합니다. 문의하신 내용에 대한 정책 정보를 찾지 못했습니다. 더 구체적인 키워드로 질문해 주시겠어요?"와 같이 정중하게 답변하세요.

    [참고 자료]
    {context}

    [질문]
    {question}

    [친절한 답변]
    """
    PROMPT = PromptTemplate(
        template=prompt_template, input_variables=["context", "question"]
    )
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

# Node.js로부터 받을 데이터 모델
class ChatRequest(BaseModel):
    message: str

# Node.js에게 보낼 데이터 모델
class ChatResponse(BaseModel):
    answer: str
    source: str | None = None # 답변의 출처

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
        
        # ⬇️ ⭐️ [수정됨 2/2] ⭐️
        # 'source' 대신 업로드 시 사용한 'policy_name'을 출처로 사용
        #
        source_doc = "출처 정보 없음"
        if response.get('source_documents'):
            # 첫 번째 근거 문서의 메타데이터('policy_name')를 가져옴
            source_doc = response['source_documents'][0].metadata.get('policy_name', '출처 정보 없음')

        print(f"LLM이 생성한 답변: {bot_reply}")
        print(f"답변 근거: {source_doc}")

        # Node.js에게 JSON 형태로 답변 반환
        return {"answer": bot_reply, "source": source_doc}

    except Exception as e:
        print(f"🚨 RAG 서버 처리 중 오류: {e}")
        # ⭐️참고: Node.js는 이 메시지를 받게 됩니다.
        return {"answer": "죄송합니다, Python RAG 서버에서 답변 생성 중 오류가 발생했습니다.", "source": None}


# --- 5. API 서버 실행 ---
if __name__ == "__main__":
    
    # --- ⬇️ (수정됨) 서버 시작 전, RAG 체인 직접 테스트 (안정화 버전) ⬇️ ---
    print("--- [RAG 체인 직접 테스트 시작] ---")
    try:
        test_query = "광주광역시 청년 정책 알려줘" # 또는 엑셀에 있는 실제 정책 관련 질문
        test_response = qa_chain.invoke(test_query)
        print(f"테스트 질문: {test_query}")
        print(f"테스트 답변: {test_response['result']}")
        
        # source_documents가 있는지 확인하고 출력 (list index out of range 방지)
        if test_response.get('source_documents'):
            print(f"테스트 근거: {test_response['source_documents'][0].metadata.get('policy_name', 'N/A')}")
        else:
            print("테스트 근거: (근거 문서를 찾지 못함)")
            
        print("--- [✅ RAG 체인 직접 테스트 성공] ---")

    except Exception as e:
        print(f"--- [🚨 RAG 체인 직접 테스트 실패] ---")
        print(f"오류 발생: {e}")
        print("-----------------------------------")
    # --- ⬆️ 테스트 코드 종료 ⬆️ ---

    print(f"Python RAG API 서버를 8001번 포트에서 시작합니다 (http://localhost:8001)")
    run(app, host="0.0.0.0", port=8001)