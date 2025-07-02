import jwt from 'jsonwebtoken';
import logger from './logger.js'; // 已转换为 ES 模块

// 注意：不再在模块顶层读取 JWT_SECRET。将在函数内部按需读取。

/**
 * 生成访问令牌
 * @param {Object} payload - 令牌载荷 (应包含 userId 或 id)
 * @returns {String|null} 访问令牌或null (如果生成失败)
 */
export const generateAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d'; // 默认为1天
  
  if (!secret) {
    logger.error('JWT_SECRET 未配置，无法生成访问令牌。');
    return null; 
  }
  
  try {
    // 确保载荷包含必要字段 (支持userId或id，兼容Admin和User模型)
    if (!payload.userId && !payload.id) {
      logger.error('生成令牌时缺少必要的userId或id字段');
      return null;
    }
    
    // 添加令牌发行时间和过期时间
    const tokenPayload = {
      ...payload,
      // 确保userId字段存在，Admin模型使用id而不是userId
      userId: payload.userId || payload.id,
      iat: Math.floor(Date.now() / 1000), // 发行时间
    };
    
    return jwt.sign(tokenPayload, secret, {
      expiresIn: expiresIn,
      algorithm: 'HS256' // 明确指定算法
    });
  } catch (error) {
    logger.error(`生成JWT时发生错误: ${error.message}`, { stack: error.stack });
    return null;
  }
};

/**
 * 生成刷新令牌 (如果项目需要)
 * @param {Object} payload - 令牌载荷 (通常只包含 userId 或 id 以减少信息暴露)
 * @returns {String|null} 刷新令牌或null (如果生成失败)
 */
export const generateRefreshToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 默认为7天
  
  if (!secret) {
    logger.error('JWT_SECRET 未配置，无法生成刷新令牌。');
    return null;
  }
  
  try {
    // 确保载荷包含必要字段 (支持userId或id，兼容Admin和User模型)
    if (!payload.userId && !payload.id) {
      logger.error('生成刷新令牌时缺少必要的userId或id字段');
      return null;
    }
    
    // 刷新令牌仅包含最小必要信息
    const refreshPayload = {
      userId: payload.userId || payload.id, // 确保兼容Admin模型使用id
      type: payload.type || 'refresh',
      userType: payload.userType, // 保留用户类型信息
      iat: Math.floor(Date.now() / 1000), // 发行时间
    };
    
    return jwt.sign(refreshPayload, secret, {
      expiresIn: refreshExpiresIn,
      algorithm: 'HS256' // 明确指定算法
    });
  } catch (error) {
    logger.error(`生成刷新令牌时发生错误: ${error.message}`, { stack: error.stack });
    return null;
  }
};

/**
 * 验证令牌
 * @param {String} token - JWT令牌
 * @returns {Object|null} 解码后的载荷或null (如果验证失败)
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    logger.error('JWT_SECRET 未配置，无法验证令牌。');
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'] // 只接受HS256算法
    });
    
    // 可以添加额外的验证逻辑，例如检查令牌版本、黑名单等
    
    return decoded;
  } catch (error) {
    // 记录特定类型的 JWT 错误
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn(`JWT 已过期: ${error.message}`);
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.error(`JWT 验证错误: ${error.message}`);
    } else if (error instanceof jwt.NotBeforeError) {
      logger.warn(`JWT 尚未生效: ${error.message}`);
    } else {
      logger.error(`JWT 未知验证错误: ${error.message}`);
    }
    return null;
  }
};

/**
 * 从 Express 请求对象的 Authorization Header 获取令牌
 * @param {Object} req - Express请求对象
 * @returns {String|null} 提取的令牌或null (如果未找到或格式不正确)
 */
export const getTokenFromHeader = (req) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // 简单的令牌格式验证：确保它看起来像一个JWT
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        logger.warn('提供的令牌不是有效的JWT格式 (不包含三个部分)');
        return null;
      }
      
      return token;
    }
    
    return null;
  } catch (error) {
    logger.error(`从请求头解析令牌时发生错误: ${error.message}`, { stack: error.stack });
    return null;
  }
};

/**
 * 从令牌中提取用户ID (无需完全验证)
 * 用于日志或非关键操作，不应用于认证
 * @param {String} token - JWT令牌
 * @returns {String|null} 用户ID或null
 */
export const extractUserIdFromToken = (token) => {
  if (!token) return null;
  
  try {
    // 解码令牌但不验证签名
    const decoded = jwt.decode(token);
    return decoded?.userId || null;
  } catch (error) {
    logger.error(`从令牌提取用户ID时发生错误: ${error.message}`);
    return null;
  }
};

// 可以选择默认导出一个包含所有函数的对象，或者让调用者分别导入
// export default {
//   generateAccessToken,
//   generateRefreshToken,
//   verifyToken,
//   getTokenFromHeader,
// };
// 但命名导出更符合 ES 模块的风格，也更灵活
