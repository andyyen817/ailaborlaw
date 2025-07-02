import Admin from '../../models/admin.model.js';
import logger from '../../utils/logger.js';

/**
 * 管理员账户管理控制器
 * 用于创建和管理超级管理员和运营管理员账户
 */

/**
 * 创建管理员账户
 * @route POST /api/v1/admin/managers
 * @access 仅超级管理员
 */
export const createAdmin = async (req, res) => {
  try {
    const { username, email, password, role = 'admin', status = 'active' } = req.body;
    
    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码为必填字段',
        error: { code: 'ADMIN_MANAGER_MISSING_FIELDS' }
      });
    }
    
    // 验证角色值
    if (role !== 'admin' && role !== 'super_admin') {
      return res.status(400).json({
        success: false,
        message: '角色必须是 admin 或 super_admin',
        error: { code: 'ADMIN_MANAGER_INVALID_ROLE' }
      });
    }
    
    // 检查当前操作者是否为超级管理员
    const currentAdmin = req.admin;
    if (currentAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: '只有超级管理员可以创建管理员账户',
        error: { code: 'ADMIN_MANAGER_NOT_SUPER_ADMIN' }
      });
    }
    
    // 检查邮箱是否已存在
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: '该邮箱已被注册',
        error: { code: 'ADMIN_MANAGER_EMAIL_EXISTS' }
      });
    }
    
    // 检查用户名是否已存在
    const existingUsername = await Admin.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: '该用户名已被使用',
        error: { code: 'ADMIN_MANAGER_USERNAME_EXISTS' }
      });
    }
    
    // 创建新管理员
    const admin = new Admin({
      username,
      email,
      password, // 使用虚拟属性，将在保存时哈希
      role,
      status
    });
    
    await admin.save();
    
    // 记录操作日志
    logger.info(`超级管理员 ${currentAdmin.username} (${currentAdmin.email}) 创建了新管理员账户: ${admin.username} (${admin.email}), 角色: ${admin.role}`);
    
    return res.status(201).json({
      success: true,
      message: '管理员账户创建成功',
      data: {
        admin: {
          id: admin._id.toString(),
          username: admin.username,
          email: admin.email,
          role: admin.role,
          status: admin.status,
          created_at: admin.created_at
        }
      }
    });
  } catch (error) {
    logger.error(`创建管理员账户时出错: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: { code: 'ADMIN_MANAGER_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 获取所有管理员账户列表
 * @route GET /api/v1/admin/managers
 * @access 仅超级管理员
 */
export const getAdmins = async (req, res) => {
  try {
    // 分页参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 查询条件
    const query = {};
    
    // 如果指定了角色筛选
    if (req.query.role && ['admin', 'super_admin'].includes(req.query.role)) {
      query.role = req.query.role;
    }
    
    // 如果指定了状态筛选
    if (req.query.status && ['active', 'inactive'].includes(req.query.status)) {
      query.status = req.query.status;
    }
    
    // 如果有搜索关键词
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { username: searchRegex },
        { email: searchRegex }
      ];
    }
    
    // 获取总记录数
    const total = await Admin.countDocuments(query);
    
    // 获取管理员列表，排除密码哈希字段
    const admins = await Admin.find(query)
      .select('-password_hash')
      .sort({ created_at: -1 }) // 按创建时间降序
      .skip(skip)
      .limit(limit);
    
    return res.status(200).json({
      success: true,
      data: {
        admins: admins.map(admin => ({
          id: admin._id.toString(),
          username: admin.username,
          email: admin.email,
          role: admin.role,
          status: admin.status,
          last_login_at: admin.last_login_at,
          created_at: admin.created_at
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error(`获取管理员列表时出错: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: { code: 'ADMIN_MANAGER_GET_LIST_ERROR', details: error.message }
    });
  }
};

/**
 * 更新管理员状态
 * @route PATCH /api/v1/admin/managers/:id/status
 * @access 仅超级管理员
 */
export const updateAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 验证状态值
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '状态必须是 active 或 inactive',
        error: { code: 'ADMIN_MANAGER_INVALID_STATUS' }
      });
    }
    
    // 检查当前操作者是否为超级管理员
    const currentAdmin = req.admin;
    if (currentAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: '只有超级管理员可以更新管理员状态',
        error: { code: 'ADMIN_MANAGER_NOT_SUPER_ADMIN' }
      });
    }
    
    // 查找要更新的管理员
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在',
        error: { code: 'ADMIN_MANAGER_NOT_FOUND' }
      });
    }
    
    // 不允许修改自己的状态
    if (admin._id.toString() === currentAdmin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '不能修改自己的状态',
        error: { code: 'ADMIN_MANAGER_CANNOT_UPDATE_SELF' }
      });
    }
    
    // 更新状态
    admin.status = status;
    await admin.save();
    
    // 记录操作日志
    logger.info(`超级管理员 ${currentAdmin.username} (${currentAdmin.email}) 更新了管理员 ${admin.username} (${admin.email}) 的状态为 ${status}`);
    
    return res.status(200).json({
      success: true,
      message: '管理员状态更新成功',
      data: {
        admin: {
          id: admin._id.toString(),
          username: admin.username,
          email: admin.email,
          role: admin.role,
          status: admin.status
        }
      }
    });
  } catch (error) {
    logger.error(`更新管理员状态时出错: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: { code: 'ADMIN_MANAGER_UPDATE_STATUS_ERROR', details: error.message }
    });
  }
};

/**
 * 重置管理员密码
 * @route POST /api/v1/admin/managers/:id/reset-password
 * @access 仅超级管理员
 */
export const resetAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    // 验证必填字段
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: '密码必须至少8个字符',
        error: { code: 'ADMIN_MANAGER_INVALID_PASSWORD' }
      });
    }
    
    // 检查当前操作者是否为超级管理员
    const currentAdmin = req.admin;
    if (currentAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: '只有超级管理员可以重置密码',
        error: { code: 'ADMIN_MANAGER_NOT_SUPER_ADMIN' }
      });
    }
    
    // 查找要更新的管理员
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在',
        error: { code: 'ADMIN_MANAGER_NOT_FOUND' }
      });
    }
    
    // 更新密码
    admin.password = password; // 使用虚拟属性，将在保存时哈希
    await admin.save();
    
    // 记录操作日志
    logger.info(`超级管理员 ${currentAdmin.username} (${currentAdmin.email}) 重置了管理员 ${admin.username} (${admin.email}) 的密码`);
    
    return res.status(200).json({
      success: true,
      message: '管理员密码重置成功',
      data: {
        admin: {
          id: admin._id.toString(),
          username: admin.username,
          email: admin.email
        }
      }
    });
  } catch (error) {
    logger.error(`重置管理员密码时出错: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: { code: 'ADMIN_MANAGER_RESET_PASSWORD_ERROR', details: error.message }
    });
  }
}; 