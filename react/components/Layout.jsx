import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
display: flex;
height: 100vh;
`;

const ContentContainer = styled.main`
flex: 1;
padding: 40px;
  overflow-y: auto; // 콘텐츠가 길어지면 스크롤
`;

// Layout 컴포넌트는 children을 props로 받아서 렌더링합니다.
const Layout = ({ children }) => {
return (
    <LayoutContainer>
    <Sidebar />
    <ContentContainer>{children}</ContentContainer>
    </LayoutContainer>
);
};

export default Layout;