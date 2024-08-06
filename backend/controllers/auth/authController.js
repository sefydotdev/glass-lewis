const jwt = require("jsonwebtoken");
const pool = require("../../util/db");
const { handleError } = require("../../middlewares/errorHandlers");

const auth = async (req, res) => {
    const { key } = req.body;

    if (!key || typeof key !== 'string') {
        return res.status(400).json({ error: 'Invalid key format' });
    }

    try {
        const client = await pool.connect();

        try {
            const result = await client.query('SELECT id, name, key FROM "User" WHERE key = $1', [key]);

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'User not found' });
            }

            const user = result.rows[0];
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.cookie('authToken', token, {
                path: '/',
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                maxAge: 3600000
            });

            res.status(200).json({ name: user.name });
        } finally {
            client.release();
        }
    } catch (err) {
        handleError(err, res);
    }
}

module.exports = { auth };
