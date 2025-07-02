const User = require('../models/user.model');
const logger = require('../utils/logger');
const memoryStore = require('../models/memory.store');
const storeState = require('../utils/store.state');

// @desc    獲取當前用戶資料
// @route   GET /api/v1/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    // 從req.user獲取用戶信息（已由auth中間件設置）
    const userId = req.user._id;
    let user;

    try {
      if (!storeState.isUsingMemoryMode()) {
        user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: '用戶未找到'
            }
          });
        }
      }
    } catch (error) {
      logger.info('切換到內存存儲模式 (MongoDB連接失敗)');
      storeState.setUsingMemoryMode(true);
    }

    if (storeState.isUsingMemoryMode()) {
      user = await memoryStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用戶未找到'
          }
        });
      }
    }

    // 構建響應數據
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType || 'employee',
      status: user.status || 'active',
      remainingQueries: user.remainingQueries || 10,
      totalConsultations: user.totalConsultations || 0,
      profile: user.profile || {},
      companyName: user.companyName || '',
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.status(200).json({
      success: true,
      message: '獲取用戶資料成功',
      data: userResponse
    });
  } catch (error) {
    logger.error(`獲取用戶資料錯誤: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '伺服器錯誤，請稍後再試'
      }
    });
  }
};

// @desc    更新用戶資料
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    // 從req.user獲取用戶ID
    const userId = req.user._id;
    
    // 獲取可更新的欄位
    const { name, industry, position, companyName } = req.body;
    
    // 準備更新數據
    const updateData = {};
    if (name) updateData.name = name;
    if (companyName) updateData.companyName = companyName;
    
    // 更新profile字段
    updateData.profile = req.user.profile || {};
    if (industry) updateData.profile.industry = industry;
    if (position) updateData.profile.position = position;
    
    let user;

    try {
      if (!storeState.isUsingMemoryMode()) {
        user = await User.findByIdAndUpdate(
          userId,
          { $set: updateData },
          { new: true, runValidators: true }
        );
        
        if (!user) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: '用戶未找到'
            }
          });
        }
      }
    } catch (error) {
      logger.info('切換到內存存儲模式 (MongoDB連接失敗)');
      storeState.setUsingMemoryMode(true);
    }

    if (storeState.isUsingMemoryMode()) {
      user = await memoryStore.updateUser(userId, updateData);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用戶未找到'
          }
        });
      }
    }

    // 構建響應數據
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
      message: '更新用戶資料成功',
      data: userResponse
    });
  } catch (error) {
    logger.error(`更新用戶資料錯誤: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '伺服器錯誤，請稍後再試'
      }
    });
  }
};

// @desc    獲取剩餘諮詢次數
// @route   GET /api/v1/users/remaining-queries
// @access  Private
exports.getRemainingQueries = async (req, res) => {
  try {
    // 從req.user獲取用戶信息
    const userId = req.user._id;
    let user;

    try {
      if (!storeState.isUsingMemoryMode()) {
        user = await User.findById(userId).select('remainingQueries');
        if (!user) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: '用戶未找到'
            }
          });
        }
      }
    } catch (error) {
      logger.info('切換到內存存儲模式 (MongoDB連接失敗)');
      storeState.setUsingMemoryMode(true);
    }

    if (storeState.isUsingMemoryMode()) {
      user = await memoryStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用戶未找到'
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: '獲取剩餘諮詢次數成功',
      data: {
        remainingQueries: user.remainingQueries || 10
      }
    });
  } catch (error) {
    logger.error(`獲取剩餘諮詢次數錯誤: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '伺服器錯誤，請稍後再試'
      }
    });
  }
};

// @desc    扣減諮詢次數
// @route   POST /api/v1/users/decrease-query
// @access  Private
exports.decreaseQuery = async (req, res) => {
  try {
    // 從req.user獲取用戶信息
    const userId = req.user._id;
    let user;

    try {
      if (!storeState.isUsingMemoryMode()) {
        // 使用原子操作減少諮詢次數
        user = await User.findOneAndUpdate(
          { _id: userId, remainingQueries: { $gt: 0 } },
          {
            $inc: { 
              remainingQueries: -1,
              totalConsultations: 1
            }
          },
          { new: true }
        );
        
        if (!user) {
          // 查找用戶以確定是否因為剩餘次數不足而更新失敗
          const existingUser = await User.findById(userId);
          if (!existingUser) {
            return res.status(404).json({
              success: false,
              error: {
                code: 'USER_NOT_FOUND',
                message: '用戶未找到'
              }
            });
          }
          
          if (existingUser.remainingQueries <= 0) {
            return res.status(400).json({
              success: false,
              error: {
                code: 'NO_REMAINING_QUERIES',
                message: '您的諮詢次數已用完'
              }
            });
          }
        }
      }
    } catch (error) {
      logger.info('切換到內存存儲模式 (MongoDB連接失敗)');
      storeState.setUsingMemoryMode(true);
    }

    if (storeState.isUsingMemoryMode()) {
      user = await memoryStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用戶未找到'
          }
        });
      }
      
      if (user.remainingQueries <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_REMAINING_QUERIES',
            message: '您的諮詢次數已用完'
          }
        });
      }
      
      // 更新用戶數據
      user = await memoryStore.updateUser(userId, {
        remainingQueries: (user.remainingQueries || 10) - 1,
        totalConsultations: (user.totalConsultations || 0) + 1
      });
    }

    res.status(200).json({
      success: true,
      message: '扣減諮詢次數成功',
      data: {
        remainingQueries: user.remainingQueries,
        totalConsultations: user.totalConsultations
      }
    });
  } catch (error) {
    logger.error(`扣減諮詢次數錯誤: ${error.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '伺服器錯誤，請稍後再試'
      }
    });
  }
}; 