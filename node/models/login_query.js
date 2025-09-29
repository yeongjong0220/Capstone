const pool = require("../database/db");
const bcrypt = require('bcrypt');

async function loginMember(registerData) {
    const conn = await pool.getConnection();

    const { type, id, password } = registerData;

    console.log(type, id, password);
    
    
    // 개선하자면 type에 따라 const table = type==='personal'?user:company
    try {
        if (type == 'personal') {
            const [result] = await conn.execute("select * from user where iduser = ?",
                [id]);

            // 해싱된 비번이랑 비교
            const storedHashedPw = result[0].password;
            const isMatch = await bcrypt.compare(password, storedHashedPw);

            if(isMatch){
                //TODO jwt 토큰 발급
                return { success: true, code : 200, user: result[0] }; // code는 꼭 넣을 것
            }
            else{
                return { success: false, code: 401, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
            }
        }

        // 그냥 기업일때
        else if (type == 'enterprise') {
            const [result] = await conn.execute("insert into company(idcompany, password) value(?,?)",
                [id, hashedPw]);

             // 해싱된 비번이랑 비교
            const storedHashedPw = result[0].password;
            const isMatch = await bcrypt.compare(password, storedHashedPw);

            if(isMatch){
                //TODO jwt 토큰 발급
                return { success: true, user: result[0] };
            }
            else{
                return { success: false, code: 401, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
            }
        }
    }
    catch (err) {
        console.error(err); // 에러

        return {message : err, code : 500};
    }
    finally {
        conn.release(); // 꼭 들어가야하는
    }
}

module.exports = { loginMember };