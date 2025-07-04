const mongoose = require('mongoose');

/**
 * 顯示管理員帳戶的完整詳細信息，用於調試
 */
async function showAdminDetails() {
  try {
    // 連接數據庫 - 使用內網連接字串
    const mongoURI = 'mongodb://root:8w2kv62n@aialabr-mongodb.ns-2rlrcc3k.svc:27017';
    
    console.log(`嘗試連接到MongoDB: ${mongoURI}`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('已連接數據庫');
    
    // 直接使用mongoose執行原始查詢
    const db = mongoose.connection.db;
    const adminsCollection = db.collection('admins');
    
    // 查詢所有管理員帳戶
    const admins = await adminsCollection.find({}).toArray();
    
    if (admins.length === 0) {
      console.log('沒有找到任何管理員帳戶');
    } else {
      console.log(`找到 ${admins.length} 個管理員帳戶：`);
      
      admins.forEach((admin, index) => {
        console.log(`\n=== 管理員 #${index + 1} ===`);
        console.log(JSON.stringify(admin, null, 2));
      });
    }
    
    // 斷開數據庫連接
    await mongoose.disconnect();
    console.log('\n已斷開數據庫連接');
  } catch (error) {
    console.error('顯示管理員詳情時出錯:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

// 執行腳本
showAdminDetails();