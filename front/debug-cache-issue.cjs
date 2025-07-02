const fs = require('fs');
const http = require('http');

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📝';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

async function makeRequest(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODMxNDBjZTM5YTEyODlhNDFiYjkyZDQiLCJ1c2VyVHlwZSI6ImVtcGxveWVlIiwiaWF0IjoxNzQ4NTIyODQ1LCJleHAiOjE3NDg2MDkyNDV9.irgBHSCJkdteGrioqUhYe8M8JuYID3LJlxde-PRDxdU',
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function debugCacheIssue() {
    console.log('🔍 开始调试前端缓存问题\n');

    // 第一次请求 - 模拟首次加载
    log('=== 第一次请求（首次加载）===');
    try {
        const response1 = await makeRequest('http://localhost:3032/api/v1/chat/sessions');
        log(`第一次请求状态: ${response1.status}`);
        log(`响应头 - Cache-Control: ${response1.headers['cache-control'] || '无'}`);
        log(`响应头 - ETag: ${response1.headers['etag'] || '无'}`);
        log(`响应头 - Last-Modified: ${response1.headers['last-modified'] || '无'}`);
        
        if (response1.status === 200) {
            log(`数据长度: ${JSON.stringify(response1.data).length} 字符`, 'success');
            if (response1.data?.data?.sessions) {
                log(`会话数量: ${response1.data.data.sessions.length}`, 'success');
            }
        }

        // 等待1秒后第二次请求 - 模拟页面刷新或重新加载
        log('\n=== 等待1秒后第二次请求（可能触发304）===');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response2 = await makeRequest('http://localhost:3032/api/v1/chat/sessions', {
            // 模拟浏览器的条件请求头
            'If-None-Match': response1.headers['etag'] || '',
            'If-Modified-Since': response1.headers['last-modified'] || ''
        });
        
        log(`第二次请求状态: ${response2.status}`);
        
        if (response2.status === 304) {
            log('🎯 发现304状态码！这可能是问题根源', 'warning');
            log('304意味着：服务器说"内容没变化，使用缓存"', 'warning');
            log('但如果浏览器缓存的是错误数据，就会导致前端显示问题', 'error');
            
            // 模拟前端的缓存处理逻辑
            log('\n=== 模拟前端缓存处理逻辑 ===');
            log('前端会使用之前缓存的数据...');
            
            // 这里模拟了一个问题场景：如果之前的缓存数据有问题
            const mockCachedData = {
                success: false, // 假设缓存的是失败响应
                error: '之前的错误响应被缓存了',
                data: { sessions: [] }
            };
            
            log('假设缓存的数据是:', 'warning');
            log(JSON.stringify(mockCachedData, null, 2), 'warning');
            log('这就是为什么前端显示失败的原因！', 'error');
            
        } else if (response2.status === 200) {
            log('第二次请求返回了新数据', 'success');
            if (response2.data?.data?.sessions) {
                log(`第二次请求会话数量: ${response2.data.data.sessions.length}`, 'success');
            }
        }

        // 测试不带条件头的请求
        log('\n=== 第三次请求（不带条件头，强制获取新数据）===');
        const response3 = await makeRequest('http://localhost:3032/api/v1/chat/sessions', {
            'Cache-Control': 'no-cache'
        });
        
        log(`第三次请求状态: ${response3.status}`);
        if (response3.status === 200 && response3.data?.data?.sessions) {
            log(`强制刷新后会话数量: ${response3.data.data.sessions.length}`, 'success');
        }

    } catch (error) {
        log(`请求失败: ${error.message}`, 'error');
    }

    // 分析问题
    log('\n=== 问题分析 ===');
    log('🔍 可能的问题原因：');
    log('1. 浏览器缓存了之前的错误响应', 'warning');
    log('2. 服务器返回304让浏览器使用缓存，但缓存数据有问题', 'warning');
    log('3. 前端的cacheService可能缓存了错误数据', 'warning');
    log('4. aiChatService.getSessionList()可能返回了缓存的错误数据', 'warning');

    log('\n💡 可能的解决方案：');
    log('1. 清除浏览器缓存', 'success');
    log('2. 在API请求中添加Cache-Control: no-cache头', 'success');
    log('3. 清除前端cacheService中的CHAT_SESSIONS缓存', 'success');
    log('4. 在调试时使用硬刷新（Ctrl+F5）', 'success');
}

debugCacheIssue().catch(console.error); 