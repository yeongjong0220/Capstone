import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { ButtonGroup, ToggleButton, Button } from 'react-bootstrap'
import '../style/sign-in.css'

const BACK_REGISTER = import.meta.env.VITE_BACK_REGISTER;

const Register = () => {

  //state 
  const [activeTab, setActiveTab] = useState('personal'); // 개인인가 기업인가 상태
  const [idOrCode, setidOrCode] = useState(''); // 개인: 이메일, 기업: 기업코드?
  const [password, setPassword] = useState(''); // 비밀번호
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

    let registerData = {};

    if (activeTab === 'personal') {
      registerData = {
        type: activeTab,
        id: idOrCode, // 개인은 ID 필드를 아이디로 사용
        password: password,
        gender: gender,
        region: region,
        age: age
      };
    }
    else if (activeTab === 'enterprise') {
      registerData = {
        type: activeTab,
        id: idOrCode,
        password: password,
      };
    }

    console.log('회원가입 요청 데이터:', registerData);
    // TODO: 개인용 백엔드 API 호출 로직
    axios.post(BACK_REGISTER, registerData)
      .then((res) => {
        if(res.status == '200'){
          alert('회원가입 완료')
        }
      })
      .catch((err) => {
        console.log(err);
        alert('회원가입 실패 개발자 도구 참조');
      })
    nav('/');
  }

  useEffect(() => { // 렌더링 or 의존성 배열의 값이 변경될때 자동 실행
          // 토큰이 존재할 경우
          if (token) { 
              nav('/', { replace: true }); 
              // replace: true 옵션은 현재 로그인 페이지를 히스토리에서 대체하여
              // 사용자가 뒤로 가기 버튼을 눌러도 다시 로그인 페이지로 돌아오지 못하게 합니다.
          }
      }, [token, nav]); 

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
          <h1 className="h3 mb-3 fw-normal">Please sign up</h1>

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

            <label htmlFor="floatingInput">{activeTab === "personal" ? "아이디" : "기업코드"}</label>
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

          {/* 개인일 때 보이는 입력창 */}
          {activeTab === 'personal' && (
            <div style={{marginBottom : '5px'}}>
              <ButtonGroup style={{marginRight : '5px'}}>
                {radiosGender.map((radio, idx) => (
                  <ToggleButton
                    key={idx}
                    id={`gender-${idx}`}
                    type="radio"
                    variant='outline-primary'
                    name="radioGender"
                    value={radio.value}
                    checked={gender === radio.value}
                    onChange={(e) => setGender(e.currentTarget.value)}
                  >
                    {radio.name}
                  </ToggleButton>
                ))}
              </ButtonGroup>
              <input type='text' onChange={(e) => { setAge(e.currentTarget.value) }} placeholder='나이' style={{ width: '40px', marginRight : '5px' }} required></input>
              <select onChange={(e) => { setRegion(e.currentTarget.value) }}>
                <option value='경기'>경기</option>
                <option value='강원'>강원</option>
                <option value='충청'>충청</option>
                <option value='경상'>경상</option>
                <option value='전라'>전라</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <button className="btn btn-primary w-100 py-2" type="submit">
            Sign up
          </button>
          <p className="mt-5 mb-3 text-body-secondary">&copy; 2017–2025</p>
        </form>
      </main>

    </div>
  );
};

export default Register;