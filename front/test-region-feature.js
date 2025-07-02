console.log('地區字段測試腳本載入中...');

// 創建測試諮詢申請數據
function createTestConsultationData() {
  const testData = [
    {
      id: `consultation_test_${Date.now()}_1`,
      userId: 'test_user_1',
      name: '台北測試用戶',
      region: '台北市',
      phone: '0912345678',
      email: 'taipei@test.com',
      lineId: 'taipeitest',
      service: 'labor_contract',
      details: '台北地區的勞動契約審核諮詢測試',
      preferredContact: ['phone', 'line'],
      consultationTime: '上午 09:00-12:00',
      status: 'pending',
      createdAt: new Date().toISOString(),
      adminNotes: ''
    },
    {
      id: `consultation_test_${Date.now()}_2`,
      userId: 'test_user_2', 
      name: '高雄測試用戶',
      region: '高雄市',
      phone: '0987654321',
      email: 'kaohsiung@test.com',
      lineId: 'kaohsiungtest',
      service: 'compensation',
      details: '高雄地區的薪資問題諮詢測試',
      preferredContact: ['email'],
      consultationTime: '下午 14:00-17:00',
      status: 'processing',
      createdAt: new Date(Date.now() - 24*60*60*1000).toISOString(),
      adminNotes: '已聯繫用戶'
    },
    {
      id: `consultation_test_${Date.now()}_3`,
      userId: 'test_user_3',
      name: '舊用戶測試',
      region: '', // 測試未填寫地區的情況
      phone: '0900000000', 
      email: 'old@test.com',
      lineId: '',
      service: 'other',
      details: '舊系統遷移數據，測試未填寫地區的向後兼容性',
      preferredContact: ['phone'],
      consultationTime: '',
      status: 'completed',
      createdAt: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
      adminNotes: '已完成處理'
    }
  ];

  // 保存到localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
    const combined = [...existing, ...testData];
    localStorage.setItem('consultationRequests', JSON.stringify(combined));
    console.log('✅ 測試數據已成功保存到localStorage');
    console.log('📊 新增了3條測試記錄：');
    testData.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} - ${item.region || '未填寫'} - ${item.service}`);
    });
    return true;
  } catch (error) {
    console.error('❌ 保存測試數據失敗:', error);
    return false;
  }
}

// 驗證地區字段功能
function validateRegionFeature() {
  console.log('\n🔍 開始驗證地區字段功能...');
  
  const requests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
  
  console.log(`📋 總諮詢請求數: ${requests.length}`);
  
  // 按地區統計
  const regionStats = {};
  requests.forEach(req => {
    const region = req.region || '未填寫';
    regionStats[region] = (regionStats[region] || 0) + 1;
  });
  
  console.log('\n📊 地區分佈統計:');
  Object.entries(regionStats).forEach(([region, count]) => {
    console.log(`  ${region}: ${count} 筆`);
  });
  
  // 檢查必要字段
  const newRequests = requests.filter(req => req.region);
  console.log(`\n✅ 包含地區信息的請求: ${newRequests.length} 筆`);
  
  return regionStats;
}

// 清除測試數據功能
function clearTestData() {
  try {
    const existing = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
    const filtered = existing.filter(req => !req.id.includes('consultation_test_'));
    localStorage.setItem('consultationRequests', JSON.stringify(filtered));
    console.log('🧹 測試數據已清除');
    return true;
  } catch (error) {
    console.error('❌ 清除測試數據失敗:', error);
    return false;
  }
}

// 執行測試
console.log('🚀 開始執行地區字段測試...');
if (createTestConsultationData()) {
  validateRegionFeature();
  console.log('\n✨ 測試完成！請檢查以下功能:');
  console.log('1. 訪問 /consultation 查看地區選擇下拉框');
  console.log('2. 訪問 /mobile/consultation 查看移動端地區選擇');
  console.log('3. 訪問 /admin/consultation-requests 查看管理後台地區功能');
  console.log('4. 測試地區篩選和搜索功能');
  console.log('\n💡 提示：執行 clearTestData() 可清除測試數據');
}

// 導出功能給全局使用
window.createTestConsultationData = createTestConsultationData;
window.validateRegionFeature = validateRegionFeature;
window.clearTestData = clearTestData; 