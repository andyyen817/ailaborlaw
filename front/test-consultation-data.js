// 测试地区字段的专家咨询数据
const testConsultationData = {
  id: `consultation_test_${Date.now()}`,
  userId: 'test_user',
  name: '測試用戶',
  region: '台北市',  // 新添加的地区字段
  phone: '0912345678',
  email: 'test@example.com',
  lineId: 'testline123',
  service: 'labor_contract',
  details: '這是一個測試的勞動契約審核諮詢申請，用來驗證地區字段是否正常顯示和篩選。',
  preferredContact: ['phone', 'line'],
  consultationTime: '上午 09:00-12:00',
  status: 'pending',
  createdAt: new Date().toISOString(),
  adminNotes: ''
};

// 保存到localStorage进行测试
try {
  const consultationRequests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
  consultationRequests.push(testConsultationData);
  localStorage.setItem('consultationRequests', JSON.stringify(consultationRequests));
  console.log('測試數據已保存:', testConsultationData);
  
  // 另外添加几个不同地区的测试数据
  const additionalTestData = [
    {
      ...testConsultationData,
      id: `consultation_test_${Date.now() + 1}`,
      name: '高雄測試用戶',
      region: '高雄市',
      details: '高雄地區的薪資問題諮詢測試',
      service: 'compensation'
    },
    {
      ...testConsultationData,
      id: `consultation_test_${Date.now() + 2}`,
      name: '台中測試用戶',
      region: '台中市',
      details: '台中地區的職場安全問題諮詢測試',
      service: 'workplace_safety'
    },
    {
      ...testConsultationData,
      id: `consultation_test_${Date.now() + 3}`,
      name: '未填地區用戶',
      region: '',  // 测试空地区的情况
      details: '未填寫地區的測試數據',
      service: 'other'
    }
  ];
  
  additionalTestData.forEach(data => {
    consultationRequests.push(data);
  });
  
  localStorage.setItem('consultationRequests', JSON.stringify(consultationRequests));
  console.log('所有測試數據已保存完成');
  
} catch (error) {
  console.error('保存測試數據時出錯:', error);
}

console.log('地區字段測試數據創建完成！');
console.log('請檢查以下功能：');
console.log('1. 專家諮詢申請頁面是否顯示地區選擇下拉框');
console.log('2. 移動端專家諮詢頁面是否正常顯示地區選擇');
console.log('3. 管理後台是否正確顯示地區信息');
console.log('4. 管理後台的地區篩選是否正常工作');
console.log('5. 申請詳情頁面是否顯示地區信息'); 