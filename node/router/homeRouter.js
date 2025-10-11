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
const {writeBoard} = require("../models/board_query.js")

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


router.get('/confirmMember', async (req,res)=>{
    await confirmMember(req.query);
    res.send("인증됨");
});

module.exports = router;