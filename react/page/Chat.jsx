import React, { useState, useEffect, useRef } from 'react';
// (CSS 파일을 따로 사용하지 않으므로, 이 파일만 수정하면 됩니다)

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
    if (input.trim() === '' || isLoading) return; 

    const userMessage = { sender: 'user', text: input };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInput = input; 
    setInput(''); 
    setIsLoading(true); 

    try {
      // (★★ 핵심 ★★) 백엔드 API에 사용자 메시지 전송
      // 00님의 Node.js 서버 주소로 변경해야 할 수 있습니다. (예: http://localhost:8080/api/chat)
      // 00님의 Python 서버 주소(예: http://localhost:8001/ask)를 직접 호출하는 것이 아닙니다!
      const response = await fetch('http://localhost:8000/api/chat', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentInput 
        }), 
      });

      if (!response.ok) { 
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 00님의 Node.js 서버가 Python 서버의 응답을 어떻게 감싸서 보내는지 확인이 필요합니다.
      // (가정 1) Node.js가 Python의 응답을 그대로 보낸다면: { "answer": "...", "source": "..." }
      // (가정 2) Node.js가 'reply' 키로 감쌌다면: { "reply": "..." }
      const data = await response.json(); 

      const botMessage = { 
        sender: 'bot', 
        // 00님의 Python 서버 응답 키('answer')에 맞춰 수정
        text: data.answer || data.reply || "응답 형식을 확인해주세요." 
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
      const errorMessage = { 
        sender: 'bot', 
        text: '죄송합니다, 답변을 생성하는 중 오류가 발생했습니다.' 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
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
        // [예쁘게] 'bg-light' 클래스 추가 (채팅창 배경색)
        className="border p-3 rounded mb-3 bg-light" 
        style={{ 
          height: '65vh', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`d-flex mb-2 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div 
              // [예쁘게] 'rounded-3' (둥근 모서리), 'shadow-sm' (작은 그림자) 클래스 추가
              className={`alert ${msg.sender === 'user' ? 'alert-primary' : 'alert-secondary'} rounded-3 shadow-sm`}
              style={{ 
                // [⭐️ 핵심 ⭐️] Python 서버의 \n (줄바꿈) 문자를 인식하게 하는 CSS
                whiteSpace: 'pre-line',

                // (기존 스타일)
                maxWidth: '75%', 
                wordWrap: 'break-word', 
                margin: 0 
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* 로딩 중일 때 표시 */}
        {isLoading && (
          <div className="d-flex justify-content-start">
            {/* [예쁘게] 로딩창도 다른 메시지와 통일 (rounded-3, shadow-sm) */}
            <div 
              className="alert alert-secondary rounded-3 shadow-sm" 
              style={{ margin: 0 }}
            >
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
          disabled={isLoading} 
        />
        <button 
          className="btn btn-primary" 
          onClick={handleSend}
          disabled={isLoading} 
        >
          {isLoading ? ( 
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