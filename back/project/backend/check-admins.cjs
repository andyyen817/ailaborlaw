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

// 選擇使用的連接字串
const MONGODB_URI = possibleConnectionStrings.find(uri => uri) || 'mongodb://localhost:27017/aialabr';
console.log('將使用連接字串:', MONGODB_URI);

// 定義 Admin Schema (爲了避免循環依賴，這裡直接定義而不是導入)
const adminSchema = new mongoose.Schema({
  username: String,
  email: String,
  password_hash: String,
  role: String,
  status: String,
  last_login_at: Date,
  created_at: Date,
  updated_at: Date
});

// 驗證密碼方法
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

/**
 * 檢查管理員賬戶
 */
async function checkAdmins() {
  // 嘗試所有可能的連接字串
  for (const connectionString of possibleConnectionStrings) {
    if (!connectionString) continue;
    
    console.log(`\n嘗試連接到: ${connectionString.substring(0, connectionString.indexOf('@') > 0 ? connectionString.indexOf('@') : 20)}...`);
    
    try {
      await mongoose.connect(connectionString);
      console.log('數據庫連接成功!');

      // 註冊 Admin 模型
      // 先檢查是否已經註冊
      const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

      // 獲取所有管理員
      const admins = await Admin.find({});
      console.log(`找到 ${admins.length} 個管理員賬戶:`);
      
      if (admins.length > 0) {
        // 遍歷所有管理員並輸出信息
        for (const admin of admins) {
          console.log('\n========================================');
          console.log(`ID: ${admin._id}`);
          console.log(`用戶名: ${admin.username}`);
          console.log(`郵箱: ${admin.email}`);
          console.log(`角色: ${admin.role}`);
          console.log(`狀態: ${admin.status}`);
          console.log(`密碼哈希: ${admin.password_hash ? admin.password_hash.substring(0, 20) + '...' : 'N/A'}`);
          console.log(`密碼哈希長度: ${admin.password_hash ? admin.password_hash.length : 0}`);
          
          // 測試密碼 "Test1234"
          const testPassword = 'Test1234';
          const passwordMatch = await admin.comparePassword(testPassword);
          console.log(`密碼 "${testPassword}" 匹配: ${passwordMatch}`);
          
          // 如果是超級管理員，我們可能想要重置密碼
          if (admin.role === 'super_admin' && !passwordMatch) {
            console.log('注意: 超級管理員密碼不匹配，可能需要重置');
          }
          
          console.log(`創建於: ${admin.created_at || 'N/A'}`);
          console.log(`最後更新: ${admin.updated_at || 'N/A'}`);
          console.log(`最後登入: ${admin.last_login_at || 'N/A'}`);
        }
        
        // 找到了管理員，無需嘗試其他連接字串
        break;
      }
      
      // 斷開連接以嘗試下一個連接字串
      await mongoose.disconnect();
      
    } catch (error) {
      console.error(`使用連接字串 ${connectionString.substring(0, 20)}... 時出錯:`, error.message);
      
      try {
        // 確保斷開連接以嘗試下一個連接字串
        await mongoose.disconnect();
      } catch (disconnectError) {
        // 忽略斷開連接時的錯誤
      }
    }
  }
  
  // 確保最後斷開連接
  try {
    await mongoose.disconnect();
    console.log('\n數據庫連接已關閉');
  } catch (disconnectError) {
    console.error('關閉數據庫連接時出錯:', disconnectError);
  }
}

// 執行檢查
checkAdmins(); 