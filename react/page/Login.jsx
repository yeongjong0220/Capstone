import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { Button, ToggleButton, ButtonGroup } from 'react-bootstrap'
import '../style/sign-in.css'

const BACK_LOGIN = import.meta.env.VITE_BACK_LOGIN;

const Login = () => {

  //state 
  const [activeTab, setActiveTab] = useState('personal'); // 개인인가 기업인가 상태
  const [idOrCode, setidOrCode] = useState(''); // 개인: 이메일, 기업: 기업코드?
  const [password, setPassword] = useState(''); // 비밀번호

  const [rememberMe, setRememberMe] = useState(false); // 이거 써야하나 ? 보류

  const radiosActiveTap = [
    { name: '개인', value: 'personal' },
    { name: '기업', value: 'enterprise' }
  ]

  //navigate
  const nav = useNavigate();

  // 개인, 기업 버튼에 따라 입력 달라지게 하는 핸들러
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // 탭 변경 시 입력 필드 초기화 (선택 사항)
    setidOrCode('');
    setPassword('');
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    const loginData = {
      type: activeTab,
      id: idOrCode, // 개인은 ID 필드를 이메일로 사용
      password: password,
    };
    console.log('개인 로그인 요청 데이터:', loginData);
    // TODO: 개인용 백엔드 API 호출 로직
    axios.post(BACK_LOGIN, loginData)
      .then((res) => {
        console.log(res);

        alert(loginData.id+'님 환영합니다');
      })
      .catch((err) => {
        console.log(err);
        alert("로그인 실패");
      })
    nav('/');
  }
  return (
    <div className="d-flex align-items-center py-4 bg-body-tertiary" style={{ minHeight: '100vh' }}>
      <main className="form-signin w-100 m-auto">
        <form onSubmit={handleSubmit}>
          <img
            className="mb-4"
            src="../src/assets/react.svg"
            alt="Bootstrap"
            width="72"
            height="57"
          />
          <h1 className="h3 mb-3 fw-normal">Please sign in</h1>

          {/* 개인 or 기업 */}
          <ButtonGroup style={{marginBottom : '5px'}}>
            {radiosActiveTap.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`tap-${idx}`}
                type="radio"
                variant='outline-primary'
                name="radioActiveTap"
                value={radio.value}
                checked={activeTab === radio.value}
                onChange={(e) => handleTabChange(e.currentTarget.value)}
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>

          {/* Email Input */}
          <div className="form-floating">
            <input
              type="text"
              className="form-control"
              id="floatingInput"
              placeholder="아이디"
              value={idOrCode}
              onChange={(e) => setidOrCode(e.target.value)}
              required
            />
            <label htmlFor="floatingInput">{activeTab==="personal"?"아이디":"기업코드"}</label>
          </div>

          {/* Password Input */}
          <div className="form-floating">
            <input
              type="password"
              className="form-control"
              id="floatingPassword"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label htmlFor="floatingPassword">Password</label>
          </div>

          {/* Remember Me Checkbox 이거 써야하나? 보류
          <div className="form-check text-start my-3">
            <input
              className="form-check-input"
              type="checkbox"
              value="remember-me"
              id="checkDefault"
              checked={rememberMe} // 💡 상태 연결
              onChange={(e) => setRememberMe(e.target.checked)} // 💡 상태 업데이트
            />
            <label className="form-check-label" htmlFor="checkDefault">
              Remember me
            </label>
          </div> */}

          {/* Submit Button */}
          <button className="btn btn-primary w-100 py-2" type="submit">
            Sign in
          </button>
          <a href='/register' style={{ textDecoration: 'none' }}>회원가입 하기</a>
          <p className="mt-5 mb-3 text-body-secondary">&copy; 2017–2025</p>
        </form>
      </main>

    </div>
  );
};

export default Login;