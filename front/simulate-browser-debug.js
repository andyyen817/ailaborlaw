const fs = require('fs');
const https = require('https');
const http = require('http');

// 模拟localStorage
const mockLocalStorage = {
    'auth_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODMxNDBjZTM5YTEyODlhNDFiYjkyZDQiLCJ1c2VyVHlwZSI6ImVtcGxveWVlIiwiaWF0IjoxNzQ4NTIyODQ1LCJleHAiOjE3NDg2MDkyNDV9.irgBHSCJkdteGrioqUhYe8M8JuYID3LJlxde-PRDxdU',
    // 这些值可能在实际的localStorage中不存在
    'auth_user': null,
    'auth_user_id': null,
    'auth_token_expires': null
};

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📝';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

function parseJwt(token) {
    if (!token) return null;
    
    try {
        if (!token.includes('.') || token.split('.').length !== 3) {
            return null;
        }
        
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString();
        
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('JWT解析失败:', e);
        return null;
    }
}

function makeHttpRequest(url, options) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https:') ? https : http;
        const req = lib.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function simulateDebug() {
    console.log('🔍 开始前端问题调试模拟\n');

    // 步骤1: 基础环境检查
    log('=== 步骤1: 基础环境检查 ===');
    
    const authToken = mockLocalStorage['auth_token'];
    const authUser = mockLocalStorage['auth_user'];
    const authUserId = mockLocalStorage['auth_user_id'];
    
    log(`auth_token存在: ${!!authToken}`);
    if (authToken) {
        log(`Token长度: ${authToken.length}`);
        log(`Token前缀: ${authToken.substring(0, 20)}...`);
    }
    
    log(`auth_user存在: ${!!authUser}`);
    log(`auth_user_id存在: ${!!authUserId}`);
    
    // 步骤2: 认证状态检查
    log('\n=== 步骤2: 认证状态检查 ===');
    
    // 模拟 authService.getToken()
    log(`模拟 authService.getToken(): ${authToken ? '有Token' : '无Token'}`);
    
    // 模拟 authService.isAuthenticated() 逻辑
    if (authToken) {
        // 检查token是否过期
        const tokenExpires = mockLocalStorage['auth_token_expires'];
        log(`Token过期时间存储: ${tokenExpires}`);
        
        if (tokenExpires) {
            const expiresAt = parseInt(tokenExpires);
            const now = Date.now();
            const isExpired = now >= expiresAt;
            
            log(`当前时间: ${now}`);
            log(`过期时间: ${expiresAt}`);
            log(`Token已过期: ${isExpired}`);
            log(`模拟 authService.isAuthenticated(): ${!isExpired}`);
        } else {
            // 没有过期时间信息，尝试解析JWT
            try {
                const payload = parseJwt(authToken);
                log(`JWT解析结果: ${JSON.stringify(payload, null, 2)}`);
                
                if (payload && payload.exp) {
                    const expiresAt = payload.exp * 1000;
                    const now = Date.now();
                    const isExpired = now >= expiresAt;
                    
                    log(`从JWT解析过期时间: ${expiresAt}`);
                    log(`当前时间: ${now}`);
                    log(`Token已过期: ${isExpired}`);
                    log(`模拟 authService.isAuthenticated(): ${!isExpired}`);
                    
                    // 这里是关键点！如果token已过期，前端逻辑会失败
                    if (isExpired) {
                        log(`⚠️ 发现问题：JWT Token已过期！`, 'error');
                        log(`这就是前端页面失败的原因！`, 'error');
                    }
                } else {
                    log(`无法从JWT获取过期信息`, 'warning');
                    log(`模拟 authService.isAuthenticated(): true (假设有效)`);
                }
            } catch (e) {
                log(`JWT解析失败: ${e.message}`, 'error');
                log(`模拟 authService.isAuthenticated(): false`);
            }
        }
    } else {
        log(`模拟 authService.isAuthenticated(): false (无Token)`);
    }

    // 步骤3: API调用测试
    log('\n=== 步骤3: API调用测试 ===');
    
    if (!authToken) {
        log('无认证Token，无法进行API测试', 'error');
        return;
    }

    try {
        log('正在测试 /api/v1/chat/sessions API...');
        
        // 构造请求
        const url = 'http://localhost:3032/api/v1/chat/sessions';
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        };
        
        log(`请求URL: ${url}`);
        log(`请求方法: GET`);
        log(`认证头: Bearer ${authToken.substring(0, 20)}...`);

        const response = await makeHttpRequest(url, options);
        
        log(`API响应状态: ${response.status}`);
        
        if (response.status === 200) {
            log(`API响应成功`, 'success');
            log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);
            
            if (response.data && response.data.success && response.data.data && response.data.data.sessions) {
                log(`找到 ${response.data.data.sessions.length} 个会话`, 'success');
                log(`API调用完全正常，问题不在后端`, 'success');
            } else {
                log(`响应格式异常`, 'warning');
            }
        } else {
            log(`API调用失败`, 'error');
            log(`响应状态: ${response.status}`);
            log(`响应数据: ${JSON.stringify(response.data, null, 2)}`, 'error');
            
            if (response.status === 401) {
                log(`🎯 发现关键问题：认证失败 (401 Unauthorized)`, 'error');
                log(`这证实了前端认证逻辑的问题`, 'error');
            }
        }

    } catch (error) {
        log(`API测试出错: ${error.message}`, 'error');
        
        if (error.code === 'ECONNREFUSED') {
            log(`连接被拒绝，可能是代理配置问题`, 'error');
        }
    }

    // 步骤4: 总结分析
    log('\n=== 步骤4: 问题总结分析 ===');
    
    const payload = parseJwt(authToken);
    if (payload && payload.exp) {
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const isExpired = now >= expiresAt;
        
        if (isExpired) {
            log(`🔍 问题根源确认：`, 'error');
            log(`1. JWT Token已于 ${new Date(expiresAt).toLocaleString()} 过期`, 'error');
            log(`2. authService.isAuthenticated() 返回 false`, 'error');
            log(`3. aiChatService.getSessionList() 在认证检查时就失败了`, 'error');
            log(`4. API测试页面绕过了authService，直接使用过期token仍能成功`, 'warning');
            log(`\n解决方案：`, 'success');
            log(`1. 重新登录获取新的token`, 'success');
            log(`2. 或者修复token刷新逻辑`, 'success');
        } else {
            log(`JWT Token仍然有效，问题可能在其他地方`, 'warning');
            const remainingTime = Math.floor((expiresAt - now) / (1000 * 60));
            log(`Token剩余有效时间: ${remainingTime} 分钟`);
        }
    }
}

// 运行调试
simulateDebug().catch(console.error); 