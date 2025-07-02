const express = require('express');
const { 
  getUserProfile, 
  updateUserProfile, 
  getRemainingQueries, 
  decreaseQuery 
} = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// 保護所有用戶路由，需要身份驗證
router.use(authenticate);

// 獲取用戶資料
router.get('/profile', getUserProfile);

// 更新用戶資料
router.put('/profile', updateUserProfile);

// 獲取剩餘諮詢次數
router.get('/remaining-queries', getRemainingQueries);

// 扣減諮詢次數
router.post('/decrease-query', decreaseQuery);

module.exports = router; 