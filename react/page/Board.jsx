import { React, useEffect } from 'react';
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../contexts/AuthContext';


const posts = [
  { id: 121, title: "[학사안내] 2025학년도 제2학기 휴학·복학 신청 안내", writer: "학사지원처", date: "2025.06.13", type: '개인', approved: true },
  { id: 120, title: "[장학안내] 2차 국가장학금 신청 안내(~9/10)", writer: "장학재단", date: "2025.08.11", type: '기업', approved: false },
  { id: 119, title: "2025-2026학년도 전남대학교 해외 파견 프로그램 선발 일정", writer: "국제교류팀", date: "2024.11.21", type: '개인', happroved: true },
  { id: 118, title: "2025학년도 해외 단기 파견 선발 안내", writer: "국제교류팀", date: "2025.09.25", type: '개인', approved: true },
  { id: 117, title: "자유 게시판 이용 수칙 공지", writer: "운영자", date: "2025.09.01", type: '개인', approved: false },
];

const Board = () => {
  

  const nav = useNavigate();

  const authContext = useAuth();

  // 현재 활성화된 페이지 번호 (임시로 1 설정)
  const activePage = 1;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
      
      {/* 제목 및 글쓰기 버튼 */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">게시글 목록</h1>
      </div>

      {/* 게시판 테이블 */}
      <div className="overflow-x-auto">
        <table 
          // 테이블 전체 테두리 설정 및 border-collapse 적용 (셀 분리)
          className="min-w-full border-collapse table-auto border border-gray-300" 
        >
          <thead className="bg-gray-50">
            <tr>
              {/* 번호 (작은 너비) */}
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16 border border-gray-300">
                번호
              </th>
              {/* 제목 (가장 넓은 공간 사용) */}
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16 border border-gray-300">
                제목
              </th>
              {/* 작성자 (모바일에서 숨김) */}
              <th scope="col" className="px-25 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32 hidden sm:table-cell border border-gray-300">
                작성자
              </th>
              {/* 작성일 */}
              <th scope="col" className="px-10 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24 border border-gray-300">
                작성일
              </th>
              {/* 유형 */}
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16 hidden md:table-cell border border-gray-300">
                유형
              </th>
              {/* 첨부파일 (작은 너비) */}
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16 border border-gray-300">
                승인 여부
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-blue-50/50 transition duration-100 cursor-pointer">
                {/* 번호 */}
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300 text-center">
                  {post.id}
                </td>
                {/* 제목 */}
                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate border border-gray-300">
                  {/* 제목 링크 색상 통일 */}
                  <a href={`/board/view/${post.id}`} className="hover:text-blue-600 transition duration-150">
                    {post.title}
                  </a>
                </td>
                {/* 작성자 */}
                <td className="px-25 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell border border-gray-300">
                  {post.writer}
                </td>
                {/* 작성일 */}
                <td className="px-10 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                  {post.date}
                </td>
                {/* 유형 */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell border border-gray-300 text-center">
                  {post.type}
                </td>
                {/* 첨부 */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 flex justify-center border border-gray-300">
                  {post.approved ? 
                    <span className='text-center'>O</span> : <span className='text-center'>X</span> }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <br></br>
      {/* 임시 페이지네이션 */}
      <div className="mt-8 flex justify-center space-x-1">
        <button className="px-3 py-1 text-sm rounded-md border text-gray-600 hover:bg-gray-100">이전</button>
        {/* 선택된 페이지 색상 통일 */}
        {[1, 2, 3].map((page) => (
            <button 
                key={page}
                className={`px-3 py-1 text-sm rounded-md border transition duration-150
                    ${page === activePage 
                        ? 'font-bold text-white bg-blue-500 border-blue-500 hover:bg-blue-600' // 활성화된 페이지는 파란색
                        : 'text-gray-600 hover:bg-gray-100 border-gray-300' // 비활성화된 페이지
                    }`
                }
            >
                {page}
            </button>
        ))}
        <button className="px-3 py-1 text-sm rounded-md border text-gray-600 hover:bg-gray-100">다음</button>
        {
          authContext.isLoggedIn
          &&
          (
          <Button variant="primary" className="absolute right-0" onClick={()=>{
          nav('/board/write')
          
          }}>글쓰기</Button>
        )
        }
      </div>
    </main>
  );
};

export default Board;