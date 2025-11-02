import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

const BACK_WRITE = import.meta.env.VITE_BACK_WRITE;



// 게시글 작성 또는 수정을 위한 입력 폼
const BoardWrite = () => {


  // 제출할 때 토큰이랑 같이 보내서 하면 되겠네 !!!
  const authContext = useAuth();
  const nav = useNavigate();

  // 토큰
  const token = localStorage.getItem('authToken');

  // 작성자를 업데이트하기 위한 effect
  useEffect(()=>{
    setPost({
      title : '',
      content : '',
      writer : authContext.userId || '',
      type : ((authContext.type==='enterprise')?'기업':'개인') || '',
      file : null,
    })
  },[authContext]);

  // 게시글 상태 관리
  const [post, setPost] = useState({
    title: '',
    content: '',
    writer: '',
    type : '',
    file: null,
  });

  // 제목/작성자/내용 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost(prevPost => ({
      ...prevPost,
      [name]: value,
    }));
  };

  // 파일 첨부 핸들러
  const handleFileChange = (e) => {
    // 파일 하나만 처리 (첫 번째 파일)
    setPost(prevPost => ({
      ...prevPost,
      file: e.target.files[0],
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("제출할 데이터:", post);

    // 토큰과 같이 보내기 , 인터셉터는 그냥 안만들듯?
    axios.post(BACK_WRITE,{post :post, token :token})
         .then((res)=>{
           console.log(res);
         })
         .catch((err)=>{

         })
    alert(`제목: ${post.title}, 작성자: ${post.writer}로 저장 요청`);
    nav('/board');
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    nav('/board');
  };

  // 폼 UI 렌더링
  return (
    <main className="w-full px-8 py-8 bg-white min-h-screen">
      <div className="max-w-full mx-auto">
        
        {/* 제목 영역 */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">게시글 작성</h1>
          <p className="text-sm text-gray-500 mt-1">새로운 게시글을 작성해주세요</p>
        </div>
        
        {/* 폼 영역 - 테이블 형태 */}
        <div className="bg-white border border-gray-300">
          <form onSubmit={handleSubmit}>
            
            <table className="w-full border-collapse">
              <tbody>
                {/* 1. 제목 입력 필드 */}
                <tr className="border-b border-gray-300">
                  <th className="w-48 px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    제목 <span className="text-red-500">*</span>
                  </th>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={post.title}
                      onChange={handleChange}
                      required
                      placeholder="제목을 입력하세요"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                  </td>
                </tr>

                {/* 2. 작성자 */}
                <tr className="border-b border-gray-300">
                  <th className="w-48 px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    작성자 <span className="text-red-500">*</span>
                  </th>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      id="writer"
                      name="writer"
                      value={post.writer}
                      onChange={handleChange}
                      required
                      placeholder="이름 또는 닉네임을 입력하세요"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      disabled
                    />
                  </td>
                </tr>
                
                {/* 3. 유형 */}
                <tr className="border-b border-gray-300">
                  <th className="w-48 px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    유형
                  </th>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      id="type"
                      name="type"
                      value={post.type}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      disabled
                    />
                  </td>
                </tr>

                {/* 4. 내용 입력 필드 */}
                <tr className="border-b border-gray-300">
                  <th className="w-48 px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300 align-top">
                    내용 <span className="text-red-500">*</span>
                  </th>
                  <td className="px-6 py-4">
                    <textarea
                      id="content"
                      name="content"
                      value={post.content}
                      onChange={handleChange}
                      required
                      rows="15"
                      placeholder="내용을 입력하세요"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-y"
                    />
                  </td>
                </tr>

                {/* 5. 파일 첨부 필드, 일단 필요없을 것 같아 숨김 */}
                <tr hidden>
                  <th className="w-48 px-6 py-4 text-left text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-300">
                    파일 첨부 (선택)
                  </th>
                  <td className="px-6 py-4">
                    <input
                      type="file"
                      id="file"
                      name="file"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {post.file && (
                      <p className="mt-2 text-sm text-gray-600">첨부된 파일: {post.file.name}</p>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 버튼 그룹 */}
            <div className="flex justify-end space-x-3 px-6 py-5 bg-gray-50 border-t border-gray-300">
              <Button 
                variant="secondary" 
                onClick={handleCancel}
                className="px-6 py-2"
              >
                취소
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                className="px-6 py-2"
              >
                저장
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default BoardWrite;