import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx'; 

const SidebarContainer = styled.aside`
  width: ${props => (props.$isOpen ? '240px' : '70px')};
  background-color: #f2f4f5;
  border-right: 1px solid #eee;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-top-right-radius: 15px;    
  border-bottom-right-radius: 15px;
  transition: width 0.3s ease;
  position: relative;
  overflow: visible; /* 버튼이 튀어나와야 하므로 visible로 변경 */
`;

// [수정] 버튼 위치 중앙 이동 & 디자인 개선
const ToggleButton = styled.button`
  position: absolute;
  top: 50%; /* 수직 중앙 정렬 */
  transform: translateY(-50%); /* 정확한 중앙 정렬을 위한 보정 */
  right: -16px; /* 조금 더 밖으로 빼서 클릭하기 쉽게 */
  width: 32px; /* 크기 확대 */
  height: 32px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #ddd;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15); /* 그림자 강화 */
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9f9f9;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`;

const Logo = styled.h1`
  font-size: ${props => props.$isOpen ? '1.8rem' : '1.5rem'};
  font-weight: 800;
  margin: 0 0 40px 0;
  color: #333;
  font-family: 'Helvetica', sans-serif;
  letter-spacing: -1px;
  text-align: center;
  white-space: nowrap;
  transition: all 0.3s ease;
`;

const NavMenu = styled.nav`
  flex: 1; 
  display: flex;
  flex-direction: column;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isOpen ? 'flex-start' : 'center'};
  text-decoration: none;
  color: #555;
  font-size: 1rem;
  padding: 12px 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  height: 48px;

  &:hover {
    background-color: #507ea4;
    color: white;
    transform: ${props => props.$isOpen ? 'translateX(5px)' : 'none'};
  }

  &.active {
    background-color: #e0e0e0;
    font-weight: bold;
  }
`;

const IconWrapper = styled.span`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
`;

const Label = styled.span`
  margin-left: 12px;
  white-space: nowrap;
  opacity: ${props => props.$isOpen ? 1 : 0};
  width: ${props => props.$isOpen ? 'auto' : '0'};
  overflow: hidden;
  transition: all 0.2s ease;
`;

const FooterMenu = styled.div`
  border-top: 1px solid #eee;
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isOpen ? 'stretch' : 'center'};
`;

const FooterLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isOpen ? 'flex-start' : 'center'};
  text-decoration: none;
  color: #777;
  font-size: 0.9rem;
  padding: 8px 10px;
  transition: color 0.2s;
  height: 40px;

  &:hover {
    color: #000;
  }
`;

const AuthLinks = styled.div`
  display: flex;
  flex-direction: ${props => props.$isOpen ? 'row' : 'column'};
  justify-content: ${props => props.$isOpen ? 'space-between' : 'center'};
  align-items: center; 
  padding: 10px 0;
  gap: ${props => props.$isOpen ? '0' : '10px'};
`;

const UserInfo = styled.span`
  display: block;
  color: #333; 
  font-weight: bold;
  font-size: 0.9rem;
  padding: ${props => props.$isOpen ? '8px 10px' : '0'};
  text-align: center;
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #777;
  font-size: 0.9rem;
  padding: 8px 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit; 
  white-space: nowrap;
  
  &:hover {
    color: #000;
  }
`;

// [추가] 화살표 아이콘 (SVG)
const ArrowIcon = ({ isOpen }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: '20px', height: '20px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);


const Sidebar = () => {
  const { isLoggedIn, name, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <SidebarContainer $isOpen={isOpen}>
      {/* [수정] 개선된 토글 버튼과 아이콘 */}
      <ToggleButton onClick={toggleSidebar}>
        <ArrowIcon isOpen={isOpen} />
      </ToggleButton>

      <Logo $isOpen={isOpen}>
        {isOpen ? 'Jobs knows.' : 'J.'}
      </Logo> 
      
      <NavMenu>
          <NavItem to="/" $isOpen={isOpen}>
            <IconWrapper>💬</IconWrapper>
            <Label $isOpen={isOpen}>Jobs와 대화하세요</Label>
          </NavItem>
          
          <NavItem to="/map" $isOpen={isOpen}>
            <IconWrapper>🗺️</IconWrapper>
            <Label $isOpen={isOpen}>Jobs MAP</Label>
          </NavItem>
          
          <NavItem to="/board" $isOpen={isOpen}>
            <IconWrapper>📋</IconWrapper>
            <Label $isOpen={isOpen}>구인구직 게시판</Label>
          </NavItem>
          
          <NavItem to="/about" $isOpen={isOpen}>
            <IconWrapper>ℹ️</IconWrapper>
            <Label $isOpen={isOpen}>about Jobs</Label>
          </NavItem>
      </NavMenu>

      <FooterMenu $isOpen={isOpen}>
          <FooterLink to="/subscription" $isOpen={isOpen}>
            <IconWrapper>💳</IconWrapper>
            <Label $isOpen={isOpen}>월정액 구독 ⊕</Label>
          </FooterLink>
          
          <AuthLinks $isOpen={isOpen}>
            {isLoggedIn ? (
              <>
                <UserInfo $isOpen={isOpen}>{name}님</UserInfo>
                <LogoutButton onClick={logout} title="로그아웃">
                   {isOpen ? 'log out →' : '🚪'}
                </LogoutButton>
              </>
            ) : (
              <>
                <FooterLink to="/login" $isOpen={isOpen} title="로그인">
                  {isOpen ? 'log in →' : <IconWrapper>🔒</IconWrapper>}
                </FooterLink>
                {isOpen && <FooterLink to="/register" $isOpen={isOpen}>sign up →</FooterLink>}
                {!isOpen && (
                   <FooterLink to="/register" $isOpen={isOpen} title="회원가입">
                     <IconWrapper>📝</IconWrapper>
                   </FooterLink>
                )}
              </>
            )}
          </AuthLinks>

      </FooterMenu>
    </SidebarContainer>
  );
};

export default Sidebar;