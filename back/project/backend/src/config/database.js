const mongoose = require('mongoose');
const logger = require('../utils/logger.js');

/**
 * 數據庫連接配置與管理
 */

const connectDatabase = async () => {
  try {
    // 獲取MongoDB連接字符串
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    logger.info('🔄 正在連接MongoDB數據庫...');
    logger.info(`數據庫地址: ${mongoURI.replace(/\/\/.*@/, '//***@')}`);

    // MongoDB連接選項
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    };

    // 連接到MongoDB
    await mongoose.connect(mongoURI, options);

    logger.info('✅ MongoDB數據庫連接成功');
    
    // 監聽數據庫事件
    mongoose.connection.on('connected', () => {
      logger.info('🔗 Mongoose已連接到MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB連接錯誤:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ Mongoose已斷開與MongoDB的連接');
    });

    // 應用程式終止時關閉數據庫連接
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🔐 MongoDB連接已關閉，應用程式正在退出');
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ MongoDB連接失敗:', error.message);
    logger.error('詳細錯誤:', error);
    throw error;
  }
};

module.exports = connectDatabase;
