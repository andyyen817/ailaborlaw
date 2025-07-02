import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/user.model.js';

/**
 * 測試用戶登入問題的腳本
 */
async function testUserLogin() {
  try {
    // 連接數據庫
    const mongoURI = 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:45064/ailabor_db?directConnection=true&authSource=admin';
    
    console.log('🔄 連接到MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ 已連接數據庫');
    
    // 獲取所有用戶
    console.log('\n📊 查詢所有用戶...');
    const allUsers = await User.find({}).select('name email userType status createdAt lastLogin');
    
    console.log(`找到 ${allUsers.length} 個用戶:`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.userType} - ${user.status} - 註冊時間: ${user.createdAt}`);
    });
    
    // 提示用戶輸入要測試的郵箱
    console.log('\n🔍 請在下面輸入要測試的用戶郵箱和密碼:');
    console.log('例如: test@example.com');
    console.log('或者直接按 Ctrl+C 結束測試');
    
    // 這裡我們先測試一個假設的用戶
    // 實際使用時可以通過命令行參數傳入
    const testEmail = process.argv[2] || 'test@example.com';
    const testPassword = process.argv[3] || 'Test1234';
    
    console.log(`\n🧪 測試登入: ${testEmail}`);
    
    // 查找用戶
    const user = await User.findOne({ email: testEmail.toLowerCase() });
    
    if (!user) {
      console.log('❌ 用戶不存在');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ 找到用戶:');
    console.log(`   ID: ${user._id}`);
    console.log(`   姓名: ${user.name}`);
    console.log(`   郵箱: ${user.email}`);
    console.log(`   用戶類型: ${user.userType}`);
    console.log(`   狀態: ${user.status}`);
    console.log(`   註冊時間: ${user.createdAt}`);
    console.log(`   最後登入: ${user.lastLogin || '從未登入'}`);
    console.log(`   密碼哈希: ${user.password.substring(0, 20)}...`);
    
    // 測試密碼驗證
    console.log(`\n🔐 測試密碼驗證 (${testPassword}):`);
    
    // 使用模型的comparePassword方法
    const modelResult = await user.comparePassword(testPassword);
    console.log(`   模型方法結果: ${modelResult}`);
    
    // 直接使用bcrypt比較
    const bcryptResult = await bcrypt.compare(testPassword, user.password);
    console.log(`   bcrypt直接比較: ${bcryptResult}`);
    
    // 檢查用戶狀態
    console.log(`\n📋 用戶狀態檢查:`);
    console.log(`   狀態: ${user.status}`);
    
    if (user.status === 'pending') {
      console.log('⚠️  用戶狀態為 pending，需要郵箱驗證');
    } else if (user.status === 'disabled') {
      console.log('❌ 用戶狀態為 disabled，賬戶已被禁用');
    } else if (user.status === 'active') {
      console.log('✅ 用戶狀態為 active，可以正常登入');
    } else {
      console.log(`⚠️  用戶狀態異常: ${user.status}`);
    }
    
    // 模擬完整的登入流程
    console.log(`\n🚀 模擬完整登入流程:`);
    
    // 1. 查找用戶
    const loginUser = await User.findOne({ email: testEmail.toLowerCase() });
    if (!loginUser) {
      console.log('❌ 步驟1失敗: 用戶不存在');
    } else {
      console.log('✅ 步驟1成功: 找到用戶');
    }
    
    // 2. 驗證密碼
    const passwordMatch = await loginUser.comparePassword(testPassword);
    if (!passwordMatch) {
      console.log('❌ 步驟2失敗: 密碼不匹配');
    } else {
      console.log('✅ 步驟2成功: 密碼驗證通過');
    }
    
    // 3. 檢查狀態
    if (loginUser.status !== 'active') {
      console.log(`❌ 步驟3失敗: 用戶狀態不是 active (${loginUser.status})`);
    } else {
      console.log('✅ 步驟3成功: 用戶狀態正常');
    }
    
    // 總結
    if (passwordMatch && loginUser.status === 'active') {
      console.log('\n🎉 登入測試成功！用戶應該能夠正常登入');
    } else {
      console.log('\n❌ 登入測試失敗！發現問題：');
      if (!passwordMatch) console.log('   - 密碼驗證失敗');
      if (loginUser.status !== 'active') console.log(`   - 用戶狀態異常: ${loginUser.status}`);
    }
    
    // 斷開數據庫連接
    await mongoose.disconnect();
    console.log('\n✅ 已斷開數據庫連接');
    
  } catch (error) {
    console.error('❌ 測試過程中出錯:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

// 運行測試
testUserLogin(); 