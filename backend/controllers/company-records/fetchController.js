const jwt = require('jsonwebtoken');
const pool = require("../../util/db");
const { handleError } = require("../../middlewares/errorHandlers");
const { verifyToken } = require("../../middlewares/requestVerifier");

const fetchRecord = async (req, res) => {
    try {
        verifyToken(res, req.headers['authorization']);
        const query = `SELECT * FROM "CompanyRecords";`;
        const result = await pool.query(query);

        return res.status(200).json(result.rows);
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        handleError(err, res);
    }
};

module.exports = { fetchRecord };
