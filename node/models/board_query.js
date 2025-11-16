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
    const { title, summary, content, job_category, employment_type, required_experience,
        target_audience, region, tags, apply_start_date, apply_end_date, company_name, source_url,
        apply_method, apply_link, contact_info, attachments, status } = post;
    

    try {
        const [result] = await conn.execute("insert into post(title, summary, content, job_category, employment_type, required_experience, target_audience, region, tags, apply_start_date, apply_end_date, company_name, source_url, apply_method, apply_link, contact_info, attachments, status) value(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [title, summary, content, job_category, employment_type, required_experience,
                target_audience, region, tags, apply_start_date, apply_end_date, company_name, source_url,
                apply_method, apply_link, contact_info, attachments, status]);
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
        const [results] = await conn.execute("select post_id,title,company_name,created_at,view_count,approved from post where del = 'N'");
        return { code: 200, posts: results };
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
        const [results] = await conn.execute("select post_id,title,company_name,created_at,view_count,approved,content from post where post_id = ? and del = 'N'", [postnum]);
        return { code: 200, post: results };
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
        const [results] = await conn.execute("update post set approved= 'Y' where post_id = ? and del = 'N'", [postnum]);
        return { result : results, code: 200 };
    }
    catch (err) {
        console.error(err);
    }
    finally {
        conn.release();
    }
}


module.exports = { writeBoard, getBoard, getPost, approveY };