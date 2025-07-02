import mongoose from 'mongoose';
import logger from '../utils/logger.js'; // 假设 logger.js 也将使用 ES 模块

/**
 * 数据库连接配置
 */
const connectDatabase = async () => {
  try {
    // 提供默認的MongoDB URI（如果環境變數中未設置）
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ailabor';
    
    // 連接選項
    const options = {
      // 在Mongoose 6+版本中，這些選項默認為true
      // 記錄選項供參考，但實際不需要設置
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      
      // 設置超時和重試選項
      serverSelectionTimeoutMS: 5000, // 如果無法連接，最多等待5秒
      heartbeatFrequencyMS: 30000,   // 每30秒檢測一次連接狀態
      maxPoolSize: 10,               // 最大連接池大小
      minPoolSize: 1,                // 最小連接池大小
      socketTimeoutMS: 45000,        // 套接字超時時間
      family: 4                      // 強制使用IPv4
    };
    
    // 連接MongoDB
    await mongoose.connect(mongoURI, options);
    
    logger.info('MongoDB 连接成功');
    
    // 監聽數據庫連接錯誤
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB 连接错误: ${err}`);
    });
    
    // 監聽數據庫連接斷開
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB 连接断开，尝试重新连接...');
      setTimeout(() => {
        logger.info('MongoDB 尝试重新连接...');
        connectDatabase(); // 重新連接
      }, 5000); // 5秒后重試
    });
    
    // 應用退出時關閉數據庫連接
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB 连接已关闭 (应用终止)');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`MongoDB 连接失败: ${error.message}`);
    // 5秒后重试连接
    setTimeout(connectDatabase, 5000);
  }
};

export default connectDatabase;
