import React, { useState, useEffect, useRef, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { AuthContext } from '../contexts/AuthContext'; 

// --- [디자인] styled-components 정의 ---
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  padding: 20px;
`;

const ChatHistory = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;
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
  white-space: pre-wrap; /* 줄바꿈(\n) 처리를 위해 필수 */

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

// --- [기능] Chat 컴포넌트 ---
const Chat = () => {
  // 🌟 [수정] 첫 인사말 변경
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

    // userProfile 객체 생성
    const userProfile = isLoggedIn ? {
        age: age || "알 수 없음",
        region: region || "알 수 없음",
        gender: gender || "알 수 없음"
    } : {};

    console.log("전송할 사용자 프로필:", userProfile);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
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