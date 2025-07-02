import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/src/models/user.model.js';

// 載入環境變量
dotenv.config({ path: './backend/.env' });

const USER_ID = '682b12659c4e57105bb52fcb';
const TEST_PHONE = '0123456789';
const TEST_COMPANY = 'sho科技';

async function debugUserUpdate() {
  try {
    console.log('連接數據庫...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('數據庫連接成功');

    // 1. 查看更新前的用戶資料
    console.log('\n=== 更新前的用戶資料 ===');
    const userBefore = await User.findById(USER_ID);
    if (!userBefore) {
      console.log('❌ 用戶不存在');
      return;
    }
    
    console.log('用戶資料：', {
      id: userBefore._id,
      name: userBefore.name,
      email: userBefore.email,
      profile: userBefore.profile
    });

    // 2. 執行更新（模擬後端API的邏輯）
    console.log('\n=== 執行更新 ===');
    const updates = {
      'profile.phone': TEST_PHONE,
      'profile.company': TEST_COMPANY
    };
    
    console.log('更新數據：', updates);
    
    const updatedUser = await User.findByIdAndUpdate(
      USER_ID,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    // 3. 查看更新後的結果
    console.log('\n=== 更新後的結果 ===');
    console.log('updatedUser對象：', {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profile: updatedUser.profile
    });

    // 4. 重新查詢資料庫確認
    console.log('\n=== 重新查詢數據庫確認 ===');
    const userAfterQuery = await User.findById(USER_ID);
    console.log('資料庫中的實際數據：', {
      id: userAfterQuery._id,
      name: userAfterQuery.name,
      email: userAfterQuery.email,
      profile: userAfterQuery.profile
    });

    // 5. 模擬API響應格式化
    console.log('\n=== API響應格式化 ===');
    const responseData = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      userType: updatedUser.userType,
      phoneNumber: updatedUser.profile?.phone || '',
      companyName: updatedUser.profile?.company || '',
      industry: updatedUser.profile?.industry || '',
      position: updatedUser.profile?.position || '',
      status: updatedUser.status
    };
    
    console.log('格式化後的響應數據：', responseData);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n數據庫連接已關閉');
  }
}

debugUserUpdate(); 