import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

  // 활성화된 링크 스타일 (NavLink를 사용하면 더 쉽게 구현 가능)
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
padding: 10px;
`;

const Sidebar = () => {
return (
    <SidebarContainer>
    <Logo>지역정책 AI 챗봇</Logo>
    
    <NavMenu>
        <NavItem to="/">홈</NavItem>
        <NavItem to="/board">게시판</NavItem>
        <NavItem to="/about">about</NavItem>
        <NavItem to="#">새 채팅</NavItem>
        <Divider />
    </NavMenu>

    <FooterMenu>
        <FooterLink to="/subscription">월정액 구독 ⊕</FooterLink>
        <AuthLinks>
        <FooterLink to="/login">log in →</FooterLink>
        {/* --- [수정됨] signup -> register --- */}
        <FooterLink to="/register">sign up →</FooterLink>
        </AuthLinks>
    </FooterMenu>
    </SidebarContainer>
);
};

export default Sidebar;