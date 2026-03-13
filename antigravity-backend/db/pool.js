const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: process.env.DB_URL && process.env.DB_URL.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
