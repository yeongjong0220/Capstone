import os
from fastapi import FastAPI
from pydantic import BaseModel
from uvicorn import run
from dotenv import load_dotenv

# LangChain 관련 모듈 임포트
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore

# ⭐️ 수정됨 1/7: RetrievalQA 대신 ConversationalRetrievalChain 임포트
from langchain.chains import ConversationalRetrievalChain 
from langchain.prompts import PromptTemplate
from typing import List, Dict, Any

# --- 1. .env 파일에서 API 키 로드 ---
load_dotenv()

# .env 파일에 키가 설정되었는지 확인
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
if not os.getenv("PINECONE_API_KEY"):
    raise ValueError("PINECONE_API_KEY가 .env 파일에 설정되지 않았습니다.")


# --- 2. (⚠️ 중요) 사용자가 직접 수정할 부분 ---
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
        temperature=0.0
    )

    # 2. Embedding Model (텍스트를 벡터로 변환)
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    # 3. Vector Store (Pinecone 인덱스에 연결)
    vectorstore = PineconeVectorStore.from_existing_index(
        index_name=PINECONE_INDEX_NAME,
        embedding=embeddings,
        text_key="embedding_text"
    )

    # 4. Retriever (벡터 저장소에서 관련 문서를 검색)
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={'k': 3}
    )

    # 5. Prompt Template (이전과 동일, {chat_history} 변수 포함)
# 5. Prompt Template (LLM에게 보낼 지시문 양식)
    prompt_template = """
    당신은 사용자에게 '지역 정책'을 쉽고 친절하게 안내하는 전문 AI 챗봇입니다.
    항상 사용자의 관점에서 생각하며, 명확하고 신뢰할 수 있는 말투로 답변해 주세요.

    [답변 생성 7원칙]
    1.  **친절하고 전문적인 말투:** 항상 상냥하고 친절한 어조를 유지하며, 정책 내용을 전달할 때는 **객관적이고 권위 있는(authoritative)** 용어를 사용해 신뢰감을 주세요.
    2.  **가독성 있는 형식:** 답변이 길어질 경우, **줄바꿈**, **글머리 기호(•)**, **번호 매기기**를 적극적으로 사용해 정책별로 내용을 명확하게 구분하여 가독성을 높여야 합니다.
    
    3.  **(🚨정보 직접 제시 및 완전성):**
        * **절대로 답변 내용에 내부 용어인 '[정책 데이터]', '[참고 자료]', 또는 '자세한 내용은 자료를 확인하세요'와 같은 회피성 문구를 언급하거나 포함해서는 안 됩니다.**
        * **[정책 데이터]에 포함된 '정책명', '대상', '목적', '주요내용', '신청방법', '문의처' 등**의 **모든 상세 정보를 찾아서 사용자 답변에 직접, 완전하게 포함**시켜야 합니다.
    
    4.  **(🌟통합 및 적합성 검토):**
        * **[다중 결과 통합]:** 만약 여러 개의 관련 정책(`{context}`)이 검색되었다면, 이를 통합하여 사용자 질문에 가장 적합한 **핵심 정책 1~2개**를 우선순위로 명확하게 제시하세요.
        * **[유효성 검토]:** 정책 정보에 유효 기간이나 대상 연령이 명시되어 있다면, 답변 시 현재 시점을 기준으로 해당 정보가 **유효한지** 언급하거나 **'반드시 최종 확인 필요'**라는 안내를 추가하여 사용자의 혼란을 방지해야 합니다.

    5.  **(✅정확성 및 안전성 확보):**
        * 답변은 반드시 아래 [정책 데이터]에 근거해야 하며, 자료에 없는 내용을 추측하거나 지어내지 마세요.
        * **[링크 규칙]:** '신청방법' 등에 'http://' 또는 'https://'로 시작하는 실제 URL이 명확히 포함된 경우에만 해당 링크를 제시하며, **자료에 실제 URL이 없다면 절대 가상의 링크를 지어내지 마세요.**

    6.  **정중한 거절:** [정책 데이터]를 검토해도 질문에 대한 적절한 정보를 찾을 수 없다면, "죄송합니다. 문의하신 내용에 대한 정책 정보를 찾지 못했습니다. 더 구체적인 키워드로 질문해 주시겠어요?"와 같이 정중하게 답변하세요.

    7.  **(➡️다음 행동 유도):** 답변을 완료한 후, 사용자에게 가장 유용할 만한 **다음 단계(Next Step)**를 제안하며 대화를 마무리합니다. (예: "혹시 신청 절차나 문의처 정보가 필요하신가요?", "관련된 다른 일자리 지원 정책에 대해서도 알아볼까요?")

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

    # ⭐️ 수정됨 2/7: 'RetrievalQA' 대신 'ConversationalRetrievalChain' 사용
    # 이 체인은 'question'과 'chat_history'를 입력받도록 설계되었습니다.
    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        # 'combine_docs_chain_kwargs'를 통해 RAG 프롬프트를 전달합니다.
        combine_docs_chain_kwargs={"prompt": PROMPT},
        return_source_documents=True
    )

    print("✅ RAG 챗봇 체인 초기화 완료.")

except Exception as e:
    print(f"🚨 RAG 초기화 중 심각한 오류 발생: {e}")
    print("API 키, Pinecone 인덱스 이름, 라이브러리 설치를 확인하세요.")
    exit(1)


# --- 4. FastAPI 서버 설정 ---
app = FastAPI()

# Node.js로부터 받을 데이터 모델 (이전과 동일)
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]] = []

# Node.js에게 보낼 데이터 모델 (이전과 동일)
class ChatResponse(BaseModel):
    answer: str
    source: str | None = None

@app.post("/ask", response_model=ChatResponse)
async def ask_question(request: ChatRequest):
    """
    Node.js 백엔드로부터 질문과 대화 기록을 받아 RAG 챗봇을 실행하고 답변을 반환합니다.
    """
    try:
        user_message = request.message
        chat_history_list = request.history
        
        print(f"Node.js로부터 받은 질문: {user_message}")
        print(f"Node.js로부터 받은 대화 기록 수: {len(chat_history_list)}개")

        # ⭐️ 수정됨 3/7: 'history' 형식을 List[Dict]에서 List[Tuple[str, str]]로 변환
        # (ConversationalRetrievalChain이 요구하는 형식)
        # 변환 대상: [{'sender': 'user', 'text': 'Q1'}, {'sender': 'bot', 'text': 'A1'}]
        # 변환 결과: [('Q1', 'A1')]
        formatted_history = []
        user_msg = None
        for turn in chat_history_list:
            if turn.get("sender") == "user":
                user_msg = turn.get("text", "")
            elif turn.get("sender") == "bot" and user_msg is not None:
                # 'user' 메시지 다음에 'bot' 메시지가 오면 짝을 이뤄 추가
                formatted_history.append((user_msg, turn.get("text", "")))
                user_msg = None # 다음 짝을 위해 초기화

        # ⭐️ 수정됨 4/7: 'invoke'에 'question'과 'chat_history' (튜플 리스트) 전달
        response = qa_chain.invoke({
            "question": user_message, 
            "chat_history": formatted_history
        })
        
        # ⭐️ 수정됨 5/7: 'ConversationalRetrievalChain'의 답변 키는 'result'가 아닌 'answer'
        bot_reply = response['answer']
        
        source_doc = "출처 정보 없음"
        if response.get('source_documents'):
            source_doc = response['source_documents'][0].metadata.get('policy_name', '출처 정보 없음')

        print(f"LLM이 생성한 답변: {bot_reply}")
        print(f"답변 근거: {source_doc}")

        # Node.js에게 JSON 형태로 답변 반환
        return {"answer": bot_reply, "source": source_doc}

    except Exception as e:
        print(f"🚨 RAG 서버 처리 중 오류: {e}")
        return {"answer": "죄송합니다, Python RAG 서버에서 답변 생성 중 오류가 발생했습니다.", "source": None}


# --- 5. API 서버 실행 ---
if __name__ == "__main__":
    
    # --- ⬇️ (수정됨) 서버 시작 전, RAG 체인 직접 테스트 (멀티턴 반영) ⬇️ ---
    print("--- [RAG 체인 직접 테스트 시작] ---")
    try:
        test_query = "그럼 자격 조건은 뭐야?" 
        
        # ⭐️ 수정됨 6/7: 테스트용 'chat_history'를 튜플 리스트 형식으로 변경
        test_history_tuples = [
            ("광주광역시 청년 정책 알려줘", "네, 광주광역시 청년 정책으로는 ... (가상 답변) ... 이 있습니다.")
        ]
        
        test_response = qa_chain.invoke({
            "question": test_query,
            "chat_history": test_history_tuples
        })
        
        print(f"테스트 질문: {test_query}")
        # ⭐️ 수정됨 7/7: 테스트 답변 키도 'answer'로 변경
        print(f"테스트 답변: {test_response['answer']}")
        
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