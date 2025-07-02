import mongoose from 'mongoose';
import User from './backend/src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function checkUserData() {
  try {
    console.log('連接數據庫...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('數據庫連接成功');
    
    // 查詢特定用戶的實際數據
    const userId = '682b12659c4e57105bb52fcb';
    console.log(`查詢用戶 ID: ${userId}`);
    
    const user = await User.findById(userId);
    
    if (user) {
      console.log('\n=== 用戶數據庫實際資料 ===');
      console.log('用戶ID:', user._id.toString());
      console.log('姓名:', user.name);
      console.log('郵箱:', user.email);
      console.log('用戶類型:', user.userType);
      console.log('Profile對象:', JSON.stringify(user.profile, null, 2));
      console.log('手機號碼 (profile.phone):', user.profile?.phone);
      console.log('公司名稱 (profile.company):', user.profile?.company);
      console.log('行業 (profile.industry):', user.profile?.industry);
      console.log('職位 (profile.position):', user.profile?.position);
      console.log('更新時間:', user.updatedAt);
      console.log('創建時間:', user.createdAt);
      
      // 測試字段映射
      console.log('\n=== API響應格式映射測試 ===');
      console.log('phoneNumber (映射後):', user.profile?.phone || '');
      console.log('companyName (映射後):', user.profile?.company || '');
    } else {
      console.log('用戶不存在');
    }
    
    await mongoose.disconnect();
    console.log('\n數據庫連接已關閉');
    process.exit(0);
  } catch (error) {
    console.error('錯誤:', error);
    process.exit(1);
  }
}

checkUserData(); 