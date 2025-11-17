import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled, { css } from 'styled-components'; // styled-components import

// --- 기존 로직 (유지) ---
const BACK_RESETPW = import.meta.env.VITE_BACK_RESETPW;

const ResetPw = () => {

    //state
    const [newPassword, setNewPassword] = useState(''); // 새 비밀번호
    const [confirmPassword, setConfirmPassword] = useState('');

    // ref
    const confirmInputRef = useRef(null);

    // params
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');

    // 토큰
    const token = localStorage.getItem('authToken');

    //navigate
    const nav = useNavigate();

    // 폼 제출 핸들러
    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword === confirmPassword) {
            const changeData = { code: code, newPw: newPassword }
            axios.patch(BACK_RESETPW, changeData)
                .then((res) => {
                    console.log(res);
                    alert('비밀번호 변경 성공'); 
                    nav('/');
                })
                .catch((err) => {
                    console.log(err);
                    alert("비밀번호 변경 실패"); 
                });
        }
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
                <Title>변경할 비밀번호 입력</Title>

                {/* --- [병합] 비밀번호 변경 칸 (새 비밀번호/ 비밀번호 확인) --- */}
                <StyledInput
                    type="password"
                    // placeholder 동적 변경
                    placeholder="새 비밀번호"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <StyledInput
                    type="password"
                    // placeholder 동적 변경
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    ref={confirmInputRef}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (newPassword != e.target.value) {
                            if (confirmInputRef.current) {
                                confirmInputRef.current.setCustomValidity('비밀번호가 일치하지 않습니다.');
                            }
                        } else {
                            if (confirmInputRef.current) {
                                confirmInputRef.current.setCustomValidity('');
                            }
                        }
                    }}
                    required
                />

                {/* --- 비밀번호 찾기 버튼 --- */}
                <StyledButton type="submit">변경하기</StyledButton>

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
  font-size: 2rem;
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

export default ResetPw;