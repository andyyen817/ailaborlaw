const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const logger = require('../utils/logger');
const memoryStore = require('../models/memory.store');
const storeState = require('../utils/store.state');

// @desc    註冊新用戶
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // 驗證請求數據
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '輸入驗證失敗',
          details: errors.array()
        }
      });
    }

    const { name, email, password, userType, industry, occupation, companyName, profile } = req.body;

    // 準備用戶資料
    const userData = {
      name,
      email,
      password,
      companyName,
      profile: {}
    };

    // 設置可選字段
    if (userType) userData.userType = userType;
    if (industry) userData.profile.industry = industry;
    
    // 處理職位/position字段
    if (occupation) userData.profile.position = occupation;
    
    // 如果直接提供了profile對象，合併它
    if (profile && typeof profile === 'object') {
      userData.profile = { ...userData.profile, ...profile };
    }

    let user, token, existingUser;

    try {
      // 檢查是否在內存模式下運行
      if (!storeState.isUsingMemoryMode()) {
        // 檢查郵箱是否已存在
        existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: '此電子郵箱已被註冊'
            }
          });
        }

        // 創建用戶
        user = await User.create(userData);
        
        // 生成JWT令牌
        token = user.generateAuthToken();
      }
    } catch (error) {
      // 如果MongoDB操作失敗，切換到內存模式
      logger.info('切換到內存存儲模式 (MongoDB連接失敗)');
      storeState.setUsingMemoryMode(true);
    }
    
    // 如果使用內存模式或MongoDB操作失敗
    if (storeState.isUsingMemoryMode()) {
      // 檢查郵箱是否已存在
      existingUser = await memoryStore.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: '此電子郵箱已被註冊'
          }
        });
      }

      // 在內存中創建用戶
      userData.status = 'active'; // 確保狀態設為active
      userData.remainingQueries = 10; // 默認查詢次數
      userData.totalConsultations = 0;

      user = await memoryStore.createUser(userData);
      token = memoryStore.generateAuthToken(user);
    }

    // 返回用戶數據（不包含密碼）
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType || 'employee',
      status: user.status || 'active',
      remainingQueries: user.remainingQueries || 10,
      profile: user.profile || {},
      companyName: user.companyName || '',
      totalConsultations: user.totalConsultations || 0
    };

    res.status(201).json({
      success: true,
      message: '用戶註冊成功',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    logger.error(`註冊錯誤: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '伺服器錯誤，請稍後再試'
      }
    });
  }
};

// @desc    用戶登入
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // 驗證請求數據
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '輸入驗證失敗',
          details: errors.array()
        }
      });
    }

    const { email, password } = req.body;
    let user, isMatch, token;

    try {
      if (!storeState.isUsingMemoryMode()) {
        // 檢查用戶是否存在（包含密碼字段用於驗證）
        user = await User.findOne({ email }).select('+password');
        if (!user) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: '郵箱或密碼錯誤'
            }
          });
        }

        // 檢查帳戶狀態
        if (user.status !== 'active') {
          return res.status(401).json({
            success: false,
            error: {
              code: 'ACCOUNT_INACTIVE',
              message: '帳戶未啟用，請聯繫管理員'
            }
          });
        }

        // 驗證密碼
        isMatch = await user.matchPassword(password);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: '郵箱或密碼錯誤'
            }
          });
        }

        // 更新最後登入時間
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        // 生成JWT令牌
        token = user.generateAuthToken();
      }
    } catch (error) {
      // 如果MongoDB操作失敗，切換到內存模式
      logger.info('切換到內存存儲模式 (MongoDB連接失敗)');
      storeState.setUsingMemoryMode(true);
    }
    
    // 如果使用內存模式或MongoDB操作失敗
    if (storeState.isUsingMemoryMode()) {
      // 從內存存儲中查找用戶
      user = await memoryStore.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '郵箱或密碼錯誤'
          }
        });
      }

      // 驗證密碼
      isMatch = await memoryStore.matchPassword(user, password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '郵箱或密碼錯誤'
          }
        });
      }

      // 更新最後登入時間
      await memoryStore.updateUser(user._id, { lastLogin: new Date() });

      // 生成JWT令牌
      token = memoryStore.generateAuthToken(user);
    }

    // 返回用戶數據（不包含密碼）
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType || 'employee',
      status: user.status || 'active',
      remainingQueries: user.remainingQueries || 10,
      totalConsultations: user.totalConsultations || 0,
      profile: user.profile || {},
      companyName: user.companyName || ''
    };

    res.status(200).json({
      success: true,
      message: '登入成功',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    logger.error(`登入錯誤: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '伺服器錯誤，請稍後再試'
      }
    });
  }
}; 