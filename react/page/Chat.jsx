import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components'; // styled-components import

// --- [디자인] styled-components 정의 (Home.jsx에서 가져옴) ---

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px); // (수정) Layout/Sidebar 높이 고려 (추가 조정 필요할 수 있음)
  padding: 20px;
`;

const ChatHistory = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 10px; // 내부 여백
`;

const ChatBubble = styled.div`
  width: -moz-fit-content;
  width: fit-content;
  max-width: 70%; // 최대 너비 살짝 늘림
  padding: 12px 18px;
  margin-bottom: 10px;
  border-radius: 20px;
  line-height: 1.5;
  word-wrap: break-word; /* 긴 단어 자동 줄바꿈 */
  
  /* --- [병합] 챗봇 답변 줄바꿈(개행) 적용 --- */
  white-space: pre-wrap;

  /* [경고 수정] props.$sender로 변경 */
  ${props => props.$sender === 'user' ? `
    background-color: #507ea4;
    color: white;
    margin-left: auto;
    border-bottom-right-radius: 5px;
  ` : `
    background-color: #e9e9eb;
    color: black;
    margin-right: auto;
    border-bottom-left-radius: 5px;
  `}
`;

// [병합] 챗봇 로딩(입력 중) 인디케이터 스타일
const typingAnimation = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  span {
    background-color: #888;
    border-radius: 50%;
    width: 8px;
    height: 8px;
    margin: 0 2px;
    animation: ${typingAnimation} 1.4s infinite ease-in-out both;
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
`;

const InputArea = styled.form` // <form> 태그로 변경
  display: flex;
  padding: 20px 10px;
  border-top: 1px solid #ddd;
  background-color: #fdfdfd;
`;

const TextInput = styled.input`
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px; // 둥글게
  outline: none;
  font-size: 1rem;
  padding: 10px 15px; // 패딩 조절
  background-color: transparent;
  
  &:disabled {
    background-color: #f5f5f5;
  }
`;

const SendButton = styled.button`
  border: none;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #507ea4;
  margin-left: 10px;
  
  &:hover {
    color: #335169;
  }
  
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

// --- [기능] Chat 컴포넌트 (Chat.jsx 로직 유지) ---

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
  const handleSend = async (e) => { // [병합] (e) 파라미터 추가
    e.preventDefault(); // [병합] <form>의 기본 동작(새로고침) 방지
    
    if (input.trim() === '' || isLoading) return; // 빈 메시지나 로딩 중엔 전송 방지

    const userMessage = { sender: 'user', text: input };
    const currentInput = input;
    const historyToSend = messages; 

    // 1. 사용자 메시지를 먼저 화면에 추가
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput(''); // 입력창 비우기
    setIsLoading(true); // 로딩 시작

    // 2. (★★ 핵심 ★★) 백엔드 API에 사용자 메시지 및 '대화 기록' 전송
    try {
      const response = await fetch('http://localhost:8000/api/chat', { // Node.js 백엔드 API 엔드포인트
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentInput, 
          history: historyToSend 
        }), 
      });

      if (!response.ok) { 
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

  // --- [디자인] 새로운 return문 ---
  return (
    <ChatContainer>
      {/* 1. 메시지 표시 영역 */}
      <ChatHistory>
        {messages.map((msg, index) => (
          /* [경고 수정] transient prop ($) 사용 */
          <ChatBubble key={index} $sender={msg.sender}>
            {msg.text}
          </ChatBubble>
        ))}

        {/* [병합] 로딩 중일 때 인디케이터 표시 */}
        {isLoading && (
          <ChatBubble $sender="bot"> {/* [경고 수정] transient prop ($) 사용 */}
            <TypingIndicator>
              <span></span><span></span><span></span>
            </TypingIndicator>
          </ChatBubble>
        )}

        {/* 스크롤을 맨 아래로 내리기 위한 빈 div */}
        <div ref={messagesEndRef} />
      </ChatHistory>

      {/* 2. 메시지 입력 영역 (form으로 변경) */}
      <InputArea onSubmit={handleSend}>
        <TextInput
          type="text"
          placeholder="무엇이 궁금하신가요?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading} // [병합] 로딩 중 비활성화
        />
        <SendButton type="submit" disabled={isLoading}> {/* [병합] 로딩 중 비활성화 */}
          ➤
        </SendButton>
      </InputArea>
    </ChatContainer>
  );
}

export default Chat;