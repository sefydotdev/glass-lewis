const jwt = require('jsonwebtoken');
const { handleError } = require("../../middlewares/errorHandlers");
const { verifyToken } = require("../../middlewares/requestVerifier");


const autoLogin = async (req, res) => {
    try {
        verifyToken(res, req.headers['authorization']);
        res.status(200).json({ message: 'Token is valid' });
    } catch (err) {

        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        handleError(err, res);
    }
};

module.exports = { autoLogin };
