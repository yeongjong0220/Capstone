const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, '..', 'env', '.env') });
const jwt = require('jsonwebtoken');

const { JWT_SECRET_KEY } = process.env;

// db 연결
const {registerMember, confirmMember} = require("../models/register_query.js");
const {loginMember} = require("../models/login_query.js")
const {writeBoard, getBoard, getPost, approveY} = require("../models/board_query.js")

///api/chat 라우터 필요 코드
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));




// 홈페이지
router.get('/', (req,res)=>{
    res.send("hi");
})


// 로그인 및 회원가입
router.post('/login',async (req,res)=>{
    const result = await loginMember(req.body);
    console.log("로그인 라우터");
    console.log(result);
    res.status(result.code).json(result);
})

router.post('/register',async (req,res)=>{
    console.log("회원가입 라우터");
    console.log(req.body);
    
    try{
        const result = await registerMember(req.body);
        res.status(result.code).json(result.message);
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
})



// 게시판 관련 라우터
router.post('/write',async (req,res)=>{
    const token = req.body.token;
    const post = req.body.post;

    // 토큰이 유효하면 
    jwt.verify(token, JWT_SECRET_KEY, (err, userPayload) => {
        if (err) {
            // 토큰이 유효하지 않거나 만료됨
            console.log('JWT 검증 실패:', err.message);
            return res.status(403).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
        }
        
        writeBoard(post);

        res.status(200);
    })
})

router.get('/getPosts',async (req,res)=>{
  try{
    
    const result = await getBoard();
    
    res.status(result.code).json(result.posts);
  }
  catch{
    res.status(500)
  }
})

router.get('/getPost',async (req,res)=>{
  
  try{
    const result = await getPost(req.query.postnum);  
    res.status(result.code).json(result.post);
  }
  catch(err){
    console.log(err);
    res.status(500)
  }
})

router.patch('/setApprove',async (req,res)=>{
  try{
    
    const result = await approveY(req.body.postnum);  
    res.status(result.code).json(result.result);
  }
  catch(err){
    console.log(err);
    res.status(500)
  }
})


// 회원가입 인증을 위한 라우터
router.get('/confirmMember', async (req,res)=>{
    await confirmMember(req.query);
    res.send("인증됨");
});


// 챗봇 라우터
router.post('/api/chat', async (req, res) => {
  try {
    // ⭐️ 수정됨 1/2: React에서 'message'와 'history'를 모두 받음
    const { message, history } = req.body;
    console.log('React로부터 받은 메시지:', message);
    console.log(`React로부터 받은 대화 기록 수: ${history.length}개`);

    // 2. (★★ 핵심 ★★) Python RAG API 서버(8001번 포트)에 요청 전송
    const ragApiUrl = 'http://127.0.0.1:8001/ask'; // 'localhost'를 '127.0.0.1'로 변경
    
    const ragResponse = await fetch(ragApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // ⭐️ 수정됨 2/2: Python 서버로 'message'와 'history'를 함께 전송
      body: JSON.stringify({ 
        message: message, // 현재 질문
        history: history  // 이전 대화 기록 (React가 보낸 배열)
      }),
    });

    if (!ragResponse.ok) {
      throw new Error(`Python RAG 서버 에러: ${ragResponse.statusText}`);
    }

    // 3. Python 서버의 응답(ChatResponse) 받기
    // (Python이 { "answer": "...", "source": "..." }로 반환)
    const ragData = await ragResponse.json();
    const botReply = ragData.answer;

    // 4. React(Chat.jsx)가 기대하는 { reply: "..." } 형태로 최종 응답 전송
    res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error('챗봇 API 처리 중 오류:', error);
    res.status(500).json({ reply: '서버에서 오류가 발생했습니다.' });
  }
});

module.exports = router;