import mongoose from 'mongoose';
import logger from './src/utils/logger.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

(async () => {
  try {
    // 提供默認的MongoDB URI（如果環境變數中未設置）
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ailabor';
    
    logger.info(`尝试连接到 MongoDB: ${uri}`);
    await mongoose.connect(uri);
    logger.info('MongoDB连接测试成功');
    // 成功连接后，Mongoose 会保持连接，对于一个简单的测试脚本，可能不需要显式断开。
    // 如果需要确保脚本退出，可以在这里调用 mongoose.disconnect() 或 process.exit(0)。
    // mongoose.disconnect(); // 可选，如果希望测试后立即断开
    process.exit(0); // 确保脚本在成功后退出
  } catch (error) {
    logger.error(`MongoDB连接测试失败: ${error.message}`, { 
      name: error.name,
      // stack: error.stack // 堆栈可能过长
    });
    if (error.reason && typeof error.reason === 'object') { // Mongoose 连接错误通常有 reason 对象
        // 记录 reason 对象中的一些关键信息
        logger.error('失败原因详情:', {
            type: error.reason.type,
            error: error.reason.error ? error.reason.error.message : 'N/A',
            // 可以根据需要添加更多来自 error.reason 的字段
        });
    } else if (error.reason) { // 如果 reason 不是对象，直接记录
        logger.error('失败原因:', error.reason);
    }
    process.exit(1); // 确保脚本在失败后退出
  }
})();
