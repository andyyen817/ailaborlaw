/**
 * 专家咨询控制器
 * 提供专家咨询申请的管理功能
 */

// 临时存储专家咨询数据
const consultations = new Map();

/**
 * 生成申请ID
 */
function generateConsultationId() {
  return 'consultation_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 服务类型映射
 */
const SERVICE_TYPES = {
  'labor_contract': '勞動合同',
  'compensation': '薪資福利', 
  'termination': '終止勞動關係',
  'workplace_safety': '工作場所安全',
  'discrimination': '歧視問題',
  'other': '其他'
};

/**
 * 状态映射
 */
const STATUS_MAP = {
  'pending': '待處理',
  'processing': '處理中',
  'completed': '已完成',
  'cancelled': '已取消'
};

const expertConsultationController = {
  /**
   * 提交专家咨询申请 (用户端)
   */
  async submitConsultation(req, res) {
    try {
      const {
        name,
        phone,
        email,
        lineId,
        service,
        details,
        preferredContact,
        timeOfDay,
        startTime,
        endTime,
        region,
        simplifiedTime
      } = req.body;

      // 基本验证
      if (!name || !phone || !service || !details) {
        return res.status(400).json({
          success: false,
          message: '缺少必填字段',
          error: { code: 'MISSING_REQUIRED_FIELDS' }
        });
      }

      // 验证联系方式
      if (!preferredContact || preferredContact.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请至少选择一种联系方式',
          error: { code: 'NO_CONTACT_METHOD' }
        });
      }

      const consultationId = generateConsultationId();
      const now = new Date();

      // 构建咨询时间描述
      let consultationTime = '';
      if (timeOfDay && startTime && endTime) {
        const timeOfDayText = timeOfDay === 'morning' ? '上午' : '下午';
        consultationTime = `${timeOfDayText} ${startTime}-${endTime}`;
      } else if (simplifiedTime) {
        consultationTime = `偏好時間 ${simplifiedTime}`;
      }

      const consultation = {
        _id: consultationId,
        user_id: req.user?.id || 'guest',
        name,
        phone,
        email: email || '',
        line_id: lineId || '',
        service_type: service,
        details,
        preferred_contact: Array.isArray(preferredContact) ? preferredContact : [preferredContact],
        consultation_time: consultationTime,
        region: region || '',
        status: 'pending',
        admin_notes: '',
        processed_by: null,
        processed_at: null,
        assigned_advisor_id: null,
        id: consultationId,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        __v: 0
      };

      consultations.set(consultationId, consultation);

      res.json({
        success: true,
        message: `✅ 申請提交成功！申請ID: ${consultationId}`,
        data: {
          id: consultationId,
          customId: consultationId,
          status: 'pending',
          createdAt: now.toISOString()
        }
      });
    } catch (error) {
      console.error('提交咨询申请失败:', error);
      res.status(500).json({
        success: false,
        message: '提交咨询申请失败',
        error: { code: 'CONSULTATION_SUBMIT_ERROR' }
      });
    }
  },

  /**
   * 获取用户申请列表
   */
  async getUserConsultations(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      // 权限检查：用户只能查看自己的申请
      if (req.user.id !== userId && req.user.userType !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '无权查看他人的申请',
          error: { code: 'PERMISSION_DENIED' }
        });
      }

      // 过滤用户的申请
      const userConsultations = Array.from(consultations.values())
        .filter(consultation => consultation.user_id === userId)
        .filter(consultation => !status || consultation.status === status)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // 分页
      const totalItems = userConsultations.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const paginatedConsultations = userConsultations.slice(startIndex, startIndex + parseInt(limit));

      res.json({
        success: true,
        data: {
          consultations: paginatedConsultations,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      console.error('获取用户申请列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取申请列表失败',
        error: { code: 'CONSULTATION_LIST_ERROR' }
      });
    }
  },

  /**
   * 获取申请详情
   */
  async getConsultationDetails(req, res) {
    try {
      const { id } = req.params;
      const consultation = consultations.get(id);

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: '申请不存在',
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      // 权限检查：用户只能查看自己的申请，管理员可以查看所有
      if (req.user.userType !== 'admin' && consultation.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: '无权查看此申请',
          error: { code: 'PERMISSION_DENIED' }
        });
      }

      res.json({
        success: true,
        data: consultation
      });
    } catch (error) {
      console.error('获取申请详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取申请详情失败',
        error: { code: 'CONSULTATION_DETAILS_ERROR' }
      });
    }
  },

  /**
   * 取消申请
   */
  async cancelConsultation(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const consultation = consultations.get(id);

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: '申请不存在',
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      // 权限检查：用户只能取消自己的申请
      if (req.user.userType !== 'admin' && consultation.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: '无权取消此申请',
          error: { code: 'PERMISSION_DENIED' }
        });
      }

      // 检查状态
      if (consultation.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: '申请已经被取消',
          error: { code: 'ALREADY_CANCELLED' }
        });
      }

      if (consultation.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: '已完成的申请无法取消',
          error: { code: 'CANNOT_CANCEL_COMPLETED' }
        });
      }

      // 更新状态
      consultation.status = 'cancelled';
      consultation.updated_at = new Date().toISOString();
      
      // 记录取消原因
      if (reason) {
        consultation.admin_notes = `取消原因: ${reason}`;
      }

      consultations.set(id, consultation);

      res.json({
        success: true,
        message: '咨询申请已取消',
        data: {
          id: consultation.id,
          status: 'cancelled',
          updatedAt: consultation.updated_at
        }
      });
    } catch (error) {
      console.error('取消申请失败:', error);
      res.status(500).json({
        success: false,
        message: '取消申请失败',
        error: { code: 'CONSULTATION_CANCEL_ERROR' }
      });
    }
  },

  /**
   * 获取所有申请列表 (管理员)
   */
  async getAdminConsultationList(req, res) {
    try {
      const { page = 1, limit = 10, status, service_type, search } = req.query;

      let allConsultations = Array.from(consultations.values());

      // 筛选
      if (status && status !== '') {
        allConsultations = allConsultations.filter(c => c.status === status);
      }

      if (service_type && service_type !== '') {
        allConsultations = allConsultations.filter(c => c.service_type === service_type);
      }

      if (search && search !== '') {
        const searchLower = search.toLowerCase();
        allConsultations = allConsultations.filter(c => 
          c.name.toLowerCase().includes(searchLower) ||
          c.phone.includes(search) ||
          (c.email && c.email.toLowerCase().includes(searchLower)) ||
          (c.line_id && c.line_id.toLowerCase().includes(searchLower))
        );
      }

      // 排序
      allConsultations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // 分页
      const totalItems = allConsultations.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const paginatedConsultations = allConsultations.slice(startIndex, startIndex + parseInt(limit));

      // 统计
      const statistics = {
        total: consultations.size,
        pending: Array.from(consultations.values()).filter(c => c.status === 'pending').length,
        processing: Array.from(consultations.values()).filter(c => c.status === 'processing').length,
        completed: Array.from(consultations.values()).filter(c => c.status === 'completed').length,
        cancelled: Array.from(consultations.values()).filter(c => c.status === 'cancelled').length
      };

      res.json({
        success: true,
        data: {
          consultations: paginatedConsultations,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems,
            hasNext: page < totalPages,
            hasPrev: page > 1
          },
          statistics
        }
      });
    } catch (error) {
      console.error('获取管理员申请列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取申请列表失败',
        error: { code: 'ADMIN_CONSULTATION_LIST_ERROR' }
      });
    }
  },

  /**
   * 更新申请状态 (管理员)
   */
  async updateAdminConsultation(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNotes, forceUpdate, assigned_advisor_id } = req.body;
      
      const consultation = consultations.get(id);

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: '申请不存在',
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      // 更新字段
      if (status) {
        consultation.status = status;
      }

      if (adminNotes !== undefined) {
        consultation.admin_notes = adminNotes;
      }

      if (assigned_advisor_id !== undefined) {
        consultation.assigned_advisor_id = assigned_advisor_id;
      }

      consultation.processed_by = req.user.id;
      consultation.processed_at = new Date().toISOString();
      consultation.updated_at = new Date().toISOString();

      if (status === 'completed') {
        consultation.completed_at = new Date().toISOString();
      }

      consultations.set(id, consultation);

      res.json({
        success: true,
        message: '咨询申请已更新',
        data: consultation
      });
    } catch (error) {
      console.error('更新申请状态失败:', error);
      res.status(500).json({
        success: false,
        message: '更新申请状态失败',
        error: { code: 'ADMIN_CONSULTATION_UPDATE_ERROR' }
      });
    }
  },

  /**
   * 删除申请 (管理员)
   */
  async deleteAdminConsultation(req, res) {
    try {
      const { id } = req.params;
      
      if (!consultations.has(id)) {
        return res.status(404).json({
          success: false,
          message: '申请不存在',
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      consultations.delete(id);

      res.json({
        success: true,
        message: '咨询申请已删除'
      });
    } catch (error) {
      console.error('删除申请失败:', error);
      res.status(500).json({
        success: false,
        message: '删除申请失败',
        error: { code: 'ADMIN_CONSULTATION_DELETE_ERROR' }
      });
    }
  },

  /**
   * 获取统计数据 (管理员)
   */
  async getAdminStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      let filteredConsultations = Array.from(consultations.values());

      // 日期筛选
      if (startDate) {
        const start = new Date(startDate);
        filteredConsultations = filteredConsultations.filter(c => 
          new Date(c.created_at) >= start
        );
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // 包含整天
        filteredConsultations = filteredConsultations.filter(c => 
          new Date(c.created_at) <= end
        );
      }

      // 基础统计
      const overview = {
        total: filteredConsultations.length,
        pending: filteredConsultations.filter(c => c.status === 'pending').length,
        processing: filteredConsultations.filter(c => c.status === 'processing').length,
        completed: filteredConsultations.filter(c => c.status === 'completed').length,
        cancelled: filteredConsultations.filter(c => c.status === 'cancelled').length
      };

      // 服务类型统计
      const serviceTypeStats = Object.keys(SERVICE_TYPES).map(type => ({
        service_type: type,
        name: SERVICE_TYPES[type],
        count: filteredConsultations.filter(c => c.service_type === type).length
      })).filter(stat => stat.count > 0);

      // 每日统计
      const dailyStats = [];
      if (filteredConsultations.length > 0) {
        const dates = {};
        filteredConsultations.forEach(c => {
          const date = new Date(c.created_at).toISOString().split('T')[0];
          if (!dates[date]) {
            dates[date] = { date, count: 0 };
          }
          dates[date].count++;
        });
        dailyStats.push(...Object.values(dates).sort((a, b) => a.date.localeCompare(b.date)));
      }

      res.json({
        success: true,
        data: {
          overview,
          serviceTypeStats,
          dailyStats
        }
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取统计数据失败',
        error: { code: 'ADMIN_STATISTICS_ERROR' }
      });
    }
  }
};

module.exports = expertConsultationController; 