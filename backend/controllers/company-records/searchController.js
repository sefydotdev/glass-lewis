const jwt = require('jsonwebtoken');
const pool = require("../../util/db");
const { handleError } = require("../../middlewares/errorHandlers");
const { verifyToken } = require("../../middlewares/requestVerifier");

const searchRecord = async (req, res) => {
    try {
        verifyToken(res, req.headers['authorization']);

        const sqlQuery = `SELECT * FROM "CompanyRecords" WHERE "name" ILIKE $1 OR "isin" ILIKE $1;`;
        const searchTerm = `%${req.body.query}%`;
        const result = await pool.query(sqlQuery, [searchTerm]);

        return res.status(200).json(result.rows);
    } catch (err) {

        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        handleError(err, res);
    }
};

module.exports = { searchRecord };
