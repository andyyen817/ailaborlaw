const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 加載環境變量
dotenv.config();

console.log('🔍 MongoDB 數據庫全面檢查工具');
console.log('======================================');
console.log('環境變量:', process.env.NODE_ENV);
console.log('數據庫URI:', process.env.MONGODB_URI);
console.log('');

/**
 * 全面檢查數據庫數據
 */
async function checkDatabaseData() {
  try {
    // 連接到數據庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功！');
    console.log('');

    // 獲取所有 collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 數據庫中共有 ${collections.length} 個 collections:`);
    collections.forEach((col, index) => {
      console.log(`${index + 1}. ${col.name}`);
    });
    console.log('');

    // 檢查每個collection的數據
    for (const col of collections) {
      const collectionName = col.name;
      console.log(`\n🔍 檢查 Collection: ${collectionName}`);
      console.log('='.repeat(50));
      
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`📊 總記錄數: ${count}`);
        
        if (count > 0) {
          // 取前3筆數據作為樣本
          const sampleDocs = await collection.find({}).limit(3).toArray();
          console.log('📋 樣本數據:');
          
          sampleDocs.forEach((doc, index) => {
            console.log(`\n--- 記錄 ${index + 1} ---`);
            console.log(JSON.stringify(doc, null, 2));
          });
          
          if (count > 3) {
            console.log(`\n... 還有 ${count - 3} 筆記錄`);
          }
        } else {
          console.log('❌ 此collection為空');
        }
        
      } catch (error) {
        console.error(`❌ 檢查 ${collectionName} 時出錯:`, error.message);
      }
    }

    // 特別檢查關鍵collections
    console.log('\n\n🎯 關鍵數據統計');
    console.log('======================================');
    
    // 檢查用戶數據
    try {
      const users = await mongoose.connection.db.collection('users').find({}).toArray();
      console.log(`👥 用戶總數: ${users.length}`);
      if (users.length > 0) {
        console.log('用戶類型分布:');
        const userTypes = {};
        users.forEach(user => {
          const type = user.userType || 'unknown';
          userTypes[type] = (userTypes[type] || 0) + 1;
        });
        Object.entries(userTypes).forEach(([type, count]) => {
          console.log(`  - ${type}: ${count} 人`);
        });
      }
    } catch (error) {
      console.log('❌ 無法檢查用戶數據:', error.message);
    }

    // 檢查管理員數據
    try {
      const admins = await mongoose.connection.db.collection('admins').find({}).toArray();
      console.log(`👑 管理員總數: ${admins.length}`);
      if (admins.length > 0) {
        console.log('管理員列表:');
        admins.forEach((admin, index) => {
          console.log(`  ${index + 1}. ${admin.email} (${admin.role || 'unknown'}) - ${admin.status || 'unknown'}`);
        });
      }
    } catch (error) {
      console.log('❌ 無法檢查管理員數據:', error.message);
    }

    // 檢查聊天會話
    try {
      const chatSessions = await mongoose.connection.db.collection('chatsessions').find({}).toArray();
      console.log(`💬 聊天會話總數: ${chatSessions.length}`);
    } catch (error) {
      console.log('❌ 無法檢查聊天會話:', error.message);
    }

    // 檢查專家諮詢
    try {
      const consultations = await mongoose.connection.db.collection('expertconsultations').find({}).toArray();
      console.log(`🎓 專家諮詢總數: ${consultations.length}`);
    } catch (error) {
      console.log('❌ 無法檢查專家諮詢:', error.message);
    }

    // 檢查其他可能的collections
    const otherCollections = ['conversations', 'invitations', 'emailverifications'];
    for (const collName of otherCollections) {
      try {
        const count = await mongoose.connection.db.collection(collName).countDocuments();
        if (count > 0) {
          console.log(`📋 ${collName}: ${count} 筆記錄`);
        }
      } catch (error) {
        // 忽略不存在的collection
      }
    }

  } catch (error) {
    console.error('❌ 數據庫操作失敗:', error);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('\n✅ 數據庫連接已關閉');
    } catch (error) {
      console.error('關閉連接時出錯:', error);
    }
  }
}

// 執行檢查
checkDatabaseData(); 