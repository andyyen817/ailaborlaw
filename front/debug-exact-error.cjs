const http = require('http');

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📝';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODMxNDBjZTM5YTEyODlhNDFiYjkyZDQiLCJ1c2VyVHlwZSI6ImVtcGxveWVlIiwiaWF0IjoxNzQ4NTIyODQ1LCJleHAiOjE3NDg2MDkyNDV9.irgBHSCJkdteGrioqUhYe8M8JuYID3LJlxde-PRDxdU',
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = http.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonData,
                        rawData: data
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: null,
                        rawData: data,
                        parseError: e.message
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject({
                error: error.message,
                code: error.code,
                isNetworkError: true
            });
        });

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

async function debugExactError() {
    console.log('🔍 精确调试前端错误\n');

    // 测试1: 直接API调用 (模拟API测试页面)
    log('=== 测试1: 直接API调用 (与API测试页面相同) ===');
    try {
        const response1 = await makeRequest('http://localhost:3032/api/v1/chat/sessions');
        log(`状态码: ${response1.status}`);
        if (response1.status === 200) {
            log(`成功获取数据，会话数量: ${response1.data?.data?.sessions?.length || 0}`, 'success');
        } else {
            log(`错误: ${JSON.stringify(response1.data)}`, 'error');
        }
    } catch (error) {
        log(`网络错误: ${error.error} (${error.code})`, 'error');
    }

    // 测试2: 模拟前端aiChatService的确切逻辑
    log('\n=== 测试2: 模拟前端aiChatService逻辑 ===');
    
    // 模拟前端的API调用过程
    const API_BASE_URL = '/api/v1';
    const baseURL = '/chat';
    const endpoint = '/sessions';
    const fullPath = API_BASE_URL + baseURL + endpoint;
    
    log(`API_BASE_URL: ${API_BASE_URL}`);
    log(`aiChatService.baseURL: ${baseURL}`);
    log(`endpoint: ${endpoint}`);
    log(`构造的完整路径: ${fullPath}`);
    
    try {
        const response2 = await makeRequest(`http://localhost:3032${fullPath}`);
        log(`状态码: ${response2.status}`);
        if (response2.status === 200) {
            log(`成功获取数据，会话数量: ${response2.data?.data?.sessions?.length || 0}`, 'success');
        } else {
            log(`错误响应:`, 'error');
            log(`状态: ${response2.status}`, 'error');
            log(`原始数据: ${response2.rawData}`, 'error');
            if (response2.data) {
                log(`解析数据: ${JSON.stringify(response2.data, null, 2)}`, 'error');
            }
        }
    } catch (error) {
        log(`网络错误: ${error.error} (${error.code})`, 'error');
        
        if (error.code === 'ECONNREFUSED') {
            log('连接被拒绝 - 可能的原因:', 'error');
            log('1. 后端服务未运行', 'error');
            log('2. 端口配置错误', 'error');
            log('3. 网络配置问题', 'error');
        }
    }

    // 测试3: 测试认证相关的问题
    log('\n=== 测试3: 认证问题调试 ===');
    
    // 测试不带认证头的请求
    try {
        const response3 = await makeRequest(`http://localhost:3032${fullPath}`, {
            headers: {} // 不包含认证头
        });
        log(`无认证请求状态码: ${response3.status}`);
        if (response3.status === 401) {
            log('确认：未认证时返回401', 'success');
        }
    } catch (error) {
        log(`无认证请求网络错误: ${error.error}`, 'error');
    }

    // 测试4: Headers和参数调试
    log('\n=== 测试4: Headers和参数调试 ===');
    
    // 模拟前端的完整请求 (包括params)
    const paramsString = 'page=1&limit=5';
    const urlWithParams = `http://localhost:3032${fullPath}?${paramsString}`;
    
    log(`带参数的URL: ${urlWithParams}`);
    
    try {
        const response4 = await makeRequest(urlWithParams);
        log(`带参数请求状态码: ${response4.status}`);
        if (response4.status === 200 && response4.data?.data?.sessions) {
            log(`带参数成功，会话数量: ${response4.data.data.sessions.length}`, 'success');
        }
    } catch (error) {
        log(`带参数请求错误: ${error.error}`, 'error');
    }

    // 总结分析
    log('\n=== 问题分析总结 ===');
    log('🔍 如果测试1成功但测试2失败，说明URL构造有问题');
    log('🔍 如果所有测试都成功，说明问题在前端的其他逻辑中');
    log('🔍 如果出现网络错误，说明连接层面有问题');
    log('🔍 如果返回401，说明认证逻辑有问题');
}

debugExactError().catch(console.error); 