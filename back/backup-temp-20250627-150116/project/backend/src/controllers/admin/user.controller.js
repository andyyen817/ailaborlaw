import User from '../../models/user.model.js';
// UserProfile model is not needed as profile is an embedded document in User model as per backend_tasks_auth_user_management.md
import logger from '../../utils/logger.js';

/**
 * 管理员用户管理控制器
 * 注意：此控制器操作 User 和 UserProfile 模型，与 backend_tasks_auth_user_management.md 的 Admin 用户管理部分对齐。
 * 后续需要根据文档详细规范 (请求/响应格式, 参数等) 进行调整。
 */

/**
 * 获取用户列表
 * @param {Object} req - 请求对象 (含req.admin由protectAdmin中間件設置)
 * @param {Object} res - 响应对象
 */
export const getUsers = async (req, res) => {
  try {
    // 從req.admin獲取管理員信息用於日誌記錄
    const adminInfo = req.admin;
    logger.info(`管理員 ${adminInfo.username || adminInfo.email} (ID: ${adminInfo._id}) 獲取用戶列表`);
    
    const { 
      page = 1, 
      limit = 10, 
      status,
      search, // 搜索關鍵詞
      userType, // 用戶類型篩選
      dateRange, // 註冊日期範圍篩選
      sort = 'registrationDate', // 排序字段
      sortOrder = 'desc' // 排序方向
    } = req.query;
    
    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 10;
    
    const query = {};
    
    // 過濾已刪除的用戶
    query.status = { $ne: 'deleted' };
    
    // 其他過濾條件
    if (status && status !== 'all') {
      query.status = status;
    }
    if (userType && userType !== 'all') {
      query.userType = userType;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // dateRange filtering
    if (dateRange) {
        const now = new Date();
        let startDate;
        switch (dateRange) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                startDate.setHours(0,0,0,0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                break;
        }
        if (startDate) {
            query.registrationDate = { $gte: startDate };
        }
    }
    
    const totalItems = await User.countDocuments(query);
    
    const sortOption = {};
    sortOption[sort] = sortOrder === 'asc' ? 1 : -1;
    
    const users = await User.find(query)
      .sort(sortOption)
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .select('-password');
      
    // 格式化響應數據，使用統一的字段名稱格式
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      status: user.status,
      // 統一使用前端期望的字段名稱
      phoneNumber: user.profile?.phone || '',
      companyName: user.profile?.company || '',
      registrationDate: user.registrationDate,
      remainingQueries: user.remainingQueries,
      totalConsultations: user.totalConsultations,
      industry: user.profile?.industry || '',
      position: user.profile?.position || ''
    }));
    
    // 添加緩存控制標頭，防止客戶端緩存
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    return res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
        total: totalItems,
        page: pageInt,
        limit: limitInt,
        totalPages: Math.ceil(totalItems / limitInt)
      }
    });
  } catch (error) {
    logger.error(`獲取用戶列表錯誤: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '服務器內部錯誤',
      error: { code: 'ADMIN_USER_LIST_SERVER_ERROR', details: error.message }
    });
  }
};
  
/**
 * 获取用户详情
 * @param {Object} req - 请求对象 (含req.admin由protectAdmin中間件設置)
 * @param {Object} res - 响应对象
 */
export const getUserDetail = async (req, res) => {
  try {
    // 從req.admin獲取管理員信息用於日誌記錄
    const adminInfo = req.admin;
    const { userId } = req.params;
    
    logger.info(`管理員 ${adminInfo.username || adminInfo.email} (ID: ${adminInfo._id}) 查看用戶詳情，用戶ID: ${userId}`);
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: { code: 'USER_NOT_FOUND' }
      });
    }
    
    // 格式化響應數據，使用統一的字段名稱格式
    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      status: user.status,
      // 統一使用前端期望的字段名稱
      phoneNumber: user.profile?.phone || '',
      companyName: user.profile?.company || '',
      registrationDate: user.registrationDate,
      lastLoginDate: user.lastLogin,
      remainingQueries: user.remainingQueries,
      totalConsultations: user.totalConsultations,
      industry: user.profile?.industry || '',
      position: user.profile?.position || ''
    };
    
    // 添加緩存控制標頭，防止客戶端緩存
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
      
    return res.status(200).json({
      success: true,
      data: {
        user: responseData
      }
    });
  } catch (error) {
    logger.error(`獲取用戶詳情錯誤: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '服務器內部錯誤',
      error: { code: 'ADMIN_USER_DETAIL_SERVER_ERROR', details: error.message }
    });
  }
};
  
/**
 * 更新用户状态 (Admin action) - Corresponds to PATCH /:userId/status in spec
 * @param {Object} req - 请求对象 (含req.admin由protectAdmin中間件設置)
 * @param {Object} res - 响应对象
 */
export const updateUserStatus = async (req, res) => {
  try {
    // 從req.admin獲取管理員信息用於日誌記錄
    const adminInfo = req.admin;
    const { userId } = req.params;
    const { status } = req.body;
    
    logger.info(`管理員 ${adminInfo.username || adminInfo.email} (ID: ${adminInfo._id}) 更新用戶狀態，用戶ID: ${userId}，新狀態: ${status}`);
    
    if (!status || !['active', 'pending', 'disabled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值',
        error: { code: 'INVALID_STATUS_VALUE', details: "Status must be one of 'active', 'pending', 'disabled'." }
      });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { status: status }, // Only update status, timestamps will auto-update
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
        error: { code: 'USER_NOT_FOUND' }
      });
    }
    
    return res.status(200).json({
      success: true,
      message: '用户状态更新成功', // Message from spec
      data: { // Data from spec
        id: user._id,
        status: user.status
      }
    });
  } catch (error) {
    logger.error(`更新用户状态错误: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: { code: 'ADMIN_UPDATE_STATUS_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 更新用户信息 (Admin action)
 * @param {Object} req - 请求对象 (含req.admin由protectAdmin中間件設置)
 * @param {Object} res - 响应对象
 */
export const updateUserInfoByAdmin = async (req, res) => {
    const { userId } = req.params;
    const { 
      name, 
      email, 
      userType, 
      status, 
      phone, 
      company, 
      industry, 
      position, 
      occupation, // 支持向後兼容性
      remainingQueries, 
      password 
    } = req.body;

    try {
        // 從req.admin獲取管理員信息用於日誌記錄
        const adminInfo = req.admin;
        logger.info(`管理員 ${adminInfo.username || adminInfo.email} (ID: ${adminInfo._id}) 更新用戶信息，用戶ID: ${userId}`);
        
        // 查找用戶（記錄更新前的資料）
        const userBeforeUpdate = await User.findById(userId);
        if (!userBeforeUpdate) {
            return res.status(404).json({ 
              success: false, 
              message: '用戶不存在', 
              error: { code: 'USER_NOT_FOUND' } 
            });
        }
        
        // 記錄更新前的資料狀態
        logger.info(`用戶資料更新前(管理員操作): ${JSON.stringify({
          id: userBeforeUpdate._id,
          name: userBeforeUpdate.name,
          email: userBeforeUpdate.email,
          profile: userBeforeUpdate.profile
        })}`);

        // 使用正確的點表示法更新嵌入式文檔
        const updates = {};
        if (name) updates.name = name;
        if (userType) updates.userType = userType;
        if (status) updates.status = status;
        if (remainingQueries !== undefined) {
            if (typeof remainingQueries !== 'number' || remainingQueries < 0) {
                 return res.status(400).json({ 
                   success: false, 
                   message: '剩餘諮詢次數必須為非負數', 
                   error: { code: 'INVALID_REMAINING_QUERIES'} 
                });
            }
            updates.remainingQueries = remainingQueries;
        }
        
        // 更新嵌入式文檔字段，使用點表示法
        if (phone) updates['profile.phone'] = phone;
        if (company) updates['profile.company'] = company;
        if (industry) updates['profile.industry'] = industry;
        
        // 處理職位字段（支持向後兼容）
        const finalPosition = position || occupation;
        if (finalPosition) updates['profile.position'] = finalPosition;
        
        if (email && email !== userBeforeUpdate.email) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser && String(existingUser._id) !== userId) {
                return res.status(409).json({ 
                  success: false, 
                  message: '此電子郵箱已被使用', 
                  error: { code: 'EMAIL_ALREADY_EXISTS' } 
                });
            }
            updates.email = email.toLowerCase();
        }
        
        // 如果需要更新密碼，使用單獨的方法來處理（由於需要觸發pre-save鉤子進行哈希）
        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ 
                  success: false, 
                  message: '密碼長度不能少於8位', 
                  error: { code: 'PASSWORD_TOO_SHORT'} 
                });
            }
            
            const user = await User.findById(userId);
            user.password = password; // 這將觸發pre-save鉤子進行哈希
            await user.save();
        }
        
        // 使用 findByIdAndUpdate 更新其他字段
        if (Object.keys(updates).length > 0) {
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updates },
                { new: true, runValidators: true }
            ).select('-password');
            
            // 記錄更新後的資料狀態
            logger.info(`用戶資料更新後(管理員操作): ${JSON.stringify({
              id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              profile: updatedUser.profile
            })}`);
            
            // 格式化響應數據，使用統一的字段名稱格式
            const responseData = {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                userType: updatedUser.userType,
                status: updatedUser.status,
                // 統一使用前端期望的字段名稱
                phoneNumber: updatedUser.profile?.phone || '',
                companyName: updatedUser.profile?.company || '',
                industry: updatedUser.profile?.industry || '',
                position: updatedUser.profile?.position || '',
                remainingQueries: updatedUser.remainingQueries
            };
            
            // 添加緩存控制標頭，防止客戶端緩存
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            
            return res.status(200).json({
                success: true,
                message: '用戶信息更新成功',
                data: { user: responseData }
            });
        } else if (!password) {
            // 如果沒有任何更新，但也不是密碼更新
            return res.status(400).json({
                success: false,
                message: '沒有提供任何更新字段',
                error: { code: 'NO_UPDATES_PROVIDED' }
            });
        } else {
            // 僅密碼更新的情況
            const updatedUser = await User.findById(userId).select('-password');
            
            // 格式化響應數據，使用統一的字段名稱格式
            const responseData = {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                userType: updatedUser.userType,
                status: updatedUser.status,
                // 統一使用前端期望的字段名稱
                phoneNumber: updatedUser.profile?.phone || '',
                companyName: updatedUser.profile?.company || '',
                industry: updatedUser.profile?.industry || '',
                position: updatedUser.profile?.position || '',
                remainingQueries: updatedUser.remainingQueries
            };
            
            // 添加緩存控制標頭，防止客戶端緩存
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            
            return res.status(200).json({
                success: true,
                message: '用戶密碼更新成功',
                data: { user: responseData }
            });
        }
    } catch (error) {
        logger.error(`管理員更新用戶信息錯誤: ${error.message}`, { userId, stack: error.stack });
        
        // 檢查是否是重複鍵錯誤
        if (error.code === 11000) {
            // 處理重複電子郵箱等情況
            return res.status(409).json({ 
                success: false, 
                message: '資源衝突，可能是電子郵箱已被使用', 
                error: { code: 'RESOURCE_CONFLICT', details: error.message } 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: '服務器內部錯誤', 
            error: { code: 'ADMIN_UPDATE_USER_SERVER_ERROR', details: error.message } 
        });
    }
};
  
/**
 * 創建新用戶 (Admin action)
 * @param {Object} req - 请求对象 (含req.admin由protectAdmin中間件設置)
 * @param {Object} res - 响应对象
 */
export const createUserByAdmin = async (req, res) => {
    const { 
      name, 
      email, 
      password, 
      userType, 
      status, 
      phone, 
      company, 
      industry, 
      position, 
      occupation, // 支持向後兼容性
      remainingQueries 
    } = req.body;

    try {
        // 從req.admin獲取管理員信息用於日誌記錄
        const adminInfo = req.admin;
        logger.info(`管理員 ${adminInfo.username || adminInfo.email} (ID: ${adminInfo._id}) 創建新用戶，郵箱: ${email}`);
        
        // 基本驗證
        if (!name || !email || !password || !userType) {
            return res.status(400).json({ 
              success: false, 
              message: '缺少必要欄位', 
              error: { code: 'MISSING_REQUIRED_FIELDS' } 
            });
        }
        if (password.length < 8) {
            return res.status(400).json({ 
              success: false, 
              message: '密碼長度不能少於8位', 
              error: { code: 'PASSWORD_TOO_SHORT'} 
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ 
              success: false, 
              message: '此電子郵箱已被註冊', 
              error: { code: 'EMAIL_ALREADY_EXISTS' } 
            });
        }

        // 創建 profile 對象
        const profile = {};
        if (phone) profile.phone = phone;
        if (company) profile.company = company;
        if (industry) profile.industry = industry;
        
        // 處理職位字段（支持向後兼容）
        const finalPosition = position || occupation;
        if (finalPosition) profile.position = finalPosition;

        // 創建新用戶
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password, // Pre-save hook will hash
            userType,
            status: status || 'active',
            remainingQueries: remainingQueries === undefined ? 10 : remainingQueries,
            profile: Object.keys(profile).length > 0 ? profile : undefined
        });

        await newUser.save();
        
        // 格式化響應數據，使用統一的字段名稱格式
        const responseData = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            userType: newUser.userType,
            status: newUser.status,
            remainingQueries: newUser.remainingQueries,
            // 統一使用前端期望的字段名稱
            phoneNumber: newUser.profile?.phone || '',
            companyName: newUser.profile?.company || '',
            industry: newUser.profile?.industry || '',
            position: newUser.profile?.position || ''
        };
        
        return res.status(201).json({
            success: true,
            message: '用戶創建成功',
            data: { user: responseData }
        });
    } catch (error) {
        logger.error(`管理員創建用戶錯誤: ${error.message}`, { stack: error.stack });
        
        // 檢查是否是驗證錯誤
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: '輸入資料驗證失敗', 
                error: { code: 'VALIDATION_ERROR', details: error.errors } 
            });
        }
        
        // 檢查是否是重複鍵錯誤
        if (error.code === 11000) {
            return res.status(409).json({ 
                success: false, 
                message: '資源衝突，可能是電子郵箱已被使用', 
                error: { code: 'RESOURCE_CONFLICT', details: error.message } 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: '服務器內部錯誤', 
            error: { code: 'ADMIN_CREATE_USER_SERVER_ERROR', details: error.message } 
        });
    }
};

/**
 * 删除用户 (Admin action)
 * @param {Object} req - 请求对象 (含req.admin由protectAdmin中間件設置)
 * @param {Object} res - 响应对象
 */
export const deleteUserByAdmin = async (req, res) => {
    const { userId } = req.params;
    try {
        // 從req.admin獲取管理員信息用於日誌記錄
        const adminInfo = req.admin;
        logger.info(`管理員 ${adminInfo.username || adminInfo.email} (ID: ${adminInfo._id}) 刪除用戶，用戶ID: ${userId}`);
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在', error: { code: 'USER_NOT_FOUND' } });
        }

        // Consider soft delete vs hard delete
        // For now, hard delete:
        await User.findByIdAndDelete(userId);
        // For soft delete:
        // user.status = 'deleted'; // or some other indicator
        // await user.save();

        return res.status(200).json({ // Spec says 200 OK or 204 No Content. 200 with message is fine.
            success: true,
            message: '用户删除成功',
            data: null // Spec format
        });

    } catch (error) {
        logger.error(`管理员删除用户错误: ${error.message}`, { userId, stack: error.stack });
        return res.status(500).json({ success: false, message: '服务器内部错误', error: { code: 'ADMIN_DELETE_USER_SERVER_ERROR', details: error.message } });
    }
};

/**
 * 匯出用戶數據為CSV格式 (Admin action)
 * @param {Object} req - 请求对象 (含req.admin由protectAdmin中間件設置)
 * @param {Object} res - 响应对象
 */
export const exportUsers = async (req, res) => {
    try {
        // 從req.admin獲取管理員信息用於日誌記錄
        const adminInfo = req.admin;
        logger.info(`管理員 ${adminInfo.username || adminInfo.email} (ID: ${adminInfo._id}) 導出用戶數據`);
        
        const { 
            status,
            search,
            userType,
            dateRange
        } = req.query;
        
        const query = {};
        
        // 過濾條件，與getUsers保持一致
        query.status = { $ne: 'deleted' };
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (userType && userType !== 'all') {
            query.userType = userType;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        // dateRange filtering
        if (dateRange) {
            const now = new Date();
            let startDate;
            switch (dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                    startDate.setHours(0,0,0,0);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    break;
            }
            if (startDate) {
                query.registrationDate = { $gte: startDate };
            }
        }
        
        // 獲取用戶數據
        const users = await User.find(query).select('-password');
        
        // 準備CSV頭
        const csvHeader = 'ID,姓名,郵箱,用戶類型,狀態,手機,公司,行業,職位,剩餘諮詢次數,總諮詢次數,註冊日期\n';
        
        // 將用戶數據轉換為CSV行
        const csvRows = users.map(user => {
            return [
                user._id,
                escapeCsvValue(user.name),
                escapeCsvValue(user.email),
                user.userType,
                user.status,
                escapeCsvValue(user.profile?.phone || ''),
                escapeCsvValue(user.profile?.company || ''),
                escapeCsvValue(user.profile?.industry || ''),
                escapeCsvValue(user.profile?.position || ''),
                user.remainingQueries,
                user.totalConsultations,
                user.registrationDate ? new Date(user.registrationDate).toISOString() : ''
            ].join(',');
        });
        
        // 合併CSV內容
        const csvContent = csvHeader + csvRows.join('\n');
        
        // 設置響應頭
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
        
        // 發送CSV數據
        return res.status(200).send(csvContent);
        
    } catch (error) {
        logger.error(`匯出用戶數據錯誤: ${error.message}`, { stack: error.stack });
        return res.status(500).json({
            success: false,
            message: '服務器內部錯誤',
            error: { code: 'ADMIN_EXPORT_USERS_ERROR', details: error.message }
        });
    }
};

/**
 * 處理CSV值的轉義
 * @param {string} value - 需要轉義的值
 * @returns {string} 轉義後的值
 */
function escapeCsvValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    
    const stringValue = String(value);
    
    // 如果包含逗號、雙引號或換行符，將整個值用雙引號包裹
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        // 將雙引號替換為兩個雙引號
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
}
