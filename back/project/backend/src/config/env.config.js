/**
 * 環境配置文件
 */

// 開發環境配置
const development = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/aialabr?directConnection=true&authSource=admin',
  jwtSecret: process.env.JWT_SECRET || 'your-development-jwt-secret-key-2024',
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

// 如果沒有設置 MONGODB_URI 環境變量，使用默認值（修正後的配置）
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/aialabr?directConnection=true&authSource=admin';
}

// 如果沒有設置 JWT_SECRET 環境變量，使用默認值
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-development-jwt-secret-key-2024';
}

// 生產環境配置
const production = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

// 測試環境配置
const test = {
  port: process.env.PORT || 3001,
  mongodbUri: process.env.MONGODB_URI_TEST || 'mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/aialabr_test?directConnection=true&authSource=admin',
  jwtSecret: process.env.JWT_SECRET || 'your-test-jwt-secret-key-2024',
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

const config = {
  development,
  production,
  test
};

const env = process.env.NODE_ENV || 'development';

module.exports = config[env]; 