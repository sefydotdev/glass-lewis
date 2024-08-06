const express = require('express');
const router = express.Router();
const { auth } = require('../../controllers/auth/authController');
const { autoLogin } = require('../../controllers/auth/autoLogin');

router.get('/autoLogin', autoLogin);
router.post('/auth', auth);

module.exports = router;
