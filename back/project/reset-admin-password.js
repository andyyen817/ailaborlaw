const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 加載環境變量
dotenv.config();

// 顯示可用的環境變量
console.log('環境變量檢查:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// 嘗試多個可能的連接字串
const possibleConnectionStrings = [
  process.env.MONGODB_URI, 
  'mongodb://root:8w2kv62n@aialabr-mongodb.ns-2rlrcc3k.svc:27017/aialabr?authSource=admin',
  'mongodb://root:8w2kv62n@aialabr-mongodb.ns-2rlrcc3k.svc.cluster.local:27017/aialabr?authSource=admin',
  'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:45064/?directConnection=true&authSource=admin',
  'mongodb://localhost:27017/aialabr'
];

// 檢查後端目錄下是否有.env文件
try {
  if (fs.existsSync('./backend/.env')) {
    const envContent = fs.readFileSync('./backend/.env', 'utf8');
    console.log('找到 ./backend/.env 文件:');
    const envLines = envContent.split('\n');
    const dbLine = envLines.find(line => line.startsWith('MONGODB_URI='));
    if (dbLine) {
      const dbUri = dbLine.substring('MONGODB_URI='.length);
      console.log('從.env文件中找到MONGODB_URI:', dbUri);
      possibleConnectionStrings.unshift(dbUri);
    }
  }
} catch (err) {
  console.error('檢查.env文件時出錯:', err);
}

/**
 * 重置超級管理員密碼
 */
async function resetAdminPassword() {
  let connected = false;
  let connectedUri = '';
  
  // 嘗試所有可能的連接字串
  for (const connectionString of possibleConnectionStrings) {
    if (!connectionString) continue;
    
    console.log(`\n嘗試連接到: ${connectionString.substring(0, connectionString.indexOf('@') > 0 ? connectionString.indexOf('@') : 20)}...`);
    
    try {
      await mongoose.connect(connectionString);
      console.log('數據庫連接成功!');
      connected = true;
      connectedUri = connectionString;
      break; // 成功連接，跳出循環
    } catch (error) {
      console.error(`使用連接字串 ${connectionString.substring(0, 20)}... 時出錯:`, error.message);
      try {
        await mongoose.disconnect();
      } catch (e) {
        // 忽略斷開連接錯誤
      }
    }
  }
  
  if (!connected) {
    console.error('無法連接到數據庫，已嘗試所有可能的連接字串');
    return;
  }
  
  try {
    // 註冊 Admin 模型 (簡化版)
    const adminSchema = new mongoose.Schema({
      username: String,
      email: String,
      password_hash: String,
      role: String,
      status: String
    });
    const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

    // 要重置密碼的管理員電子郵箱
    const adminEmail = 'test@ailaborlaw.com';
    
    // 先檢查管理員是否存在
    const admin = await Admin.findOne({ email: adminEmail });
    
    if (!admin) {
      console.error(`未找到郵箱為 ${adminEmail} 的管理員`);
      return;
    }
    
    console.log(`找到管理員: ${admin.username} (${admin.email}), 角色: ${admin.role}, 狀態: ${admin.status}`);
    console.log(`原密碼哈希: ${admin.password_hash ? admin.password_hash.substring(0, 20) + '...' : 'N/A'}`);
    
    // 生成新密碼哈希 (密碼為 "Test1234")
    const password = 'Test1234';
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(password, salt);

    console.log(`為管理員 ${adminEmail} 生成新密碼哈希...`);
    console.log(`新密碼: ${password}`);
    console.log(`新密碼哈希: ${newPasswordHash.substring(0, 20)}...`);

    // 更新管理員密碼
    const result = await Admin.updateOne(
      { email: adminEmail },
      { $set: { password_hash: newPasswordHash } }
    );

    if (result.matchedCount === 0) {
      console.error(`未找到郵箱為 ${adminEmail} 的管理員`);
    } else if (result.modifiedCount === 0) {
      console.warn(`管理員 ${adminEmail} 的密碼未更改 (可能已經是相同的哈希)`);
    } else {
      console.log(`已成功重置管理員 ${adminEmail} 的密碼!`);
    }

    // 驗證密碼是否已更新
    const updatedAdmin = await Admin.findOne({ email: adminEmail });
    
    if (!updatedAdmin) {
      console.error(`更新後未找到郵箱為 ${adminEmail} 的管理員`);
      return;
    }
    
    console.log(`\n更新後的管理員資訊:`);
    console.log(`ID: ${updatedAdmin._id}`);
    console.log(`用戶名: ${updatedAdmin.username}`);
    console.log(`郵箱: ${updatedAdmin.email}`);
    console.log(`角色: ${updatedAdmin.role}`);
    console.log(`狀態: ${updatedAdmin.status}`);
    console.log(`新密碼哈希: ${updatedAdmin.password_hash.substring(0, 20)}...`);

    // 使用bcrypt直接驗證新密碼是否工作
    const isMatch = await bcrypt.compare(password, updatedAdmin.password_hash);
    console.log(`密碼驗證結果: ${isMatch ? '成功' : '失敗'}`);

  } catch (error) {
    console.error('重置密碼過程中出錯:', error);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('\n數據庫連接已關閉');
    } catch (disconnectError) {
      console.error('關閉數據庫連接時出錯:', disconnectError);
    }
  }
}

// 執行重置密碼
resetAdminPassword(); 