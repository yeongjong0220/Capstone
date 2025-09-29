import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'

// 1. Context 생성: 초기값으로 상태와 상태를 업데이트할 함수를 정의
// 이 초기값은 Provider가 없을 때(컴포넌트 밖에 있을 때) 사용, but 실제로는 Provider가 값을 제공(감쌀 예정이니)
const AuthContext = createContext({
  isLoggedIn: false, // 초기 상태는 로그인 안되어 있음
  userId: null, // 유저도 없고 
  gender: null, // 성별도 없고
  region: null, // 암것도 없다


  // AuthProvider 컴포넌트로 감싸져 있지 않은 컴포넌트에게 초기 값 , 그니까 에러 방지할라고 넣어 놓은 것
  login: () => { },
  logout: () => { },
});

// 2. Provider 컴포넌트 , {children}은 이 컴포넌트 하위로 가지는 컴포넌트들을 말함 (얘 아래로 잇는 애들한테는 isLoggedIn이랑 userId 뿌려줄 수 있음)
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [gender, setGender] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        logout();
      }
      else {
        setIsLoggedIn(true);
        setUserId(decodedToken.id);
        setGender(decodedToken.gender);
        setRegion(decodedToken.region);
      }
    }
  }, [])

  // 로그인, 실제로는 API 호출 후 토큰 저장 및 유저 정보 설정
  const login = (token) => {
    // 토큰 가져와서 디코드
    const decodedToken = jwtDecode(token);
    console.log(decodedToken);

    setIsLoggedIn(true);
    setUserId(decodedToken.id);
    setGender(decodedToken.gender);
    setRegion(decodedToken.region);
  };

  // 로그아웃, 토큰 삭제 및 상태 초기화
  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    localStorage.removeItem('authToken');
  };

  const value = {
    isLoggedIn,
    userId,
    gender,
    region,
    login,
    logout,
  };

  return (
    // value를 통해 상태와 함수를 하위 컴포넌트에 제공
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook 정의
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};