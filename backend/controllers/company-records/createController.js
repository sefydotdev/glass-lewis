const jwt = require('jsonwebtoken');
const pool = require("../../util/db");
const { handleError } = require("../../middlewares/errorHandlers");
const { verifyToken } = require("../../middlewares/requestVerifier");

const createRecord = async (req, res) => {
    try {
        verifyToken(res, req.headers['authorization']);

        const { name, exchange, ticker, ISIN, website } = req.body;

        if (!name || !exchange || !ticker || !ISIN) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const query = `
            INSERT INTO "CompanyRecords" (name, exchange, ticker, isin, website)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const values = [name, exchange, ticker, ISIN, website || null];

        await pool.query(query, values);

        return res.status(201).json({ message: 'Record created successfully' });
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        if (err.code === '23505') {
            return res.status(409).json({ error: 'Record with this ISIN already exists' });
        }

        handleError(err, res);
    }
};

module.exports = { createRecord };
