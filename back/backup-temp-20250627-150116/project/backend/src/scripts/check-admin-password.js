import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/admin.model.js';

/**
 * 腳本用於檢查和修復管理員密碼哈希問題
 */
async function checkAndFixAdminPasswords() {
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
      console.log(`找到 ${admins.length} 個管理員帳戶，開始檢查密碼哈希...`);

      for (const admin of admins) {
        console.log(`\n--- 檢查管理員: ${admin.username} (${admin.email}) ---`);
        
        const testPasswords = [
          { label: '當前配置的密碼', value: admin.username === 'admin' ? 'Test1234' : 'Admin1234' },
          { label: '其他可能的密碼', value: admin.username === 'admin' ? 'SuperAdmin@2025' : 'Admin1234' }
        ];
        
        for (const pw of testPasswords) {
          const isMatch = await bcrypt.compare(pw.value, admin.password_hash);
          console.log(`- 測試密碼 "${pw.label}": ${isMatch ? '匹配' : '不匹配'}`);
        }
          
        // 修復密碼哈希
        const newPassword = admin.username === 'admin' ? 'Test1234' : 'Admin1234';
        console.log(`- 正在重置密碼為: ${newPassword}...`);
        
        // 直接更新密碼哈希
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // 使用update方法而不是save，以避開模型中的pre-save中間件
        await Admin.updateOne(
          { _id: admin._id },
          { 
            $set: { 
              password_hash: hashedPassword,
              updated_at: new Date()
            } 
          }
        );
        
        console.log(`- 密碼已重置`);
        
        // 驗證更新後的密碼
        const updatedAdmin = await Admin.findById(admin._id);
        const isNewPasswordValid = await bcrypt.compare(newPassword, updatedAdmin.password_hash);
        console.log(`- 驗證新密碼: ${isNewPasswordValid ? '成功' : '失敗'}`);
      }
    }
    
    // 斷開數據庫連接
    await mongoose.disconnect();
    console.log('\n已斷開數據庫連接');
    
    console.log('\n操作完成，請嘗試使用以下帳戶登入：');
    console.log('1. 超級管理員');
    console.log('   - 用戶名: admin');
    console.log('   - 郵箱: test@ailaborlaw.com');
    console.log('   - 密碼: Test1234');
    console.log('2. 普通管理員');
    console.log('   - 用戶名: newadmin');
    console.log('   - 郵箱: newadmin@ailaborlaw.com');
    console.log('   - 密碼: Admin1234');
    
  } catch (error) {
    console.error('檢查和修復管理員密碼時出錯:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

// 執行腳本
checkAndFixAdminPasswords(); 