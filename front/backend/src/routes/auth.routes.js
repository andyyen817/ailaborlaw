const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middleware/validate.middleware');

const router = express.Router();

// 註冊路由
router.post('/register', validateRegister, register);

// 登入路由
router.post('/login', validateLogin, login);

module.exports = router; 