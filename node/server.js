const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const path = require("path");
dotenv.config({ path: path.join(__dirname, 'env', '.env') });
const { FRONT_SERVER, BACK_PORT } = process.env;

const app = express();

// CORS 설정: 프론트엔드 서버 포트 허용
const corsOptions = {
  origin: FRONT_SERVER, // 프론트 개발 서버 포트
  credentials: true, // 쿠키/인증 헤더(credentials)를 포함한 요청 허용
};

app.use(cors(corsOptions)); //  CORS 미들웨어 적용 (서버간 통신 규약 완화)
app.use(express.json()); // JSON 파싱 미들웨어

const homeRouter = require("./router/homeRouter.js");

app.use('/', homeRouter);

app.listen(process.env.BACK_PORT, ()=>{
    const url = `http://localhost:${BACK_PORT}`;
    console.log("서버 실행 중 "+ url);
});

