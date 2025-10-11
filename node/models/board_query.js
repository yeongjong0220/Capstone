const pool = require("../database/db");


/*

title: '',
content: '',
writer: '',
type : '',

포스트 형태
*/



async function writeBoard(post) {
    const conn = await pool.getConnection();
    console.log(post);
    const {title, content, writer, type} = post;
    const now = new Date();
    
    try {
        const [result] = await conn.execute("insert into post(type, title, writer, date, text) value(?,?,?,?,?)",
                    [type, title, writer, now , content ]);
    }
    catch (err) {
        console.error(err);
    }
    finally {
        conn.release();
    }
}

module.exports = { writeBoard };