import mongoose from 'mongoose';
import Admin from '../src/models/admin.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 設置 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加載環境變量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkAdmins() {
  try {
    // 連接到數據庫
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('Using MongoDB URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to database');
    
    // 查詢超級管理員
    console.log('Checking super admin...');
    const superAdmin = await Admin.findOne({
      $or: [
        { username: 'admin' },
        { email: 'test@ailaborlaw.com' }
      ]
    });
    
    if (superAdmin) {
      console.log('Found super admin:');
      console.log('- ID:', superAdmin._id.toString());
      console.log('- Username:', superAdmin.username);
      console.log('- Email:', superAdmin.email);
      console.log('- Role:', superAdmin.role);
      console.log('- Status:', superAdmin.status);
      console.log('- Password Hash Exists:', !!superAdmin.password_hash);
      console.log('- Password Hash Length:', superAdmin.password_hash ? superAdmin.password_hash.length : 0);
    } else {
      console.log('Super admin not found!');
    }
    
    // 查詢普通管理員
    console.log('\nChecking regular admin...');
    const regularAdmin = await Admin.findOne({
      $or: [
        { username: 'newadmin' },
        { email: 'newadmin@ailaborlaw.com' }
      ]
    });
    
    if (regularAdmin) {
      console.log('Found regular admin:');
      console.log('- ID:', regularAdmin._id.toString());
      console.log('- Username:', regularAdmin.username);
      console.log('- Email:', regularAdmin.email);
      console.log('- Role:', regularAdmin.role);
      console.log('- Status:', regularAdmin.status);
      console.log('- Password Hash Exists:', !!regularAdmin.password_hash);
      console.log('- Password Hash Length:', regularAdmin.password_hash ? regularAdmin.password_hash.length : 0);
    } else {
      console.log('Regular admin not found!');
    }
    
    // 測試密碼比較
    if (superAdmin) {
      console.log('\nTesting super admin password...');
      const testPassword = 'Test1234';
      try {
        const result = await superAdmin.comparePassword(testPassword);
        console.log('Password comparison result:', result);
      } catch (error) {
        console.error('Error comparing super admin password:', error);
      }
    }
    
    if (regularAdmin) {
      console.log('\nTesting regular admin password...');
      const testPassword = 'Admin1234';
      try {
        const result = await regularAdmin.comparePassword(testPassword);
        console.log('Password comparison result:', result);
      } catch (error) {
        console.error('Error comparing regular admin password:', error);
      }
    }
    
    // 關閉數據庫連接
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

// 執行檢查
checkAdmins(); 