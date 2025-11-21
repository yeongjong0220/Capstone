import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styled from 'styled-components';

import ViewKakaoMap from '../components/Maps/ViewKaKaoMap';

// --- [기능] 기존 로직 (유지) ---
const GET_POST = import.meta.env.VITE_GET_POST;
const SET_APPROVE = import.meta.env.VITE_SET_APPROVE;

const BoardView = () => {
  const { postnum } = useParams(); // URL에서 postnum 가져오기
  const [post, setPost] = useState({}); // 초기값을 빈 객체로 변경
  const nav = useNavigate();
  const authContext = useAuth();

  // [기능] 특정 게시글 데이터 불러오기
  useEffect(() => {
    axios.get(GET_POST, { params: { postnum } })
      .then((res) => {
        const [result] = res.data;
        setPost(result || {}); // 데이터가 없을 경우 빈 객체
      })
      .catch((err) => {
        console.log(err);
        alert("게시글을 불러오는 데 실패했습니다.");
      });
  }, [postnum]); // postnum이 바뀔 때마다 다시 실행

  // [기능] 관리자 승인 로직
  const setApprove = async () => {
    try {
      await axios.patch(SET_APPROVE, { postnum: postnum });
      alert("승인 처리되었습니다.");
      nav('/board'); // 목록으로 이동
    } catch (err) {
      console.log(err);
      alert("승인 처리에 실패했습니다.");
    }
  };

  // --- [디자인] 새로운 return 문 ---
  return (
    <PostContainer>
      <PostHeader>
        {/* [병합] 실제 데이터 post.title 바인딩 */}
        <PostTitle>{post.title || '로딩 중...'}</PostTitle>
        <PostInfo>
          {/* [병합] 실제 데이터 post.writer (혹은 post.name) 바인딩 */}
          <span>작성자: {post.company_name || '...'}</span>
          {/* [병합] 실제 데이터 post.date 바인딩 */}
          <span>작성일: {post.created_at || '...'}</span>
          {/* (조회수 로직은 기능에 없었으므로 임시 제거) */}
        </PostInfo>
      </PostHeader>

      {/* [병합] 실제 데이터 post.text 바인딩 */}
      <PostContent>
        {post.content}
      </PostContent>


      <ViewKakaoMap latitude = {post.latitude} longitude = {post.longitude}>

      </ViewKakaoMap>

      {/* --- [병합] 버튼 영역 (새 디자인 적용) --- */}
      <ButtonContainer>
        {/* [병합] 관리자 '승인하기' 버튼 (기능 유지) */}
        {(authContext.isLoggedIn && authContext.type === "admin" && post.approved !== 'Y') && (
          <ApproveButton onClick={setApprove}>
            승인하기
          </ApproveButton>
        )}

        {/* [디자인] '목록으로' 버튼 (Link로 구현) */}
        <ListButton to="/board">
          목록으로
        </ListButton>
      </ButtonContainer>

      {/* (댓글 기능은 원본에 없었으므로 CommentsSection 제거) */}
    </PostContainer>
  );
};

// --- [디자인] 스타일 (BoardPost.js에서 가져옴) ---

const PostContainer = styled.div`
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  margin: 20px; // Layout과 여백
`;

const PostHeader = styled.div`
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 30px;
`;

const PostTitle = styled.h2`
  font-size: 2.2rem;
  margin: 0 0 15px 0; // 날짜와 간격
  font-weight: bold;
`;

const PostInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.9rem;
`;

const PostContent = styled.div`
  min-height: 200px;
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  
  /* [병합] 백엔드 데이터의 줄바꿈(\n)을 인식하도록 추가 */
  white-space: pre-wrap;
`;

// [병합] 버튼들을 담을 컨테이너
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  border-top: 1px solid #eee;
  padding-top: 20px;
`;

// [병합] '목록' 버튼 (Link 기반)
const ListButton = styled(Link)`
  background-color: #555; 
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #333;
  }
`;

// [병합] '승인' 버튼 (button 기반)
const ApproveButton = styled.button`
  background-color: #507ea4; // 파란색 계열
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #335169;
  }
`;

export default BoardView;