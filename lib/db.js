const mariadb = require('mariadb');

const config = require('../../config/mysql.json');

const pool = mariadb.createPool({
    host: config.cliquidator.master.host,
    user: config.cliquidator.master.username,
    password: config.cliquidator.master.password,
    database: config.cliquidator.master.defaultDatabase,
    port: config.cliquidator.master.port,
    connectionLimit: 5
});

const queryDatabase = async (sql, replacements) => {
    let conn, resp;
    try {
        conn = await pool.getConnection();
        await conn.query('SELECT 1 AS val');
        resp = await conn.query(sql, replacements)
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release();
        return resp;
    }
};

module.exports = {
    query: queryDatabase,
    pool
};