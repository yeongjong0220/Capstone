const pool = require("../database/db");
const bcrypt = require('bcrypt');
const { generateRandomNumber, sendEmail, sendPwMail } = require('./sendMail');

async function registerMember(registerData) {
    const conn = await pool.getConnection();
    const code = generateRandomNumber(10);

    const { type, email, password, name, gender, region, age } = registerData;


    // 비번 해싱
    const hashedPw = bcrypt.hashSync(password, 10);


    // 정상 (a Y, d N) / 대기 (a N , d N) / 삭제 (a N, d Y) / 아예 계정이 없는 경우
    try {
        const [selectResult] = await conn.execute("select * from user where email = ?", [email]) // 이미 계정이 있는지 확인
        console.log(selectResult[0]);

        // 가계정이든 , 승인된 계정이든 있는 경우
        if (selectResult.length > 0) {
            // 1. 삭제된 계정 ==> 새로운 정보 덮어쓰기
            if (selectResult[0].del === 'Y') {
                const [result] = await conn.execute("update user set password = ?, type = ? , name = ?, gender =?, region =?, age = ?, del = 'N', approved = 'N', code = ? where email = ? ",
                    [hashedPw, type, name, gender, region, age, code, email]);
                sendEmail(email, type, code);
                return { message: '탈퇴 계정을 다시 승인 대기 상태로 만듦', code: 200 };
            }
            // 2. 정상 활동중인 계정 ==> 에러 메시지
            else if (selectResult[0].approved === 'Y') {
                return { message: '이미 가입된 계정이 존재', code: 409 }
            }
            // 3. 승인 대기중인 계정 ==> 새로운 정보 덮어쓰기 .. 이제 보니까 삭제된 계정이랑 로직 똑같이 해도 되나
            else {
                const [result] = await conn.execute("update user set password = ?, type = ? , name = ?, gender =?, region =?, age = ?, del = 'N', approved = 'N', code = ? where email = ? ",
                    [hashedPw, type, name, gender, region, age, code, email]);
                sendEmail(email, type, code);
                return { message: '가계정 상태의 계정에 대해 코드 재발급', code: 200 };
            }
        }
        // 4. 계정이 없는 경우  ==> 만들기  
        else {
            const [result] = await conn.execute("insert into user(email, password, type, name, gender, region, age, code ) value(?,?,?,?,?,?,?,?)",
                [email, hashedPw, type, name, gender, region, age, code]);
            sendEmail(email, type, code);
            return { message: '새로운 계정 생성', code: 200 };
        }
    }
    catch (err) {
        console.error(err); // 에러
        return { message: err, code: 500 };
    }
    finally {
        conn.release(); // 꼭 들어가야하는
    }
}

async function confirmMember(query) {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.execute(
            "update user set approved = 'Y', code = null where code = ? "
            , [query.token]
        )
        return result;
    }
    catch (err) {
        console.error(err);
    }
    finally {
        conn.release();
    }
}

async function setCodeForChPw(email){
    const conn = await pool.getConnection();
    const code = generateRandomNumber(10);
    try{
        const [result] = await conn.execute("update user set code = ? where email = ? ",
                    [code, email]);
        sendPwMail(email,code);
        return { message: '메일 송신', code: 200 };
    }
    catch (err){
        console.error(err);
    }
    finally{
        conn.release();
    }
}

async function changePw(code, newPw){
    const conn = await pool.getConnection();
    console.log(code, newPw);
    
    const hashedPw = bcrypt.hashSync(newPw, 10);
    try{
        const [result] = await conn.execute("update user set code = null , password= ? where code = ?",[hashedPw, code]);
        return { message: '비밀번호 변경완료', code: 200 };
    }
    catch(err){
        console.error(err);
    }
    finally{
        conn.release();
    }
}


module.exports = { registerMember, confirmMember, setCodeForChPw, changePw };

// 직면한 문제
//  3. 요청 데이터 수정하기 (jwt 토큰 + 인증 유지에 이름 사용하기 등)
//  4. 게시물 글쓰기 기능 + db 연결 (최종 글 업로드 눌렀을 때 jwt 토큰 보내서 무결성 검사받기)
//  5. board 류 디자인 수정