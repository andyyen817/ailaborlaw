import { getTokenFromHeader, verifyToken } from '../utils/jwt.js';
import User from '../models/user.model.js';
import Admin from '../models/admin.model.js';
import logger from '../utils/logger.js';

/**
 * 認證中間件 (Protect Route)
 * 驗證 JWT，並將用戶信息附加到 req.user
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - Express下一個中間件函數
 */
export const protect = async (req, res, next) => {
  let token;
  try {
    token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供認證令牌，禁止訪問',
        error: { code: 'UNAUTHENTICATED', details: 'No token provided.' }
      });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) { // 確保 decoded 存在且包含 userId
      return res.status(401).json({
        success: false,
        message: '認證令牌無效或已過期',
        error: { code: 'INVALID_TOKEN', details: 'Token is invalid or expired.' }
      });
    }

    // 從資料庫中查找用戶，確保用戶仍然存在且狀態正常
    // 選擇要附加到 req.user 的字段，避免附加整個用戶對象（特別是密碼哈希）
    const currentUser = await User.findById(decoded.userId).select('-password');

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: '持有此令牌的用戶已不存在',
        error: { code: 'USER_NOT_FOUND', details: 'User belonging to this token no longer exists.' }
      });
    }

    if (currentUser.status === 'deleted') {
      return res.status(410).json({ // 410 Gone，用戶已刪除
        success: false,
        message: '此帳戶已被刪除',
        error: { code: 'ACCOUNT_DELETED', details: 'This account has been deleted.' }
      });
    }

    if (currentUser.status !== 'active') {
      return res.status(403).json({ // 403 Forbidden，因為用戶已認證但無權訪問
        success: false,
        message: `帳戶狀態為 "${currentUser.status}"，訪問被拒絕`,
        error: { code: 'ACCOUNT_INACTIVE_OR_DISABLED', details: `Account status is '${currentUser.status}'. Access denied.` }
      });
    }

    // 檢查令牌生成時間是否在用戶最後密碼修改時間之前
    // 這可以防止在密碼更改後舊令牌繼續有效
    if (decoded.iat && currentUser.passwordChangedAt) {
      const passwordChangedTime = Math.floor(new Date(currentUser.passwordChangedAt).getTime() / 1000);
      if (decoded.iat < passwordChangedTime) {
        return res.status(401).json({
          success: false,
          message: '用戶密碼已更改，請重新登入',
          error: { code: 'PASSWORD_CHANGED', details: 'User recently changed password. Please log in again.' }
        });
      }
    }

    // 將用戶信息附加到請求對象
    req.user = {
      id: currentUser._id.toString(), // 確保是字符串 ID
      userType: currentUser.userType,
      email: currentUser.email,
      name: currentUser.name,
      status: currentUser.status,
      remainingQueries: currentUser.remainingQueries,
      // 可以根據需要添加其他安全字段
    };
    
    // 記錄訪問日誌（用於審計）
    logger.debug(`認證用戶訪問: ${req.user.id} (${req.user.userType}) - ${req.method} ${req.originalUrl}`);
    
    next();
  } catch (error) {
    logger.error(`認證中間件錯誤: ${error.message}`, { 
      token: token ? '已提供' : '未提供', 
      path: req.path,
      method: req.method,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      message: '服務器認證過程中發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: 'An error occurred during authentication.' }
    });
  }
};

/**
 * 管理員權限中間件
 * 檢查用戶是否為管理員。必須在 protect 中間件之後使用。
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - Express下一個中間件函數
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    logger.warn(`非管理員用戶嘗試訪問管理員路由: User ID ${req.user ? req.user.id : 'Unknown'}, User Type ${req.user ? req.user.userType : 'Unknown'}`);
    return res.status(403).json({
      success: false,
      message: '權限不足，需要管理員權限',
      error: { code: 'FORBIDDEN', details: 'Admin access required.' }
    });
  }
};

/**
 * HR權限中間件
 * 檢查用戶是否為HR。必須在 protect 中間件之後使用。
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - Express下一個中間件函數
 */
export const isHR = (req, res, next) => {
  if (req.user && req.user.userType === 'hr') {
    next();
  } else {
    logger.warn(`非HR用戶嘗試訪問HR路由: User ID ${req.user ? req.user.id : 'Unknown'}, User Type ${req.user ? req.user.userType : 'Unknown'}`);
    return res.status(403).json({
      success: false,
      message: '權限不足，需要HR權限',
      error: { code: 'FORBIDDEN', details: 'HR access required.' }
    });
  }
};

/**
 * 雇主權限中間件
 * 檢查用戶是否為雇主。必須在 protect 中間件之後使用。
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - Express下一個中間件函數
 */
export const isEmployer = (req, res, next) => {
  if (req.user && req.user.userType === 'employer') {
    next();
  } else {
    logger.warn(`非雇主用戶嘗試訪問雇主路由: User ID ${req.user ? req.user.id : 'Unknown'}, User Type ${req.user ? req.user.userType : 'Unknown'}`);
    return res.status(403).json({
      success: false,
      message: '權限不足，需要雇主權限',
      error: { code: 'FORBIDDEN', details: 'Employer access required.' }
    });
  }
};

/**
 * 員工權限中間件
 * 檢查用戶是否為員工。必須在 protect 中間件之後使用。
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - Express下一個中間件函數
 */
export const isEmployee = (req, res, next) => {
  if (req.user && req.user.userType === 'employee') {
    next();
  } else {
    logger.warn(`非員工用戶嘗試訪問員工路由: User ID ${req.user ? req.user.id : 'Unknown'}, User Type ${req.user ? req.user.userType : 'Unknown'}`);
    return res.status(403).json({
      success: false,
      message: '權限不足，需要員工權限',
      error: { code: 'FORBIDDEN', details: 'Employee access required.' }
    });
  }
};

/**
 * 多角色權限中間件
 * 檢查用戶是否為指定角色之一。必須在 protect 中間件之後使用。
 * @param {String[]} roles - 允許的角色數組
 * @returns {Function} Express中間件函數
 */
export const hasRole = (roles) => {
  return (req, res, next) => {
    if (!Array.isArray(roles) || roles.length === 0) {
      logger.error('hasRole 中間件配置錯誤: roles 必須是非空數組');
      return res.status(500).json({
        success: false,
        message: '服務器配置錯誤',
        error: { code: 'SERVER_CONFIGURATION_ERROR', details: 'Role configuration error' }
      });
    }
    
    if (req.user && roles.includes(req.user.userType)) {
      next();
    } else {
      logger.warn(`用戶缺少所需角色: User ID ${req.user?.id}, User Type ${req.user?.userType}, Required Roles [${roles.join(', ')}]`);
      return res.status(403).json({
        success: false,
        message: '權限不足，需要特定角色權限',
        error: { code: 'FORBIDDEN', details: `Required roles: ${roles.join(', ')}` }
      });
    }
  };
};

/**
 * 查詢中間件 (Check Remaining Queries)
 * 檢查用戶是否有足夠的諮詢次數
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - Express下一個中間件函數
 */
export const hasRemainingQueries = async (req, res, next) => {
  try {
    // 用戶ID應該已經在protect中間件中設置
    const userId = req.user.id;
    
    // 獲取用戶信息
    const user = await User.findById(userId).select('remainingQueries');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: { code: 'USER_NOT_FOUND', details: '無法找到當前用戶' }
      });
    }
    
    // 檢查是否有足夠的諮詢次數
    if (user.remainingQueries <= 0) {
      return res.status(403).json({
        success: false,
        message: '諮詢次數不足',
        error: { 
          code: 'INSUFFICIENT_QUERIES', 
          details: '您的剩餘諮詢次數為0，無法發起新的諮詢。請充值後再試。' 
        }
      });
    }
    
    // 如果有足夠的諮詢次數，繼續下一個中間件
    next();
  } catch (error) {
    logger.error(`檢查諮詢次數失敗: ${error.message}`, { userId: req.user?.id });
    return res.status(500).json({
      success: false,
      message: '伺服器內部錯誤',
      error: { 
        code: 'SERVER_ERROR', 
        details: '檢查諮詢次數時發生錯誤'
      }
    });
  }
};

/**
 * 自己或管理員權限中間件
 * 確保用戶只能訪問自己的資源，除非是管理員
 * @param {String} userIdParam - 路由參數名稱，包含要訪問的用戶ID (默認為 'userId')
 * @returns {Function} Express中間件函數
 */
export const isSelfOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    const targetUserId = req.params[userIdParam];
    
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: `缺少必要的路由參數 ${userIdParam}`,
        error: { code: 'MISSING_PARAMETER', details: `Missing required parameter: ${userIdParam}` }
      });
    }
    
    // 如果是管理員，允許訪問
    if (req.user.userType === 'admin') {
      return next();
    }
    
    // 如果訪問自己的資源，允許訪問
    if (req.user.id === targetUserId) {
      return next();
    }
    
    // 其他情況，禁止訪問
    logger.warn(`用戶嘗試訪問其他用戶資源: ${req.user.id} 嘗試訪問 ${targetUserId}`);
    return res.status(403).json({
      success: false,
      message: '權限不足，只能訪問自己的資源',
      error: { code: 'FORBIDDEN', details: 'Can only access your own resources unless you are an admin.' }
    });
  };
};

/**
 * 可選認證中間件
 * 如果有認證令牌則驗證，沒有則繼續（支持游客用戶）
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - Express下一個中間件函數
 */
export const protectOptional = async (req, res, next) => {
  let token;
  try {
    token = getTokenFromHeader(req);

    // 如果沒有令牌，設置為游客用戶繼續
    if (!token) {
      req.user = {
        id: 'guest',
        userType: 'guest',
        email: null,
        name: 'Guest User',
        status: 'guest'
      };
      return next();
    }

    // 如果有令牌，嘗試驗證
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      // 令牌無效，設置為游客用戶
      req.user = {
        id: 'guest',
        userType: 'guest',
        email: null,
        name: 'Guest User',
        status: 'guest'
      };
      return next();
    }

    // 從資料庫中查找用戶
    const currentUser = await User.findById(decoded.userId).select('-password');

    if (!currentUser || currentUser.status !== 'active') {
      // 用戶不存在或不活躍，設置為游客用戶
      req.user = {
        id: 'guest',
        userType: 'guest',
        email: null,
        name: 'Guest User',
        status: 'guest'
      };
      return next();
    }

    // 用戶有效，設置認證用戶信息
    req.user = {
      id: currentUser._id.toString(),
      userType: currentUser.userType,
      email: currentUser.email,
      name: currentUser.name,
      status: currentUser.status,
      remainingQueries: currentUser.remainingQueries,
    };
    
    next();
  } catch (error) {
    // 發生錯誤，設置為游客用戶繼續
    logger.debug(`可選認證中間件錯誤 (設為游客): ${error.message}`);
    req.user = {
      id: 'guest',
      userType: 'guest',
      email: null,
      name: 'Guest User',
      status: 'guest'
    };
    next();
  }
};

/**
 * 通用认证令牌中间件
 * 支持普通用户和管理员的token认证
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
export const authenticateToken = async (req, res, next) => {
  let token;
  try {
    token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供認證令牌，禁止訪問',
        error: { code: 'UNAUTHENTICATED', details: 'No token provided.' }
      });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: '認證令牌無效或已過期',
        error: { code: 'INVALID_TOKEN', details: 'Token is invalid or expired.' }
      });
    }

    let currentUser = null;
    let userType = 'user';

    // 首先尝试在User表中查找
    currentUser = await User.findById(decoded.userId).select('-password');
    
    // 如果在User表中没找到，尝试在Admin表中查找
    if (!currentUser) {
      const adminUser = await Admin.findById(decoded.userId).select('-password_hash');
      if (adminUser) {
        currentUser = adminUser;
        userType = 'admin';
      }
    }

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: '持有此令牌的用戶已不存在',
        error: { code: 'USER_NOT_FOUND', details: 'User belonging to this token no longer exists.' }
      });
    }

    // 检查账户状态
    if (currentUser.status === 'deleted') {
      return res.status(410).json({
        success: false,
        message: '此帳戶已被刪除',
        error: { code: 'ACCOUNT_DELETED', details: 'This account has been deleted.' }
      });
    }

    if (currentUser.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `帳戶狀態為 "${currentUser.status}"，訪問被拒絕`,
        error: { code: 'ACCOUNT_INACTIVE_OR_DISABLED', details: `Account status is '${currentUser.status}'. Access denied.` }
      });
    }

    // 设置用户信息到req.user
    if (userType === 'admin') {
      req.user = {
        id: currentUser._id.toString(),
        userType: currentUser.role, // admin或super_admin
        email: currentUser.email,
        name: currentUser.username,
        status: currentUser.status,
        isAdmin: true
      };
    } else {
      req.user = {
        id: currentUser._id.toString(),
        userType: currentUser.userType,
        email: currentUser.email,
        name: currentUser.name,
        status: currentUser.status,
        remainingQueries: currentUser.remainingQueries,
        isAdmin: false
      };
    }
    
    logger.debug(`通用認證成功: ${req.user.id} (${req.user.userType}) - ${req.method} ${req.originalUrl}`);
    
    next();
  } catch (error) {
    logger.error(`通用認證中間件錯誤: ${error.message}`, { 
      token: token ? '已提供' : '未提供', 
      path: req.path,
      method: req.method,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      message: '服務器認證過程中發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: 'An error occurred during authentication.' }
    });
  }
};

/**
 * 角色权限中间件
 * 检查用户是否具有指定角色之一
 * @param {String[]} roles - 允许的角色数组
 * @returns {Function} Express中间件函数
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    // 确保用户已经通过认证
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '请先登录',
        error: { code: 'UNAUTHENTICATED', details: 'Authentication required' }
      });
    }
    
    // 检查角色
    if (!Array.isArray(roles) || roles.length === 0) {
      logger.error('requireRole 中间件配置错误: roles 必须是非空数组');
      return res.status(500).json({
        success: false,
        message: '服务器配置错误',
        error: { code: 'SERVER_CONFIGURATION_ERROR', details: 'Role configuration error' }
      });
    }
    
    // 检查角色匹配，管理员角色特殊处理
    const userRole = req.user.userType;
    const hasRequiredRole = roles.includes(userRole) || 
                           (roles.includes('admin') && (userRole === 'admin' || userRole === 'super_admin'));
    
    if (hasRequiredRole) {
      next();
    } else {
      logger.warn(`用户缺少所需角色: User ID ${req.user.id}, User Type ${req.user.userType}, Required Roles [${roles.join(', ')}]`);
      return res.status(403).json({
        success: false,
        message: '权限不足，需要特定角色权限',
        error: { code: 'FORBIDDEN', details: `Required roles: ${roles.join(', ')}` }
      });
    }
  };
};

// 注意：原有的 isSuperAdmin 和 hasPermission 中間件已移除，
// 因為它們依賴於當前任務範圍之外的 Admin 模型和特定權限系統。
// 如果將來需要，可以基於 User 模型的 userType 或更複雜的角色權限系統重新實現。
