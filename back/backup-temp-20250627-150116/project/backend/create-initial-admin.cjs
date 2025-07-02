const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// 加載環境變量
dotenv.config();

console.log('🚀 創建初始管理員帳戶');
console.log('======================================');

/**
 * 創建初始管理員帳戶
 */
async function createInitialAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 數據庫連接成功！');

    // 定義管理員Schema
    const adminSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password_hash: { type: String, required: true },
      role: { type: String, required: true },
      status: { type: String, default: 'active' },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    });

    const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

    // 根據README文檔創建兩個管理員帳戶
    const adminsToCreate = [
      {
        username: 'admin',
        email: 'test@ailaborlaw.com',
        password: 'Test1234',
        role: 'super_admin'
      },
      {
        username: 'newadmin',
        email: 'newadmin@ailaborlaw.com',
        password: 'Admin1234',
        role: 'admin'
      }
    ];

    for (const adminData of adminsToCreate) {
      console.log(`\n🔐 創建管理員: ${adminData.username} (${adminData.email})`);
      
      // 檢查是否已存在
      const existingAdmin = await Admin.findOne({ 
        $or: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      });

      if (existingAdmin) {
        console.log(`⚠️  管理員 ${adminData.username} 已存在，跳過創建`);
        continue;
      }

      // 生成密碼哈希
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(adminData.password, salt);

      // 創建管理員
      const newAdmin = new Admin({
        username: adminData.username,
        email: adminData.email,
        password_hash: password_hash,
        role: adminData.role,
        status: 'active'
      });

      await newAdmin.save();
      console.log(`✅ 管理員 ${adminData.username} 創建成功！`);
      console.log(`   - 郵箱: ${adminData.email}`);
      console.log(`   - 角色: ${adminData.role}`);
      console.log(`   - 密碼: ${adminData.password}`);
      console.log(`   - ID: ${newAdmin._id}`);

      // 驗證密碼
      const isPasswordCorrect = await bcrypt.compare(adminData.password, password_hash);
      console.log(`   - 密碼驗證: ${isPasswordCorrect ? '✅ 成功' : '❌ 失敗'}`);
    }

    // 驗證創建結果
    console.log('\n📊 創建完成後的管理員統計:');
    const allAdmins = await Admin.find({});
    console.log(`總計: ${allAdmins.length} 個管理員`);
    
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.username} (${admin.email}) - ${admin.role}`);
    });

    console.log('\n🎉 初始管理員帳戶創建完成！');
    console.log('\n可用於登入的帳戶:');
    console.log('1. 超級管理員:');
    console.log('   郵箱: test@ailaborlaw.com');
    console.log('   密碼: Test1234');
    console.log('2. 普通管理員:');
    console.log('   郵箱: newadmin@ailaborlaw.com');
    console.log('   密碼: Admin1234');

  } catch (error) {
    console.error('❌ 創建管理員過程中出錯:', error);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('\n✅ 數據庫連接已關閉');
    } catch (error) {
      console.error('關閉連接時出錯:', error);
    }
  }
}

// 執行創建
createInitialAdmins(); 