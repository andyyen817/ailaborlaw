import mongoose from 'mongoose';
import Admin from '../src/models/admin.model.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 設置 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加載環境變量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function resetAdminPassword() {
  try {
    // 連接到數據庫
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('Using MongoDB URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to database');
    
    // 查詢超級管理員
    const adminEmail = 'test@ailaborlaw.com';
    const newPassword = 'Test1234';
    
    console.log(`Resetting password for admin with email: ${adminEmail}`);
    console.log(`New password will be: ${newPassword}`);
    
    // 生成新的密碼哈希
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    
    // 更新管理員密碼
    const result = await Admin.updateOne(
      { email: adminEmail },
      { 
        $set: { 
          password_hash: password_hash,
          updated_at: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      console.log('Admin not found!');
    } else if (result.modifiedCount === 0) {
      console.log('Password was not changed (might be the same as before)');
    } else {
      console.log('Password reset successful!');
    }
    
    // 驗證新密碼
    const admin = await Admin.findOne({ email: adminEmail });
    if (admin) {
      const passwordValid = await admin.comparePassword(newPassword);
      console.log('Password validation after reset:', passwordValid ? 'Successful' : 'Failed');
    }
    
    // 關閉數據庫連接
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// 執行重置
resetAdminPassword(); 