import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
  max-width: 900px;
  margin: 20px;
  padding: 20px;
`;

const Section = styled.section`
  margin-bottom: 50px;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #507ea4;
`;

const ContentBox = styled.div`
  background: #f2f4f5;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  min-height: 150px; // 높이 살짝 조정
  font-size: 1rem;
  line-height: 1.7;
`;

const About = () => {
  return (
    <AboutContainer>
      <Section>
        <Title>지역정책 AI 챗봇 사용 방법</Title>
        <ContentBox>
          지역 정책 AI 챗봇은, 우리 지역 맞춤형 AI 챗봇으로 지
          역에서 시행되는 정책을 비롯한 우리 지역의 다양한 정
          보들을 제공해주는 서비스입니다.<br />
          사용법은 간단합니다. 사이트나 어플에 접속하여 알고 
          싶은 정보에 대해 편히 질문해 보세요!
        </ContentBox>
      </Section>

      <Section>
        <Title>개발 스토리</Title>
        <ContentBox>
          내용 작성
          {/* 여기에 개발 스토리를 채워넣으세요 */}
        </ContentBox>
      </Section>
    </AboutContainer>
  );
};

export default About;