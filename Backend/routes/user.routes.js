const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/users.controller');

router.post('/login', userCtrl.login);
router.post('/forgot-password', userCtrl.forgotPassword);
//router.post('/signup', userCtrl.signup);

module.exports = router;
