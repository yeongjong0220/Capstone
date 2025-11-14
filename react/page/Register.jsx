import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components'; // styled-components import

// --- [기능] 기존 로직 (유지) ---
const BACK_REGISTER = import.meta.env.VITE_BACK_REGISTER;

const Register = () => {
  //state
  const [activeTab, setActiveTab] = useState('personal'); // 개인인가 기업인가 상태
  const [emailOrCode, setEmailOrCode] = useState(''); // 개인: 이메일, 기업: 기업코드
  const [name, setName] = useState(''); // 이름 (회사 or 개인)
  const [password, setPassword] = useState(''); // 비밀번호
  const [passwordConfirm, setPasswordConfirm] = useState(''); // [병합] 비밀번호 확인 필드 추가
  const [gender, setGender] = useState('male');
  const [region, setRegion] = useState('경기');
  const [age, setAge] = useState('');

  // 토큰
  const token = localStorage.getItem('authToken');

  const radiosGender = [
    { name: '남', value: 'male' },
    { name: '여', value: 'female' }
  ];

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
    setName('');
    setPassword('');
    setPasswordConfirm('');
    setGender('male');
    setRegion('경기');
    setAge('');
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    // [병합] 비밀번호 확인 로직 추가
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    let registerData = {};

    if (activeTab === 'personal') {
      registerData = {
        type: activeTab,
        email: emailOrCode,
        password: password,
        name: name,
        gender: gender,
        region: region,
        age: age
      };
    } else if (activeTab === 'enterprise') {
      registerData = {
        type: activeTab,
        email: emailOrCode,
        name: name,
        password: password,
        gender: null,
        region: null,
        age: null
      };
    }

    axios.post(BACK_REGISTER, registerData)
      .then((res) => {
        console.log(res);
        if (res.status == '200') {
          alert('메일을 확인하세요');
        }
        nav('/'); // 성공 시 로그인 페이지로 이동 (혹은 메인으로)
      })
      .catch((err) => {
        console.log(err);
        alert('회원가입 실패. 개발자 도구를 참조하세요.');
      });
  };

  useEffect(() => {
    if (token) {
      nav('/', { replace: true });
    }
  }, [token, nav]);

  // --- [디자인] 새로운 return 문 ---
  return (
    <AuthContainer>
      <AuthForm as="form" onSubmit={handleSubmit}>
        <Title>SIGNUP</Title>
        
        {/* --- [병합] 개인/기업 탭 --- */}
        <StyledButtonGroup>
          {radiosActiveTap.map((radio) => (
            <StyledToggleButton
              key={radio.value}
              type="button"
              active={activeTab === radio.value}
              onClick={() => handleTabChange(radio.value)}
            >
              {radio.name}
            </StyledToggleButton>
          ))}
        </StyledButtonGroup>

        {/* --- [병합] 이름 (동적 라벨) --- */}
        <Label>{activeTab === "personal" ? "이름" : "기업명"}</Label>
        <StyledInput
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        {/* --- [병합] 이메일/기업코드 (동적 라벨) --- */}
        <Label>{activeTab === "personal" ? "이메일 (아이디)" : "기업 이메일 (아이디)"}</Label>
        <StyledInput
          type="text" // 이메일 유효성 검사는 나중에 추가
          value={emailOrCode}
          onChange={(e) => setEmailOrCode(e.target.value)}
          required
        />

        {/* --- [병합] 비밀번호 --- */}
        <Label>비밀번호</Label>
        <StyledInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {/* --- [병합] 비밀번호 재확인 --- */}
        <Label>비밀번호 재확인</Label>
        <StyledInput
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />

        {/* --- [병합] 개인 회원 전용 입력창 --- */}
        {activeTab === 'personal' && (
          <>
            <InputGroup>
              <div style={{ flex: 1 }}>
                <Label>성별</Label>
                <StyledButtonGroup>
                  {radiosGender.map((radio) => (
                    <StyledToggleButton
                      key={radio.value}
                      type="button"
                      active={gender === radio.value}
                      onClick={() => setGender(radio.value)}
                    >
                      {radio.name}
                    </StyledToggleButton>
                  ))}
                </StyledButtonGroup>
              </div>
            </InputGroup>

            <InputGroup>
              <div style={{ flex: 1 }}>
                <Label>나이</Label>
                <StyledInput
                  type="number"
                  placeholder="나이"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label>지역</Label>
                <StyledSelect 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value='경기'>경기</option>
                  <option value='강원'>강원</option>
                  <option value='충청'>충청</option>
                  <option value='경상'>경상</option>
                  <option value='전라'>전라</option>
                </StyledSelect>
              </div>
            </InputGroup>
          </>
        )}
        
        <StyledButton type="submit">회원가입</StyledButton>
        <FooterText>&copy; 2017–2025</FooterText>
      </AuthForm>
    </AuthContainer>
  );
};

// --- [디자인] 스타일 (styled-components) ---
const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 100px 0; /* 폼이 길어질 수 있으므로 위아래 패딩 */
`;

const AuthForm = styled.div` // 'as' prop으로 <form> 전달
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

// [병합] Select 태그 스타일 추가
const StyledSelect = styled.select`
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

const InputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 5px; // InputGroup의 mb를 줄임 (Input에 mb가 있으므로)
`;

const Label = styled.label`
  display: block;
  text-align: left;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 5px;
  padding-left: 5px;
`;

const FooterText = styled.p`
  margin-top: 40px;
  font-size: 0.8rem;
  color: #aaa;
`;

// [병합] 탭 버튼 (Login.jsx에서 가져옴)
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
  background-color: #f7f7f7;
  color: #555;

  ${props =>
    props.active &&
    css`
      background-color: #507ea4;
      color: white;
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

  ${props =>
    !props.active &&
    css`
      &:hover {
        background-color: #eee;
      }
    `}
`;

export default Register;