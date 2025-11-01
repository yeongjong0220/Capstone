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
const {writeBoard, getBoard} = require("../models/board_query.js")

///api/chat 라우터 필요 코드
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.get('/', (req,res)=>{
    res.send("hi");
})

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

router.get('/getPost',async (req,res)=>{
  try{
    const posts = await getBoard();
    
    res.status(200).json(posts);
  }
  catch{
    res.status(500)
  }
})


router.get('/confirmMember', async (req,res)=>{
    await confirmMember(req.query);
    res.send("인증됨");
});



router.post('/api/chat', async (req, res) => {
  try {
    // 1. React(Chat.jsx)에서 보낸 메시지 받기
    const userMessage = req.body.message;
    console.log('React로부터 받은 메시지:', userMessage);

    // 2. (★★ 핵심 ★★) Python RAG API 서버(8001번 포트)에 요청 전송
    const ragApiUrl = 'http://localhost:8001/ask';
    
    const ragResponse = await fetch(ragApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: userMessage // Python 서버의 ChatRequest 형식에 맞게 전송
      }),
    });

    if (!ragResponse.ok) {
      throw new Error(`Python RAG 서버 에러: ${ragResponse.statusText}`);
    }

    // 3. Python 서버의 응답(ChatResponse) 받기
    // (Python이 { "answer": "..." }로 반환하기로 약속)
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