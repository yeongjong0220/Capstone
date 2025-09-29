const express = require("express");
const router = express.Router();

// db 연결
const {registerMember} = require("../models/register_query.js");
const {loginMember} = require("../models/login_query.js")

router.get('/', (req,res)=>{
    res.send("hi");
})

router.post('/login',async (req,res)=>{
    console.log("로그인 라우터" + req.body);
    const result = await loginMember(req.body);
    res.status(result.code).send(result.message);
})

router.post('/register',async (req,res)=>{
    console.log("회원가입 라우터"+req.body);
    try{
        const result = await registerMember(req.body);
        res.status(result.code).json(result.message);
    }
    catch(err){
        console.log(err);
        res.status(500);
    }
})


module.exports = router;