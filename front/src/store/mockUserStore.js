// src/store/mockUserStore.js
import { EventTypes, listenEvent } from '@/services/eventService';

const USERS_STORAGE_KEY = 'app_users_mock_data';
const INVITE_RECORDS_KEY = 'app_invite_records';

// 嘗試從 localStorage 加載邀請記錄，如果不存在則初始化為空數組
let inviteRecords = [];
try {
  const storedRecords = localStorage.getItem(INVITE_RECORDS_KEY);
  if (storedRecords) {
    inviteRecords = JSON.parse(storedRecords);
  }
} catch (e) {
  console.error("Error parsing invite records from localStorage", e);
  inviteRecords = [];
}

// 尝试从 localStorage 加载用户数据，如果不存在则初始化为空数组
let users = [];
try {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (storedUsers) {
    users = JSON.parse(storedUsers);
  }
} catch (e) {
  console.error("Error parsing users from localStorage", e);
  users = []; // 如果解析失败，则重置为默认空数组
}

// 添加一个默认的管理员用户，如果不存在的话
if (!users.find(u => u.email === 'test@ailaborlaw.com')) {
    users.push({
        id: 'admin_001',
        name: '测试管理员',
        email: 'test@ailaborlaw.com',
        password: 'Test1234', // 使用確切的密碼，保持大小寫敏感性
        userType: 'admin',
        registrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10天前
        remainingQueries: 999,
        totalConsultations: 10,
        status: 'active',
    });
}

// 添加一个测试用户，用于验证密码处理
if (!users.find(u => u.email === 'creatyen@qq.com')) {
    users.push({
        id: 'test_user_createyen',
        name: '测试用户',
        email: 'creatyen@qq.com',
        password: 'a1234567', // 移除特殊符號 '@'
        userType: 'employee',
        registrationDate: new Date().toISOString().split('T')[0],
        remainingQueries: 10,
        totalConsultations: 0,
        status: 'active',
        occupation: '工程師',
        industry: '科技業',
        companyName: '测试公司',
        phoneNumber: '0912345678'
    });
}

// 添加BOSS測試用戶，自動重新添加，確保總是存在
// 首先檢查是否已存在
const bossUserIndex = users.findIndex(u => u.email === 'boss@qq.com');
if (bossUserIndex >= 0) {
    // 如果已存在，確保狀態是active
    users[bossUserIndex].status = 'active';
} else {
    // 如果不存在，添加這個用戶
    users.push({
        id: 'test_boss_user',
        name: 'BOSS用戶',
        email: 'boss@qq.com',
        password: 'a1234567',
        userType: 'employer',
        registrationDate: new Date().toISOString().split('T')[0],
        remainingQueries: 20,
        totalConsultations: 5,
        status: 'active',
        occupation: '主管',
        industry: '服務業',
        companyName: 'BOSS公司',
        phoneNumber: '0987654321'
    });
}

// 生成更多测试数据，确保总数至少为30，如果localStorage中已有很多数据则可能不需要那么多
const desiredTotalUsers = 35;
const usersToAdd = desiredTotalUsers - users.length;

if (usersToAdd > 0) {
    const userTypes = ['hr', 'employer', 'employee', 'admin'];
    const statuses = ['active', 'pending', 'disabled'];
    for (let i = 0; i < usersToAdd; i++) {
        const randomUserType = userTypes[Math.floor(Math.random() * userTypes.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const registrationDate = new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000); // 过去一年内随机日期
        
        users.push({
            id: `user_mock_${Date.now()}_${i}`,
            name: `用户${i + 1}`,
            email: `user${i + 1}@example.com`,
            userType: randomUserType,
            registrationDate: registrationDate.toISOString().split('T')[0],
            remainingQueries: Math.floor(Math.random() * 100),
            totalConsultations: Math.floor(Math.random() * 50),
            status: randomStatus,
        });
    }
}
// 统一在所有数据添加或修改后保存到localStorage
localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));


// 辅助函数：日期比较
const isSameDay = (date1Str, date2) => {
  const d1 = new Date(date1Str);
  return d1.getFullYear() === date2.getFullYear() &&
         d1.getMonth() === date2.getMonth() &&
         d1.getDate() === date2.getDate();
};

const isInDateRange = (dateStr, rangeType) => {
  const userDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 当天开始

  switch (rangeType) {
    case 'today':
      return isSameDay(userDate, today);
    case 'week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // 周一为一周开始
      startOfWeek.setHours(0,0,0,0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);
      return userDate >= startOfWeek && userDate <= endOfWeek;
    case 'month':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
       endOfMonth.setHours(23,59,59,999);
      return userDate >= startOfMonth && userDate <= endOfMonth;
    case 'year':
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      endOfYear.setHours(23,59,59,999);
      return userDate >= startOfYear && userDate <= endOfYear;
    default:
      return true; // 'all' or unknown range
  }
};

// 每個用戶生成唯一的邀請碼
function generateInviteCode(userId) {
  // 定义不易混淆的字符集
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  // 生成8位隨機字符
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// 處理邀請獎勵
function processInvite(inviteCode, newUserId) {
  // 查找邀請碼對應的用戶
  const inviter = users.find(user => {
    // 嘗試從用戶的inviteCode字段或localStorage中查找
    const userInviteCode = user.inviteCode || localStorage.getItem(`invite_code_${user.id}`);
    return userInviteCode === inviteCode;
  });
  
  if (!inviter) {
    console.warn('找不到對應邀請碼的用戶:', inviteCode);
    return false;
  }
  
  // 防止自我邀請
  if (inviter.id === newUserId) {
    console.warn('不能自我邀請');
    return false;
  }
  
  // 檢查該邀請碼是否已使用過
  const existingInvite = inviteRecords.find(record => 
    record.inviteCode === inviteCode && record.inviteeId === newUserId
  );
  
  if (existingInvite) {
    console.warn('該邀請碼已被此用戶使用過');
    return false;
  }
  
  // 記錄邀請關係
  const inviteRecord = {
    inviteCode,
    inviterId: inviter.id,
    inviteeId: newUserId,
    inviteCodeUsed: inviteCode, // 方便後台管理顯示
    inviteeRegistrationDate: new Date().toISOString(), // 方便後台管理顯示
    usedAt: new Date().toISOString(),
    rewardApplied: true // 添加獎勵發放狀態標記
  };
  
  inviteRecords.push(inviteRecord);
  localStorage.setItem(INVITE_RECORDS_KEY, JSON.stringify(inviteRecords));
  
  // 更新邀請人的邀請計數和獎勵
  const inviterIndex = users.findIndex(u => u.id === inviter.id);
  if (inviterIndex > -1) {
    // 如果用戶沒有invitedCount字段，初始化為0
    users[inviterIndex].invitedCount = (users[inviterIndex].invitedCount || 0) + 1;
    // 額外增加10次諮詢額度
    users[inviterIndex].remainingQueries = (users[inviterIndex].remainingQueries || 0) + 10;
    
    // 保存到localStorage
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    // 更新邀請統計
    const statsKey = `invite_stats_${inviter.id}`;
    const storedStats = localStorage.getItem(statsKey);
    let stats = { count: 1 };
    
    if (storedStats) {
      try {
        const parsedStats = JSON.parse(storedStats);
        stats.count = (parsedStats.count || 0) + 1;
      } catch (e) {
        console.error('解析邀請統計數據出錯:', e);
      }
    }
    
    localStorage.setItem(statsKey, JSON.stringify(stats));
  }
  
  return true;
}

// 用戶數據初始化時添加保護機制
// 確保localStorage中的用戶數據保持最新和完整
function ensureUserDataIntegrity() {
  try {
    // 從localStorage重新加載用戶數據，確保使用最新數據
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        const loadedUsers = JSON.parse(storedUsers);
        if (Array.isArray(loadedUsers) && loadedUsers.length > 0) {
          // 更新內存中的users數組
          users = loadedUsers;
          console.log(`已從localStorage加載 ${users.length} 條用戶數據`);
        }
      } catch (e) {
        console.error('解析用戶數據失敗:', e);
      }
    }
    
    // 檢查管理員和測試用戶是否存在，如果不存在則添加
    ensureEssentialUsers();
    
    // 檢查用戶ID的唯一性
    ensureUserIdUniqueness();
    
    // 保存更新後的用戶數據到localStorage
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    return true;
  } catch (e) {
    console.error('確保用戶數據完整性失敗:', e);
    return false;
  }
}

// 確保必要的基礎用戶存在
function ensureEssentialUsers() {
  // 檢查管理員用戶
  if (!users.find(u => u.email === 'test@ailaborlaw.com')) {
    console.log('添加缺失的管理員用戶');
    users.push({
      id: 'admin_001',
      name: '测试管理员',
      email: 'test@ailaborlaw.com',
      password: 'Test1234', // 使用確切的密碼，保持大小寫敏感性
      userType: 'admin',
      registrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      remainingQueries: 999,
      totalConsultations: 10,
      status: 'active',
    });
  }
  
  // 檢查測試用戶lee1
  const lee1UserId = '682d367ce9d05b9a4d91401f';
  if (!users.find(u => u.id === lee1UserId)) {
    console.log('添加缺失的測試用戶lee1');
    users.push({
      id: lee1UserId,
      name: 'lee1234',
      email: 'lee1@gmail.com',
      userType: 'admin',
      status: 'active',
      phoneNumber: '1234567891234',
      companyName: '123鋼鐵',
      industry: 'manufacturing',
      position: '老板',
      remainingQueries: 11,
      totalConsultations: 0,
      registrationDate: '2025-05-21T02:12:12.278Z',
      lastLoginDate: new Date().toISOString()
    });
    console.log('已添加测试用户lee1数据:', lee1UserId);
  }
  
  // 檢查測試用戶
  if (!users.find(u => u.email === 'creatyen@qq.com')) {
    console.log('添加缺失的測試用戶');
    users.push({
      id: 'test_user_createyen',
      name: '测试用户',
      email: 'creatyen@qq.com',
      password: 'a1234567',
      userType: 'employee',
      registrationDate: new Date().toISOString().split('T')[0],
      remainingQueries: 10,
      totalConsultations: 0,
      status: 'active',
      occupation: '工程師',
      industry: '科技業',
      companyName: '测试公司',
      phoneNumber: '0912345678'
    });
  }
  
  // 檢查BOSS用戶
  const bossUserIndex = users.findIndex(u => u.email === 'boss@qq.com');
  if (bossUserIndex >= 0) {
    // 確保狀態是active
    users[bossUserIndex].status = 'active';
  } else {
    console.log('添加缺失的BOSS用戶');
    users.push({
      id: 'test_boss_user',
      name: 'BOSS用戶',
      email: 'boss@qq.com',
      password: 'a1234567',
      userType: 'employer',
      registrationDate: new Date().toISOString().split('T')[0],
      remainingQueries: 20,
      totalConsultations: 5,
      status: 'active',
      occupation: '主管',
      industry: '服務業',
      companyName: 'BOSS公司',
      phoneNumber: '0987654321'
    });
  }
}

// 確保用戶ID唯一性
function ensureUserIdUniqueness() {
  const userIds = new Map();
  const duplicateUsers = [];
  
  // 找出所有重複的用戶ID
  for (const user of users) {
    if (userIds.has(user.id)) {
      duplicateUsers.push(user);
    } else {
      userIds.set(user.id, user);
    }
  }
  
  if (duplicateUsers.length > 0) {
    console.warn(`發現 ${duplicateUsers.length} 個重複的用戶ID，嘗試修復...`);
    
    for (const user of duplicateUsers) {
      // 生成新ID
      const timestamp = Date.now();
      const randomPart = Math.random().toString(36).substring(2, 10);
      let emailPart = 'nomail';
      
      if (user.email) {
        // 使用整個郵箱生成雜湊
        const encoder = new TextEncoder();
        const data = encoder.encode(user.email);
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
          hash = ((hash << 5) - hash) + data[i];
          hash = hash & hash;
        }
        emailPart = Math.abs(hash).toString(36);
      }
      
      const oldId = user.id;
      const newId = `user_${timestamp}_${emailPart}_${randomPart}`;
      
      console.log(`修復重複用戶ID: ${user.email} ${oldId} -> ${newId}`);
      user.id = newId;
      
      // 更新相關數據
      const oldInviteCode = localStorage.getItem(`invite_code_${oldId}`);
      if (oldInviteCode) {
        localStorage.setItem(`invite_code_${newId}`, oldInviteCode);
        localStorage.removeItem(`invite_code_${oldId}`);
      }
      
      const oldChatHistory = localStorage.getItem(`chat_${oldId}`);
      if (oldChatHistory) {
        localStorage.setItem(`chat_${newId}`, oldChatHistory);
        localStorage.removeItem(`chat_${oldId}`);
      }
    }
  }
}

// 在mockUserStore初始化時調用保護機制
ensureUserDataIntegrity();

// 定期檢查用戶數據完整性
setInterval(ensureUserDataIntegrity, 60000); // 每60秒檢查一次

// 使用事件服務監聽用戶資料更新事件
if (typeof window !== 'undefined') {
  // 清理舊的直接事件監聽器
  window.removeEventListener('user:profile_updated', () => {});
  
  // 使用事件服務添加新的監聽器
  listenEvent(EventTypes.USER_PROFILE_UPDATED, (event) => {
    if (event.detail && event.detail.userData && event.detail.userId) {
      const { userId, userData } = event.detail;
      console.log(`監聽到用戶(ID: ${userId})資料更新事件，原始數據:`, JSON.stringify(userData));
      
      // 在模擬數據存儲中查找並更新用戶
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex > -1) {
        // 記錄更新前的數據狀態
        console.log(`更新前的用戶資料:`, JSON.stringify({
          phoneNumber: users[userIndex].phoneNumber,
          companyName: users[userIndex].companyName,
          phone: users[userIndex].phone,
          company: users[userIndex].company
        }));
        
        // 確保字段名稱一致性 - 模擬數據存儲中使用 phoneNumber 和 companyName
        const standardizedData = {
          ...userData,
          // 確保使用統一的字段名稱
          phoneNumber: userData.phoneNumber || userData.phone,
          companyName: userData.companyName || userData.company
        };
        
        console.log(`標準化後的資料:`, JSON.stringify({
          phoneNumber: standardizedData.phoneNumber,
          companyName: standardizedData.companyName
        }));
        
        // 如果後端返回的是 phone 和 company，刪除這些字段，避免存儲冗餘數據
        if (standardizedData.phone) {
          console.log(`刪除冗餘字段 phone:${standardizedData.phone}`);
          delete standardizedData.phone;
        }
        if (standardizedData.company) {
          console.log(`刪除冗餘字段 company:${standardizedData.company}`);
          delete standardizedData.company;
        }
        
        // 合併新舊數據
        users[userIndex] = {
          ...users[userIndex],
          ...standardizedData,
          // 確保關鍵欄位更新
          name: standardizedData.name || users[userIndex].name,
          // 更新profile相關欄位 - 增强字段映射逻辑
          occupation: standardizedData.occupation || standardizedData.position || (standardizedData.profile?.position) || (standardizedData.profile?.occupation) || users[userIndex].occupation,
          industry: standardizedData.industry || (standardizedData.profile?.industry) || users[userIndex].industry,
          // 确保同时更新 position 字段以保持兼容性
          position: standardizedData.position || standardizedData.occupation || (standardizedData.profile?.position) || (standardizedData.profile?.occupation) || users[userIndex].position,
          // 更新時間戳
          lastUpdated: new Date().toISOString()
        };
        
        // 再次確認關鍵字段已正確更新
        console.log(`更新後的用戶關鍵字段:`, JSON.stringify({
          phoneNumber: users[userIndex].phoneNumber,
          companyName: users[userIndex].companyName,
        }));
        
        // 立即同步更新到localStorage
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        console.log(`已更新模擬數據存儲中的用戶(ID: ${userId})資料，並同步到localStorage`);
      } else {
        console.warn(`模擬數據存儲中未找到用戶(ID: ${userId})`);
      }
    }
  });
  
  // 監聽數據同步事件
  listenEvent(EventTypes.DATA_SYNC_NEEDED, (event) => {
    if (event.detail && event.detail.dataType === 'users') {
      console.log('監聽到用戶數據同步事件:', JSON.stringify(event.detail));
      
      if (event.detail.action === 'update' && event.detail.data) {
        const { userId, userData } = event.detail.data;
        console.log(`處理數據同步事件，用戶ID: ${userId}，原始數據:`, JSON.stringify(userData));
        
        // 確保字段名稱一致性
        const standardizedData = {
          ...userData,
          // 確保使用統一的字段名稱
          phoneNumber: userData.phoneNumber || userData.phone,
          companyName: userData.companyName || userData.company
        };
        
        console.log(`同步事件：標準化後的用戶數據:`, JSON.stringify({
          phoneNumber: standardizedData.phoneNumber,
          companyName: standardizedData.companyName
        }));
        
        // 刪除冗餘字段
        if (standardizedData.phone) {
          console.log(`同步事件：刪除冗餘字段 phone:${standardizedData.phone}`);
          delete standardizedData.phone;
        }
        if (standardizedData.company) {
          console.log(`同步事件：刪除冗餘字段 company:${standardizedData.company}`);
          delete standardizedData.company;
        }
        
        // 執行更新邏輯
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
          // 記錄更新前的值
          console.log(`同步事件：更新前的用戶資料:`, JSON.stringify({
            phoneNumber: users[userIndex].phoneNumber,
            companyName: users[userIndex].companyName
          }));
          
          users[userIndex] = {
            ...users[userIndex],
            ...standardizedData,
            // 确保关键字段更新 - 增强字段映射逻辑
            name: standardizedData.name || users[userIndex].name,
            // 更新profile相关字段 - 增强职业字段映射
            occupation: standardizedData.occupation || standardizedData.position || (standardizedData.profile?.position) || (standardizedData.profile?.occupation) || users[userIndex].occupation,
            industry: standardizedData.industry || (standardizedData.profile?.industry) || users[userIndex].industry,
            // 确保同时更新 position 字段以保持兼容性
            position: standardizedData.position || standardizedData.occupation || (standardizedData.profile?.position) || (standardizedData.profile?.occupation) || users[userIndex].position,
            lastUpdated: new Date().toISOString()
          };
          
          console.log(`同步事件：更新後的用戶資料:`, JSON.stringify({
            phoneNumber: users[userIndex].phoneNumber,
            companyName: users[userIndex].companyName
          }));
          
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
          console.log(`已通過同步事件更新模擬數據存儲中的用戶(ID: ${userId})資料，並同步到localStorage`);
          
          // 確保數據一致性，強制刷新
          console.log(`觸發數據一致性檢查...`);
          ensureUserDataIntegrity();
        } else {
          console.warn(`同步事件：模擬數據存儲中未找到用戶(ID: ${userId})`);
        }
      }
    }
  });
}

export const mockUserStore = {
    getUsers: (params = {}) => {
        let filteredUsers = [...users];

        // 搜索词筛选 (姓名或邮箱)
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredUsers = filteredUsers.filter(user =>
                (user.name && user.name.toLowerCase().includes(searchTerm)) ||
                (user.email && user.email.toLowerCase().includes(searchTerm))
            );
        }

        // 状态筛选
        if (params.status) {
            filteredUsers = filteredUsers.filter(user => user.status === params.status);
        }

        // 用户类型筛选
        if (params.userType) {
            filteredUsers = filteredUsers.filter(user => user.userType === params.userType);
        }
        
        // 注册日期筛选
        if (params.dateRange) {
            filteredUsers = filteredUsers.filter(user => 
                isInDateRange(user.registrationDate, params.dateRange)
            );
        }

        const total = filteredUsers.length;

        // 分页逻辑
        if (params.page && params.limit) {
            const page = parseInt(params.page, 10);
            const limit = parseInt(params.limit, 10);
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            filteredUsers = filteredUsers.slice(startIndex, endIndex);
        }

        return Promise.resolve({ users: filteredUsers, total: total }); // 返回的是当前页的用户 和 未分页前的总数
    },
    getUserById: (id) => {
        console.log(`從模擬存儲獲取用戶，ID: ${id}`);
        
        // 先刷新從 localStorage 中加載用戶數據
        try {
            const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            if (storedUsers) {
                const parsedUsers = JSON.parse(storedUsers);
                if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
                    console.log(`已從localStorage加載 ${parsedUsers.length} 條用戶數據`);
                    users = parsedUsers;
                }
            }
        } catch (e) {
            console.error("從 localStorage 加載用戶數據時發生錯誤", e);
        }
        
        const user = users.find(u => u.id === id);
        
        if (user) {
            console.log(`找到用戶，ID: ${id}，詳細數據:`, JSON.stringify({
                phoneNumber: user.phoneNumber,
                companyName: user.companyName,
                phone: user.phone,
                company: user.company
            }));
            
            // 確保字段名稱一致性，返回統一使用 phoneNumber 和 companyName
            const standardizedUser = {
                ...user,
                phoneNumber: user.phoneNumber || user.phone,
                companyName: user.companyName || user.company
            };
            
            // 刪除冗餘字段
            if (standardizedUser.phone) delete standardizedUser.phone;
            if (standardizedUser.company) delete standardizedUser.company;
            
            console.log(`返回標準化用戶數據:`, JSON.stringify({
                phoneNumber: standardizedUser.phoneNumber,
                companyName: standardizedUser.companyName
            }));
            
            return Promise.resolve(standardizedUser);
        } else {
            console.warn(`未找到ID為 ${id} 的用戶`);
            return Promise.resolve(null);
        }
    },
    addUser: (userData) => {
        // 生成真正唯一的ID，使用時間戳+郵箱+隨機數確保絕對唯一
        const timestamp = Date.now();
        // 生成一個更長、更隨機的部分
        const randomPart = Math.random().toString(36).substring(2, 10) + 
                           Math.random().toString(36).substring(2, 10);
        
        // 確保郵箱部分唯一，使用完整郵箱生成雜湊
        let emailPart = '';
        if (userData.email) {
            // 使用整個郵箱而不是只取前綴
            const encoder = new TextEncoder();
            const data = encoder.encode(userData.email);
            let hash = 0;
            for (let i = 0; i < data.length; i++) {
                hash = ((hash << 5) - hash) + data[i];
                hash = hash & hash; // 轉換為32位整數
            }
            emailPart = Math.abs(hash).toString(36);
        } else {
            emailPart = 'nomail';
        }
        
        // 組合ID，確保各部分之間有明確分隔
        const userId = `user_${timestamp}_${emailPart}_${randomPart}`;
        
        const newUser = {
            id: userId, // 生成唯一ID
            registrationDate: new Date().toISOString().split('T')[0],
            remainingQueries: userData.remainingQueries || 10, // 默認10次免費諮詢
            totalConsultations: 0,
            status: userData.status || 'pending', // 新注册用户默认为待验证
            userType: userData.userType || 'employee', // 如果未提供，默认为 'employee'
            inviteCode: generateInviteCode(), // 為每個用戶生成邀請碼
            invitedCount: 0, // 已邀請人數初始化為0
            // 標準化字段名稱
            occupation: userData.occupation || '', // 職業
            industry: userData.industry || '', // 行業
            companyName: userData.companyName || '', // 公司名稱
            phoneNumber: userData.phoneNumber || '', // 手機號碼
            password: userData.password, // 儲存密碼，確保登入驗證可以使用
            ...userData // 包含从注册表单传来的 name, email 等，如果userData中已有userType，它会覆盖上面的默认值
        };
        
        // 檢查ID是否已存在，如果存在則重新生成
        // 增強唯一性檢查，確保不會有衝突
        let retryCount = 0;
        const maxRetries = 5;
        while (users.some(user => user.id === newUser.id) && retryCount < maxRetries) {
            console.warn(`生成的用戶ID(${newUser.id})已存在，重新生成...嘗試次數: ${retryCount + 1}`);
            // 使用新的時間戳+隨機部分重新生成
            const newTimestamp = Date.now() + retryCount;
            const newRandomPart = newTimestamp + '_' + Math.random().toString(36).substring(2, 15) + '_' + retryCount;
            newUser.id = `user_${newTimestamp}_${emailPart}_${newRandomPart}`;
            retryCount++;
        }
        
        // 最終檢查，如果嘗試多次後仍然有衝突，則拋出錯誤
        if (users.some(user => user.id === newUser.id)) {
            console.error('無法生成唯一用戶ID，放棄嘗試');
            throw new Error('無法生成唯一用戶ID');
        }
        
        // 處理邀請碼獎勵
        if (userData.inviteCode) {
            const inviteSuccess = processInvite(userData.inviteCode, newUser.id);
            if (inviteSuccess) {
                // 如果邀請成功，被邀請人獲得額外10次免費諮詢
                newUser.remainingQueries += 10;
            }
        }
        
        users.push(newUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        
        // 將用戶的邀請碼存儲到localStorage，以便在其他地方使用
        localStorage.setItem(`invite_code_${newUser.id}`, newUser.inviteCode);
        
        return Promise.resolve(newUser);
    },
    updateUser: (userId, updatedData) => {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            users[userIndex] = { ...users[userIndex], ...updatedData };
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
            return Promise.resolve(users[userIndex]);
        }
        return Promise.reject(new Error('User not found for update'));
    },
    deleteUser: (userId) => {
        const initialLength = users.length;
        users = users.filter(u => u.id !== userId);
        if (users.length < initialLength) {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
            return Promise.resolve({ success: true });
        }
        return Promise.reject(new Error('User not found for deletion'));
    },
    // toggleUserStatus 可以在这里实现，或者在 userService 中基于 getUserById 和 updateUser 实现
    toggleUserStatus: (userId) => {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            const currentUserStatus = users[userIndex].status;
            users[userIndex].status = currentUserStatus === 'active' ? 'disabled' : 'active';
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
            return Promise.resolve(users[userIndex]);
        }
        return Promise.reject(new Error('User not found for status toggle'));
    },
    // 獲取用戶的邀請統計
    getInviteStats: (userId) => {
        const invitesCount = inviteRecords.filter(record => record.inviterId === userId).length;
        return Promise.resolve({
            invitedCount: invitesCount,
            bonusConsultations: invitesCount * 10
        });
    },
    // 獲取用戶的邀請碼
    getUserInviteCode: (userId) => {
        // 嘗試從用戶對象中獲取
        const user = users.find(u => u.id === userId);
        if (user && user.inviteCode) {
            return Promise.resolve(user.inviteCode);
        }
        
        // 如果用戶對象中沒有，則從localStorage中獲取
        const codeFromStorage = localStorage.getItem(`invite_code_${userId}`);
        if (codeFromStorage) {
            return Promise.resolve(codeFromStorage);
        }
        
        // 都沒有的話，生成一個新的
        const newCode = generateInviteCode();
        localStorage.setItem(`invite_code_${userId}`, newCode);
        
        // 同時更新用戶對象
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            users[userIndex].inviteCode = newCode;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
        
        return Promise.resolve(newCode);
    },
    // 獲取每次邀請成功獎勵的諮詢次數
    getInviteBonusAmount: () => {
        // TODO: 將來可以從系統設定中讀取此值
        return 10; // 目前固定返回10
    },
    // 獲取和保存系統設定（例如邀請獎勵次數）
    getInviteSettings: () => {
        const settingsStr = localStorage.getItem('app_invite_settings');
        if (settingsStr) {
            return JSON.parse(settingsStr);
        }
        // 返回默認值
        return {
            defaultFreeQueries: 10, // 新用戶默認免費次數
            inviteBonusQueries: 10, // 邀請人獎勵次數
            inviteeBonusQueries: 10 // 被邀請人獎勵次數
        };
    },
    saveInviteSettings: (settings) => {
        localStorage.setItem('app_invite_settings', JSON.stringify(settings));
        return Promise.resolve(settings);
    },
    // 管理員相關
    getAdminUsers: async () => {
        return users.filter(u => u.userType === 'admin' || u.role === 'superadmin' || u.role === 'operator');
    },
    addAdminUser: async (email, password, role) => {
        if (users.find(u => u.email === email)) {
            throw new Error('該郵箱已被註冊為管理員。');
        }
        const newAdminUser = {
            id: `admin_${Date.now()}`,
            name: email.split('@')[0], // 簡單用郵箱前綴做名字
            email,
            password: password, // 直接存儲原始密碼，保持大小寫敏感性
            role,
            userType: 'admin', // 標記為管理員類型
            registrationDate: new Date().toISOString().split('T')[0],
            status: 'active',
            remainingQueries: 999, // 確保管理員有足夠的諮詢次數
        };
        users.push(newAdminUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        return newAdminUser;
    },
    removeAdminUser: async (adminId) => {
        const initialLength = users.length;
        users = users.filter(u => u.id !== adminId || (u.userType !== 'admin' && u.role !== 'superadmin' && u.role !== 'operator'));
        if (users.length < initialLength) {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
            return { success: true };
        }
        throw new Error('未找到該管理員或無法刪除。');
    },
    findUser: async (query) => { // 用於SystemSettingsView查找用戶
        const lowerQuery = query.toLowerCase();
        return users.find(u => u.id.toLowerCase() === lowerQuery || u.email.toLowerCase() === lowerQuery || (u.name && u.name.toLowerCase().includes(lowerQuery)));
    }
};
