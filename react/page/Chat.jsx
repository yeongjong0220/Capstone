import React, { useState, useEffect, useRef, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { AuthContext } from '../contexts/AuthContext'; 

// --- [디자인] styled-components 정의 ---

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  padding: 20px;
  position: relative; /* 배경 텍스트 배치를 위한 기준점 */
  overflow: hidden; /* 배경 텍스트가 넘치더라도 스크롤 생기지 않게 함 */
`;

// 새로 추가된 배경 텍스트 컴포넌트
const ChatBackgroundText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 정확히 중앙 정렬 */
  font-size: 10vw; /* 창 너비의 10% 크기 (반응형) */
  font-weight: 900; /* 아주 두꺼운 글씨 */
  color: #f0f0f0; /* 아주 연한 회색 */
  white-space: nowrap; /* 줄바꿈 방지 */
  z-index: 0; /* 채팅 내용보다 뒤로 */
  pointer-events: none; /* 클릭 통과 (마우스 이벤트 방해 안 함) */
  user-select: none; /* 드래그 선택 방지 */
  font-family: sans-serif; /* 깔끔한 산세리프 폰트 권장 */
`;

const ChatHistory = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;
  position: relative; /* z-index 적용을 위해 필수 */
  z-index: 1; /* 배경 텍스트보다 위에 오도록 설정 */
`;

const ChatBubble = styled.div`
  width: -moz-fit-content;
  width: fit-content;
  max-width: 70%;
  padding: 12px 18px;
  margin-bottom: 10px;
  border-radius: 20px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;

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

const InputArea = styled.form`
  display: flex;
  padding: 20px 10px;
  border-top: 1px solid #ddd;
  background-color: #fdfdfd;
  position: relative; /* z-index 적용을 위해 필수 */
  z-index: 2; /* 배경 및 채팅 내역보다 위에 오도록 설정 */
`;

const TextInput = styled.input`
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 1rem;
  padding: 10px 15px;
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

const CHAT_API = import.meta.env.VITE_CHAT_API;

// --- [기능] Chat 컴포넌트 ---
const Chat = () => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: '안녕하세요, Jobs입니다.\n정책이나 일자리가 궁금하시다면 무엇이든 물어봐 주세요.' 
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { isLoggedIn, age, region, gender } = useContext(AuthContext); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    const currentInput = input;
    const historyToSend = messages;

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    const userProfile = isLoggedIn ? {
        age: age || "알 수 없음",
        region: region || "알 수 없음",
        gender: gender || "알 수 없음"
    } : {};

    console.log("전송할 사용자 프로필:", userProfile);

    try {
      const response = await fetch(CHAT_API , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentInput, 
          history: historyToSend,
          user_profile: userProfile 
        }), 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage = { 
        sender: 'bot', 
        text: data.reply 
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

  return (
    <ChatContainer>
      {/* 배경 텍스트 추가 (ChatContainer 내부에 위치) */}
      <ChatBackgroundText>Jobs knows.</ChatBackgroundText>

      <ChatHistory>
        {messages.map((msg, index) => (
          <ChatBubble key={index} $sender={msg.sender}>
            {msg.text}
          </ChatBubble>
        ))}
        {isLoading && (
          <ChatBubble $sender="bot">
            <TypingIndicator>
              <span></span><span></span><span></span>
            </TypingIndicator>
          </ChatBubble>
        )}
        <div ref={messagesEndRef} />
      </ChatHistory> 

      <InputArea onSubmit={handleSend}>
        <TextInput
          type="text"
          placeholder="무엇이 궁금하신가요?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <SendButton type="submit" disabled={isLoading}>
          ➤
        </SendButton>
      </InputArea>
    </ChatContainer>
  );
}

export default Chat;