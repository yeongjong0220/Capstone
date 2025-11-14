import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styled, { css } from 'styled-components';

const GET_POSTS = import.meta.env.VITE_GET_POSTS;

const Board = () => {
  const authContext = useAuth();
  const [posts, setPosts] = useState([]);
  const [activePage, setActivePage] = useState(1);

  useEffect(() => {
    axios.get(GET_POSTS)
      .then((res) => {
        // --- [오류 추적을 위한 콘솔 로그 추가] ---
        console.log("--- API 응답 확인 ---");
        console.log("Raw res.data:", res.data);
        console.log("Array.isArray(res.data):", Array.isArray(res.data));
        // --- [로그 종료] ---

        if (Array.isArray(res.data)) {
          setPosts(res.data);
        } else {
          console.warn("API 응답이 배열이 아니므로, 빈 배열로 강제 설정합니다.");
          setPosts([]); // 배열이 아니면 무조건 빈 배열로 설정
        }
      })
      .catch((err) => {
        console.error("API 호출 중 오류 발생:", err);
        setPosts([]); // 에러 발생 시에도 빈 배열로 설정
        alert("게시물 가져오기 실패");
      });
  }, []); // 마운트 시 1회

  return (
    <BoardContainer>
      <HeaderWrapper>
        <Title>게시판</Title>
        {(authContext.isLoggedIn && (authContext.type === "admin" || authContext.type === "enterprise")) && (
          <WriteButton to="/board/write">
            글쓰기 ⊕
          </WriteButton>
        )}
      </HeaderWrapper>
      
      <PostList>
        {/* posts가 항상 배열이므로 .map 오류가 발생하지 않아야 함 */}
        {posts.map(post => (
          <PostItem key={post.postnum} to={`/board/view/${post.postnum}`}>
            <PostTitle>{post.title}</PostTitle>
            <PostAuthor>{post.writer}</PostAuthor>
          </PostItem>
        ))}
        
        {/* [추가] API 응답은 왔으나 데이터가 0개일 때 표시 */}
        {posts.length === 0 && (
          <NoPosts>게시글이 없습니다.</NoPosts>
        )}
      </PostList>
      
      <Pagination>
        <PageButton>이전</PageButton>
        {[1, 2, 3].map((page) => (
          <PageButton
            key={page}
            $active={page === activePage}
            onClick={() => setActivePage(page)}
          >
            {page}
          </PageButton>
        ))}
        <PageButton>다음</PageButton>
      </Pagination>
    </BoardContainer>
  );
};

// --- 스타일 컴포넌트 (이하 동일) ---

const BoardContainer = styled.div`
  padding: 40px;
  background: #fff;
  min-height: 500px;
  margin: 20px;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0; 
`;

const WriteButton = styled(Link)`
  background-color: #507ea4; 
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #335169;
  }
`;

const PostList = styled.div``;

// [추가] 게시글 없을 때
const NoPosts = styled.div`
  padding: 40px;
  text-align: center;
  color: #888;
  font-size: 1.1rem;
  border-bottom: 1px solid #f0f0f0;
`;

const PostItem = styled(Link)`
  display: flex;
  justify-content: space-between;
  padding: 20px 10px;
  border-bottom: 1px solid #f0f0f0;
  text-decoration: none;
  color: #333;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const PostTitle = styled.span`
  font-size: 1.1rem;
  flex: 1; 
  
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 20px;
`;

const PostAuthor = styled.span`
  font-size: 1rem;
  color: #777;
  width: 120px; 
  text-align: right;
  flex-shrink: 0;
`;

const Pagination = styled.div`
  text-align: center;
  margin-top: 40px;
  font-size: 1rem;
  color: #555;
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  font-size: 0.9rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  color: #555;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  ${props => props.$active && css`
    background-color: #507ea4;
    color: white;
    border-color: #507ea4;
    font-weight: bold;
  `}
`;

export default Board;