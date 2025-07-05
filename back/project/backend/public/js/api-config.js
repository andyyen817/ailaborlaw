/**
 * API 配置和通用工具函數
 * 從 test-api.html 中提取的核心功能
 */

// API 配置
const API = {
    BASE_URL: 'https://ailaborlawbackv1.vercel.app/api/v1',
    AUTH_TOKEN_KEY: 'auth_token',
    USER_KEY: 'user_info'
};

// 存儲token
let authToken = localStorage.getItem(API.AUTH_TOKEN_KEY) || '';
let refreshToken = localStorage.getItem('refreshToken') || '';
let currentUser = JSON.parse(localStorage.getItem(API.USER_KEY) || 'null');

// 默認測試賬號
const TEST_ADMIN = {
    username: 'admin',
    email: 'test@ailaborlaw.com',
    password: 'Test1234'
};

const TEST_USER = {
    username: 'newadmin',
    email: 'newadmin@ailaborlaw.com',
    password: 'Admin1234'
};

// 添加認證令牌到請求
const getAuthHeaders = () => {
    const token = localStorage.getItem(API.AUTH_TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// 通用API调用函数
async function callApi(endpoint, method = 'GET', data = null, auth = false) {
    try {
        const url = `${API.BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // 获取最新的token（从localStorage或全局变量）
        const currentToken = authToken || localStorage.getItem(API.AUTH_TOKEN_KEY);
        
        if (auth && currentToken) {
            headers['Authorization'] = `Bearer ${currentToken}`;
        }
        
        const options = {
            method,
            headers
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }
        
        console.log(`API调用: ${method} ${url}`, {
            hasAuth: !!currentToken,
            tokenLength: currentToken ? currentToken.length : 0,
            data
        });
        
        const response = await fetch(url, options);
        const result = await response.json();
        
        console.log(`API响应: ${response.status}`, result);
        
        return result;
    } catch (error) {
        console.error('API调用错误:', error);
        return {
            success: false,
            message: '请求失败',
            error: {
                code: 'REQUEST_FAILED',
                details: error.message
            }
        };
    }
}

// 格式化输出结果
function formatResult(element, data, isSuccess = true) {
    if (!element) return;
    
    element.innerHTML = '';
    element.className = `result ${isSuccess ? 'success' : 'error'}`;
    
    if (typeof data === 'object') {
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(data, null, 2);
        element.appendChild(pre);
    } else {
        element.textContent = data;
    }
}

// 更新UI以反映登录状态
function updateLoginStatus() {
    const userInfo = document.getElementById('user-info');
    
    if (!userInfo) return;
    
    if (authToken && currentUser) {
        userInfo.innerHTML = `
            <div class="logged-in">
                <p><strong>已登录为:</strong> ${currentUser.name || 'Unknown'}</p>
                <p><strong>用户类型:</strong> ${currentUser.userType || 'Unknown'}</p>
                <button id="logout-btn">登出</button>
            </div>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    } else {
        userInfo.innerHTML = '<p>未登录</p>';
    }
}

// 处理登出
function handleLogout() {
    localStorage.removeItem(API.AUTH_TOKEN_KEY);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(API.USER_KEY);
    authToken = '';
    refreshToken = '';
    currentUser = null;
    updateLoginStatus();
    alert('成功登出');
} 