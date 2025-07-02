// 模擬邀請數據腳本
// 用於向localStorage添加模擬邀請記錄和用戶數據

(function() {
  // 獲取當前用戶ID
  const currentUser = JSON.parse(localStorage.getItem('auth_user'));
  if (!currentUser || !currentUser.id) {
    console.error('未找到當前用戶信息，請確保您已登錄');
    return;
  }

  const currentUserId = currentUser.id;
  console.log('當前用戶ID:', currentUserId);

  // 生成10組模擬用戶數據
  const mockUsers = [
    {
      id: "user_inv_1",
      name: "張小明",
      email: "xiaoming@example.com",
      registrationDate: "2023-11-12",
      remainingQueries: 20,
      status: "active",
      userType: "employee"
    },
    {
      id: "user_inv_2",
      name: "林美玲",
      email: "meiling1988@gmail.com",
      registrationDate: "2023-12-05",
      remainingQueries: 18,
      status: "active",
      userType: "hr"
    },
    {
      id: "user_inv_3",
      name: "王大華",
      email: "dahua.wang@hotmail.com",
      registrationDate: "2024-01-17",
      remainingQueries: 20,
      status: "active",
      userType: "employer"
    },
    {
      id: "user_inv_4",
      name: "李小婷",
      email: "tina2000@yahoo.com.tw",
      registrationDate: "2024-02-08",
      remainingQueries: 15,
      status: "active",
      userType: "employee"
    },
    {
      id: "user_inv_5",
      name: "陳俊傑",
      email: "jasonchen@company.com",
      registrationDate: "2024-02-20",
      remainingQueries: 20,
      status: "active",
      userType: "employee"
    },
    {
      id: "user_inv_6",
      name: "黃雅琪",
      email: "yachi.huang@example.org",
      registrationDate: "2024-03-01",
      remainingQueries: 17,
      status: "active",
      userType: "hr"
    },
    {
      id: "user_inv_7",
      name: "吳建志",
      email: "chienwu1975@gmail.com",
      registrationDate: "2024-03-15",
      remainingQueries: 20,
      status: "active",
      userType: "employer"
    },
    {
      id: "user_inv_8",
      name: "鄭淑芬",
      email: "sufen.cheng@example.com",
      registrationDate: "2024-04-02",
      remainingQueries: 20,
      status: "active",
      userType: "employee"
    },
    {
      id: "user_inv_9",
      name: "劉大為",
      email: "davidliu1990@outlook.com",
      registrationDate: "2024-04-18",
      remainingQueries: 19,
      status: "active",
      userType: "employee"
    },
    {
      id: "user_inv_10",
      name: "楊依婷",
      email: "eting.yang@company.net",
      registrationDate: "2024-05-01",
      remainingQueries: 20,
      status: "active",
      userType: "hr"
    }
  ];

  // 生成邀請碼
  let inviteCode = '';
  const storedInviteCode = localStorage.getItem(`invite_code_${currentUserId}`);
  if (storedInviteCode) {
    inviteCode = storedInviteCode;
  } else {
    // 定义不易混淆的字符集
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    
    // 生成8位隨機字符
    for (let i = 0; i < 8; i++) {
      inviteCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // 存儲邀請碼
    localStorage.setItem(`invite_code_${currentUserId}`, inviteCode);
  }
  
  console.log('用戶邀請碼:', inviteCode);

  // 生成邀請記錄
  const mockInviteRecords = mockUsers.map((user, index) => {
    const date = new Date(user.registrationDate);
    return {
      inviteCode: inviteCode,
      inviterId: currentUserId,
      inviteeId: user.id,
      usedAt: date.toISOString()
    };
  });

  // 更新用戶列表
  let existingUsers = JSON.parse(localStorage.getItem('app_users_mock_data') || '[]');
  let addedUsers = 0;
  
  mockUsers.forEach(user => {
    if (!existingUsers.find(u => u.id === user.id)) {
      existingUsers.push(user);
      addedUsers++;
    }
  });
  
  localStorage.setItem('app_users_mock_data', JSON.stringify(existingUsers));
  console.log(`已添加 ${addedUsers} 個模擬用戶`);

  // 更新邀請記錄
  let existingInvites = JSON.parse(localStorage.getItem('app_invite_records') || '[]');
  let addedRecords = 0;
  
  mockInviteRecords.forEach(record => {
    if (!existingInvites.find(r => r.inviteeId === record.inviteeId)) {
      existingInvites.push(record);
      addedRecords++;
    }
  });
  
  localStorage.setItem('app_invite_records', JSON.stringify(existingInvites));
  console.log(`已添加 ${addedRecords} 個邀請記錄`);

  // 更新邀請統計
  const statsKey = `invite_stats_${currentUserId}`;
  const stats = { 
    invitedCount: mockUsers.length, 
    bonusConsultations: mockUsers.length * 10 
  };
  localStorage.setItem(statsKey, JSON.stringify(stats));

  console.log('模擬數據已成功添加！');
  console.log('請刷新邀請好友頁面查看效果');
})(); 