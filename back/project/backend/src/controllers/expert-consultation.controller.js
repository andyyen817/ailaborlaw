const ExpertConsultation = require('../models/expert_consultation.model.js');
const { SERVICE_TYPES, STATUS_TYPES } = require('../models/expert_consultation.model.js');
const logger = require('../utils/logger.js');

/**
 * 专家咨询控制器
 * 处理所有专家咨询相关的API请求
 */

class ExpertConsultationController {
  /**
   * 创建专家咨询申请
   * @route POST /api/v1/expert-consultations
   */
  static async createConsultation(req, res) {
    try {
      const {
        name,
        phone,
        email,
        lineId,
        region,
        service,
        details,
        preferredContact,
        timeOfDay,
        startTime,
        endTime,
        simplifiedTime
      } = req.body;

      // 构建咨询时间字符串
      let consultationTime = '';
      if (timeOfDay && startTime && endTime) {
        const timeMap = {
          morning: '上午',
          afternoon: '下午',
          evening: '晚上'
        };
        consultationTime = `${timeMap[timeOfDay]} ${startTime}-${endTime}`;
      }

      // 获取认证用户ID（所有用户都必须登录）
      const userId = req.user.id;

      // 创建咨询记录
      const consultation = new ExpertConsultation({
        user_id: userId,
        name,
        phone,
        email: email || null,
        line_id: lineId || null,
        region: region || null,
        service_type: service,
        details,
        preferred_contact: preferredContact,
        consultation_time: consultationTime || null,
        simplified_time: simplifiedTime || null
      });

      await consultation.save();

      logger.info('新的专家咨询申请已创建', {
        consultationId: consultation.id,
        userId,
        service: service,
        name
      });

      res.status(201).json({
        success: true,
        message: '咨詢申請提交成功',
        data: {
          id: consultation._id,
          customId: consultation.id,
          status: consultation.status,
          createdAt: consultation.created_at
        }
      });

    } catch (error) {
      logger.error('创建专家咨询申请失败', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });

      res.status(500).json({
        success: false,
        message: '提交申請時發生錯誤',
        error: {
          code: 'CONSULTATION_CREATE_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取用户的咨询申请列表
   * @route GET /api/v1/expert-consultations/user/:userId
   */
  static async getUserConsultations(req, res) {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        limit = 10,
        status
      } = req.query;

      // 权限检查：只能查看自己的申请，除非是管理员
      if (req.user.userType !== 'admin' && req.user.id !== userId) {
        return res.status(403).json({
          success: false,
          message: '權限不足，只能查看自己的申請',
          error: { code: 'FORBIDDEN' }
        });
      }

      // 构建查询选项
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status: status || null
      };

      const consultations = await ExpertConsultation.findByUser(userId, options);
      const total = await ExpertConsultation.countDocuments({ 
        user_id: userId,
        ...(status && { status })
      });

      const totalPages = Math.ceil(total / options.limit);

      res.json({
        success: true,
        data: {
          consultations,
          pagination: {
            currentPage: options.page,
            totalPages,
            totalItems: total,
            hasNext: options.page < totalPages,
            hasPrev: options.page > 1
          }
        }
      });

    } catch (error) {
      logger.error('获取用户咨询列表失败', {
        error: error.message,
        userId: req.params.userId
      });

      res.status(500).json({
        success: false,
        message: '獲取咨詢列表時發生錯誤',
        error: {
          code: 'CONSULTATION_LIST_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取单个咨询申请详情
   * @route GET /api/v1/expert-consultations/:id
   */
  static async getConsultationDetail(req, res) {
    try {
      const { id } = req.params;

      const consultation = await ExpertConsultation.findOne({ id });

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: '咨詢申請不存在',
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      // 权限检查：只能查看自己的申请，除非是管理员
      if (req.user.userType !== 'admin' && req.user.id !== consultation.user_id) {
        return res.status(403).json({
          success: false,
          message: '權限不足，只能查看自己的申請',
          error: { code: 'FORBIDDEN' }
        });
      }

      res.json({
        success: true,
        data: consultation
      });

    } catch (error) {
      logger.error('获取咨询详情失败', {
        error: error.message,
        consultationId: req.params.id
      });

      res.status(500).json({
        success: false,
        message: '獲取咨詢詳情時發生錯誤',
        error: {
          code: 'CONSULTATION_DETAIL_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 取消咨询申请
   * @route PUT /api/v1/expert-consultations/:id/cancel
   */
  static async cancelConsultation(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const consultation = await ExpertConsultation.findOne({ id });

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: '咨詢申請不存在',
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      // 权限检查：只能取消自己的申请，除非是管理员
      if (req.user.userType !== 'admin' && req.user.id !== consultation.user_id) {
        return res.status(403).json({
          success: false,
          message: '權限不足，只能取消自己的申請',
          error: { code: 'FORBIDDEN' }
        });
      }

      // 只能取消pending或processing状态的申请
      if (consultation.status !== STATUS_TYPES.PENDING && consultation.status !== STATUS_TYPES.PROCESSING) {
        return res.status(400).json({
          success: false,
          message: '只能取消待處理或處理中的申請',
          error: { code: 'INVALID_STATUS' }
        });
      }

      await consultation.cancel(reason);

      logger.info('咨询申请已取消', {
        consultationId: consultation.id,
        userId: req.user.id,
        reason
      });

      res.json({
        success: true,
        message: '咨詢申請已取消',
        data: {
          id: consultation.id,
          status: consultation.status,
          updatedAt: consultation.updated_at
        }
      });

    } catch (error) {
      logger.error('取消咨询申请失败', {
        error: error.message,
        consultationId: req.params.id
      });

      res.status(500).json({
        success: false,
        message: '取消申請時發生錯誤',
        error: {
          code: 'CONSULTATION_CANCEL_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取所有咨询申请列表 (管理员)
   * @route GET /api/v1/expert-consultations/admin/list
   */
  static async getAdminConsultations(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        service_type,
        search,
        startDate,
        endDate,
        region,
        advisorId
      } = req.query;

      // 构建筛选条件
      const filters = {};
      if (status) filters.status = status;
      if (service_type) filters.service_type = service_type;
      if (search) filters.search = search;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (region) filters.region = region;
      if (advisorId) filters.advisorId = advisorId;

      // 构建查询选项
      const options = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const consultations = await ExpertConsultation.adminFind(filters, options);
      
      // 获取总数用于分页
      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.service_type) query.service_type = filters.service_type;
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { phone: { $regex: filters.search, $options: 'i' } }
        ];
      }
      if (filters.startDate || filters.endDate) {
        query.created_at = {};
        if (filters.startDate) query.created_at.$gte = new Date(filters.startDate);
        if (filters.endDate) query.created_at.$lte = new Date(filters.endDate);
      }

      const total = await ExpertConsultation.countDocuments(query);
      const totalPages = Math.ceil(total / options.limit);

      // 获取统计数据
      const statistics = {
        total,
        pending: await ExpertConsultation.countDocuments({ ...query, status: STATUS_TYPES.PENDING }),
        processing: await ExpertConsultation.countDocuments({ ...query, status: STATUS_TYPES.PROCESSING }),
        completed: await ExpertConsultation.countDocuments({ ...query, status: STATUS_TYPES.COMPLETED }),
        cancelled: await ExpertConsultation.countDocuments({ ...query, status: STATUS_TYPES.CANCELLED })
      };

      res.json({
        success: true,
        data: {
          consultations,
          pagination: {
            currentPage: options.page,
            totalPages,
            totalItems: total,
            hasNext: options.page < totalPages,
            hasPrev: options.page > 1
          },
          statistics
        }
      });

    } catch (error) {
      logger.error('获取管理员咨询列表失败', {
        error: error.message,
        adminId: req.user.id
      });

      res.status(500).json({
        success: false,
        message: '獲取咨詢列表時發生錯誤',
        error: {
          code: 'ADMIN_CONSULTATION_LIST_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取咨询申请详情 (管理员)
   * @route GET /api/v1/expert-consultations/admin/:id
   */
  static async getAdminConsultationDetail(req, res) {
    try {
      const { id } = req.params;

      const consultation = await ExpertConsultation.findOne({ id });

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: '咨詢申請不存在',
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      res.json({
        success: true,
        data: consultation
      });

    } catch (error) {
      logger.error('获取管理员咨询详情失败', {
        error: error.message,
        consultationId: req.params.id
      });

      res.status(500).json({
        success: false,
        message: '獲取咨詢詳情時發生錯誤',
        error: {
          code: 'ADMIN_CONSULTATION_DETAIL_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 更新咨询申请 (管理员)
   * @route PUT /api/v1/expert-consultations/admin/:id
   */
  static async updateConsultation(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNotes, forceUpdate, region, assignedAdvisorId, simplifiedTime } = req.body;

      const consultation = await ExpertConsultation.findOne({ id });

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: '咨詢申請不存在',
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      // 记录旧状态
      const oldStatus = consultation.status;

      // 更新基本字段
      if (region) consultation.region = region;
      if (assignedAdvisorId) consultation.assigned_advisor_id = assignedAdvisorId;
      if (simplifiedTime) consultation.simplified_time = simplifiedTime;

      // 如果有状态更新，使用模型的updateStatus方法进行状态验证
      if (status && status !== consultation.status) {
        const shouldForceUpdate = forceUpdate === true || forceUpdate === 'true';
        await consultation.updateStatus(status, req.admin._id.toString(), adminNotes, shouldForceUpdate);
        
        logger.info('咨询申请状态已更新', {
          consultationId: consultation.id,
          adminId: req.admin._id.toString(),
          oldStatus,
          newStatus: status,
          forceUpdate: shouldForceUpdate
        });
      } else if (adminNotes || region || assignedAdvisorId || simplifiedTime) {
        // 只更新其他字段
        if (adminNotes) consultation.admin_notes = adminNotes;
        consultation.processed_by = req.admin._id.toString();
        
        if (!consultation.processed_at) {
          consultation.processed_at = new Date();
        }
        
        await consultation.save();
        
        logger.info('咨询申请信息已更新', {
          consultationId: consultation.id,
          adminId: req.admin._id.toString(),
          updatedFields: { region, assignedAdvisorId, simplifiedTime, adminNotes }
        });
      }

      res.json({
        success: true,
        message: '咨詢申請已更新',
        data: consultation
      });

    } catch (error) {
      logger.error('更新咨询申请失败', {
        error: error.message,
        consultationId: req.params.id,
        adminId: req.admin?._id?.toString() || 'unknown'
      });

      // 如果是状态流转错误，返回特定的错误信息并提供强制更新建议
      if (error.message.includes('無法將狀態從')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: { 
            code: 'INVALID_STATUS_TRANSITION',
            suggestion: '如需強制更新狀態，請在請求中添加 forceUpdate: true 參數'
          }
        });
      }

      res.status(500).json({
        success: false,
        message: '更新申請時發生錯誤',
        error: {
          code: 'CONSULTATION_UPDATE_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 删除咨询申请 (管理员)
   * @route DELETE /api/v1/expert-consultations/admin/:id
   */
  static async deleteConsultation(req, res) {
    try {
      const { id } = req.params;

      const consultation = await ExpertConsultation.findOne({ id });

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: '咨詢申請不存在',
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      await ExpertConsultation.deleteOne({ id });

      logger.info('咨询申请已删除', {
        consultationId: consultation.id,
        adminId: req.admin._id.toString()
      });

      res.json({
        success: true,
        message: '咨詢申請已刪除'
      });

    } catch (error) {
      logger.error('删除咨询申请失败', {
        error: error.message,
        consultationId: req.params.id,
        adminId: req.admin._id.toString()
      });

      res.status(500).json({
        success: false,
        message: '刪除申請時發生錯誤',
        error: {
          code: 'CONSULTATION_DELETE_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取咨询统计数据 (管理员)
   * @route GET /api/v1/expert-consultations/admin/statistics
   */
  static async getStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const statistics = await ExpertConsultation.getStatistics(filters);

      res.json({
        success: true,
        data: statistics
      });

    } catch (error) {
      logger.error('获取咨询统计数据失败', {
        error: error.message,
        adminId: req.admin._id.toString()
      });

      res.status(500).json({
        success: false,
        message: '獲取統計數據時發生錯誤',
        error: {
          code: 'CONSULTATION_STATISTICS_ERROR',
          details: error.message
        }
      });
    }
  }
}

module.exports = ExpertConsultationController; 
