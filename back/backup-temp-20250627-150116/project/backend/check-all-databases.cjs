const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 加載環境變量
dotenv.config();

console.log('🔍 MongoDB 多數據庫全面檢查工具');
console.log('======================================');

/**
 * 檢查指定數據庫的數據
 */
async function checkDatabase(dbName) {
  console.log(`\n🗄️  檢查數據庫: ${dbName}`);
  console.log('='.repeat(60));
  
  try {
    // 構建數據庫連接URI
    const baseUri = process.env.MONGODB_URI.split('/')[0] + '//' + process.env.MONGODB_URI.split('/')[2];
    const dbUri = `${baseUri}/${dbName}?directConnection=true&authSource=admin`;
    
    console.log(`連接到: ${dbUri.substring(0, dbUri.indexOf('@'))}...`);
    
    // 連接到指定數據庫
    await mongoose.connect(dbUri);
    console.log('✅ 數據庫連接成功！');

    // 獲取所有 collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 數據庫中共有 ${collections.length} 個 collections:`);
    
    let totalRecords = 0;
    const collectionStats = [];

    for (const col of collections) {
      const collectionName = col.name;
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const count = await collection.countDocuments();
        totalRecords += count;
        collectionStats.push({ name: collectionName, count });
        console.log(`  📋 ${collectionName}: ${count} 筆記錄`);
      } catch (error) {
        console.log(`  ❌ ${collectionName}: 檢查失敗 - ${error.message}`);
      }
    }
    
    console.log(`\n📊 數據庫總記錄數: ${totalRecords}`);

    // 重點檢查關鍵collections
    console.log('\n🎯 關鍵數據詳情:');
    console.log('-'.repeat(40));
    
    // 檢查用戶數據
    try {
      const users = await mongoose.connection.db.collection('users').find({}).toArray();
      console.log(`👥 用戶總數: ${users.length}`);
      if (users.length > 0) {
        console.log('最新3個用戶:');
        users.slice(-3).forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.userType || 'unknown'}) - ${user.name || 'no name'}`);
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
      if (chatSessions.length > 0) {
        console.log(`最新會話創建時間: ${chatSessions[chatSessions.length - 1].created_at || 'unknown'}`);
      }
    } catch (error) {
      console.log('❌ 無法檢查聊天會話:', error.message);
    }

    // 檢查專家諮詢
    try {
      const consultations = await mongoose.connection.db.collection('expertconsultations').find({}).toArray();
      console.log(`🎓 專家諮詢總數: ${consultations.length}`);
      if (consultations.length > 0) {
        console.log(`最新諮詢創建時間: ${consultations[consultations.length - 1].createdAt || 'unknown'}`);
      }
    } catch (error) {
      console.log('❌ 無法檢查專家諮詢:', error.message);
    }

    // 檢查對話記錄
    try {
      const conversations = await mongoose.connection.db.collection('conversations').find({}).toArray();
      console.log(`📝 對話記錄總數: ${conversations.length}`);
    } catch (error) {
      console.log('❌ 無法檢查對話記錄:', error.message);
    }

    await mongoose.disconnect();
    
    return {
      dbName,
      totalCollections: collections.length,
      totalRecords,
      collections: collectionStats
    };
    
  } catch (error) {
    console.error(`❌ 檢查數據庫 ${dbName} 時出錯:`, error.message);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // 忽略斷開連接錯誤
    }
    return {
      dbName,
      error: error.message,
      totalCollections: 0,
      totalRecords: 0,
      collections: []
    };
  }
}

/**
 * 檢查所有相關數據庫
 */
async function checkAllDatabases() {
  const databasesToCheck = ['ai_law_advisor_dev', 'aialabr'];
  const results = [];
  
  for (const dbName of databasesToCheck) {
    const result = await checkDatabase(dbName);
    results.push(result);
    
    // 等待一秒避免連接衝突
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 總結報告
  console.log('\n\n📋 數據庫對比總結');
  console.log('======================================');
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.dbName}: 檢查失敗 - ${result.error}`);
    } else {
      console.log(`✅ ${result.dbName}:`);
      console.log(`   📊 Collections: ${result.totalCollections}`);
      console.log(`   📝 總記錄數: ${result.totalRecords}`);
      
      if (result.collections.length > 0) {
        const topCollections = result.collections
          .filter(col => col.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        if (topCollections.length > 0) {
          console.log(`   🔝 主要數據:`);
          topCollections.forEach(col => {
            console.log(`      ${col.name}: ${col.count} 筆`);
          });
        }
      }
    }
    console.log('');
  });
  
  // 推薦使用哪個數據庫
  const productionDb = results.find(r => r.totalRecords > 100) || 
                      results.sort((a, b) => b.totalRecords - a.totalRecords)[0];
  
  if (productionDb && productionDb.totalRecords > 0) {
    console.log(`🎯 推薦使用數據庫: ${productionDb.dbName}`);
    console.log(`   理由: 包含最多數據 (${productionDb.totalRecords} 筆記錄)`);
    console.log(`\n🔧 建議更新 .env 文件中的數據庫名稱:`);
    console.log(`   MONGODB_URI=mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/${productionDb.dbName}?directConnection=true&authSource=admin`);
  }
}

// 執行檢查
checkAllDatabases(); 