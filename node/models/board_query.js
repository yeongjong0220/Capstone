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

    try {
        const [results] = await conn.execute("select postnum,title,writer,date,type,approved from post where del = 'N'");
        return { code : 200, posts : results };
    }
    catch (err) {
        console.error(err);
    }
    finally {
        conn.release();
    }
}

async function getPost(postnum) {
    const conn = await pool.getConnection();
    
    try {
        const [results] = await conn.execute("select postnum,title,writer,date,type,approved,text from post where postnum = ? and del = 'N'", [postnum]);
        return { code : 200, post : results };
    }
    catch (err) {
        console.error(err);
    }
    finally {
        conn.release();
    }
}

async function approveY(postnum) {
    const conn = await pool.getConnection();
    
    try {
        const [results] = await conn.execute("update post set approved= 'Y' where postnum = ? and del = 'N'", [postnum]);
        return { code : 200 };
    }
    catch (err) {
        console.error(err);
    }
    finally {
        conn.release();
    }
}


module.exports = { writeBoard, getBoard, getPost , approveY };