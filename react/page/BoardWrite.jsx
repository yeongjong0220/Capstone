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
      writer : authContext.userId,
      type : ((authContext.gender==='')?'기업':'개인'),
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
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    nav('/board');
  };

  // 폼 UI 렌더링
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white  ">
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
        게시글 작성
      </h1>
      
      <form onSubmit={handleSubmit}>
        
        {/* 1. 제목 입력 필드 */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            제목  <span className="text-red-500"> *</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={post.title}
            onChange={handleChange}
            required
            placeholder="제목을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
          />
        </div>

        {/* 2. 작성자 입력 필드 */}
        <div className="mb-4">
          <label htmlFor="writer" className="block text-sm font-medium text-gray-700 mb-1">
            작성자 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="writer"
            name="writer"
            value={post.writer}
            onChange={handleChange}
            required
            placeholder="이름 또는 닉네임을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
            disabled
          />
        </div>

        {/* 3. 내용 입력 필드 */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={post.content}
            onChange={handleChange}
            required
            rows="10"
            placeholder="내용을 입력하세요."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 resize-y"
          />
        </div>

        {/* 4. 파일 첨부 필드, 일단 필요없을 것 같아 숨김 */}
        <div className="mb-6" hidden>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            파일 첨부 (선택)
          </label>
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
        </div>

        {/* 5. 버튼 그룹 */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button 
            variant="secondary" 
            onClick={handleCancel}
          >
            취소
          </Button>
          <Button 
            variant="primary" 
            type="submit"
          >
            저장
          </Button>
        </div>
      </form>
    </main>
  );
};

export default BoardWrite;