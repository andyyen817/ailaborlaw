import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import InviteRecord from './src/models/invite-record.model.js';

// 連接數據庫
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://creatyen:G0Gk4ZQnKTpBCcFH@cluster0.wqzqh.mongodb.net/ai_labor_advisor?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

const diagnoseStatsProblems = async () => {
  console.log('🔍 診斷邀請統計數據問題');
  console.log('==========================================');
  
  try {
    // 1. 查找測試用戶（管理員）
    const testUser = await User.findOne({ email: 'creatyen@gmail.com' });
    if (!testUser) {
      console.log('❌ 找不到測試用戶');
      return;
    }
    
    console.log('👤 測試用戶信息:');
    console.log(`   ID: ${testUser._id}`);
    console.log(`   姓名: ${testUser.name}`);
    console.log(`   邮箱: ${testUser.email}`);
    console.log(`   邀請碼: ${testUser.myInviteCode}`);
    console.log('');
    
    // 2. 檢查該用戶的所有邀請記錄
    const allInviteRecords = await InviteRecord.find({ inviterId: testUser._id });
    console.log('📊 該用戶的所有邀請記錄:');
    console.log(`   總數: ${allInviteRecords.length}`);
    
    if (allInviteRecords.length > 0) {
      allInviteRecords.forEach((record, index) => {
        console.log(`   記錄 ${index + 1}:`);
        console.log(`     邀請人ID: ${record.inviterId}`);
        console.log(`     被邀請人ID: ${record.inviteeId}`);
        console.log(`     邀請碼: ${record.inviteCode}`);
        console.log(`     狀態: ${record.status}`);
        console.log(`     邀請人獎勵: ${record.inviterBonus}`);
        console.log(`     被邀請人獎勵: ${record.inviteeBonus}`);
        console.log(`     創建時間: ${record.createdAt}`);
        console.log(`     完成時間: ${record.completedAt}`);
        console.log('');
      });
    } else {
      console.log('   ❌ 沒有找到任何邀請記錄！');
    }
    
    // 3. 測試 getInviteStats 方法
    console.log('🧪 測試 getInviteStats 方法:');
    const inviteStats = await InviteRecord.getInviteStats(testUser._id);
    console.log('   統計結果:', JSON.stringify(inviteStats, null, 2));
    console.log('');
    
    // 4. 檢查狀態分佈
    const statusCounts = await InviteRecord.aggregate([
      { $match: { inviterId: testUser._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('📈 狀態分佈:');
    statusCounts.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} 條記錄`);
    });
    console.log('');
    
    // 5. 檢查被邀請人信息
    const inviteRecordsWithInvitee = await InviteRecord.find({ inviterId: testUser._id })
      .populate('inviteeId', 'name email registrationDate');
    
    console.log('👥 被邀請人詳細信息:');
    inviteRecordsWithInvitee.forEach((record, index) => {
      console.log(`   被邀請人 ${index + 1}:`);
      if (record.inviteeId) {
        console.log(`     姓名: ${record.inviteeId.name}`);
        console.log(`     郵箱: ${record.inviteeId.email}`);
        console.log(`     註冊時間: ${record.inviteeId.registrationDate}`);
      } else {
        console.log(`     ❌ 被邀請人信息不存在 (inviteeId: ${record.inviteeId})`);
      }
      console.log(`     記錄狀態: ${record.status}`);
      console.log('');
    });
    
    // 6. 模擬 getUserInviteStats 的計算邏輯
    console.log('🔢 模擬統計計算邏輯:');
    let totalInvites = 0;
    let successfulInvites = 0;
    let totalBonusEarned = 0;
    
    inviteStats.forEach(stat => {
      console.log(`   處理狀態 '${stat._id}': ${stat.count} 條記錄, 總獎勵: ${stat.totalInviterBonus}`);
      totalInvites += stat.count;
      if (stat._id === 'completed') {
        successfulInvites = stat.count;
        totalBonusEarned = stat.totalInviterBonus;
      }
    });
    
    console.log('');
    console.log('📊 計算結果:');
    console.log(`   totalInvites: ${totalInvites}`);
    console.log(`   successfulInvites (totalInvited): ${successfulInvites}`);
    console.log(`   totalBonusEarned: ${totalBonusEarned}`);
    
    // 7. 問題診斷
    console.log('');
    console.log('🔍 問題診斷:');
    if (allInviteRecords.length === 0) {
      console.log('❌ 根本問題：數據庫中沒有該用戶的邀請記錄');
      console.log('   可能原因：');
      console.log('   1. 邀請註冊流程沒有創建 InviteRecord');
      console.log('   2. inviterId 字段值不匹配');
      console.log('   3. 邀請記錄被意外刪除');
    } else if (successfulInvites === 0) {
      console.log('❌ 問題：有邀請記錄但沒有 completed 狀態的記錄');
      console.log('   可能原因：');
      console.log('   1. 邀請記錄的 status 不是 "completed"');
      console.log('   2. 邀請註冊流程沒有正確更新狀態');
    } else {
      console.log('✅ 數據看起來正常，可能是前端或API的問題');
    }
    
  } catch (error) {
    console.error('❌ 診斷過程中發生錯誤:', error);
  }
};

const main = async () => {
  await connectDB();
  await diagnoseStatsProblems();
  await mongoose.disconnect();
  console.log('🔚 診斷完成');
};

main().catch(console.error); 