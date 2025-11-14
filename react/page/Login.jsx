import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled, { css } from 'styled-components'; // styled-components import

// --- 기존 로직 (유지) ---
const BACK_LOGIN = import.meta.env.VITE_BACK_LOGIN;

const Login = () => {
  // Context
  const context = useAuth();
  const { login } = context;

  //state
  const [activeTab, setActiveTab] = useState('personal'); // 개인인가 기업인가 상태
  const [emailOrCode, setEmailOrCode] = useState(''); // 개인: 이메일, 기업: 기업코드
  const [password, setPassword] = useState(''); // 비밀번호

  // 토큰
  const token = localStorage.getItem('authToken');

  const radiosActiveTap = [
    { name: '개인', value: 'personal' },
    { name: '기업', value: 'enterprise' }
  ];

  //navigate
  const nav = useNavigate();

  // 개인, 기업 버튼에 따라 입력 달라지게 하는 핸들러
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // 탭 변경 시 입력 필드 초기화
    setEmailOrCode('');
    setPassword('');
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    const loginData = {
      type: activeTab,
      email: emailOrCode,
      password: password,
    };
    
    axios.post(BACK_LOGIN, loginData)
      .then((res) => {
        console.log(res);
        const token = res.data.token;
        localStorage.setItem('authToken', token);
        login(token);
        alert('환영합니다'); // (TODO: 나중에 커스텀 모달로 바꾸는 것을 권장)
        nav('/');
      })
      .catch((err) => {
        console.log(err);
        alert("로그인 실패"); // (TODO: 나중에 커스텀 모달로 바꾸는 것을 권장)
      });
    // .then() .catch()가 완료되기 전에 nav('/')가 실행되는 것을 막기 위해
    // nav('/')는 .then() 안으로 이동했습니다.
  };

  useEffect(() => { // 렌더링 or 의존성 배열의 값이 변경될때 자동 실행
    // 로그인 되었을 경우
    if (token) {
      nav('/', { replace: true });
    }
  }, [token, nav]);

  // --- 새로운 return 문 (디자인 적용) ---
  return (
    <AuthContainer>
      <AuthForm as="form" onSubmit={handleSubmit}> {/* <form> 태그로 작동하도록 'as' prop 사용 */}
        <Title>LOGIN</Title>

        {/* --- [병합] 개인/기업 탭 기능 (새로운 스타일 적용) --- */}
        <StyledButtonGroup>
          {radiosActiveTap.map((radio) => (
            <StyledToggleButton
              key={radio.value}
              type="button" // form submit 방지
              active={activeTab === radio.value}
              onClick={() => handleTabChange(radio.value)} // 핸들러 직접 연결
            >
              {radio.name}
            </StyledToggleButton>
          ))}
        </StyledButtonGroup>

        {/* --- [병합] 이메일/기업코드 Input (기존 로직 연결) --- */}
        <StyledInput
          type="text"
          // placeholder 동적 변경
          placeholder={activeTab === "personal" ? "아이디" : "기업코드"}
          value={emailOrCode}
          onChange={(e) => setEmailOrCode(e.target.value)}
          required
        />
        
        {/* --- [병합] 비밀번호 Input (기존 로직 연결) --- */}
        <StyledInput
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* --- [디자인] 로그인 버튼 (type="submit" 유지) --- */}
        <StyledButton type="submit">로그인</StyledButton>
        
        <HelpLinks>
          <HelpLink to="/find-id">아이디 찾기</HelpLink> /
          <HelpLink to="/find-pw">비밀번호 찾기</HelpLink>
        </HelpLinks>
        
        {/* --- [병합] 회원가입 링크 (기존 '/register' 경로 사용) --- */}
        <HelpLinks style={{ marginTop: '40px' }}>
          혹시 계정이 아직 없으신가요? <HelpLink to="/register">회원가입하기</HelpLink>
        </HelpLinks>

        <FooterText>&copy; 2017–2025</FooterText>
      </AuthForm>
    </AuthContainer>
  );
};

// --- [디자인] 스타일 (styled-components) ---
// --- (디자인팀이 제공한 코드) ---
const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  /* background-color: #fff; */ /* Layout과 겹칠 수 있으므로 주석 처리 (필요시 해제) */
  padding-top: 60px; /* 사이드바 상단과 겹치지 않도록 패딩 추가 */
`;

const AuthForm = styled.div` /* form 태그는 'as' prop으로 전달 */
  width: 400px;
  padding: 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 40px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 15px;
  margin-bottom: 15px;
  font-size: 1rem;
  border: 1px solid #ddd;
  background-color: #f7f7f7;
  border-radius: 8px;
`;

const StyledButton = styled.button`
  width: 100%;
  padding: 15px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background-color: #507ea4;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #335169;
  }
`;

const HelpLinks = styled.div`
  margin-top: 20px;
  font-size: 0.9rem;
  color: #777;
`;

const HelpLink = styled(Link)`
  color: #555;
  text-decoration: none;
  margin: 0 5px;

  &:hover {
    text-decoration: underline;
  }
`;

const FooterText = styled.p`
  margin-top: 40px;
  font-size: 0.8rem;
  color: #aaa;
`;


// --- [병합] 탭 버튼을 위한 새로운 styled-components ---
const StyledButtonGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  width: 100%;
`;

const StyledToggleButton = styled.button`
  flex: 1;
  padding: 10px 15px;
  font-size: 1rem;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  background-color: #f7f7f7; // 기본 배경
  color: #555; // 기본 글자색

  // active prop에 따라 스타일 변경
  ${props =>
    props.active &&
    css`
      background-color: #507ea4; // 활성 배경색
      color: white; // 활성 글자색
      border-color: #507ea4;
    `}

  &:first-child {
    border-radius: 8px 0 0 8px;
  }
  &:last-child {
    border-radius: 0 8px 8px 0;
  }
  
  &:not(:last-child) {
    border-right: none;
  }

  // 활성화되지 않았을 때만 hover 효과
  ${props =>
    !props.active &&
    css`
      &:hover {
        background-color: #eee;
      }
    `}
`;

export default Login;