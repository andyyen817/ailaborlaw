import mongoose from 'mongoose';
import InviteRecord from './src/models/invite-record.model.js';
import User from './src/models/user.model.js';

// 測試用戶ID
const testUserId = "685d6c950d48e3c9de6239f6";

async function diagnoseInviteData() {
  try {
    // 連接數據庫 - 使用Sealos雲端MongoDB URI
    const mongoUri = 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:45064/ailabor_db?directConnection=true&authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ 數據庫連接成功');

    console.log('\n🔍 邀請數據診斷報告');
    console.log('==========================================');
    
    // 1. 檢查用戶信息
    console.log('\n1. 檢查用戶信息...');
    const user = await User.findById(testUserId);
    if (user) {
      console.log('✅ 用戶存在:', {
        id: user._id,
        name: user.name,
        email: user.email,
        myInviteCode: user.myInviteCode
      });
    } else {
      console.log('❌ 用戶不存在');
      return;
    }

    // 2. 檢查邀請記錄 - 作為邀請人
    console.log('\n2. 檢查邀請記錄（作為邀請人）...');
    const inviteRecords = await InviteRecord.find({ inviterId: testUserId })
      .populate('inviteeId', 'name email registrationDate')
      .sort({ createdAt: -1 });
    
    console.log(`找到 ${inviteRecords.length} 條邀請記錄:`);
    inviteRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. 邀請記錄:`, {
        id: record._id,
        inviteeId: record.inviteeId?._id,
        inviteeName: record.inviteeId?.name,
        inviteeEmail: record.inviteeId?.email,
        inviteCode: record.inviteCode,
        status: record.status,
        inviterBonus: record.inviterBonus,
        inviteeBonus: record.inviteeBonus,
        bonusGiven: record.bonusGiven,
        createdAt: record.createdAt,
        completedAt: record.completedAt
      });
    });

    // 3. 檢查邀請統計查詢
    console.log('\n3. 檢查邀請統計查詢...');
    const inviteStats = await InviteRecord.getInviteStats(testUserId);
    console.log('統計查詢結果:', inviteStats);
    
    // 手動計算統計
    let totalInvites = 0;
    let successfulInvites = 0;
    let totalBonusEarned = 0;
    
    inviteStats.forEach(stat => {
      totalInvites += stat.count;
      console.log(`  狀態 ${stat._id}: ${stat.count} 條記錄, 總獎勵: ${stat.totalInviterBonus}`);
      if (stat._id === 'completed') {
        successfulInvites = stat.count;
        totalBonusEarned = stat.totalInviterBonus;
      }
    });
    
    console.log('\n📊 統計結果:');
    console.log(`  總邀請數: ${totalInvites}`);
    console.log(`  成功邀請數: ${successfulInvites}`);
    console.log(`  總獲得獎勵: ${totalBonusEarned}`);

    // 4. 檢查recentInvitees數據結構
    console.log('\n4. 檢查recentInvitees數據結構...');
    const recentInvites = await InviteRecord.find({ inviterId: testUserId })
      .populate('inviteeId', 'name email registrationDate')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('recentInvites原始數據:');
    recentInvites.forEach((record, index) => {
      console.log(`  ${index + 1}. 原始記錄:`, {
        inviteeId: record.inviteeId,
        inviterBonus: record.inviterBonus,
        createdAt: record.createdAt
      });
    });

    // 5. 模擬API返回的數據結構
    console.log('\n5. 模擬API返回的數據結構...');
    const recentInvitees = recentInvites.map(record => ({
      name: record.inviteeId?.name,
      email: record.inviteeId?.email,  // 🔍 檢查是否有email
      invitedAt: record.createdAt,
      bonusReceived: record.inviterBonus,
      status: "active"
    }));
    
    console.log('recentInvitees處理後數據:');
    recentInvitees.forEach((invitee, index) => {
      console.log(`  ${index + 1}. 處理後:`, invitee);
    });

    // 6. 檢查所有相關的邀請記錄
    console.log('\n6. 檢查所有邀請記錄...');
    const allInviteRecords = await InviteRecord.find({})
      .populate('inviterId', 'name email')
      .populate('inviteeId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log(`數據庫中總共有 ${allInviteRecords.length} 條最近的邀請記錄:`);
    allInviteRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. 記錄:`, {
        id: record._id,
        inviter: record.inviterId?.name,
        invitee: record.inviteeId?.name,
        inviteeEmail: record.inviteeId?.email,
        status: record.status,
        createdAt: record.createdAt
      });
    });

    console.log('\n🎯 診斷總結:');
    console.log('==========================================');
    
    if (successfulInvites === 0) {
      console.log('❌ 問題發現: 沒有狀態為"completed"的邀請記錄');
      console.log('💡 可能原因:');
      console.log('   1. 邀請記錄的狀態不是"completed"');
      console.log('   2. 邀請記錄的inviterId不匹配');
      console.log('   3. 數據庫中確實沒有該用戶的成功邀請記錄');
    }
    
    if (recentInvitees.length > 0 && !recentInvitees[0].email) {
      console.log('❌ 問題發現: recentInvitees中缺少email字段');
      console.log('💡 可能原因:');
      console.log('   1. populate查詢沒有包含email字段');
      console.log('   2. 被邀請用戶的email字段為空');
      console.log('   3. 數據庫關聯查詢失敗');
    }

  } catch (error) {
    console.error('❌ 診斷過程中發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ 數據庫連接已關閉');
  }
}

// 執行診斷
diagnoseInviteData(); 