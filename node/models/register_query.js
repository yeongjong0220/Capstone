const pool = require("../database/db");
const bcrypt = require('bcrypt');

async function registerMember(registerData) {
    const conn = await pool.getConnection();

    const { type, id, password, gender, region, age } = registerData;
    
    // 해싱
    const hashedPw = bcrypt.hashSync(password,10); 

    try {
        if (type == 'personal') {
            const [result] = await conn.execute("insert into user(iduser, password, gender, reigion, age ) value(?,?,?,?,?)",
                [id, hashedPw, gender, region, age]);

            return { message : result.affectedRows, code : 200};
        }
        else if (type == 'enterprise') {
            const [result] = await conn.execute("insert into company(idcompany, password) value(?,?)",
                [id, hashedPw]);

            return { message : result.affectedRows, code : 200};
        }
    }
    catch (err) {
        console.error(err); // 에러

        return { message :err, code : 500};
    }
    finally {
        conn.release(); // 꼭 들어가야하는
    }
}

module.exports = { registerMember };