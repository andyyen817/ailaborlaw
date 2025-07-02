import User from '../models/user.model.js';
import { AppError, errorUtils } from '../utils/error.js';
import logger from '../utils/logger.js';

/**
 * 獲取當前用戶資料
 * @route GET /api/v1/users/me
 * @access Private
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user 應該由 auth 中間件設置
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: {
          code: 'USER_NOT_FOUND',
          details: '無法找到當前用戶資料'
        }
      });
    }

    // 格式化響應數據，符合前端需求並統一字段名稱
    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      // 統一使用前端期望的字段名稱
      phoneNumber: user.profile?.phone || '',
      companyName: user.profile?.company || '',
      industry: user.profile?.industry || '',
      position: user.profile?.position || '',
      remainingQueries: user.remainingQueries,
      totalConsultations: user.totalConsultations,
      status: user.status,
      registrationDate: user.registrationDate
    };

    // 添加緩存控制標頭，防止客戶端緩存
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      success: true,
      data: {
        user: responseData
      }
    });
  } catch (error) {
    logger.error(`獲取用戶資料失敗: ${error.message}`, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: '獲取用戶資料時發生錯誤',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * 更新當前用戶資料
 * @route PUT /api/v1/users/me
 * @access Private
 */
export const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, company, industry, position, occupation } = req.body;
    
    // 使用正確的點表示法更新嵌入式文檔
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates['profile.phone'] = phone;
    if (company) updates['profile.company'] = company;
    if (industry) updates['profile.industry'] = industry;
    
    // 處理職位字段（支持向後兼容）
    const finalPosition = position || occupation; // 優先使用 position，fallback 到 occupation
    if (finalPosition) updates['profile.position'] = finalPosition;
    
    // 如果嘗試更新郵箱，需要檢查是否已存在
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: '此電子郵箱已被其他用戶使用',
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            details: `Email ${email} is already registered.`
          }
        });
      }
      updates.email = email.toLowerCase();
    }

    // 記錄更新前的用戶資料（用於審計）
    const userBeforeUpdate = await User.findById(userId);
    if (!userBeforeUpdate) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: {
          code: 'USER_NOT_FOUND',
          details: '無法更新不存在的用戶'
        }
      });
    }
    
    // 記錄更新前的資料狀態
    logger.info(`用戶資料更新前: ${JSON.stringify({
      id: userBeforeUpdate._id,
      name: userBeforeUpdate.name,
      email: userBeforeUpdate.email,
      profile: userBeforeUpdate.profile
    })}`);

    // 使用正確的操作符和點表示法更新用戶資料
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    // 記錄更新後的資料狀態
    logger.info(`用戶資料更新後: ${JSON.stringify({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profile: updatedUser.profile
    })}`);

    // 格式化響應數據，統一使用前端需要的字段名稱
    const responseData = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      userType: updatedUser.userType,
      // 統一使用前端期望的字段名稱
      phoneNumber: updatedUser.profile?.phone || '',
      companyName: updatedUser.profile?.company || '',
      industry: updatedUser.profile?.industry || '',
      position: updatedUser.profile?.position || '',
      status: updatedUser.status
    };

    // 添加緩存控制標頭，防止客戶端緩存
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      success: true,
      message: '用戶資料已更新',
      data: {
        user: responseData
      }
    });
  } catch (error) {
    logger.error(`更新用戶資料失敗: ${error.message}`, { userId: req.user?.id, stack: error.stack });
    res.status(500).json({
      success: false,
      message: '更新用戶資料時發生錯誤',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * 更新當前用戶密碼
 * @route PUT /api/v1/users/me/password
 * @access Private
 */
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // 1. 獲取用戶（包含密碼欄位）
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: {
          code: 'USER_NOT_FOUND',
          details: '無法找到當前用戶'
        }
      });
    }

    // 2. 驗證當前密碼
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '當前密碼不正確',
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          details: '無法驗證當前密碼'
        }
      });
    }

    // 3. 更新密碼
    user.password = newPassword;
    await user.save(); // 這將觸發 pre-save 中間件來雜湊新密碼

    res.status(200).json({
      success: true,
      message: '密碼已更新成功'
    });
  } catch (error) {
    logger.error(`更新用戶密碼失敗: ${error.message}`, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: '更新密碼時發生錯誤',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * 刪除當前用戶（自行註銷）
 * @route DELETE /api/v1/users/me
 * @access Private
 */
export const deleteCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // 軟刪除（將狀態設為 'deleted'）
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          status: 'deleted',
          deletedAt: new Date()
        } 
      },
      { new: true }
    );
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: {
          code: 'USER_NOT_FOUND',
          details: '無法找到要刪除的用戶'
        }
      });
    }

    // 清除用戶會話（如果有）
    // TODO: 實現會話/令牌撤銷機制

    res.status(200).json({
      success: true,
      message: '用戶帳號已註銷'
    });
  } catch (error) {
    logger.error(`刪除用戶失敗: ${error.message}`, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: '刪除用戶時發生錯誤',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * 獲取當前用戶剩餘諮詢次數
 * @route GET /api/v1/users/me/queries
 * @access Private
 */
export const getRemainingQueries = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('remainingQueries totalConsultations');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: {
          code: 'USER_NOT_FOUND',
          details: '無法找到當前用戶'
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        remainingQueries: user.remainingQueries,
        totalConsultations: user.totalConsultations
      }
    });
  } catch (error) {
    logger.error(`獲取諮詢次數失敗: ${error.message}`, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: '獲取諮詢次數時發生錯誤',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * 扣減用戶諮詢次數
 * @route POST /api/v1/users/me/queries/decrease
 * @access Private
 */
export const decreaseQuery = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 使用findById獲取完整用戶對象，以便使用模型方法
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: {
          code: 'USER_NOT_FOUND',
          details: '無法找到當前用戶'
        }
      });
    }
    
    // 檢查是否有剩餘次數
    if (user.remainingQueries <= 0) {
      return res.status(400).json({
        success: false,
        message: '諮詢次數不足',
        error: {
          code: 'INSUFFICIENT_QUERIES',
          details: '您的剩餘諮詢次數為0，無法進行諮詢'
        }
      });
    }
    
    // 使用模型方法進行原子性操作
    const success = await user.decreaseRemainingQueries();
    
    if (!success) {
      return res.status(400).json({
        success: false,
        message: '扣減諮詢次數失敗',
        error: {
          code: 'DECREASE_QUERY_FAILED',
          details: '無法扣減諮詢次數，可能次數已用完'
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: '成功扣減一次諮詢次數',
      data: {
        remainingQueries: user.remainingQueries,
        totalConsultations: user.totalConsultations
      }
    });
  } catch (error) {
    logger.error(`扣減諮詢次數失敗: ${error.message}`, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: '扣減諮詢次數時發生錯誤',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * 增加用戶諮詢次數 (僅限管理員使用)
 * 此API通過管理員路由提供，支持Admin模型的認證方式
 * @param {Object} req - Express請求對象 
 * @param {Object} res - Express響應對象
 */
export const increaseQueries = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    
    // 從req.admin中獲取管理員信息（使用protectAdmin中間件時）
    const adminInfo = req.admin || req.user;
    
    // 日誌記錄操作信息
    logger.info(`管理員嘗試增加用戶諮詢次數: 管理員ID ${adminInfo.id || adminInfo._id}, 目標用戶ID ${userId}`);
    
    // 驗證輸入
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '無效的增加次數',
        error: {
          code: 'INVALID_AMOUNT',
          details: '增加次數必須是正數'
        }
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: {
          code: 'USER_NOT_FOUND',
          details: '無法找到指定用戶'
        }
      });
    }
    
    // 使用模型方法增加次數
    const newRemainingQueries = await user.increaseRemainingQueries(amount);
    
    // 日誌記錄成功操作
    logger.info(`管理員成功增加用戶諮詢次數: 管理員ID ${adminInfo.id || adminInfo._id}, 目標用戶ID ${userId}, 增加數量 ${amount}`);
    
    res.status(200).json({
      success: true,
      message: `成功增加${amount}次諮詢次數`,
      data: {
        userId: user._id,
        remainingQueries: newRemainingQueries,
        totalConsultations: user.totalConsultations
      }
    });
  } catch (error) {
    const adminInfo = req.admin || req.user;
    logger.error(`增加諮詢次數失敗: ${error.message}`, { 
      userId: req.params.userId,
      adminId: adminInfo?.id || adminInfo?._id || 'unknown'
    });
    res.status(500).json({
      success: false,
      message: '增加諮詢次數時發生錯誤',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
}; 