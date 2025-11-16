import React from 'react';
import styled from 'styled-components';

const SubscriptionContainer = styled.div`
  display: flex;
  flex-wrap: wrap; // 좁은 화면에서 줄바꿈
  gap: 30px;
  justify-content: center;
  align-items: stretch; // 박스 높이를 맞춤
  padding: 30px 20px;
  margin: 20px;
`;

const PlanBox = styled.div`
  width: 350px;
  min-height: 500px; // 최소 높이 조정
  background: #fff;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 2px solid ${props => props.$isVip ? '#507ea4' : '#eee'};

  /* [수정] flexbox로 레이아웃 변경 */
  display: flex;
  flex-direction: column;
  justify-content: space-between; // 콘텐츠와 버튼을 위아래로 분리
`;

const PlanTitle = styled.h2`
  font-size: 1.8rem;
  text-align: center;
  color: ${props => props.$isVip ? '#507ea4' : '#333'};
  margin-bottom: 30px;
`;

const PlanContent = styled.div`
  font-size: 1.1rem; // 기본 폰트 크기
  line-height: 1.8;
  
  h3 { // VIP 플랜용
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 10px;
  }
  p { // VIP 플랜용
    text-align: center;
    font-size: 1rem;
    color: #555;
    margin-bottom: 30px;
  }
  ul {
    list-style: none;
    padding-left: 0;
  }
  li {
    margin-bottom: 10px;
    padding-left: 20px;
    position: relative;
    &:before { // ' - ' 대신 '✓'
      content: '✓';
      color: #507ea4;
      position: absolute;
      left: 0;
      font-weight: bold;
    }
  }
`;

const StyledButton = styled.button`
  width: 100%; // 100%로 변경
  padding: 15px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background-color: #507ea4;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 30px; // [수정] 상단 여백으로 공간 확보 (br 태그 대신)

  &:hover {
    background-color: #335169;
  }
`;

const Subscription = () => {
  return (
    <SubscriptionContainer>
      <PlanBox>
        <div> {/* 상단 콘텐츠 묶음 */}
          <PlanTitle>현재 플랜</PlanTitle>
          <PlanContent>
            <ul>
              <li>제한적인 사용량</li>
              <li>제한적 메모리</li>
              <li>etc.</li>
            </ul>
          </PlanContent>
        </div>
        <div> {/* 하단 콘텐츠 (버튼 등) - 현재는 비어있음 */}
        </div>
      </PlanBox>

      <PlanBox $isVip> {/* transient prop ($) 사용 */}
        <div> {/* 상단 콘텐츠 묶음 */}
          <PlanTitle $isVip>VIP 플랜</PlanTitle> {/* transient prop ($) 사용 */}
          <PlanContent>
            <h3>XXXX 원 / 월</h3>
            <p>더 빠르게, 더 똑똑하게.</p>
            <ul>
              <li>더 많은 사용량</li>
              <li>더 많은 메모리</li>
              <li>보다 빠른 속도</li>
              <li>메세지 및 업로드 확장</li>
              <li>etc.</li>
            </ul>
          </PlanContent>
        </div>
        
        <div> {/* 하단 콘텐츠 (버튼) */}
          <StyledButton>결제하기</StyledButton>
        </div>
      </PlanBox>
    </SubscriptionContainer>
  );
};

export default Subscription;