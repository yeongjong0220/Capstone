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

async function getBoard() {
    const conn = await pool.getConnection();
    console.log("getBoard 실행");

    try {
        const [results] = await conn.execute("select postnum,title,writer,date,type,approved,text from post where del = 'N'");
        return results;
    }
    catch (err) {
        console.error(err);
    }
    finally {
        conn.release();
    }
}

module.exports = { writeBoard, getBoard };