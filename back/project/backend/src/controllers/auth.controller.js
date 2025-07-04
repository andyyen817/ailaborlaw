const User = require('../models/user.model.js');
const EmailLog = require('../models/email_log.model.js');
const EmailVerification = require('../models/email_verification.model.js');
const EmailService = require('../services/email.service.js');
const { generateAccessToken } = require('../utils/jwt.js');
const logger = require('../utils/logger.js');
// 假设会有 express-validator 的结果处理函数
// const { validationResult } = require('express-validator');

/**
 * 用戶註冊
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const registerUser = async (req, res) => {
  // 注意：輸入驗證現在由 express-validator 中間件處理

  const { 
    name,                 // 暱稱
    email,                // 電子郵箱
    password,             // 密碼
    userType,             // 用戶類型
    industry,             // 行業
    position,             // 職位/職業 (新字段)
    occupation,           // 職位/職業 (舊字段，向後兼容)
    inviteCode,           // 邀請碼
    profile,              // 完整的用戶檔案對象
    companyName           // 公司名稱
  } = req.body;

  try {
    // 1. 檢查郵箱是否已存在
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ // 409 Conflict
        success: false,
        message: '此電子郵箱已被註冊',
        error: { code: 'EMAIL_ALREADY_EXISTS', details: `Email ${email} is already registered.` }
      });
    }

    // 2. 創建新用戶 (密碼哈希將在 User Model 的 pre-save hook 中自動完成)
    // 處理用戶類型和基本資料
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      userType: userType || 'employee',
      status: 'active', // 此處根據需求設置為 active 而非 pending
    };

    // 處理可選字段
    if (profile) {
      userData.profile = profile;
    } else {
      // 如果沒有提供完整profile對象，創建一個
      userData.profile = {};
      // 處理行業字段
      if (industry) userData.profile.industry = industry;
      
      // 處理職位/職業字段（支持向後兼容）
      const finalPosition = position || occupation; // 優先使用 position，fallback 到 occupation
      if (finalPosition) userData.profile.position = finalPosition;
    }

    // 處理其他可選字段
    if (companyName) userData.companyName = companyName;
    if (inviteCode) userData.inviteCode = inviteCode;

    const newUser = new User(userData);
    await newUser.save();

    // 3. 生成 JWT
    const tokenPayload = {
      userId: newUser._id.toString(),
      userType: newUser.userType
    };
    const token = generateAccessToken(tokenPayload);

    if (!token) {
      logger.error(`JWT 生成失敗，用戶: ${newUser._id}`);
      return res.status(500).json({
        success: false,
        message: '用戶註冊成功，但登入憑證生成失敗，請稍後嘗試登入',
        error: { code: 'TOKEN_GENERATION_FAILED' }
      });
    }

    // 4. 準備響應數據 (不包含密碼等敏感信息)
    const userResponse = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      userType: newUser.userType,
      status: newUser.status,
      remainingQueries: newUser.remainingQueries,
      // 統一字段命名，將嵌套的profile字段映射到根級字段
      industry: newUser.profile?.industry || '',
      position: newUser.profile?.position || '',
      phoneNumber: newUser.profile?.phone || '',
      companyName: newUser.profile?.company || '',
      // 保留原有字段以向後兼容
      inviteCode: newUser.inviteCode,
      totalConsultations: newUser.totalConsultations || 0
    };

    return res.status(201).json({ // 201 Created
      success: true,
      message: '用戶註冊成功',
      data: {
        token,
        user: userResponse
      }
    });

  } catch (error) {
    logger.error(`用戶註冊錯誤: ${error.message}`, { email, name, stack: error.stack });
    // 檢查是否是 Mongoose 驗證錯誤
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: '用戶註冊資訊驗證失敗',
        error: { code: 'VALIDATION_ERROR', details: error.errors }
      });
    }
    return res.status(500).json({
      success: false,
      message: '伺服器在處理用戶註冊時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 忘記密碼 - 發送重置驗證碼
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 調用發送驗證碼邏輯，類型為 password_reset
    req.body = { email, type: 'password_reset' };
    return await sendEmailVerification(req, res);

  } catch (error) {
    logger.error(`忘記密碼錯誤: ${error.message}`, { email, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在處理忘記密碼請求時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 重置密碼
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const resetPassword = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  try {
    // 1. 查找用戶
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    // 2. 檢查重置驗證碼
    if (!user.passwordResetCode) {
      return res.status(400).json({
        success: false,
        message: '未找到有效的重置驗證碼，請先申請密碼重置',
        error: { code: 'NO_RESET_CODE' }
      });
    }

    if (new Date() > user.passwordResetExpires) {
      return res.status(410).json({
        success: false,
        message: '重置驗證碼已過期，請重新申請',
        error: { code: 'RESET_CODE_EXPIRED' }
      });
    }

    // 3. 驗證重置驗證碼
    const isValid = await EmailService.verifyCode(verificationCode, user.passwordResetCode);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: '重置驗證碼錯誤',
        error: { code: 'INVALID_RESET_CODE' }
      });
    }

    // 4. 更新密碼和清除重置驗證碼
    user.password = newPassword; // 密碼會在 pre-save hook 中自動哈希
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    user.passwordChangedAt = new Date();
    await user.save();

    // 5. 更新郵件日志狀態
    try {
      const emailLog = await EmailLog.findOne({
        userId: user._id,
        type: 'password_reset',
        status: 'sent'
      }).sort({ sentAt: -1 });
      
      if (emailLog) {
        await emailLog.markAsVerified();
      }
    } catch (logError) {
      logger.error(`更新郵件日志失敗: ${logError.message}`);
    }

    return res.status(200).json({
      success: true,
      message: '密碼重置成功',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          passwordChangedAt: user.passwordChangedAt
        }
      }
    });

  } catch (error) {
    logger.error(`重置密碼錯誤: ${error.message}`, { email, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在處理密碼重置時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 用戶登入
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const loginUser = async (req, res) => {
  // 注意：輸入驗證現在由 express-validator 中間件處理

  const { email, password } = req.body;

  try {
    // 1. 通過 email 查找用戶
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ // 401 Unauthorized
        success: false,
        message: '認證失敗：郵箱或密碼錯誤', // 通用錯誤資訊，避免洩露用戶是否存在
        error: { code: 'INVALID_CREDENTIALS', details: 'Incorrect email or password.' }
      });
    }

    // 2. 比較提交的密碼與資料庫中存儲的哈希密碼
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '認證失敗：郵箱或密碼錯誤',
        error: { code: 'INVALID_CREDENTIALS', details: 'Incorrect email or password.' }
      });
    }

    // 3. 檢查用戶狀態
    if (user.status === 'pending') {
      return res.status(401).json({
        success: false,
        message: '賬戶尚待啟動/驗證，請檢查您的郵箱或聯絡管理員',
        error: { code: 'ACCOUNT_PENDING_VERIFICATION', details: 'Account is pending verification.' }
      });
    }
    if (user.status === 'disabled') {
      return res.status(401).json({
        success: false,
        message: '您的賬戶已被禁用，請聯絡管理員',
        error: { code: 'ACCOUNT_DISABLED', details: 'Account has been disabled.' }
      });
    }
    if (user.status === 'deleted') {
      return res.status(401).json({
        success: false,
        message: '您的賬戶已被刪除，請聯絡管理員',
        error: { code: 'ACCOUNT_DELETED', details: 'Account has been deleted.' }
      });
    }
    if (user.status !== 'active') { // 其他非 active 狀態
        return res.status(401).json({
            success: false,
            message: `賬戶狀態異常 (${user.status})，無法登入`,
            error: { code: 'ACCOUNT_STATUS_NOT_ACTIVE', details: `Account status is '${user.status}'.`}
        });
    }

    // 4. 更新用戶的 lastLogin 字段
    user.lastLogin = new Date();
    await user.save();

    // 5. 生成 JWT
    const tokenPayload = {
      userId: user._id.toString(),
      userType: user.userType
    };
    const token = generateAccessToken(tokenPayload);

    if (!token) {
      logger.error(`JWT 生成失敗，用戶登入: ${user._id}`);
      return res.status(500).json({
        success: false,
        message: '登入成功，但授權憑證生成失敗，請重試',
        error: { code: 'TOKEN_GENERATION_FAILED' }
      });
    }
    
    // 6. 準備響應數據，統一字段命名
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      userType: user.userType,
      status: user.status,
      remainingQueries: user.remainingQueries,
      totalConsultations: user.totalConsultations || 0,
      // 統一字段命名，將嵌套的profile字段映射到根級字段
      industry: user.profile?.industry || '',
      position: user.profile?.position || '',
      phoneNumber: user.profile?.phone || '',
      companyName: user.profile?.company || '',
      // 保留原有字段
      inviteCode: user.inviteCode
    };

    return res.status(200).json({
      success: true,
      message: '登入成功',
      data: {
        token,
        user: userResponse
      }
    });

  } catch (error) {
    logger.error(`用戶登入錯誤: ${error.message}`, { email, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在處理登入請求時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 發送郵箱驗證碼 (修改版 - 支持一步式註冊)
 * ⚠️ 重要：此API只發送驗證碼，不創建用戶！
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const sendEmailVerification = async (req, res) => {
  const { email, type = 'registration', language = 'zh-TW' } = req.body;

  try {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // 1. 檢查郵箱是否已註冊且已驗證（只針對已驗證的用戶）
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (type === 'registration') {
      // ⚠️ 重要：只阻止已驗證的郵箱，允許已註冊但未驗證的郵箱重新發送
      if (existingUser && existingUser.emailVerified) {
        return res.status(409).json({
          success: false,
          message: '此郵箱已註冊且已驗證',
          error: { code: 'EMAIL_ALREADY_VERIFIED' }
        });
      }
      // 📝 新邏輯：即使用戶已存在（但未驗證），也只存驗證碼，不修改用戶
    } else if (type === 'password_reset') {
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: '該郵箱尚未註冊',
          error: { code: 'EMAIL_NOT_FOUND' }
        });
      }
    }

    // 2. 檢查發送頻率限制（使用新的EmailVerification模型）
    const limitCheck = await EmailVerification.checkSendingLimits(email.toLowerCase(), clientIP, type);
    if (!limitCheck.canSend) {
      return res.status(429).json({
        success: false,
        message: limitCheck.limits.email.recentCount > 0 
          ? '發送頻率過快，請稍後再試' 
          : '24小時內發送次數已達上限',
        error: { 
          code: limitCheck.limits.email.recentCount > 0 ? 'RATE_LIMIT_EXCEEDED' : 'DAILY_LIMIT_EXCEEDED',
          nextSendTime: limitCheck.nextSendTime,
          limits: limitCheck.limits
        }
      });
    }

    // 3. 生成驗證碼
    const verificationCode = EmailService.generateVerificationCode();
    const hashedCode = await EmailService.hashVerificationCode(verificationCode);

    // 4. 保存驗證碼到獨立表（而不是用戶表）
    if (type === 'registration') {
      await EmailVerification.createVerification(
        email.toLowerCase(),
        hashedCode,
        type,
        clientIP
      );
    } else if (type === 'password_reset') {
      // 密碼重置還是需要更新用戶記錄（為了兼容性）
      const user = existingUser;
      user.passwordResetCode = hashedCode;
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      user.lastEmailSentAt = new Date();
      await user.save();
    }

    // 5. 發送郵件
    let emailResult;
    if (type === 'registration') {
      // 註冊郵件不需要userId，使用臨時名稱
      emailResult = await EmailService.sendRegistrationEmailWithoutUser(
        email.toLowerCase(), 
        email.split('@')[0], // 臨時名稱
        verificationCode
      );
    } else if (type === 'password_reset') {
      emailResult = await EmailService.sendPasswordResetEmail(
        email.toLowerCase(), 
        existingUser.name, 
        verificationCode, 
        existingUser._id
      );
    }

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: emailResult.message || '郵件發送失敗',
        error: { code: 'EMAIL_SEND_FAILED' }
      });
    }

    // 6. 成功響應
    return res.status(200).json({
      success: true,
      message: type === 'registration' ? '驗證郵件已發送' : '密碼重置郵件已發送',
      data: {
        email: email.toLowerCase(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15分鐘後過期
        nextSendTime: new Date(Date.now() + 60 * 1000) // 60秒後可重發
      }
    });

  } catch (error) {
    logger.error(`發送郵箱驗證碼錯誤: ${error.message}`, { email, type, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在處理郵件發送時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 驗證郵箱驗證碼
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const verifyEmail = async (req, res) => {
  const { email, verificationCode, type = 'registration' } = req.body;

  try {
    // 1. 查找用戶
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    // 2. 檢查驗證碼和過期時間
    let storedHashedCode, expiresAt;
    if (type === 'registration') {
      storedHashedCode = user.emailVerificationCode;
      expiresAt = user.emailVerificationExpires;
      
      if (user.emailVerified) {
        return res.status(409).json({
          success: false,
          message: '郵箱已驗證，無需重複驗證',
          error: { code: 'EMAIL_ALREADY_VERIFIED' }
        });
      }
    } else if (type === 'password_reset') {
      storedHashedCode = user.passwordResetCode;
      expiresAt = user.passwordResetExpires;
    }

    if (!storedHashedCode) {
      return res.status(400).json({
        success: false,
        message: '未找到有效的驗證碼，請先申請發送',
        error: { code: 'NO_VERIFICATION_CODE' }
      });
    }

    if (new Date() > expiresAt) {
      return res.status(410).json({
        success: false,
        message: '驗證碼已過期，請重新申請',
        error: { code: 'VERIFICATION_CODE_EXPIRED' }
      });
    }

    // 3. 驗證驗證碼
    const isValid = await EmailService.verifyCode(verificationCode, storedHashedCode);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: '驗證碼錯誤',
        error: { code: 'INVALID_VERIFICATION_CODE' }
      });
    }

    // 4. 更新用戶狀態
    if (type === 'registration') {
      user.emailVerified = true;
      user.status = 'active';
      user.emailVerificationCode = null;
      user.emailVerificationExpires = null;
      
      // 如果是邀請註冊，處理邀請獎勵
      if (user.inviteCode) {
        const inviter = await User.findByInviteCode(user.inviteCode);
        if (inviter) {
          inviter.invitedCount += 1;
          inviter.remainingQueries += 10; // 邀請人獎勵10次諮詢
          await inviter.save();
          
          user.remainingQueries += 10; // 被邀請人也獲得10次諮詢
          user.invitedBy = inviter._id;
          
          // 發送邀請確認郵件
          try {
            await EmailService.sendInviteConfirmationEmail(
              user.email,
              user.name,
              inviter.name,
              10,
              user._id
            );
          } catch (emailError) {
            logger.error(`發送邀請確認郵件失敗: ${emailError.message}`);
          }
        }
      }
    } else if (type === 'password_reset') {
      // 密碼重置驗證只是確認驗證碼有效，不清除驗證碼
      // 驗證碼會在重置密碼時清除
    }

    await user.save();

    // 5. 更新郵件日志狀態
    try {
      const emailLog = await EmailLog.findOne({
        userId: user._id,
        type,
        status: 'sent'
      }).sort({ sentAt: -1 });
      
      if (emailLog) {
        await emailLog.markAsVerified();
      }
    } catch (logError) {
      logger.error(`更新郵件日志失敗: ${logError.message}`);
    }

    // 6. 成功響應
    const responseData = {
      user: {
        id: user._id.toString(),
        email: user.email,
        emailVerified: user.emailVerified,
        status: user.status
      }
    };

    if (type === 'registration') {
      responseData.user.remainingQueries = user.remainingQueries;
    }

    return res.status(200).json({
      success: true,
      message: type === 'registration' ? '郵箱驗證成功' : '驗證碼驗證成功',
      data: responseData
    });

  } catch (error) {
    logger.error(`郵箱驗證錯誤: ${error.message}`, { email, type, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在處理郵箱驗證時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 重新發送驗證郵件
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const resendVerification = async (req, res) => {
  const { email, type = 'registration' } = req.body;

  try {
    // 1. 查找用戶
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    // 2. 檢查是否需要重發
    if (type === 'registration' && user.emailVerified) {
      return res.status(409).json({
        success: false,
        message: '郵箱已驗證，無需重新發送',
        error: { code: 'EMAIL_ALREADY_VERIFIED' }
      });
    }

    // 3. 調用發送驗證碼邏輯
    req.body = { email, type };
    return await sendEmailVerification(req, res);

  } catch (error) {
    logger.error(`重新發送驗證郵件錯誤: ${error.message}`, { email, type, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在處理重發請求時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 檢查郵箱驗證狀態
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const getEmailVerificationStatus = async (req, res) => {
  const { email } = req.query;

  try {
    // 1. 查找用戶
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    // 2. 檢查發送限制
    const limitCheck = await EmailService.checkSendingLimits(user._id, 'registration');

    // 3. 構建響應數據
    const responseData = {
      email: user.email,
      isVerified: user.emailVerified,
      verificationSent: !!user.emailVerificationSentAt,
      sentAt: user.emailVerificationSentAt,
      canResend: limitCheck.canSend,
      nextResendTime: limitCheck.nextSendTime,
      sentCount: user.emailVerificationSentCount || 0,
      limits: {
        recentCount: limitCheck.recentCount,
        hourlyCount: limitCheck.hourlyCount,
        dailyCount: limitCheck.dailyCount
      }
    };

    return res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    logger.error(`檢查郵箱驗證狀態錯誤: ${error.message}`, { email, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在檢查驗證狀態時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * ⭐ 一步式驗證並註冊 (修復版本 - 延遲標記策略)
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const verifyAndRegister = async (req, res) => {
  const { email, verificationCode, userData } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

  // 添加請求開始日誌
  logger.info(`🚀 開始一步式註冊流程`, { 
    email: email?.toLowerCase(), 
    hasInviteCode: !!userData?.inviteCode,
    clientIP
  });

  // 開始數據庫事務
  const session = await User.startSession();
  let verificationRecord = null; // 用於追蹤驗證記錄
  
  try {
    await session.withTransaction(async () => {
      // 1. 驗證驗證碼 (⭐ 使用延遲標記策略)
      logger.info(`📧 開始驗證郵箱驗證碼`, { email: email?.toLowerCase() });
      
      const verificationResult = await EmailVerification.verifyCode(
        email.toLowerCase(), 
        verificationCode, 
        'registration',
        false // ⭐ 關鍵修改：不立即標記為已使用
      );
      
      if (!verificationResult.valid) {
        logger.warn(`❌ 驗證碼驗證失敗`, { 
          email: email?.toLowerCase(),
          code: verificationResult.code,
          message: verificationResult.message
        });
        
        const error = new Error(verificationResult.message);
        error.code = verificationResult.code;
        throw error;
      }

      // 保存驗證記錄用於後續標記
      verificationRecord = verificationResult.verification;
      logger.info(`✅ 驗證碼驗證成功`, { 
        email: email?.toLowerCase(),
        verificationId: verificationRecord._id
      });

      // 2. 檢查郵箱是否已註冊
      logger.info(`👤 檢查郵箱是否已註冊`, { email: email?.toLowerCase() });
      
      const existingUser = await User.findOne({ email: email.toLowerCase() }).session(session);
      if (existingUser) {
        logger.warn(`⚠️ 郵箱已註冊`, { 
          email: email?.toLowerCase(),
          existingUserId: existingUser._id
        });
        
        const error = new Error('此郵箱已註冊');
        error.code = 'EMAIL_ALREADY_EXISTS';
        throw error;
      }

      // 3. 驗證用戶數據
      logger.info(`📝 驗證用戶數據`, { email: email?.toLowerCase() });
      
      if (!userData.name || !userData.password) {
        logger.warn(`❌ 缺少必要用戶信息`, { 
          email: email?.toLowerCase(),
          hasName: !!userData.name,
          hasPassword: !!userData.password
        });
        
        const error = new Error('缺少必要的用戶信息');
        error.code = 'MISSING_USER_DATA';
        throw error;
      }

      // 驗證密碼強度
      if (userData.password.length < 8 || !/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(userData.password)) {
        logger.warn(`❌ 密碼強度不足`, { 
          email: email?.toLowerCase(),
          passwordLength: userData.password.length
        });
        
        const error = new Error('密碼必須至少8位，包含字母和數字');
        error.code = 'WEAK_PASSWORD';
        throw error;
      }

      // 4. 處理邀請碼（如果有）
      let bonusQueries = 10; // 基礎查詢次數
      let inviterData = null;
      
      if (userData.inviteCode) {
        logger.info(`🎁 處理邀請碼`, { 
          email: email?.toLowerCase(),
          inviteCode: userData.inviteCode
        });
        
        const InviteService = require('../services/invite.service.js');
        const inviteValidation = await InviteService.validateInviteCode(userData.inviteCode);
        
        if (inviteValidation.valid) {
          inviterData = inviteValidation.inviter;
          bonusQueries += 10; // 被邀請人獎勵10次
          
          logger.info(`✅ 邀請碼驗證成功`, { 
            email: email?.toLowerCase(),
            inviterName: inviterData.name,
            bonusQueries
          });
          
          // 給邀請人增加10次查詢
          await User.findByIdAndUpdate(
            inviterData.id,
            { 
              $inc: { 
                remainingQueries: 10,
                invitedCount: 1
              }
            },
            { session }
          );
        } else {
          logger.warn(`⚠️ 邀請碼無效`, { 
            email: email?.toLowerCase(),
            inviteCode: userData.inviteCode,
            reason: inviteValidation.message
          });
        }
      }

      // 5. 創建完整的用戶賬戶
      logger.info(`👥 創建用戶賬戶`, { 
        email: email?.toLowerCase(),
        name: userData.name,
        bonusQueries
      });
      
      const newUser = new User({
        name: userData.name,
        email: email.toLowerCase(),
        password: userData.password, // 直接使用明文密碼，pre-save hook會自動加密
        userType: 'employee',
        status: 'active', // 直接設為active，因為郵箱已驗證
        emailVerified: true,
        remainingQueries: bonusQueries,
        profile: {
          industry: userData.industry || '',
          position: userData.position || ''
        },
        inviteCode: userData.inviteCode || null,
        invitedBy: inviterData?.id || null
      });
      
      await newUser.save({ session });
      
      logger.info(`✅ 用戶創建成功`, { 
        email: email?.toLowerCase(),
        userId: newUser._id,
        remainingQueries: newUser.remainingQueries
      });

      // 6. 記錄邀請關係（如果有）
      if (inviterData) {
        logger.info(`📝 記錄邀請關係`, { 
          email: email?.toLowerCase(),
          inviterId: inviterData.id,
          inviteeId: newUser._id
        });
        
        const InviteRecord = require('../models/invite-record.model.js');
        await InviteRecord.createInviteRecord(
          inviterData.id,
          newUser._id,
          userData.inviteCode,
          10, // inviterBonus
          10, // inviteeBonus
          session
        );
        
        // 發送邀請確認郵件
        try {
          await EmailService.sendInviteConfirmationEmail(
            newUser.email,
            newUser.name,
            inviterData.name,
            10,
            newUser._id
          );
          
          logger.info(`📧 邀請確認郵件發送成功`, { 
            email: email?.toLowerCase(),
            inviterName: inviterData.name
          });
        } catch (emailError) {
          logger.error(`📧 發送邀請確認郵件失敗: ${emailError.message}`, {
            email: email?.toLowerCase(),
            error: emailError.stack
          });
          // 不阻止註冊流程
        }
      }

      // 7. 生成JWT token
      const tokenPayload = {
        userId: newUser._id.toString(),
        userType: newUser.userType
      };
      const token = generateAccessToken(tokenPayload);

      logger.info(`🔐 JWT token生成成功`, { 
        email: email?.toLowerCase(),
        userId: newUser._id
      });

      // 8. 返回成功響應
      return res.status(201).json({
        success: true,
        message: '註冊成功',
        data: {
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            userType: newUser.userType,
            emailVerified: true,
            remainingQueries: bonusQueries,
            status: 'active'
          },
          token,
          inviteInfo: inviterData ? {
            inviterName: inviterData.name,
            bonusReceived: 10
          } : null
        }
      });
    });

    // ⭐ 事務成功後，標記驗證碼為已使用
    if (verificationRecord) {
      const markResult = await EmailVerification.markCodeAsUsed(verificationRecord._id);
      if (markResult) {
        logger.info(`✅ 驗證碼已標記為已使用`, { 
          email: email?.toLowerCase(),
          verificationId: verificationRecord._id
        });
      } else {
        logger.warn(`⚠️ 標記驗證碼為已使用失敗`, { 
          email: email?.toLowerCase(),
          verificationId: verificationRecord._id
        });
      }
    }

    logger.info(`🎉 一步式註冊流程完成`, { 
      email: email?.toLowerCase(),
      clientIP
    });

  } catch (error) {
    // ⭐ 事務失敗後，釋放驗證碼臨時鎖定
    if (verificationRecord) {
      const releaseResult = await EmailVerification.releaseTempLock(verificationRecord._id);
      if (releaseResult) {
        logger.info(`🔓 驗證碼臨時鎖定已釋放`, { 
          email: email?.toLowerCase(),
          verificationId: verificationRecord._id
        });
      } else {
        logger.warn(`⚠️ 釋放驗證碼臨時鎖定失敗`, { 
          email: email?.toLowerCase(),
          verificationId: verificationRecord._id
        });
      }
    }

    logger.error(`❌ 一步式註冊錯誤: ${error.message}`, { 
      email: email?.toLowerCase(),
      errorCode: error.code,
      clientIP,
      error: error.stack 
    });
    
    // 根據錯誤類型返回適當的HTTP狀態碼
    let statusCode = 500;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    
    switch (error.code) {
      case 'VERIFICATION_CODE_NOT_FOUND':
      case 'INVALID_VERIFICATION_CODE':
      case 'VERIFICATION_CODE_TEMPORARILY_LOCKED':
        statusCode = 400;
        errorCode = error.code;
        break;
      case 'EMAIL_ALREADY_EXISTS':
        statusCode = 409;
        errorCode = error.code;
        break;
      case 'MISSING_USER_DATA':
      case 'WEAK_PASSWORD':
        statusCode = 400;
        errorCode = error.code;
        break;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message,
      error: { 
        code: errorCode,
        details: error.message 
      }
    });
  } finally {
    await session.endSession();
  }
};

/**
 * 邀請註冊郵箱驗證
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const verifyInviteRegistration = async (req, res) => {
  const { email, verificationCode, inviteCode } = req.body;

  try {
    // 1. 先驗證邀請碼
    const InviteService = require('../services/invite.service.js');
    const inviteValidation = await InviteService.validateInviteCode(inviteCode);
    
    if (!inviteValidation.valid) {
      return res.status(400).json({
        success: false,
        message: inviteValidation.message,
        error: { code: 'INVALID_INVITE_CODE' }
      });
    }

    // 2. 驗證郵箱驗證碼
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    if (user.emailVerified) {
      return res.status(409).json({
        success: false,
        message: '郵箱已驗證，無需重複驗證',
        error: { code: 'EMAIL_ALREADY_VERIFIED' }
      });
    }

    if (!user.emailVerificationCode) {
      return res.status(400).json({
        success: false,
        message: '未找到有效的驗證碼，請先申請發送',
        error: { code: 'NO_VERIFICATION_CODE' }
      });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(410).json({
        success: false,
        message: '驗證碼已過期，請重新申請',
        error: { code: 'VERIFICATION_CODE_EXPIRED' }
      });
    }

    // 3. 驗證驗證碼
    const isValid = await EmailService.verifyCode(verificationCode, user.emailVerificationCode);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: '驗證碼錯誤',
        error: { code: 'INVALID_VERIFICATION_CODE' }
      });
    }

    // 4. 更新用戶狀態並處理邀請
    user.emailVerified = true;
    user.status = 'active';
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    
    // 設置邀請關係
    user.inviteCode = inviteCode.toUpperCase();
    
    await user.save();

    // 5. 處理邀請註冊邏輯
    let inviteResult = null;
    try {
      inviteResult = await InviteService.processInviteRegistration(user._id, inviteCode);
      
      if (inviteResult.success) {
        // 發送邀請確認郵件給被邀請人
        await EmailService.sendInviteConfirmationEmail(
          user.email,
          user.name,
          inviteValidation.inviter.name,
          inviteResult.data.inviteeBonus,
          user._id
        );
        
        // 更新用戶的邀請相關信息
        user.invitedBy = inviteValidation.inviter.id;
        user.remainingQueries = inviteResult.data.inviteeRemainingQueries;
        
        logger.info(`邀請註冊成功: ${user.email} 由 ${inviteValidation.inviter.name} 邀請，獎勵已發放`);
      } else {
        logger.warn(`邀請處理未成功: ${inviteResult.message}`, { userId: user._id, inviteCode });
      }
    } catch (inviteError) {
      logger.error(`邀請處理失敗: ${inviteError.message}`, { 
        userId: user._id, 
        inviteCode, 
        stack: inviteError.stack 
      });
      // 郵箱驗證成功但邀請處理失敗，需要標記狀態
      inviteResult = { 
        success: false, 
        error: inviteError.message,
        needsManualReview: true 
      };
    }

    // 6. 更新郵件日志狀態
    try {
      const emailLog = await EmailLog.findOne({
        userId: user._id,
        type: 'registration',
        status: 'sent'
      }).sort({ sentAt: -1 });
      
      if (emailLog) {
        await emailLog.markAsVerified();
      }
    } catch (logError) {
      logger.error(`更新郵件日志失敗: ${logError.message}`);
    }

    return res.status(200).json({
      success: true,
      message: '邀請註冊驗證成功',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          emailVerified: user.emailVerified,
          status: user.status,
          remainingQueries: user.remainingQueries,
          inviteCode: user.inviteCode,
          invitedBy: user.invitedBy
        },
        inviter: inviteValidation.inviter,
        inviteProcessing: {
          success: inviteResult?.success || false,
          bonusAwarded: inviteResult?.success ? inviteResult.data?.inviteeBonus : 0,
          error: inviteResult?.error || null,
          needsManualReview: inviteResult?.needsManualReview || false
        }
      }
    });

  } catch (error) {
    logger.error(`邀請註冊驗證錯誤: ${error.message}`, { email, inviteCode, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在處理邀請註冊驗證時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 使用邀請碼註冊用戶
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
const registerWithInvite = async (req, res) => {
  const { inviteCode, email, password, username } = req.body;

  try {
    // 1. 驗證必需字段
    if (!inviteCode || !email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: '缺少必需字段：邀請碼、郵箱、密碼和用戶名都是必需的',
        error: { code: 'MISSING_REQUIRED_FIELDS' }
      });
    }

    // 2. 驗證邀請碼
    const InviteService = require('../services/invite.service.js');
    const inviteValidation = await InviteService.validateInviteCode(inviteCode);
    
    if (!inviteValidation.valid) {
      return res.status(400).json({
        success: false,
        message: inviteValidation.message,
        error: { code: 'INVALID_INVITE_CODE' }
      });
    }

    // 3. 檢查郵箱是否已存在
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '此電子郵箱已被註冊',
        error: { code: 'EMAIL_ALREADY_EXISTS' }
      });
    }

    // 4. 創建新用戶
    const userData = {
      name: username,
      email: email.toLowerCase(),
      password,
      userType: 'employee',
      status: 'active',
      emailVerified: true, // 通過邀請碼註冊的用戶直接設為已驗證
      inviteCode: inviteCode.toUpperCase(),
      invitedBy: inviteValidation.inviter.id,
      profile: {
        position: 'employee'
      }
    };

    const newUser = new User(userData);
    await newUser.save();

    // 5. 處理邀請註冊邏輯
    let inviteResult = null;
    try {
      inviteResult = await InviteService.processInviteRegistration(newUser._id, inviteCode);
      
      if (inviteResult.success) {
        // 更新用戶的邀請相關信息
        newUser.remainingQueries = inviteResult.data.inviteeRemainingQueries;
        await newUser.save();
        
        // 發送邀請確認郵件給被邀請人
        await EmailService.sendInviteConfirmationEmail(
          newUser.email,
          newUser.name,
          inviteValidation.inviter.name,
          inviteResult.data.inviteeBonus,
          newUser._id
        );
        
        logger.info(`邀請註冊成功: ${newUser.email} 由 ${inviteValidation.inviter.name} 邀請，獎勵已發放`);
      } else {
        logger.warn(`邀請處理未成功: ${inviteResult.message}`, { userId: newUser._id, inviteCode });
      }
    } catch (inviteError) {
      logger.error(`邀請處理失敗: ${inviteError.message}`, { 
        userId: newUser._id, 
        inviteCode, 
        stack: inviteError.stack 
      });
      inviteResult = { 
        success: false, 
        error: inviteError.message,
        needsManualReview: true 
      };
    }

    // 6. 生成 JWT
    const tokenPayload = {
      userId: newUser._id.toString(),
      userType: newUser.userType
    };
    const token = generateAccessToken(tokenPayload);

    if (!token) {
      logger.error(`JWT 生成失敗，用戶: ${newUser._id}`);
      return res.status(500).json({
        success: false,
        message: '用戶註冊成功，但登入憑證生成失敗，請稍後嘗試登入',
        error: { code: 'TOKEN_GENERATION_FAILED' }
      });
    }

    // 7. 準備響應數據
    const userResponse = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      userType: newUser.userType,
      status: newUser.status,
      remainingQueries: newUser.remainingQueries,
      inviteCode: newUser.inviteCode,
      invitedBy: newUser.invitedBy,
      totalConsultations: newUser.totalConsultations || 0
    };

    return res.status(201).json({
      success: true,
      message: '邀請註冊成功',
      data: {
        token,
        user: userResponse,
        inviter: inviteValidation.inviter,
        inviteProcessing: {
          success: inviteResult?.success || false,
          bonusAwarded: inviteResult?.success ? inviteResult.data?.inviteeBonus : 0,
          error: inviteResult?.error || null,
          needsManualReview: inviteResult?.needsManualReview || false
        }
      }
    });

  } catch (error) {
    logger.error(`邀請註冊錯誤: ${error.message}`, { email, inviteCode, stack: error.stack });
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: '用戶註冊資訊驗證失敗',
        error: { code: 'VALIDATION_ERROR', details: error.errors }
      });
    }
    return res.status(500).json({
      success: false,
      message: '伺服器在處理邀請註冊時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

module.exports = {
  registerUser,
  forgotPassword,
  resetPassword,
  loginUser,
  sendEmailVerification,
  verifyEmail,
  resendVerification,
  getEmailVerificationStatus,
  verifyAndRegister,
  verifyInviteRegistration,
  registerWithInvite
};
