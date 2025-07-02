/**
 * 環境變量配置文件
 * 用於在應用啟動時加載環境變量，特別是在無法直接修改.env文件的情況下
 */

import dotenv from 'dotenv';
import logger from '../utils/logger.js';

// 嘗試加載.env文件
dotenv.config();

// 必要的環境變量檢查與設置
export const setupEnvironment = () => {
  // ⭐ 設置正確的MongoDB連接字符串
  if (!process.env.MONGODB_URI) {
    // 使用Sealos雲端MongoDB連接字符串
    process.env.MONGODB_URI = 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:45064/ailabor_db?directConnection=true&authSource=admin';
    logger.info('MONGODB_URI 已設置為Sealos雲端數據庫');
  }

  // 檢查並設置JWT密鑰
  if (!process.env.JWT_SECRET) {
    // 為開發環境設置默認密鑰
    const defaultSecret = 'ailabor_super_secret_key_for_development_only';
    process.env.JWT_SECRET = defaultSecret;
    logger.warn(`JWT_SECRET 未設置，使用默認值進行開發。生產環境請設置強密鑰！`);
  }

  // 設置JWT令牌過期時間
  if (!process.env.JWT_EXPIRES_IN) {
    process.env.JWT_EXPIRES_IN = '1d';
  }

  // 設置JWT刷新令牌過期時間
  if (!process.env.JWT_REFRESH_EXPIRES_IN) {
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  }

  // 允許初始管理員創建
  if (!process.env.ALLOW_INITIAL_ADMIN_CREATION) {
    process.env.ALLOW_INITIAL_ADMIN_CREATION = 'true';
  }

  // 設置初始超級管理員信息
  if (!process.env.INITIAL_ADMIN_USERNAME) {
    process.env.INITIAL_ADMIN_USERNAME = 'superadmin';
  }

  if (!process.env.INITIAL_ADMIN_EMAIL) {
    process.env.INITIAL_ADMIN_EMAIL = 'superadmin@example.com';
  }

  if (!process.env.INITIAL_ADMIN_PASSWORD) {
    process.env.INITIAL_ADMIN_PASSWORD = 'AdminPass123!';
  }

  // 記錄環境信息
  logger.info(`應用環境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`服務器端口: ${process.env.PORT || 7070}`);
  logger.info(`MongoDB URI: ${process.env.MONGODB_URI ? '已配置' : '未配置'}`);
}

export default setupEnvironment; 