import { verifyToken } from '../utils/jwt.js';
const Admin = require('../models/admin.model.js');
const logger = require('../utils/logger.js');

/**
 * Admin認證中間件
 * 驗證請求頭中的JWT令牌，並將管理員信息添加到req.admin
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - Express下一個中間件函數
 */
export const protectAdmin = async (req, res, next) => {
  try {
    // 1. 獲取令牌
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      logger.warn('Admin API嘗試訪問，但未提供令牌');
      return res.status(401).json({
        success: false,
        message: '未授權，請提供有效的管理員訪問令牌',
        error: { code: 'ADMIN_AUTH_NO_TOKEN', details: 'No token provided.' }
      });
    }

    // 2. 驗證令牌
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id || decoded.type !== 'admin_access') {
      logger.warn('Admin API使用無效令牌嘗試訪問');
      return res.status(401).json({
        success: false,
        message: '訪問令牌無效或已過期',
        error: { code: 'ADMIN_AUTH_INVALID_TOKEN', details: 'Invalid token or wrong token type.' }
      });
    }

    // 3. 檢查管理員是否存在
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      logger.warn(`Admin API使用不存在的管理員ID嘗試訪問: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: '管理員不存在或已被刪除',
        error: { code: 'ADMIN_AUTH_ADMIN_NOT_FOUND', details: 'Admin not found.' }
      });
    }

    // 4. 檢查管理員狀態
    if (admin.status !== 'active') {
      logger.warn(`非活動狀態的管理員嘗試訪問: Admin ID ${admin._id}, status: ${admin.status}`);
      return res.status(403).json({
        success: false,
        message: '管理員帳號已被禁用',
        error: { code: 'ADMIN_AUTH_ADMIN_INACTIVE', details: 'Admin account is not active.' }
      });
    }

    // 5. 將管理員信息添加到請求對象
    req.admin = admin;
    
    // 繼續處理請求
    next();
  } catch (error) {
    logger.error(`Admin認證中間件錯誤: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '服務器在驗證管理員身份時發生錯誤',
      error: { code: 'ADMIN_AUTH_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 超級管理員權限中間件
 * 檢查管理員是否具有超級管理員權限。必須在 protectAdmin 中間件之後使用。
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - Express下一個中間件函數
 */
export const isSuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'super_admin') {
    next();
  } else {
    logger.warn(`非超級管理員嘗試訪問超級管理員路由: Admin ID ${req.admin ? req.admin._id : 'Unknown'}, Role ${req.admin ? req.admin.role : 'Unknown'}`);
    return res.status(403).json({
      success: false,
      message: '權限不足，需要超級管理員權限',
      error: { code: 'ADMIN_AUTH_NOT_SUPER_ADMIN', details: 'Super Admin access required.' }
    });
  }
};

/**
 * 檢查特定權限中間件
 * 檢查管理員是否具有特定權限。必須在 protectAdmin 中間件之後使用。
 * @param {String} permission - 需要檢查的權限
 * @returns {Function} Express中間件函數
 */
export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (req.admin && req.admin.hasPermission(permission)) {
      next();
    } else {
      logger.warn(`管理員缺少所需權限: Admin ID ${req.admin ? req.admin._id : 'Unknown'}, 需要權限: ${permission}`);
      return res.status(403).json({
        success: false,
        message: `權限不足，需要 ${permission} 權限`,
        error: { code: 'ADMIN_AUTH_PERMISSION_DENIED', details: `Permission '${permission}' required.` }
      });
    }
  };
}; 
