/**
 * 應用程式配置設定
 */

const appConfig = {
  // 服務器配置
  server: {
    port: process.env.PORT || 7070,
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // 數據庫配置
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // CORS配置
  cors: {
    allowedOrigins: [
      'https://ailaborlawbackv1.vercel.app',
      'https://ailaborlaw.vercel.app',
      'http://localhost:3000',
      'http://localhost:7070'
    ]
  },

  // 日誌配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5
  }
};

module.exports = appConfig;
