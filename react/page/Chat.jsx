import React, { useState, useEffect, useRef } from 'react';

const Chat = () => {
  // 메시지 목록을 저장할 상태 (초기 메시지 포함)
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '안녕하세요! 지역 정책에 대해 무엇이든 물어보세요.' }
  ]);
  
  // 사용자가 입력 중인 메시지를 저장할 상태
  const [input, setInput] = useState('');
  
  // (고도화) 챗봇이 답변 중일 때 로딩 표시를 위한 상태
  const [isLoading, setIsLoading] = useState(false);

  // (고도화) 메시지 목록이 길어질 때 자동으로 스크롤을 내리기 위한 ref
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // messages 상태가 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // '전송' 버튼 클릭 또는 Enter 키 입력 시 호출될 함수
const handleSend = async () => {
  if (input.trim() === '' || isLoading) return; // 빈 메시지나 로딩 중엔 전송 방지

  const userMessage = { sender: 'user', text: input };

  // 1. 사용자 메시지를 먼저 화면에 추가
  setMessages(prevMessages => [...prevMessages, userMessage]);
  const currentInput = input; // (중요) API로 보낼 메시지를 변수에 저장
  setInput(''); // 입력창 비우기
  setIsLoading(true); // 로딩 시작

  // 2. (★★ 핵심 ★★) 백엔드 API에 사용자 메시지 전송
  try {
    const response = await fetch('http://localhost:8000/api/chat', { // (가정) 백엔드 API 엔드포인트
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: currentInput // 백엔드로 { "message": "사용자 입력값" } 형태의 JSON 전송
      }), 
    });

    if (!response.ok) { // HTTP 상태 코드가 200-299가 아닐 경우
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // (가정) 백엔드가 { "reply": "챗봇의 답변입니다." } 형태의 JSON을 반환한다고 가정
    const data = await response.json(); 

    // 3. 백엔드로부터 받은 챗봇 응답을 화면에 추가
    const botMessage = { 
      sender: 'bot', 
      text: data.reply // 백엔드에서 온 실제 답변
    };
    setMessages(prevMessages => [...prevMessages, botMessage]);

  } catch (error) {
    console.error("API 호출 중 오류 발생:", error);
    // 4. 에러 발생 시 사용자에게 알려주기
    const errorMessage = { 
      sender: 'bot', 
      text: '죄송합니다, 답변을 생성하는 중 오류가 발생했습니다.' 
    };
    setMessages(prevMessages => [...prevMessages, errorMessage]);
  } finally {
    // 5. 성공하든 실패하든 로딩 상태 종료
    setIsLoading(false); 
  }
};

  // Enter 키로 전송하는 함수
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '800px' }}>
      <h2 className="text-center mb-3">지역 정책 AI 챗봇</h2>

      {/* 1. 메시지 표시 영역 */}
      <div 
        className="border p-3 rounded mb-3" 
        style={{ height: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
      >
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`d-flex mb-2 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div 
              className={`alert ${msg.sender === 'user' ? 'alert-primary' : 'alert-secondary'}`}
              style={{ maxWidth: '75%', wordWrap: 'break-word', margin: 0 }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* 로딩 중일 때 표시 */}
        {isLoading && (
          <div className="d-flex justify-content-start">
            <div className="alert alert-secondary" style={{ margin: 0 }}>
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              &nbsp; 답변을 생성 중입니다...
            </div>
          </div>
        )}

        {/* 스크롤을 맨 아래로 내리기 위한 빈 div */}
        <div ref={messagesEndRef} />
      </div>

      {/* 2. 메시지 입력 영역 */}
      <div className="input-group">
        <input 
          type="text" 
          className="form-control" 
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading} // 로딩 중일 땐 입력 비활성화
        />
        <button 
          className="btn btn-primary" 
          onClick={handleSend}
          disabled={isLoading} // 로딩 중일 땐 버튼 비활성화
        >
          {isLoading ? ( // 로딩 상태에 따라 버튼 텍스트 변경
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              &nbsp; 전송 중...
            </>
          ) : (
            '전송'
          )}
        </button>
      </div>
    </div>
  );
}

export default Chat;