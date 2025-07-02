/**
 * 環境變量配置更新腳本
 * 該腳本將強制設置PORT為7070，覆蓋任何現有的環境變量設置
 */

console.log('正在設置環境變量 PORT=7070...');

// 直接修改 process.env
process.env.PORT = '7070';

// 驗證設置
console.log(`PORT 環境變量已設置為: ${process.env.PORT}`);
console.log('請重新啟動服務器以使用新端口');

// 寫入到 .env 文件或其他配置的方法在此省略
// 因為這只是臨時解決方案，我們直接在啟動腳本中設置環境變量 