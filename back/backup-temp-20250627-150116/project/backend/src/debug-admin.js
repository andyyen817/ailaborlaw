import mongoose from 'mongoose';
import Admin from './models/admin.model.js';

/**
 * 腳本用於顯示所有管理員帳戶的詳細信息
 */
async function displayAdmins() {
  try {
    // 連接數據庫 - 使用內網連接字串
    const mongoURI = 'mongodb://root:8w2kv62n@aialabr-mongodb.ns-2rlrcc3k.svc:27017';
    
    console.log(`嘗試連接到MongoDB: ${mongoURI}`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('已連接數據庫');
    
    // 查詢所有管理員帳戶
    const admins = await Admin.find({});
    
    if (admins.length === 0) {
      console.log('沒有找到任何管理員帳戶');
    } else {
      console.log(`找到 ${admins.length} 個管理員帳戶：`);
      
      admins.forEach((admin, index) => {
        console.log(`\n--- 管理員 #${index + 1} ---`);
        console.log(`ID: ${admin._id}`);
        console.log(`用戶名: ${admin.username}`);
        console.log(`郵箱: ${admin.email}`);
        console.log(`角色: ${admin.role}`);
        console.log(`狀態: ${admin.status}`);
        console.log(`最後登入時間: ${admin.last_login_at || '從未登入'}`);
        console.log(`創建時間: ${admin.created_at}`);
        console.log(`更新時間: ${admin.updated_at}`);
        // 不顯示密碼哈希值，出於安全考慮
      });
    }
    
    // 斷開數據庫連接
    await mongoose.disconnect();
    console.log('\n已斷開數據庫連接');
  } catch (error) {
    console.error('顯示管理員帳戶時出錯:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

// 執行腳本
displayAdmins(); 