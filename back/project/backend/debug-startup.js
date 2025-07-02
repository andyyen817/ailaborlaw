import express from 'express';
import dotenv from 'dotenv';

console.log('🔍 DEBUG: 开始启动诊断...');

// 加载环境变量
console.log('🔍 DEBUG: 加载环境变量...');
dotenv.config();

console.log('🔍 DEBUG: 环境变量加载完成');
console.log('🔍 DEBUG: PORT =', process.env.PORT || '未设置');
console.log('🔍 DEBUG: NODE_ENV =', process.env.NODE_ENV || '未设置');

const app = express();
const PORT = process.env.PORT || 7070;

console.log('🔍 DEBUG: 创建Express应用成功');

// 基础中间件
app.use(express.json());
console.log('🔍 DEBUG: 中间件配置完成');

// 测试路由
app.get('/', (req, res) => {
  console.log('🔍 DEBUG: 收到根路径请求');
  res.json({
    message: '诊断服务器运行中',
    status: 'ok',
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
});

app.get('/health', (req, res) => {
  console.log('🔍 DEBUG: 收到健康检查请求');
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

console.log('🔍 DEBUG: 路由配置完成');

// 启动服务器
console.log('🔍 DEBUG: 开始启动服务器...');

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ DEBUG: 服务器启动回调执行!');
  console.log(`✅ DEBUG: 服务器在端口 ${PORT} 上运行 (所有接口)`);
  console.log(`🌐 DEBUG: 访问地址: http://localhost:${PORT}`);
  console.log(`🔍 DEBUG: 进程PID: ${process.pid}`);
  
  // 验证服务器确实在监听
  const address = server.address();
  console.log('🔍 DEBUG: 服务器地址信息:', address);
});

// 详细的错误处理
server.on('error', (err) => {
  console.error('❌ DEBUG: 服务器错误:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ DEBUG: 端口 ${PORT} 已被占用!`);
  }
});

server.on('listening', () => {
  console.log('🎉 DEBUG: 服务器正在监听事件触发!');
  const addr = server.address();
  console.log('🎉 DEBUG: 监听地址:', addr);
});

// 进程错误处理
process.on('uncaughtException', (err) => {
  console.error('❌ DEBUG: 未捕获的异常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ DEBUG: 未处理的Promise拒绝:', reason);
  console.error('❌ DEBUG: Promise:', promise);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n📴 DEBUG: 收到SIGINT信号，正在关闭服务器...');
  server.close(() => {
    console.log('✅ DEBUG: 服务器已关闭');
    process.exit(0);
  });
});

console.log('🔍 DEBUG: 所有配置完成，等待服务器启动...'); 