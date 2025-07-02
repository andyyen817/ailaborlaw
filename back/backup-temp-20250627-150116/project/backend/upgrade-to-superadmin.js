/**
 * 升級管理員為超級管理員腳本
 * 這個腳本用於將現有管理員升級為超級管理員
 * 執行方式: node upgrade-to-superadmin.js <email>
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 加載環境變量
dotenv.config();

// MongoDB連接設置
const connectDatabase = async () => {
  try {
    // 使用與應用相同的連接字符串
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ailabor';
    
    console.log(`嘗試連接到MongoDB: ${mongoURI}`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB連接成功');
    return true;
  } catch (error) {
    console.error(`MongoDB連接失敗: ${error.message}`);
    return false;
  }
};

// 定義Admin模型
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password_hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// 創建或使用現有的Admin模型
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

// 升級指定管理員為超級管理員
const upgradeToSuperAdmin = async (email) => {
  try {
    // 連接數據庫
    const connected = await connectDatabase();
    if (!connected) {
      console.error('無法連接到數據庫，退出操作');
      process.exit(1);
    }

    // 檢查是否存在該管理員
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.error(`找不到電子郵件為 ${email} 的管理員`);
      await mongoose.connection.close();
      process.exit(1);
    }

    // 更新角色為超級管理員
    admin.role = 'super_admin';
    await admin.save();
    
    console.log(`已將管理員 ${admin.username} (${admin.email}) 升級為超級管理員`);
    console.log(`角色: ${admin.role}`);

    // 關閉數據庫連接
    await mongoose.connection.close();
    console.log('操作完成，數據庫連接已關閉');
    
  } catch (error) {
    console.error(`升級管理員時發生錯誤: ${error.message}`);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// 獲取命令行參數中的電子郵件
const email = process.argv[2] || 'test@ailaborlaw.com';

if (!email) {
  console.error('請提供管理員電子郵件，例如: node upgrade-to-superadmin.js admin@example.com');
  process.exit(1);
}

// 執行升級操作
upgradeToSuperAdmin(email); 