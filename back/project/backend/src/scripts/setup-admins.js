import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';

// 加載環境變量
dotenv.config();

/**
 * 設置管理員賬戶腳本
 * 按照前端需求創建特定的超級管理員和普通管理員帳戶
 * 用法: node src/scripts/setup-admins.js
 */
async function setupAdmins() {
  try {
    // 連接數據庫 - 使用內網連接字串
    const mongoURI = 'mongodb://root:8w2kv62n@aialabr-mongodb.ns-2rlrcc3k.svc:27017';
    
    console.log(`嘗試連接到MongoDB: ${mongoURI}`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('已連接數據庫');

    // 設置超級管理員賬戶
    const superAdminData = {
      username: 'admin',
      email: 'test@ailaborlaw.com',
      password: 'Test1234',
      role: 'super_admin',
      status: 'active'
    };

    // 檢查是否已存在相同郵箱的超級管理員
    let existingSuperAdmin = await Admin.findOne({ email: superAdminData.email });

    if (existingSuperAdmin) {
      console.log('超級管理員賬戶已存在，正在更新...');
      existingSuperAdmin.username = superAdminData.username;
      existingSuperAdmin.password = superAdminData.password; // 虛擬屬性會處理密碼哈希
      existingSuperAdmin.role = superAdminData.role;
      existingSuperAdmin.status = superAdminData.status;
      await existingSuperAdmin.save();
      console.log('超級管理員賬戶已更新');
    } else {
      // 創建新超級管理員
      const superAdmin = new Admin(superAdminData);
      await superAdmin.save();
      console.log('超級管理員賬戶創建成功');
    }

    // 設置普通管理員賬戶
    const adminData = {
      username: 'newadmin',
      email: 'newadmin@ailaborlaw.com',
      password: 'Admin1234',
      role: 'admin',
      status: 'active'
    };

    // 檢查是否已存在相同郵箱的普通管理員
    let existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('普通管理員賬戶已存在，正在更新...');
      existingAdmin.username = adminData.username;
      existingAdmin.password = adminData.password; // 虛擬屬性會處理密碼哈希
      existingAdmin.role = adminData.role;
      existingAdmin.status = adminData.status;
      await existingAdmin.save();
      console.log('普通管理員賬戶已更新');
    } else {
      // 創建新普通管理員
      const admin = new Admin(adminData);
      await admin.save();
      console.log('普通管理員賬戶創建成功');
    }

    console.log('管理員賬戶設置完成：');
    console.log('1. 超級管理員：');
    console.log('  - 用戶名: admin');
    console.log('  - 郵箱: test@ailaborlaw.com');
    console.log('  - 密碼: Test1234');
    console.log('  - 角色: super_admin');
    console.log('');
    console.log('2. 普通管理員：');
    console.log('  - 用戶名: newadmin');
    console.log('  - 郵箱: newadmin@ailaborlaw.com');
    console.log('  - 密碼: Admin1234');
    console.log('  - 角色: admin');

    // 斷開數據庫連接
    await mongoose.disconnect();
    console.log('已斷開數據庫連接');
  } catch (error) {
    console.error('設置管理員賬戶時出錯:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// 執行腳本
setupAdmins(); 