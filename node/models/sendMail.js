const nodemailer = require("nodemailer");
const dotenv = require("dotenv"); // 숨겨진 환경변수 파일에서 값을 가져와 파싱(구문분석)을 할 수 있게 만드는 모듈
const path = require("path");
dotenv.config({ path: path.join(__dirname, '..', 'env', '.env') });
const { NODEMAILER_USER, NODEMAILER_PASS, BACK_SERVER } = process.env;

// 난수 code 생성하는 함수
const generateRandomNumber = (n) => {
  let code = "";
  for (let i = 0; i < n; i++) {
    code += Math.floor(Math.random() * 10);
  }
  
  return code;
};

// 메일의 기본적 속성을 정의 ??
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS,
  },
});

// 회원가입 인증용 메일
const sendEmail = async (email, type, code) => {
  const verificationUrl = `${BACK_SERVER}/confirmMember?type=${type}&token=${code}`;
  const mailOptions = {
    from: NODEMAILER_USER,
    to: email,
    subject: "회원가입 인증 코드", // 메일제목
    html: `<h1>Code 회원가입 인증 코드:</h1>
           <a href="${verificationUrl}">인증하기</a>`, // 메일 내용
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('sendEmail error', error);
    return { errorCode: 'MAIL_ERROR', message: '이메일 전송에 실패했습니다.' };
  }
};



// 비밀번호 리셋용 메일 , 흠 만들려나 이거
const sendPwMail = async (email,code) => {
  console.log("sendPwMail 보냄");
  
  const verificationUrl = `http://localhost:5173/resetPw?token=${code}`; // 이걸 비밀번호 변경할 수 있도록 바꿔야할 듯, 프론트 입력창으로
  const mailOptions = {
    from: NODEMAILER_USER,
    to: email,
    subject: "Co-Code 비밀번호 변경", // 메일제목
    html: `<h1>Co-Code 비밀번호 변경하기:</h1>
           <a href="${verificationUrl}">변경하기</a>`, // 메일 내용
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('sendPwMail error', error);
    return { errorCode: 'MAIL_ERROR', message: '이메일 전송에 실패했습니다.' };
  }
};

module.exports = { generateRandomNumber, sendEmail, sendPwMail };