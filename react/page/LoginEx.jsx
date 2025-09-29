import React, { useState } from 'react';

// 로그인 페이지 컴포넌트 (개인/기업 탭 전환 기능 포함)
function LoginWithTabs({ onLoginSuccess, onRegisterClick }) {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' 또는 'enterprise'
  const [emailOrId, setEmailOrId] = useState(''); // 개인: 이메일, 기업: 아이디
  const [companyId, setCompanyId] = useState(''); // 기업용 사원 코드/회사 ID
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // 탭 변경 시 입력 필드 초기화 (선택 사항)
    setEmailOrId('');
    setCompanyId('');
    setPassword('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    let loginData = {};
    if (activeTab === 'personal') {
      loginData = {
        type: 'personal',
        email: emailOrId, // 개인은 ID 필드를 이메일로 사용
        password: password,
      };
      console.log('개인 로그인 요청 데이터:', loginData);
      // TODO: 개인용 백엔드 API 호출 로직
      // 예: api.post('/api/personal/login', loginData)
    } else { // activeTab === 'enterprise'
      loginData = {
        type: 'enterprise',
        companyId: companyId,
        username: emailOrId, // 기업은 ID 필드를 사용자 이름으로 사용
        password: password,
      };
      console.log('기업 로그인 요청 데이터:', loginData);
      // TODO: 기업용 백엔드 API 호출 로직
      // 예: api.post('/api/enterprise/login', loginData)
    }

    // ✨ 임시 로직 (프론트 확인용)
    setTimeout(() => {
        alert(`${activeTab === 'personal' ? '개인' : '기업'} 로그인 시도 완료!`);
        setIsLoading(false);
        // if (onLoginSuccess) onLoginSuccess(loginData); // 로그인 성공 시 콜백 호출
    }, 1200);
  };

  const handleRegisterClick = () => {
    console.log('회원가입 버튼 클릭');
    // TODO: 회원가입 페이지로 이동 또는 모달 열기 등의 로직
    alert('회원가입 페이지로 이동합니다.');
    if (onRegisterClick) onRegisterClick(activeTab); // 회원가입 콜백 호출 (어떤 탭에서 눌렀는지 전달)
  };

  return (
    <div style={styles.outerContainer}>
        <div style={styles.container}>
            <div style={styles.tabContainer}>
                <button
                    style={{ ...styles.tabButton, ...(activeTab === 'personal' ? styles.activeTab : {}) }}
                    onClick={() => handleTabChange('personal')}
                    disabled={isLoading}
                >
                    개인
                </button>
                <button
                    style={{ ...styles.tabButton, ...(activeTab === 'enterprise' ? styles.activeTab : {}) }}
                    onClick={() => handleTabChange('enterprise')}
                    disabled={isLoading}
                >
                    기업
                </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                {activeTab === 'enterprise' && (
                    <div style={styles.inputGroup}>
                        <label htmlFor="companyId" style={styles.label}>사원 코드/회사 ID</label>
                        <input
                            id="companyId"
                            type="text"
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            required
                            style={styles.input}
                            disabled={isLoading}
                            placeholder="기업 ID를 입력하세요"
                        />
                    </div>
                )}

                <div style={styles.inputGroup}>
                    <label htmlFor="id" style={styles.label}>{activeTab === 'personal' ? '이메일' : '아이디'}</label>
                    <input
                        id="id"
                        type={activeTab === 'personal' ? 'email' : 'text'}
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        required
                        style={styles.input}
                        disabled={isLoading}
                        placeholder={activeTab === 'personal' ? '이메일을 입력하세요' : '아이디를 입력하세요'}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="password" style={styles.label}>비밀번호</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                        disabled={isLoading}
                        placeholder="비밀번호를 입력하세요"
                    />
                </div>

                <div style={styles.buttonGroup}>
                    <button type="submit" style={styles.loginButton} disabled={isLoading}>
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                    <button type="button" onClick={handleRegisterClick} style={styles.registerButton} disabled={isLoading}>
                        회원가입
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}

export default LoginWithTabs;

// 스타일 정의
const styles = {
  outerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh', // 전체 화면 높이 사용
    background: '#f0f2f5', // 배경색
  },
  container: {
    maxWidth: '450px',
    width: '90%',
    padding: '30px 40px',
    backgroundColor: '#ffffff', // 흰색 배경
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '25px',
    gap: '10px', // 탭 버튼 사이 간격
  },
  tabButton: {
    flex: 1, // 버튼이 공간을 균등하게 차지
    padding: '12px 20px',
    border: '1px solid #a7d9b9', // 연한 녹색 테두리
    borderRadius: '8px',
    backgroundColor: '#eaf7ef', // 연한 녹색 배경
    color: '#34a853', // 진한 녹색 텍스트
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  activeTab: {
    backgroundColor: '#34a853', // 활성 탭은 진한 녹색 배경
    color: 'white',
    borderColor: '#34a853',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px', // 입력 그룹 사이 간격
  },
  inputGroup: {
    marginBottom: '0', // gap으로 간격 처리
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#555',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #d0d0d0',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px', // 버튼 사이 간격
    marginTop: '25px',
  },
  loginButton: {
    flex: 1,
    padding: '14px 20px',
    backgroundColor: '#4285f4', // 구글 블루 계열
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  registerButton: {
    flex: 1,
    padding: '14px 20px',
    backgroundColor: '#cccccc', // 회색
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
};