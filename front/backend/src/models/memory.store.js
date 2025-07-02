/**
 * 簡單的內存數據存儲，用於MongoDB連接失敗時的API測試
 * 注意：僅用於開發環境，不適合生產環境使用
 */

class MemoryStore {
  constructor() {
    this.users = [];
    this.userIdCounter = 1;
  }

  // 創建用戶
  async createUser(userData) {
    const id = this.userIdCounter++;
    const user = {
      _id: id.toString(),
      ...userData,
      createdAt: new Date(),
      lastLogin: null
    };
    
    // 模擬密碼加密
    if (user.password) {
      // 在內存模式中，我們只是簡單地標記密碼已加密
      user.password = `encrypted:${user.password}`;
    }
    
    this.users.push(user);
    return user;
  }

  // 根據郵箱查找用戶
  async findUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  // 根據ID查找用戶
  async findUserById(id) {
    return this.users.find(u => u._id === id);
  }

  // 更新用戶
  async updateUser(id, updateData) {
    const userIndex = this.users.findIndex(u => u._id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateData,
    };
    
    return this.users[userIndex];
  }

  // 檢查密碼是否匹配（簡單實現，僅用於測試）
  async matchPassword(user, enteredPassword) {
    if (!user || !user.password) return false;
    const storedPassword = user.password.startsWith('encrypted:') 
      ? user.password.replace('encrypted:', '') 
      : user.password;
    
    return storedPassword === enteredPassword;
  }

  // 生成模擬JWT令牌
  generateAuthToken(user) {
    return `test_token_for_user_${user._id}`;
  }
}

module.exports = new MemoryStore(); 