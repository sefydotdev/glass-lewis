const jwt = require("jsonwebtoken");
require('dotenv').config();

function verifyToken(res, authHeader){

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Token is required' });
    }

    jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
}

module.exports = { verifyToken };
