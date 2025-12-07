import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// 🌟 [수정 완료] 여기에 'export'를 꼭 붙여야 다른 파일에서 import { AuthContext } 가 가능합니다!
export const AuthContext = createContext({
  isLoggedIn: false, 
  userId: null, 
  gender: null, 
  region: null, 
  name: null,
  type: null,
  age : null, 

  login: () => { },
  logout: () => { },
});

// 2. Provider 컴포넌트
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [gender, setGender] = useState('');
  const [region, setRegion] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [age, setAge] = useState('');

  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          logout();
        }
        else {
          setIsLoggedIn(true);
          setUserId(decodedToken.email);
          setGender(decodedToken.gender);
          setRegion(decodedToken.region);
          setName(decodedToken.name);
          setType(decodedToken.type);
          setAge(decodedToken.age);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    }
  }, []); // 의존성 배열 유지

  // 로그인 함수
  const login = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);

      localStorage.setItem('authToken', token); // 🌟 로그인 시 토큰 저장 로직 추가됨 (필요시 확인)
      
      setIsLoggedIn(true);
      setUserId(decodedToken.email);
      setGender(decodedToken.gender);
      setRegion(decodedToken.region);
      setName(decodedToken.name);
      setType(decodedToken.type);
      setAge(decodedToken.age);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUserId(null);
    setGender(null);
    setRegion(null);
    setName(null);
    setType(null);
    setAge(null);
    nav('/');
  };

  const value = {
    isLoggedIn,
    userId,
    gender,
    region,
    name,
    type,
    age,
    login,
    logout,
  };

  return (
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