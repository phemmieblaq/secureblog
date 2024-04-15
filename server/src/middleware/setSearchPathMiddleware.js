// setSearchPathMiddleware.js
const { pool } = require('../database');

async function setSearchPathMiddleware(req, res, next) {
    const client = await pool.connect();
    try {
        await client.query('SET search_path TO your_schema_name, public');
        req.dbClient = client;
        next();
    } catch (error) {
        client.release();
        console.error('Failed to setup database connection:', error);
        res.status(500).send('Failed to setup database connection');
    }
}

module.exports = setSearchPathMiddleware;
