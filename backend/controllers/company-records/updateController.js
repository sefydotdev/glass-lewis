const jwt = require('jsonwebtoken');
const pool = require("../../util/db");
const { handleError } = require("../../middlewares/errorHandlers");
const { verifyToken } = require("../../middlewares/requestVerifier");

const updateRecord = async (req, res) => {
    try {
        verifyToken(res, req.headers['authorization']);

        const { id, name, exchange, ticker, ISIN, website } = req.body;

        const updateQuery = `
            UPDATE "CompanyRecords"
            SET 
                "name" = $1,
                "exchange" = $2,
                "ticker" = $3,
                "isin" = $4,
                "website" = $5
            WHERE "id" = $6
            RETURNING *;
        `;
        const updateValues = [name, exchange, ticker, ISIN, website, id];

        const updateResult = await pool.query(updateQuery, updateValues);

        if (updateResult.rowCount === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }

        return res.status(200).json(updateResult.rows[0]);
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

module.exports = { updateRecord };
