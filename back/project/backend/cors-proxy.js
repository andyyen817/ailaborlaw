#!/usr/bin/env node

/**
 * 簡單的CORS代理服務器
 * 解決本地HTML文件測試API時的跨域問題
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

const PROXY_PORT = 3030;
const TARGET_API = 'https://ailaborlawbackv1.vercel.app';

const server = http.createServer((req, res) => {
    // 設置CORS標頭
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');

    // 處理預檢請求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 構建目標URL
    const targetUrl = new URL(req.url, TARGET_API);
    
    console.log(`🔄 代理請求: ${req.method} ${targetUrl.href}`);

    // 選擇HTTP或HTTPS
    const client = targetUrl.protocol === 'https:' ? https : http;

    // 設置請求選項
    const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        path: targetUrl.pathname + targetUrl.search,
        method: req.method,
        headers: {
            ...req.headers,
            host: targetUrl.hostname
        }
    };

    // 創建代理請求
    const proxyReq = client.request(options, (proxyRes) => {
        // 複製響應標頭
        Object.keys(proxyRes.headers).forEach(key => {
            res.setHeader(key, proxyRes.headers[key]);
        });

        // 設置狀態碼
        res.writeHead(proxyRes.statusCode);

        // 轉發響應體
        proxyRes.pipe(res);

        console.log(`✅ 響應: ${proxyRes.statusCode} ${req.method} ${targetUrl.href}`);
    });

    // 錯誤處理
    proxyReq.on('error', (err) => {
        console.error(`❌ 代理錯誤: ${err.message}`);
        res.writeHead(500);
        res.end(JSON.stringify({
            success: false,
            message: '代理服務器錯誤',
            error: err.message
        }));
    });

    // 轉發請求體
    req.pipe(proxyReq);
});

// 啟動服務器
server.listen(PROXY_PORT, () => {
    console.log(`🚀 CORS代理服務器啟動成功！`);
    console.log(`📡 本地地址: http://localhost:${PROXY_PORT}`);
    console.log(`🎯 目標API: ${TARGET_API}`);
    console.log(`💡 使用方法: 將API測試工具的基礎URL改為 http://localhost:${PROXY_PORT}`);
    console.log(`⏹️  停止服務器: 按 Ctrl+C`);
});

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n🛑 正在關閉CORS代理服務器...');
    server.close(() => {
        console.log('✅ 服務器已關閉');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 收到終止信號，正在關閉服務器...');
    server.close(() => {
        console.log('✅ 服務器已關閉');
        process.exit(0);
    });
}); 