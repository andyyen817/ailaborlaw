/**
 * 应用程序配置
 */
const appConfig = {
  // 服务器配置
  port: process.env.PORT || 7070,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  // N8N配置
  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL
  },
  
  // 跨域配置
  cors: {
    // 明確指定允許的來源，包括前端的內網和外網地址
    origin: [
      'http://userai-laborlaw.ns-2rlrcc3k.svc.cluster.local:3000',
      'http://localhost:3000', // 本地開發環境
      process.env.CORS_ORIGIN || '*' // 保留環境變量中的配置或默認允許所有
    ],
    credentials: true
  },
  
  // 分页配置
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },
  
  // 上传文件配置
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
};

export default appConfig;
