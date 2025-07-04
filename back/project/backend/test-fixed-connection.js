import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * 測試修復後的MongoDB連接和管理員登入功能
 */

// 使用修復後的連接配置
const mongoURI = 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/aialabr?directConnection=true&authSource=admin';

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

async function testConnection() {
  console.log('🔧 測試修復後的MongoDB連接和登入功能...\n');
  
  try {
    // 連接數據庫
    console.log('1️⃣ 連接到aialabr數據庫...');
    const connection = await mongoose.createConnection(mongoURI);
    console.log('✅ 數據庫連接成功');
    
    // 創建管理員模型
    const Admin = connection.model('Admin', adminSchema);
    
    // 測試管理員賬戶
    const testAccounts = [
      { email: 'test@ailaborlaw.com', password: 'Test1234' },
      { email: 'newadmin@ailaborlaw.com', password: 'Admin1234' }
    ];
    
    console.log('\n2️⃣ 測試管理員賬戶登入...');
    
    for (const account of testAccounts) {
      console.log(`\n🔍 測試賬戶: ${account.email}`);
      
      // 查找管理員
      const admin = await Admin.findOne({ email: account.email });
      
      if (!admin) {
        console.log(`❌ 找不到管理員: ${account.email}`);
        continue;
      }
      
      console.log(`✅ 找到管理員: ${admin.username} (${admin.role})`);
      
      // 驗證密碼
      const isPasswordValid = await bcrypt.compare(account.password, admin.password_hash);
      
      if (isPasswordValid) {
        console.log(`✅ 密碼驗證成功: ${account.email}`);
        console.log(`   角色: ${admin.role}`);
        console.log(`   狀態: ${admin.status}`);
        console.log(`   創建時間: ${admin.created_at}`);
      } else {
        console.log(`❌ 密碼驗證失敗: ${account.email}`);
      }
    }
    
    // 檢查數據庫集合
    console.log('\n3️⃣ 檢查數據庫集合...');
    const collections = await connection.db.listCollections().toArray();
    console.log(`📁 找到 ${collections.length} 個集合:`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    await connection.close();
    console.log('\n✅ 連接測試完成，數據庫修復成功！');
    
  } catch (error) {
    console.error('\n❌ 測試失敗:', error.message);
    console.error('詳細錯誤:', error);
  }
}

// 執行測試
testConnection()
  .then(() => {
    console.log('\n🎉 數據庫修復驗證完成！');
    console.log('🚀 您現在可以使用以下賬戶登入API:');
    console.log('   📧 test@ailaborlaw.com (密碼: Test1234)');
    console.log('   📧 newadmin@ailaborlaw.com (密碼: Admin1234)');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 驗證過程中發生錯誤:', error);
    process.exit(1);
  }); 