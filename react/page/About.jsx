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
  min-height: 150px;
  font-size: 1rem;
  line-height: 1.7;
`;

const About = () => {
  return (
    <AboutContainer>
      <Section>
        <Title>서비스 이용 방법</Title>
        <ContentBox>
          저희 서비스는 우리 지역 맞춤형 <b>AI 챗봇</b>과 <b>구인구직 지도 서비스</b>를 결합하여, 
          흩어져 있는 지역 정책과 채용 정보를 한곳에서 제공합니다.<br /><br />
          
          <b>1. 지도 기반 채용 정보 확인:</b><br />
          지도 서비스를 통해 내 주변의 다양한 기업들이 올린 <b>공식적이고 최신화된 구인 공고</b>를 
          직관적으로 확인할 수 있습니다.<br /><br />

          <b>2. AI 챗봇 상담:</b><br />
          복잡한 정책이나 채용 공고 내용이 궁금하다면 챗봇에게 물어보세요. 
          챗봇이 지도에 등록된 최신 정보를 바탕으로 친절하게 답변해 드립니다.
        </ContentBox>
      </Section>

      <Section>
        <Title>개발 스토리</Title>
        <ContentBox>
          본 서비스는 <b>전남대학교 'We-Meet' 프로젝트</b>의 일환으로, 
          지역 사회의 정보 불균형을 해소하고자 기획되었습니다.<br /><br />
          
          <b>React</b> 기반의 직관적인 사용자 인터페이스, 
          <b>Node.js</b>와 <b>Python</b>(FastAPI, LangChain)을 활용한 안정적인 서버와 
          고도화된 RAG(검색 증강 생성) 기술을 접목하여, 
          단순 검색을 넘어 실질적인 도움을 줄 수 있는 
          <b>'로컬 정책 및 일자리 매칭 플랫폼'</b>으로 개발되었습니다.
        </ContentBox>
      </Section>
    </AboutContainer>
  );
};

export default About;