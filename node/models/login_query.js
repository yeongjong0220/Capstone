const pool = require("../database/db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, '..', 'env', '.env') });

// .env
const JWT_SECRET = process.env.JWT_SECRET_KEY;

async function loginMember(registerData) {
    const conn = await pool.getConnection();

    const { type, email, password } = registerData;

    console.log(type, email, password);


    // 개선하자면 type에 따라 const table = type==='personal'?user:company
    try {
        if (type == 'personal') {
            const [result] = await conn.execute("select * from user where email = ? and approved = 'Y'",
                [email]);

            // 해싱된 비번이랑 비교
            const storedHashedPw = result[0].password;
            const isMatch = await bcrypt.compare(password, storedHashedPw);

            if (isMatch) {
                // jwt 토큰 발급 , 테이블 컬럼 명은 수정 예정
                const payload = {
                    email: result[0].email,          // DB의 고유 ID
                    name : result[0].name,
                    gender : result[0].gender,
                    region : result[0].region,
                    age : result[0].age,
                    type: type,       // 계정 유형 (개인/기업)
                };
                const token = jwt.sign(
                    payload,          // 토큰에 담을 정보
                    JWT_SECRET,       // 서명에 사용하는 비밀 키
                    { expiresIn: '10m' } // 토큰 만료 시간, + 만료 시간은 백엔드 서버에서 검증함 ()
                );
                return { success: true, code: 200, token: token }; // code는 꼭 넣을 것
            }
            else {
                return { success: false, code: 401, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
            }
        }

        // 그냥 기업일때
        else if (type == 'enterprise') {
            const [result] = await conn.execute("select * from company where email = ? and approved = 'Y'",
                [email]);

            // 해싱된 비번이랑 비교
            const storedHashedPw = result[0].password;
            const isMatch = await bcrypt.compare(password, storedHashedPw);

            if (isMatch) {
                // jwt 토큰 발급
                const payload = {
                    email: result[0].email,          // DB의 고유 ID
                    name : result[0].name,      // 회사명
                    type: type       // 계정 유형 (개인/기업)
                };
                const token = jwt.sign(
                    payload,          // 토큰에 담을 정보
                    JWT_SECRET,       // 서명에 사용하는 비밀 키
                    { expiresIn: '10m' } // 토큰 만료 시간
                );

                return { success: true, code : 200, token : token };
            }
            else {
                return { success: false, code: 401, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
            }
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

module.exports = { loginMember };