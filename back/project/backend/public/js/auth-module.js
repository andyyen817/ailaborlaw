/**
 * 認證模組
 * 處理用戶註冊、登入、快速登入等功能
 */

// 注册处理函数
async function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const userType = document.getElementById('register-userType').value;
    const industry = document.getElementById('register-industry').value;
    const position = document.getElementById('register-position').value;
    const inviteCode = document.getElementById('register-inviteCode').value;
    
    if (!name || !email || !password) {
        formatResult(document.getElementById('register-result'), '请填写必要信息', false);
        return;
    }
    
    const data = {
        name,
        email,
        password,
        userType,
        profile: {
            industry,
            position
        }
    };
    
    if (inviteCode) {
        data.inviteCode = inviteCode;
    }
    
    const result = await callApi('/auth/register', 'POST', data);
    formatResult(document.getElementById('register-result'), result, result.success);
    
    if (result.success) {
        alert('註冊成功！請登入。');
    }
}

// 登录处理函数
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        formatResult(document.getElementById('login-result'), '请填写邮箱和密码', false);
        return;
    }
    
    const result = await callApi('/auth/login', 'POST', { email, password });
    formatResult(document.getElementById('login-result'), result, result.success);
    
    if (result.success && result.data) {
        authToken = result.data.accessToken;
        refreshToken = result.data.refreshToken || '';
        currentUser = result.data.user;
        
        localStorage.setItem(API.AUTH_TOKEN_KEY, authToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem(API.USER_KEY, JSON.stringify(currentUser));
        
        updateLoginStatus();
        alert('登入成功！');
    }
}

// 快速登入處理函數
async function handleQuickLogin(testAccount) {
    const result = await callApi('/auth/login', 'POST', {
        email: testAccount.email,
        password: testAccount.password
    });
    
    formatResult(document.getElementById('quick-login-result'), result, result.success);
    
    if (result.success && result.data) {
        authToken = result.data.accessToken;
        refreshToken = result.data.refreshToken || '';
        currentUser = result.data.user;
        
        localStorage.setItem(API.AUTH_TOKEN_KEY, authToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem(API.USER_KEY, JSON.stringify(currentUser));
        
        updateLoginStatus();
        alert(`快速登入成功！歡迎 ${currentUser.name}`);
    }
}

// 獲取用戶資料
async function handleGetProfile() {
    const result = await callApi('/users/profile', 'GET', null, true);
    formatResult(document.getElementById('profile-result'), result, result.success);
}

// 更新用戶資料
async function handleUpdateProfile() {
    const name = document.getElementById('update-name').value;
    const industry = document.getElementById('update-industry').value;
    const position = document.getElementById('update-position').value;
    
    const data = {};
    if (name) data.name = name;
    if (industry || position) {
        data.profile = {};
        if (industry) data.profile.industry = industry;
        if (position) data.profile.position = position;
    }
    
    if (Object.keys(data).length === 0) {
        formatResult(document.getElementById('update-profile-result'), '请填写要更新的信息', false);
        return;
    }
    
    const result = await callApi('/users/profile', 'PUT', data, true);
    formatResult(document.getElementById('update-profile-result'), result, result.success);
    
    if (result.success) {
        currentUser = { ...currentUser, ...result.data.user };
        localStorage.setItem(API.USER_KEY, JSON.stringify(currentUser));
        updateLoginStatus();
    }
}

// 初始化認證模組事件監聽器
function initAuthEventListeners() {
    // 注册处理程序
    document.getElementById('register-btn')?.addEventListener('click', handleRegister);
    document.getElementById('login-btn')?.addEventListener('click', handleLogin);
    document.getElementById('get-profile-btn')?.addEventListener('click', handleGetProfile);
    document.getElementById('update-profile-btn')?.addEventListener('click', handleUpdateProfile);
    
    // 快速登入按鈕
    document.getElementById('admin-quick-login')?.addEventListener('click', () => handleQuickLogin(TEST_ADMIN));
    document.getElementById('user-quick-login')?.addEventListener('click', () => handleQuickLogin(TEST_USER));
} 