import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx'; // [추가] AuthContext import

const SidebarContainer = styled.aside`
width: 240px;
background-color: #f2f4f5;
border-right: 1px solid #eee;
padding: 20px;
display: flex;
flex-direction: column;
height: 100%;
border-top-right-radius: 15px;    /* 오른쪽 위 모서리 */
border-bottom-right-radius: 15px; /* 오른쪽 아래 모서리 */
`;

const Divider = styled.div`
height: 1px;
  background-color: #aaaaaa; /* 사이드바 경계선과 비슷한 연한 색 */
  margin: 5px 5px; /* 위아래로 5px, 좌우로 5px 여백 */
`;

const Logo = styled.h1`
font-size: 1.5rem;
margin: 0 0 40px 0;
color: #333;
`;

const NavMenu = styled.nav`
  flex: 1; // 상단 메뉴가 남은 공간을 다 차지하도록
`;

const NavItem = styled(Link)`
display: block;
text-decoration: none;
color: #555;
font-size: 1rem;
padding: 12px 10px;
margin-bottom: 8px;
border-radius: 6px;

&:hover {
    background-color: #507ea4;
    color: white;
}

&.active {
    background-color: #e0e0e0;
    font-weight: bold;
}
`;

const FooterMenu = styled.div`
border-top: 1px solid #eee;
padding-top: 15px;
`;

const FooterLink = styled(Link)`
display: block;
text-decoration: none;
color: #777;
font-size: 0.9rem;
padding: 8px 10px;

&:hover {
    color: #000;
}
`;

const AuthLinks = styled.div`
display: flex;
justify-content: space-between;
align-items: center; // 세로 정렬
padding: 10px;
`;

// [추가] 로그인 시 사용자 이름을 표시할 컴포넌트
const UserInfo = styled.span`
  display: block;
  color: #333; // 로그인 링크보다 진하게
  font-weight: bold;
  font-size: 0.9rem;
  padding: 8px 10px;
`;

// [추가] 로그아웃 버튼 (FooterLink와 유사하게)
const LogoutButton = styled.button`
  display: block;
  text-decoration: none;
  color: #777;
  font-size: 0.9rem;
  padding: 8px 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit; // 버튼 폰트 통일
  
  &:hover {
    color: #000;
  }
`;


const Sidebar = () => {
  // [추가] AuthContext에서 필요한 값 가져오기
  const { isLoggedIn, name, logout } = useAuth();

  return (
    <SidebarContainer>
      <Logo>지역정책 AI 챗봇</Logo>
      
      <NavMenu>
          <NavItem to="/">홈</NavItem>
          <NavItem to="/board">게시판</NavItem>
          <NavItem to="/about">about</NavItem>
          <NavItem to="/map">지역정책 map</NavItem>
          <NavItem to="#">새 채팅</NavItem>
          <Divider />
      </NavMenu>

      <FooterMenu>
          <FooterLink to="/subscription">월정액 구독 ⊕</FooterLink>
          
          {/* --- [수정] 로그인 상태에 따라 UI 변경 --- */}
          <AuthLinks>
            {isLoggedIn ? (
              // 1. 로그인 되었을 때
              <>
                <UserInfo>{name}님</UserInfo>
                <LogoutButton onClick={logout}>log out →</LogoutButton>
              </>
            ) : (
              // 2. 로그아웃 되었을 때
              <>
                <FooterLink to="/login">log in →</FooterLink>
                <FooterLink to="/register">sign up →</FooterLink>
              </>
            )}
          </AuthLinks>
          {/* --- [수정 완료] --- */}

      </FooterMenu>
    </SidebarContainer>
  );
};

export default Sidebar;