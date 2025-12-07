import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx'; 

const SidebarContainer = styled.aside`
  width: 240px;
  background-color: #f2f4f5;
  border-right: 1px solid #eee;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-top-right-radius: 15px;    
  border-bottom-right-radius: 15px; 
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 40px 0;
  color: #333;
  font-family: 'Helvetica', sans-serif;
  letter-spacing: -1px;
`;

const NavMenu = styled.nav`
  flex: 1; 
`;

const NavItem = styled(Link)`
  display: block;
  text-decoration: none;
  color: #555;
  font-size: 1rem;
  padding: 12px 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  transition: all 0.2s ease; /* 부드러운 호버 효과 추가 */

  &:hover {
    background-color: #507ea4;
    color: white;
    transform: translateX(5px); /* 호버 시 살짝 오른쪽으로 이동하는 애니메이션 */
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
  transition: color 0.2s;

  &:hover {
    color: #000;
  }
`;

const AuthLinks = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center; 
  padding: 10px;
`;

const UserInfo = styled.span`
  display: block;
  color: #333; 
  font-weight: bold;
  font-size: 0.9rem;
  padding: 8px 10px;
`;

const LogoutButton = styled.button`
  display: block;
  text-decoration: none;
  color: #777;
  font-size: 0.9rem;
  padding: 8px 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit; 
  
  &:hover {
    color: #000;
  }
`;


const Sidebar = () => {
  const { isLoggedIn, name, logout } = useAuth();

  return (
    <SidebarContainer>
      <Logo>Jobs knows.</Logo> 
      
      <NavMenu>
          {/* '홈' -> 'Jobs와 대화하세요'로 변경 */}
          <NavItem to="/">Jobs와 대화하세요</NavItem> 
          <NavItem to="/map">Jobs MAP</NavItem>
          <NavItem to="/board">구인구직 게시판</NavItem>
          <NavItem to="/about">about Jobs</NavItem>
      </NavMenu>

      <FooterMenu>
          <FooterLink to="/subscription">월정액 구독 ⊕</FooterLink>
          
          <AuthLinks>
            {isLoggedIn ? (
              <>
                <UserInfo>{name}님</UserInfo>
                <LogoutButton onClick={logout}>log out →</LogoutButton>
              </>
            ) : (
              <>
                <FooterLink to="/login">log in →</FooterLink>
                <FooterLink to="/register">sign up →</FooterLink>
              </>
            )}
          </AuthLinks>

      </FooterMenu>
    </SidebarContainer>
  );
};

export default Sidebar;