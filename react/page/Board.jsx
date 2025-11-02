import { React, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'

const GET_POSTS = import.meta.env.VITE_GET_POSTS;

// 게시물 예시
// const posts = [  
//   { postnum: 121, title: "안녕", writer: "최민석", date: "2025.06.13", type: '개인', approved: true },
// ];



const Board = () => {
  const nav = useNavigate();
  const authContext = useAuth();
  const [posts, setPosts] = useState([]);


  // 페이지네이션
  const [activePage, setActivePage] = useState(1); // 현재 페이지
  const postPerPage = 5; // 페이지당 포스트
  const [page, setPage] = useState(1) // 총 페이지 개수 
  const [fPostInx, setFinx] = useState(0)
  const [lPostInx, setLinx] = useState(4)


  // 한번에 보여줄 페이지 버튼
  const getPaginationRange = () => {
    const maxVisiblePages = 5; // 화면에 보여줄 최대 페이지 버튼 개수

    let startPage = Math.max(1, activePage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(page, startPage + maxVisiblePages - 1);

    // 끝 페이지가 부족할 경우 시작 페이지를 땡기기
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 1부터 endPage까지의 배열을 만들고, startPage 미만은 잘라냅니다.
    const pages = Array.from({ length: endPage }, (_, i) => i + 1).slice(startPage - 1);

    return pages;
  };






  useEffect(() => {
    axios.get(GET_POSTS)
      .then((res) => {
        setPosts(res.data)
      })
      .catch((err) => {
        console.log(err);
        alert("게시물 가져오기 실패");
      })
  }, []);

  useEffect(() => {
    const totalPage = Math.ceil(posts.length / postPerPage) // 총 페이지 개수 구하기
    setPage(totalPage)
    setFinx(postPerPage * (activePage - 1)) // 해당 페이지에서 보여줘야할 포스트의 첫 인덱스
    setLinx(postPerPage * (activePage - 1) + 4) // 해당 페이지에서 보여줘야할 포스트의 마지막 인덱스

  }, [activePage, posts])

  const upPage = () => {
    if (activePage < page) {
      setActivePage(activePage + 1);
      console.log("현재 페이지" + activePage);

    }
  }
  const downPage = () => {
    if (activePage > 1) {
      setActivePage(activePage - 1);
      console.log("현재 페이지" + activePage);
    }
  }



  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">

      {/* 제목 및 글쓰기 버튼 */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">게시글 목록</h1>
          <p className="text-sm text-gray-500">전체 게시글 {posts.length}개</p>
        </div>
        {(authContext.isLoggedIn && (authContext.type === "admin" || authContext.type === "enterprise")) && (
          <Button
            variant="primary"
            onClick={() => nav('/board/write')}
            className="px-4 py-2"
          >
            글쓰기
          </Button>
        )}
      </div>

      {/* 게시판 테이블 */}
      <div className="overflow-x-auto bg-white border border-gray-300 rounded">
        <table className="min-w-full border-collapse table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-[8%] px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-b border-gray-300">
                번호
              </th>
              <th scope="col" className="w-[35%] px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-b border-gray-300">
                제목
              </th>
              <th scope="col" className="w-[15%] px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-b border-gray-300 hidden sm:table-cell">
                작성자
              </th>
              <th scope="col" className="w-[18%] px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-b border-gray-300">
                작성일
              </th>
              <th scope="col" className="w-[12%] px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-b border-gray-300 hidden md:table-cell">
                유형
              </th>
              <th scope="col" className="w-[12%] px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-gray-300">
                승인 여부
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {posts.slice(fPostInx, lPostInx + 1).map((post) => (
              <tr key={post.postnum} className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900 border-r border-b border-gray-200">
                  {post.postnum}
                </td>
                <td className="px-6 py-4 text-sm border-r border-b border-gray-200">
                  <a
                    href={`/board/view/${post.postnum}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors truncate block"
                  >
                    {post.title}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700 hidden sm:table-cell border-r border-b border-gray-200">
                  {post.writer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 border-r border-b border-gray-200">
                  {post.date}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700 hidden md:table-cell border-r border-b border-gray-200">
                  {post.type}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm border-b border-gray-200">
                  {post.approved === 'Y' ?
                    <span className="text-green-600 font-semibold">✓</span> :
                    <span className="text-red-600 font-semibold">✗</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-6 flex justify-center items-center space-x-2">

        {/* '이전' 버튼 */}
        <button
          className="px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={downPage}
        >
          &lt;
        </button>

        {/* 로직 시작: 현재 보이는 페이지 범위 */}
        {getPaginationRange().map((pNum) => (
          <button
            key={pNum}
            onClick={() => setActivePage(pNum)} // 클릭 시 activePage 변경
            className={`px-3 py-2 text-sm border rounded transition-colors ${pNum === activePage
                ? 'bg-blue-500 border-blue-500 text-black font-semibold'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            {pNum}
          </button>
        ))}
        {/* 로직 끝 */}

        {/* 생략 기호 (...) 및 마지막 페이지 처리 */}
        {/* 조건: 마지막 보이는 페이지가 전체 페이지보다 작을 때 ... 표시 */}
        {getPaginationRange()[getPaginationRange().length - 1] < page && (
          <>
            {/* 생략 기호 */}
            <span className="px-3 py-2 text-sm text-gray-500">...</span>

            {/* 마지막 페이지 버튼 */}
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`px-3 py-2 text-sm border rounded transition-colors ${page === activePage
                  ? 'bg-blue-500 border-blue-500 text-white font-semibold'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              {page}
            </button>
          </>
        )}

        {/* '다음' 버튼 */}
        <button
          className="px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={upPage}
        >
          &gt;
        </button>
      </div>
    </main>
  );
};

export default Board;
