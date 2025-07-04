import mongoose from 'mongoose';

/**
 * 使用正確端口46203檢查MongoDB中所有可能的數據庫和用戶數據
 */

// 使用正確的外網端口46203的數據庫連接配置
const databaseConfigs = [
  {
    name: 'ailabor_db (當前API使用，正確端口)',
    uri: 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/ailabor_db?directConnection=true&authSource=admin'
  },
  {
    name: 'aialabr (歷史腳本使用，正確端口)',
    uri: 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/aialabr?directConnection=true&authSource=admin'
  },
  {
    name: 'ailabor (部分腳本使用，正確端口)',
    uri: 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/ailabor?directConnection=true&authSource=admin'
  },
  {
    name: '默認數據庫 (test，正確端口)',
    uri: 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/test?directConnection=true&authSource=admin'
  },
  {
    name: '默認數據庫 (admin，正確端口)',
    uri: 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/admin?directConnection=true&authSource=admin'
  },
  {
    name: '沒有指定數據庫名稱（可能包含真實數據）',
    uri: 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/?directConnection=true&authSource=admin'
  }
];

// 用戶模型Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  userType: String,
  status: String,
  emailVerified: Boolean,
  profile: {
    industry: String,
    position: String,
    company: String,
    phone: String
  },
  createdAt: Date,
  updatedAt: Date
}, { collection: 'users' });

// 管理員模型Schema
const adminSchema = new mongoose.Schema({
  username: String,
  email: String,
  password_hash: String,
  role: String,
  status: String,
  created_at: Date,
  updated_at: Date
}, { collection: 'admins' });

async function checkDatabase(config) {
  console.log(`\n========================================`);
  console.log(`檢查數據庫: ${config.name}`);
  console.log(`連接URI: ${config.uri.replace(/\/\/.*@/, '//***@')}`);
  console.log(`========================================`);
  
  let connection;
  try {
    // 設置連接超時
    const options = {
      serverSelectionTimeoutMS: 10000, // 10秒超時
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000
    };
    
    // 創建新的連接
    connection = mongoose.createConnection(config.uri, options);
    
    // 等待連接建立
    await connection.asPromise();
    console.log('✅ 連接成功');
    
    // 檢查數據庫中的所有集合
    const collections = await connection.db.listCollections().toArray();
    console.log(`📁 找到 ${collections.length} 個集合:`, collections.map(c => c.name).join(', '));
    
    // 檢查用戶集合
    if (collections.find(c => c.name === 'users')) {
      const User = connection.model('User', userSchema);
      const userCount = await User.countDocuments();
      console.log(`👥 users集合: ${userCount} 個用戶`);
      
      if (userCount > 0) {
        console.log('\n📝 用戶列表:');
        const users = await User.find({}, 'name email userType status emailVerified createdAt').limit(10);
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. 📧 ${user.email} | 👤 ${user.name} | 🏷️ ${user.userType} | 📊 ${user.status} | ✅ ${user.emailVerified} | 📅 ${user.createdAt ? user.createdAt.toISOString().split('T')[0] : 'N/A'}`);
        });
        
        if (userCount > 10) {
          console.log(`  ... 還有 ${userCount - 10} 個用戶`);
        }
        
        // 檢查是否有您的測試郵箱
        const testEmails = ['test@ailaborlaw.com', 'newadmin@ailaborlaw.com'];
        console.log('\n🔍 檢查管理員測試賬戶:');
        for (const email of testEmails) {
          const testUser = await User.findOne({ email });
          if (testUser) {
            console.log(`  ✅ 找到: ${email}`);
          } else {
            console.log(`  ❌ 未找到: ${email}`);
          }
        }
      }
    } else {
      console.log('❌ 沒有找到 users 集合');
    }
    
    // 檢查管理員集合
    if (collections.find(c => c.name === 'admins')) {
      const Admin = connection.model('Admin', adminSchema);
      const adminCount = await Admin.countDocuments();
      console.log(`👑 admins集合: ${adminCount} 個管理員`);
      
      if (adminCount > 0) {
        console.log('\n📝 管理員列表:');
        const admins = await Admin.find({}, 'username email role status created_at').limit(10);
        admins.forEach((admin, index) => {
          console.log(`  ${index + 1}. 📧 ${admin.email} | 👤 ${admin.username} | 🏷️ ${admin.role} | 📊 ${admin.status} | 📅 ${admin.created_at ? admin.created_at.toISOString().split('T')[0] : 'N/A'}`);
        });
        
        // 檢查是否有您的測試郵箱
        const testEmails = ['test@ailaborlaw.com', 'newadmin@ailaborlaw.com'];
        console.log('\n🔍 檢查管理員測試賬戶:');
        for (const email of testEmails) {
          const testAdmin = await Admin.findOne({ email });
          if (testAdmin) {
            console.log(`  ✅ 找到: ${email}`);
          } else {
            console.log(`  ❌ 未找到: ${email}`);
          }
        }
      }
    } else {
      console.log('❌ 沒有找到 admins 集合');
    }
    
    // 檢查其他可能的集合
    const otherCollections = collections.filter(c => !['users', 'admins'].includes(c.name));
    if (otherCollections.length > 0) {
      console.log(`\n📋 其他集合:`);
      for (const col of otherCollections) {
        try {
          const count = await connection.db.collection(col.name).countDocuments();
          console.log(`  - ${col.name}: ${count} 個文檔`);
        } catch (e) {
          console.log(`  - ${col.name}: 無法統計文檔數量`);
        }
      }
    }
    
    console.log(`\n📊 數據庫統計: ${collections.length} 個集合總計`);
    
  } catch (error) {
    console.log(`❌ 連接失敗: ${error.message}`);
    
    // 如果是超時錯誤，提供建議
    if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
      console.log('💡 建議: 可能是網路問題或MongoDB服務器暫時不可用');
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        // 忽略關閉錯誤
      }
    }
  }
}

async function checkAllDatabases() {
  console.log('🔍 開始檢查所有可能的數據庫 (使用正確端口46203)...\n');
  console.log('📊 檢查目標:');
  console.log('  - 用戶數據 (users集合)');
  console.log('  - 管理員數據 (admins集合)');
  console.log('  - 其他相關數據');
  console.log('  - 管理員測試賬戶: test@ailaborlaw.com, newadmin@ailaborlaw.com');
  
  for (const config of databaseConfigs) {
    await checkDatabase(config);
  }
  
  console.log('\n\n🎯 檢查完成！');
  console.log('📋 請查看上面的結果，確定哪個數據庫包含您的真實用戶數據。');
  console.log('🔧 如果所有數據庫都無法連接，可能需要：');
  console.log('   1. 檢查MongoDB服務器狀態');
  console.log('   2. 確認網路連接');
  console.log('   3. 聯繫Sealos支援檢查數據庫服務');
}

// 執行檢查
checkAllDatabases()
  .then(() => {
    console.log('\n✅ 數據庫檢查任務完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 檢查過程中發生錯誤:', error);
    process.exit(1);
  }); 