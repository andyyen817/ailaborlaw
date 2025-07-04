const express = require('express');
const authController = require('../controllers/auth.controller.js');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration and login
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "張三"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "zhangsan@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "password123"
 *               profile:
 *                 type: object
 *                 properties:
 *                   industry:
 *                     type: string
 *                     example: "tech"
 *                   position:
 *                     type: string
 *                     example: "employee"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 */
// 簡化的路由，移除複雜驗證中間件
// 路由: POST /api/v1/auth/register
router.post('/register', authController.registerUser);

/**
 * @swagger
 * /auth/register/with-invite:
 *   post:
 *     summary: Register a new user with invite code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *               - email
 *               - password
 *               - username
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 example: "INV001"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "password123"
 *               username:
 *                 type: string
 *                 example: "testuser"
 *     responses:
 *       201:
 *         description: User registered successfully with invite code
 *       400:
 *         description: Invalid input or invite code
 *       409:
 *         description: Email already exists
 */
// 路由: POST /api/v1/auth/register/with-invite
router.post('/register/with-invite', authController.registerWithInvite);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "zhangsan@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication failed (e.g., incorrect email/password, account inactive)
 */
// 路由: POST /api/v1/auth/login
router.post('/login', authController.loginUser);

/**
 * @swagger
 * /auth/send-email-verification:
 *   post:
 *     summary: Send email verification code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               type:
 *                 type: string
 *                 enum: [registration, password_reset]
 *                 default: registration
 *                 example: "registration"
 *               language:
 *                 type: string
 *                 enum: [zh-TW, zh-CN, en]
 *                 default: zh-TW
 *                 example: "zh-TW"
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       409:
 *         description: Email already verified
 *       429:
 *         description: Rate limit exceeded
 */
// 路由: POST /api/v1/auth/send-email-verification
router.post('/send-email-verification', authController.sendEmailVerification);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email with verification code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - verificationCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               verificationCode:
 *                 type: string
 *                 pattern: '^\\d{6}$'
 *                 example: "123456"
 *               type:
 *                 type: string
 *                 enum: [registration, password_reset]
 *                 default: registration
 *                 example: "registration"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid verification code
 *       410:
 *         description: Verification code expired
 */
// 路由: POST /api/v1/auth/verify-email
router.post('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend email verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               type:
 *                 type: string
 *                 enum: [registration, password_reset]
 *                 default: registration
 *                 example: "registration"
 *     responses:
 *       200:
 *         description: Verification email resent successfully
 *       409:
 *         description: Email already verified
 *       429:
 *         description: Rate limit exceeded
 */
// 路由: POST /api/v1/auth/resend-verification
router.post('/resend-verification', authController.resendVerification);

/**
 * @swagger
 * /auth/email-verification-status:
 *   get:
 *     summary: Check email verification status
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         example: "user@example.com"
 *     responses:
 *       200:
 *         description: Email verification status retrieved
 *       404:
 *         description: User not found
 */
// 路由: GET /api/v1/auth/email-verification-status
router.get('/email-status', authController.getEmailVerificationStatus);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset verification code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       404:
 *         description: Email not found
 *       429:
 *         description: Rate limit exceeded
 */
// 路由: POST /api/v1/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with verification code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - verificationCode
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               verificationCode:
 *                 type: string
 *                 pattern: '^\\d{6}$'
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "NewPassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid verification code
 *       410:
 *         description: Verification code expired
 */
// 路由: POST /api/v1/auth/reset-password
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /auth/verify-and-register:
 *   post:
 *     summary: ⭐ One-step email verification and user registration
 *     description: 一步式郵箱驗證並註冊用戶，支持前端單頁面註冊流程
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - verificationCode
 *               - userData
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               verificationCode:
 *                 type: string
 *                 pattern: '^\\d{6}$'
 *                 example: "123456"
 *               userData:
 *                 type: object
 *                 required:
 *                   - name
 *                   - password
 *                 properties:
 *                   name:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 50
 *                     example: "張三"
 *                   password:
 *                     type: string
 *                     minLength: 8
 *                     pattern: '^(?=.*[a-zA-Z])(?=.*\\d).{8,}$'
 *                     example: "Password123"
 *                   industry:
 *                     type: string
 *                     maxLength: 100
 *                     example: "資訊科技"
 *                   position:
 *                     type: string
 *                     maxLength: 100
 *                     example: "軟體工程師"
 *                   inviteCode:
 *                     type: string
 *                     pattern: '^[A-Z0-9]{8}$'
 *                     example: "ABC12345"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid verification code or user data
 *       409:
 *         description: Email already registered
 */
// 路由: POST /api/v1/auth/verify-and-register ⭐ 新增一步式註冊API
router.post('/verify-and-register', authController.verifyAndRegister);

/**
 * @swagger
 * /auth/verify-invite-registration:
 *   post:
 *     summary: Verify invite registration with email and invite code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - verificationCode
 *               - inviteCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "invited@example.com"
 *               verificationCode:
 *                 type: string
 *                 pattern: '^\\d{6}$'
 *                 example: "123456"
 *               inviteCode:
 *                 type: string
 *                 pattern: '^[A-Z0-9]{8}$'
 *                 example: "ABC12345"
 *     responses:
 *       200:
 *         description: Invite registration verified successfully
 *       400:
 *         description: Invalid verification code or invite code
 *       410:
 *         description: Verification code expired
 */
// 路由: POST /api/v1/auth/verify-invite-registration
router.post('/verify-invite-registration', authController.verifyInviteRegistration);

module.exports = router;

// Swagger/OpenAPI 组件定义 (通常放在主 app.js 或 swagger配置文件中, 这里为了方便查看)
/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "操作成功"
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: "jwt.token.string"
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "mongodb_object_id"
 *                 name:
 *                   type: string
 *                   example: "張三"
 *                 email:
 *                   type: string
 *                   example: "zhangsan@example.com"
 *                 userType:
 *                   type: string
 *                   example: "employee"
 *                 status:
 *                   type: string
 *                   example: "pending" # For registration response
 *                 remainingQueries:
 *                   type: number
 *                   example: 10 # For registration response
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
