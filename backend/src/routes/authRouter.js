const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/otp', authController.otpGenerator);
router.post('/signup', authController.signup);

module.exports = router;
