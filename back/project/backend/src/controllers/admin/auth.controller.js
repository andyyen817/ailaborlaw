// 假设 Admin 模型, jwtUtils, logger 都已转换为 ES 模块或将被转换
const Admin = require('../../models/admin.model.js'); 
// jwtUtils 现在是命名导出
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../utils/jwt.js'; 
const logger = require('../../utils/logger.js');
const bcrypt = require('bcryptjs'); // 修正：使用 import 而非 require

/**
 * 管理员认证控制器 (旧版，基于 Admin 模型)
 * 注意：这部分可能需要与新的基于 User模型的认证系统进行协调或重构。
 */

/**
 * 管理员登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export const login = async (req, res) => {
  try {
    console.log('===== 管理員登入API調用 =====');
    console.log('請求體:', JSON.stringify(req.body));
    
    const { username, email, password } = req.body;
    
    console.log(`用戶名: ${username || '未提供'}`);
    console.log(`郵箱: ${email || '未提供'}`);
    console.log(`密碼長度: ${password ? password.length : 0}`);
    
    // 確保至少提供了用戶名或郵箱其中之一
    if ((!username && !email) || !password) {
      logger.warn('管理员登录: 缺少用户名/邮箱或密码');
      console.log('錯誤: 缺少必要欄位');
      return res.status(400).json({
        success: false,
        message: '用户名/邮箱和密码必须',
        code: 'ADMIN_AUTH_MISSING_CREDENTIALS'
      });
    }
    
    // 用於查找條件的變數
    const searchConditions = [];
    
    // 如果提供了用戶名，加入查找條件
    if (username) {
      searchConditions.push({ username });
    }
    
    // 如果提供了郵箱，加入查找條件
    if (email) {
      searchConditions.push({ email });
    }
    
    // 構建查詢條件
    const findQuery = searchConditions.length > 1 
      ? { $or: searchConditions }
      : searchConditions[0]; // 如果只有一個條件，直接使用，避免不必要的$or
    
    console.log('查詢條件:', JSON.stringify(findQuery));
    
    // 查找管理员账号
    const admin = await Admin.findOne(findQuery);
    
    if (!admin) {
      logger.warn(`管理员登录失败: 未找到使用条件 ${JSON.stringify(findQuery)} 的管理员`);
      console.log('錯誤: 未找到管理員帳戶');
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
        code: 'ADMIN_AUTH_INVALID_CREDENTIALS'
      });
    }
    
    console.log('找到管理員:', {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: admin.role,
      status: admin.status
    });
    
    // 驗證密碼
    console.log('驗證密碼中...');
    console.log('輸入密碼:', password);
    console.log('數據庫密碼哈希:', admin.password_hash);
    
    const isPasswordValid = await admin.comparePassword(password);
    console.log('密碼驗證結果:', isPasswordValid);
    
    // 嘗試直接用bcrypt驗證
    const bcryptResult = await bcrypt.compare(password, admin.password_hash);
    console.log('直接bcrypt驗證結果:', bcryptResult);
    
    if (!isPasswordValid) {
      logger.warn(`管理员登录失败: 密码不匹配，管理员ID ${admin._id}`);
      console.log('錯誤: 密碼不匹配');
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
        code: 'ADMIN_AUTH_INVALID_CREDENTIALS'
      });
    }
    
    if (admin.status !== 'active') {
      logger.warn(`管理员登录失败: 账户已禁用，管理员ID ${admin._id}`);
      console.log('錯誤: 帳戶狀態不是 active');
      return res.status(403).json({
        success: false,
        message: '账户已禁用',
        code: 'ADMIN_AUTH_ACCOUNT_DISABLED'
      });
    }
    
    // 记录登录时间
    if (typeof admin.recordLogin === 'function') {
      await admin.recordLogin();
    } else { // 简易替代
      admin.last_login_at = new Date();
      await admin.save();
    }
    
    // 确保 admin._id 是字符串类型，防止 JWT 生成问题
    const adminId = admin._id.toString();
    
    // 生成访问令牌
    const accessTokenPayload = {
      id: adminId,
      role: admin.role || 'admin',
      userType: 'admin_separate_table',
      type: 'admin_access'
    };
    const accessToken = generateAccessToken(accessTokenPayload);
    
    // 生成刷新令牌
    const refreshTokenPayload = {
      id: adminId,
      role: admin.role || 'admin',
      userType: 'admin_separate_table',
      type: 'admin_refresh'
    };
    const refreshToken = generateRefreshToken(refreshTokenPayload);
    
    if (!accessToken || !refreshToken) {
      logger.error('Admin login: Failed to generate tokens for admin ID:', adminId);
      console.log('錯誤: 生成令牌失敗');
      return res.status(500).json({
        success: false,
        message: '登录凭证生成失败',
        code: 'ADMIN_AUTH_TOKEN_GENERATION_ERROR'
      });
    }
    
    console.log('登入成功，返回令牌');
    logger.info(`管理员登录成功: ${admin.username} (${admin.role})`);
    
    return res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        admin: { // 只返回安全信息
          id: adminId,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          status: admin.status
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
        }
      }
    });
  } catch (error) {
    console.log('登入過程中發生錯誤:', error);
    logger.error(`管理员登录错误: ${error.message}`, {stack: error.stack});
    return res.status(500).json({
      success: false,
      message: '服务器内部错误 (登录过程)',
      code: 'ADMIN_AUTH_LOGIN_SERVER_ERROR'
    });
  }
};
  
/**
 * 获取当前管理员信息
 * @param {Object} req - 请求对象 (期望 req.admin 由特定于 Admin 模型的中间件填充)
 * @param {Object} res - 响应对象
 */
export const getCurrentAdmin = async (req, res) => {
  try {
    // 此函数高度依赖于一个能正确填充 req.admin 的中间件，
    // 该中间件需要基于 Admin 模型进行JWT验证和用户查找。
    // 我们当前的 protect/isAdmin 是基于 User 模型的。
    if (!req.admin) { // req.admin 应该由一个 Admin 专属的认证中间件填充
      logger.warn('getCurrentAdmin: req.admin is not populated.');
      return res.status(401).json({
        success: false,
        message: '未授权或管理员信息不可用 (req.admin missing)',
        code: 'ADMIN_AUTH_GET_CURRENT_UNAUTHORIZED'
      });
    }
    const admin = req.admin; 

    return res.status(200).json({
      success: true,
      data: { // 只返回安全信息
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role, // 假设 Admin 模型有 role 字段
        status: admin.status,
        last_login_at: admin.last_login_at, // 假设 Admin 模型有 last_login_at 字段
        created_at: admin.created_at // 假设 Admin 模型有 created_at 字段
      }
    });
  } catch (error) {
    logger.error(`获取管理员信息错误: ${error.message}`, {stack: error.stack});
    return res.status(500).json({
      success: false,
      message: '服务器内部错误 (获取管理员信息)',
      code: 'ADMIN_AUTH_GET_CURRENT_SERVER_ERROR'
    });
  }
};
  
/**
 * 创建初始超级管理员账户（仅用于系统初始化）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
export const createInitialAdmin = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    
    // 增加一个环境变量控制是否允许重复创建，以防意外调用
    if (adminCount > 0 && process.env.ALLOW_INITIAL_ADMIN_CREATION !== 'true') { 
      return res.status(403).json({
        success: false,
        message: '管理员账户已存在，不允许重复创建初始账户',
        code: 'ADMIN_AUTH_INITIAL_ADMIN_EXISTS_RESTRICTED'
      });
    }
    
    const initialAdminData = {
        username: process.env.INITIAL_ADMIN_USERNAME || 'superadmin',
        email: process.env.INITIAL_ADMIN_EMAIL || 'superadmin@example.com',
        password: process.env.INITIAL_ADMIN_PASSWORD || 'SuperSecureP@ssw0rd1!', // 建议使用更强的默认密码
        role: 'super_admin', // 假设 Admin 模型有 role 字段
        status: 'active'
    };

    // 确保 Admin 模型有 pre-save hook 处理密码哈希, 
    // 否则需要在此处手动哈希 initialAdminData.password 字段
    // 例如:
    // if (Admin.schema.options.autoIndex === undefined) { // 仅为示例条件
    //    const bcrypt = await import('bcryptjs'); // 动态导入或在顶部导入
    //    const salt = await bcrypt.genSalt(10);
    //    initialAdminData.password_hash = await bcrypt.hash(initialAdminData.password, salt); // 假设模型存 password_hash
    //    delete initialAdminData.password; 
    // }

    const admin = await Admin.create(initialAdminData); 
    
    return res.status(201).json({
      success: true,
      message: '初始超级管理员账户创建成功',
      data: { // 只返回安全信息
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    logger.error(`创建初始超级管理员错误: ${error.message}`, {stack: error.stack});
    return res.status(500).json({
      success: false,
      message: '服务器内部错误 (创建超级管理员)',
      code: 'ADMIN_AUTH_CREATE_INITIAL_ADMIN_SERVER_ERROR'
    });
  }
};

/**
 * 創建初始超級管理員賬戶 (公開API)
 * 僅在系統中沒有任何管理員用戶時可用
 * @route POST /api/v1/admin/auth/setup-initial-admin
 * @access Public
 */
export const setupInitialAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 驗證必填欄位
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用戶名、電子郵箱和密碼為必填項',
        code: 'ADMIN_AUTH_MISSING_FIELDS'
      });
    }
    
    // 檢查系統中是否已有管理員
    const adminCount = await Admin.countDocuments();
    
    // 如果已有管理員賬戶，則拒絕操作
    if (adminCount > 0) {
      logger.warn(`嘗試創建初始超級管理員但系統中已有 ${adminCount} 個管理員賬戶`);
      return res.status(403).json({
        success: false,
        message: '系統中已有管理員賬戶，無法使用此API',
        code: 'ADMIN_AUTH_ADMINS_ALREADY_EXIST'
      });
    }
    
    // 檢查郵箱是否已存在
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: '該郵箱已被註冊',
        code: 'ADMIN_AUTH_EMAIL_EXISTS'
      });
    }
    
    // 創建超級管理員
    const admin = new Admin({
      username,
      email,
      password, // 密碼會由Admin模型的虛擬屬性處理哈希
      role: 'super_admin',
      status: 'active'
    });
    
    await admin.save();
    
    logger.info(`系統初始超級管理員已創建: ${username} (${email})`);
    
    return res.status(201).json({
      success: true,
      message: '初始超級管理員創建成功',
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    logger.error(`創建初始超級管理員錯誤: ${error.message}`, { stack: error.stack });
    
    // 檢查是否是驗證錯誤
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: '輸入資料驗證失敗',
        code: 'ADMIN_AUTH_VALIDATION_ERROR',
        details: error.errors
      });
    }
    
    // 檢查是否是重複鍵錯誤
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: '用戶名或郵箱已被使用',
        code: 'ADMIN_AUTH_DUPLICATE_KEY'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '服務器內部錯誤',
      code: 'ADMIN_AUTH_SERVER_ERROR'
    });
  }
};

/**
 * 緊急設置超級管理員角色
 * 用於在系統出現問題時，將指定郵箱的管理員設置為超級管理員
 * @route POST /api/v1/admin/auth/emergency-super-admin/:email
 * @access Public (需要特殊安全碼)
 */
export const emergencySuperAdmin = async (req, res) => {
  try {
    const { email } = req.params;
    const { secretKey } = req.body;
    
    // 驗證安全碼
    const expectedSecretKey = process.env.ADMIN_EMERGENCY_SECRET || 'EmergencySuperAdmin2025';
    if (secretKey !== expectedSecretKey) {
      logger.warn(`有人嘗試使用錯誤的安全碼進行緊急管理員操作: ${email}`);
      return res.status(403).json({
        success: false,
        message: '安全碼無效',
        code: 'ADMIN_AUTH_INVALID_SECRET'
      });
    }
    
    // 檢查指定郵箱的管理員是否存在
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '未找到指定郵箱的管理員賬戶',
        code: 'ADMIN_AUTH_EMAIL_NOT_FOUND'
      });
    }
    
    // 設置為超級管理員並啟用賬戶
    admin.role = 'super_admin';
    admin.status = 'active';
    
    // 可選：重置密碼
    // 如果需要重置密碼，取消下面的註釋
    /*
    const defaultPassword = 'Test1234';
    admin.password = defaultPassword; // 會由 Admin 模型的 pre-save 鉤子進行哈希
    */
    
    await admin.save();
    
    logger.info(`緊急操作: ${email} 已被設置為超級管理員`);
    
    return res.status(200).json({
      success: true,
      message: '已成功將指定管理員設置為超級管理員',
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          status: admin.status
        }
      }
    });
  } catch (error) {
    logger.error(`緊急超級管理員操作錯誤: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '服務器內部錯誤',
      code: 'ADMIN_AUTH_SERVER_ERROR'
    });
  }
};
