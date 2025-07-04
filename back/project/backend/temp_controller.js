const LaborAdvisor = require '../models/labor_advisor.model.js';
import ExpertConsultation from '../models/expert_consultation.model.js';
import logger from '../utils/logger.js';

/**
 * 劳资顾问控制�? * 处理所有劳资顾问管理相关的API请求
 */

class LaborAdvisorController {
  /**
   * 获取劳资顾问列表
   * @route GET /api/v1/labor-advisors
   */
  static async getAdvisors(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        region,
        specialty,
        status,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      // 构建查询条件
      const query = {};
      
      if (region) query.region = region;
      if (specialty) query.specialties = { $in: [specialty] };
      if (status === 'active') query.is_active = true;
      if (status === 'inactive') query.is_active = false;
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      // 构建排序
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // 分页查询
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const advisors = await LaborAdvisor.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // 获取总数
      const total = await LaborAdvisor.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          advisors,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      logger.error('获取劳资顾问列表失败', {
        error: error.message,
        adminId: req.admin._id.toString()
      });

      res.status(500).json({
        success: false,
        message: '獲取顧問列表時發生錯�?,
        error: {
          code: 'ADVISOR_LIST_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 搜索可用顾问（用于指派）
   * @route GET /api/v1/labor-advisors/search
   */
  static async searchAvailableAdvisors(req, res) {
    try {
      const { region, specialty, available = 'true' } = req.query;

      if (!region || !specialty) {
        return res.status(400).json({
          success: false,
          message: '地區和專業領域為必填參數',
          error: { code: 'MISSING_REQUIRED_PARAMS' }
        });
      }

      let advisors;
      
      if (available === 'true') {
        // 查找最佳可用顾�?        advisors = await LaborAdvisor.find({
          is_active: true,
          region: region,
          specialties: { $in: [specialty] }
        }).sort({ 
          workload_status: 1, 
          avg_completion_time: 1,
          total_completed: -1 
        }).limit(10);

        // 过滤出可以接受新案件的顾�?        advisors = advisors.filter(advisor => advisor.canAcceptNewCase());
      } else {
        // 查找所有符合条件的顾问
        advisors = await LaborAdvisor.findByRegionAndSpecialty(region, specialty, {
          limit: 20
        });
      }

      res.json({
        success: true,
        data: {
          advisors,
          total: advisors.length,
          searchCriteria: { region, specialty, available }
        }
      });

    } catch (error) {
      logger.error('搜索可用顾问失败', {
        error: error.message,
        adminId: req.admin._id.toString()
      });

      res.status(500).json({
        success: false,
        message: '搜索顧問時發生錯�?,
        error: {
          code: 'ADVISOR_SEARCH_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取劳资顾问详情
   * @route GET /api/v1/labor-advisors/:id
   */
  static async getAdvisorDetail(req, res) {
    try {
      const { id } = req.params;

      const advisor = await LaborAdvisor.findOne({ id });

      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: '勞資顧問不存�?,
          error: { code: 'ADVISOR_NOT_FOUND' }
        });
      }

      // 获取该顾问的咨询案件统计
      const consultationStats = await ExpertConsultation.aggregate([
        { $match: { assigned_advisor_id: id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // 获取最近的咨询案件
      const recentConsultations = await ExpertConsultation.find({
        assigned_advisor_id: id
      }).sort({ created_at: -1 }).limit(5);

      res.json({
        success: true,
        data: {
          advisor,
          consultationStats,
          recentConsultations
        }
      });

    } catch (error) {
      logger.error('获取劳资顾问详情失败', {
        error: error.message,
        advisorId: req.params.id,
        adminId: req.admin._id.toString()
      });

      res.status(500).json({
        success: false,
        message: '獲取顧問詳情時發生錯�?,
        error: {
          code: 'ADVISOR_DETAIL_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 创建新的劳资顾问
   * @route POST /api/v1/labor-advisors
   */
  static async createAdvisor(req, res) {
    try {
      const {
        name,
        phone,
        email,
        lineId,
        region,
        specialties,
        notes
      } = req.body;

      // 检查邮箱是否已存在
      const existingAdvisor = await LaborAdvisor.findOne({ email });
      if (existingAdvisor) {
        return res.status(400).json({
          success: false,
          message: '該電子郵箱已被使�?,
          error: { code: 'EMAIL_ALREADY_EXISTS' }
        });
      }

      // 创建新顾�?      const advisor = new LaborAdvisor({
        name,
        phone,
        email,
        line_id: lineId || null,
        region,
        specialties,
        notes: notes || ''
      });

      await advisor.save();

      logger.info('新的劳资顾问已创�?, {
        advisorId: advisor.id,
        name,
        region,
        specialties,
        adminId: req.admin._id.toString()
      });

      res.status(201).json({
        success: true,
        message: '勞資顧問創建成功',
        data: advisor
      });

    } catch (error) {
      logger.error('创建劳资顾问失败', {
        error: error.message,
        adminId: req.admin._id.toString()
      });

      // 处理唯一性约束错�?      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const message = field === 'email' ? '該電子郵箱已被使�? : '該顧問信息已存在';
        
        return res.status(400).json({
          success: false,
          message,
          error: { code: 'DUPLICATE_ADVISOR' }
        });
      }

      res.status(500).json({
        success: false,
        message: '創建顧問時發生錯�?,
        error: {
          code: 'ADVISOR_CREATE_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 更新劳资顾问信息
   * @route PUT /api/v1/labor-advisors/:id
   */
  static async updateAdvisor(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        phone,
        email,
        lineId,
        region,
        specialties,
        isActive,
        notes
      } = req.body;

      const advisor = await LaborAdvisor.findOne({ id });

      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: '勞資顧問不存�?,
          error: { code: 'ADVISOR_NOT_FOUND' }
        });
      }

      // 如果更新邮箱，检查是否已被其他顾问使�?      if (email && email !== advisor.email) {
        const existingAdvisor = await LaborAdvisor.findOne({ 
          email, 
          id: { $ne: id } 
        });
        
        if (existingAdvisor) {
          return res.status(400).json({
            success: false,
            message: '該電子郵箱已被其他顧問使�?,
            error: { code: 'EMAIL_ALREADY_EXISTS' }
          });
        }
      }

      // 更新字段
      if (name) advisor.name = name;
      if (phone) advisor.phone = phone;
      if (email) advisor.email = email;
      if (lineId !== undefined) advisor.line_id = lineId;
      if (region) advisor.region = region;
      if (specialties) advisor.specialties = specialties;
      if (isActive !== undefined) advisor.is_active = isActive;
      if (notes !== undefined) advisor.notes = notes;

      await advisor.save();

      logger.info('劳资顾问信息已更�?, {
        advisorId: advisor.id,
        updatedFields: { name, phone, email, region, specialties, isActive },
        adminId: req.admin._id.toString()
      });

      res.json({
        success: true,
        message: '顧問信息更新成功',
        data: advisor
      });

    } catch (error) {
      logger.error('更新劳资顾问失败', {
        error: error.message,
        advisorId: req.params.id,
        adminId: req.admin._id.toString()
      });

      res.status(500).json({
        success: false,
        message: '更新顧問時發生錯�?,
        error: {
          code: 'ADVISOR_UPDATE_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 切换劳资顾问状�?   * @route PUT /api/v1/labor-advisors/:id/toggle-status
   */
  static async toggleAdvisorStatus(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const advisor = await LaborAdvisor.findOne({ id });

      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: '勞資顧問不存�?,
          error: { code: 'ADVISOR_NOT_FOUND' }
        });
      }

      const oldStatus = advisor.is_active;
      advisor.is_active = !advisor.is_active;
      
      // 如果提供了原因，添加到备注中
      if (reason) {
        const statusText = advisor.is_active ? '啟用' : '停用';
        const timestamp = new Date().toLocaleString('zh-TW');
        advisor.notes = advisor.notes 
          ? `${advisor.notes}\n[${timestamp}] ${statusText}: ${reason}` 
          : `[${timestamp}] ${statusText}: ${reason}`;
      }

      await advisor.save();

      logger.info('劳资顾问状态已切换', {
        advisorId: advisor.id,
        oldStatus,
        newStatus: advisor.is_active,
        reason,
        adminId: req.admin._id.toString()
      });

      res.json({
        success: true,
        message: `顧問�?{advisor.is_active ? '啟用' : '停用'}`,
        data: {
          id: advisor.id,
          name: advisor.name,
          is_active: advisor.is_active
        }
      });

    } catch (error) {
      logger.error('切换劳资顾问状态失�?, {
        error: error.message,
        advisorId: req.params.id,
        adminId: req.admin._id.toString()
      });

      res.status(500).json({
        success: false,
        message: '切換顧問狀態時發生錯誤',
        error: {
          code: 'ADVISOR_STATUS_TOGGLE_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 删除劳资顾问
   * @route DELETE /api/v1/labor-advisors/:id
   */
  static async deleteAdvisor(req, res) {
    try {
      const { id } = req.params;

      const advisor = await LaborAdvisor.findOne({ id });

      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: '勞資顧問不存�?,
          error: { code: 'ADVISOR_NOT_FOUND' }
        });
      }

      // 检查是否有正在处理的咨询案�?      const activeConsultations = await ExpertConsultation.countDocuments({
        assigned_advisor_id: id,
        status: { $in: ['pending', 'processing'] }
      });

      if (activeConsultations > 0) {
        return res.status(400).json({
          success: false,
          message: `該顧問還�?${activeConsultations} 個正在處理的諮詢案件，無法刪除`,
          error: { code: 'ADVISOR_HAS_ACTIVE_CONSULTATIONS' }
        });
      }

      // 删除顾问前，将历史咨询案件的顾问信息设为null
      await ExpertConsultation.updateMany(
        { assigned_advisor_id: id },
        { 
          $set: { assigned_advisor_id: null },
          $push: { 
            admin_notes: `\n[${new Date().toLocaleString('zh-TW')}] 原指派顧�?${advisor.name} 已被刪除` 
          }
        }
      );

      await LaborAdvisor.deleteOne({ id });

      logger.info('劳资顾问已删�?, {
        advisorId: advisor.id,
        advisorName: advisor.name,
        adminId: req.admin._id.toString()
      });

      res.json({
        success: true,
        message: '顧問刪除成功'
      });

    } catch (error) {
      logger.error('删除劳资顾问失败', {
        error: error.message,
        advisorId: req.params.id,
        adminId: req.admin._id.toString()
      });

      res.status(500).json({
        success: false,
        message: '刪除顧問時發生錯�?,
        error: {
          code: 'ADVISOR_DELETE_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取劳资顾问统计数据
   * @route GET /api/v1/labor-advisors/statistics
   */
  static async getAdvisorStatistics(req, res) {
    try {
      const { region } = req.query;

      // 获取顾问统计
      const advisorStats = await LaborAdvisor.getStatistics(region);

      // 获取工作负载分布
      const workloadDistribution = await LaborAdvisor.aggregate([
        { $match: region ? { region, is_active: true } : { is_active: true } },
        {
          $group: {
            _id: '$workload_status',
            count: { $sum: 1 },
            advisors: { $push: { id: '$id', name: '$name', total_assigned: '$total_assigned' } }
          }
        }
      ]);

      // 获取效率排行�?      const efficiencyRanking = await LaborAdvisor.find(
        region ? { region, is_active: true, total_completed: { $gt: 0 } } : { is_active: true, total_completed: { $gt: 0 } }
      ).sort({ avg_completion_time: 1 }).limit(10);

      // 获取本月新增咨询分配情况
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const monthlyAssignments = await ExpertConsultation.aggregate([
        { 
          $match: { 
            created_at: { $gte: currentMonth },
            assigned_advisor_id: { $ne: null }
          }
        },
        {
          $group: {
            _id: '$assigned_advisor_id',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // 获取顾问名称
      const advisorIds = monthlyAssignments.map(item => item._id);
      const advisorNames = await LaborAdvisor.find(
        { id: { $in: advisorIds } },
        { id: 1, name: 1 }
      );

      const advisorNameMap = {};
      advisorNames.forEach(advisor => {
        advisorNameMap[advisor.id] = advisor.name;
      });

      monthlyAssignments.forEach(item => {
        item.advisorName = advisorNameMap[item._id] || '未知顧問';
      });

      res.json({
        success: true,
        data: {
          overview: advisorStats.overview,
          regionDistribution: advisorStats.byRegion,
          workloadDistribution,
          efficiencyRanking,
          monthlyAssignments
        }
      });

    } catch (error) {
      logger.error('获取劳资顾问统计失败', {
        error: error.message,
        adminId: req.admin._id.toString()
      });

      res.status(500).json({
        success: false,
        message: '獲取顧問統計數據時發生錯�?,
        error: {
          code: 'ADVISOR_STATISTICS_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 手动指派顾问到咨询案�?   * @route PUT /api/v1/labor-advisors/assign/:consultationId
   */
  static async assignAdvisorToConsultation(req, res) {
    try {
      const { consultationId } = req.params;
      const { advisorId, notes } = req.body;

      if (!advisorId) {
        return res.status(400).json({
          success: false,
          message: '顧問ID為必填項',
          error: { code: 'MISSING_ADVISOR_ID' }
        });
      }

      // 查找咨询案件
      const consultation = await ExpertConsultation.findOne({ id: consultationId });
      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: '諮詢案件不存�?,
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      // 查找顾问
      const advisor = await LaborAdvisor.findOne({ id: advisorId });
      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: '勞資顧問不存�?,
          error: { code: 'ADVISOR_NOT_FOUND' }
        });
      }

      if (!advisor.is_active) {
        return res.status(400).json({
          success: false,
          message: '該顧問已停用，無法指派案�?,
          error: { code: 'ADVISOR_INACTIVE' }
        });
      }

      // 检查顾问是否可以接受新案件
      if (!advisor.canAcceptNewCase()) {
        return res.status(400).json({
          success: false,
          message: '該顧問工作負載已滿，無法接受新案�?,
          error: { code: 'ADVISOR_OVERLOADED' }
        });
      }

      // 指派顾问
      const oldAdvisorId = consultation.assigned_advisor_id;
      consultation.assigned_advisor_id = advisorId;
      
      // 如果有备注，添加指派信息
      const assignmentNote = `[指派] 指派給顧�? ${advisor.name}${notes ? ` - ${notes}` : ''}`;
      consultation.admin_notes = consultation.admin_notes 
        ? `${consultation.admin_notes}\n${assignmentNote}` 
        : assignmentNote;

      await consultation.save();

      // 更新顾问统计
      if (oldAdvisorId && oldAdvisorId !== advisorId) {
        // 如果之前有其他顾问，需要更新其统计
        const oldAdvisor = await LaborAdvisor.findOne({ id: oldAdvisorId });
        if (oldAdvisor) {
          oldAdvisor.total_assigned = Math.max(0, oldAdvisor.total_assigned - 1);
          await oldAdvisor.save();
        }
      }

      if (!oldAdvisorId || oldAdvisorId !== advisorId) {
        // 新指派，更新顾问统计
        await advisor.updateStats(false);
      }

      logger.info('顾问已指派到咨询案件', {
        consultationId: consultation.id,
        advisorId: advisor.id,
        advisorName: advisor.name,
        oldAdvisorId,
        adminId: req.admin._id.toString()
      });

      res.json({
        success: true,
        message: '顧問指派成功',
        data: {
          consultation: {
            id: consultation.id,
            assigned_advisor_id: consultation.assigned_advisor_id
          },
          advisor: {
            id: advisor.id,
            name: advisor.name,
            workload_status: advisor.workload_status
          }
        }
      });

    } catch (error) {
      logger.error('指派顾问失败', {
        error: error.message,
        consultationId: req.params.consultationId,
        adminId: req.admin._id.toString()
      });

      res.status(500).json({
        success: false,
        message: '指派顧問時發生錯�?,
        error: {
          code: 'ADVISOR_ASSIGNMENT_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 自动指派最佳顾问到咨询案件
   * @route POST /api/v1/labor-advisors/auto-assign/:consultationId
   */
  static async autoAssignAdvisor(req, res) {
    try {
      const { consultationId } = req.params;

      // 查找咨询案件
      const consultation = await ExpertConsultation.findOne({ id: consultationId });
      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: '諮詢案件不存�?,
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      if (consultation.assigned_advisor_id) {
        return res.status(400).json({
          success: false,
          message: '該案件已指派顧問',
          error: { code: 'ALREADY_ASSIGNED' }
        });
      }

      // 如果没有地区信息，无法自动指�?      if (!consultation.region) {
        return res.status(400).json({
          success: false,
          message: '該案件缺少地區信息，無法自動指�?,
          error: { code: 'MISSING_REGION_INFO' }
        });
      }

      // 查找最佳可用顾�?      const bestAdvisor = await LaborAdvisor.findBestAvailable(
        consultation.region,
        consultation.service_type
      );

      if (!bestAdvisor) {
        return res.status(404).json({
          success: false,
          message: `�?${consultation.region} 地區找不到擅�?${consultation.service_type} 的可用顧問`,
          error: { code: 'NO_AVAILABLE_ADVISOR' }
        });
      }

      // 自动指派
      consultation.assigned_advisor_id = bestAdvisor.id;
      consultation.admin_notes = consultation.admin_notes 
        ? `${consultation.admin_notes}\n[自動指派] 系統自動指派給顧�? ${bestAdvisor.name}` 
        : `[自動指派] 系統自動指派給顧�? ${bestAdvisor.name}`;

      await consultation.save();

      // 更新顾问统计
      await bestAdvisor.updateStats(false);

      logger.info('自动指派顾问成功', {
        consultationId: consultation.id,
        advisorId: bestAdvisor.id,
        advisorName: bestAdvisor.name,
        region: consultation.region,
        serviceType: consultation.service_type,
        adminId: req.admin._id.toString()
      });

      res.json({
        success: true,
        message: '自動指派成功',
        data: {
          consultation: {
            id: consultation.id,
            assigned_advisor_id: consultation.assigned_advisor_id
          },
          advisor: {
            id: bestAdvisor.id,
            name: bestAdvisor.name,
            region: bestAdvisor.region,
            specialties: bestAdvisor.specialties,
            workload_status: bestAdvisor.workload_status
          }
        }
      });

    } catch (error) {
      logger.error('自动指派顾问失败', {
        error: error.message,
        consultationId: req.params.consultationId,
        adminId: req.admin._id.toString()
      });

      res.status(500).json({
        success: false,
        message: '自動指派時發生錯�?,
        error: {
          code: 'AUTO_ASSIGNMENT_ERROR',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取咨询案件的指派历�?   * @route GET /api/v1/labor-advisors/assignment-history/:consultationId
   */
  static async getAssignmentHistory(req, res) {
    try {
      const { consultationId } = req.params;

      // 查找咨询案件
      const consultation = await ExpertConsultation.findOne({ id: consultationId });
      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: '諮詢案件不存�?,
          error: { code: 'CONSULTATION_NOT_FOUND' }
        });
      }

      // 构建指派历史信息
      const history = {
        consultationId: consultation.id,
        currentAdvisor: null,
        assignmentHistory: [],
        statusChanges: []
      };

      // 获取当前指派的顾问信�?      if (consultation.assigned_advisor_id) {
        const currentAdvisor = await LaborAdvisor.findOne({ id: consultation.assigned_advisor_id });
        if (currentAdvisor) {
          history.currentAdvisor = {
            id: currentAdvisor.id,
            name: currentAdvisor.name,
            region: currentAdvisor.region,
            specialties: currentAdvisor.specialties,
            workload_status: currentAdvisor.workload_status
          };
        }
      }

      // 解析管理员备注中的指派历�?      if (consultation.admin_notes) {
        const notes = consultation.admin_notes.split('\n');
        notes.forEach(note => {
          const trimmedNote = note.trim();
          if (trimmedNote.includes('[指派]') || trimmedNote.includes('[自動指派]')) {
            history.assignmentHistory.push({
              timestamp: consultation.updated_at,
              action: trimmedNote.includes('[自動指派]') ? 'auto_assign' : 'manual_assign',
              note: trimmedNote
            });
          }
        });
      }

      // 获取状态变化历�?      const statusMapping = {
        'pending': '待處�?,
        'processing': '處理�?, 
        'completed': '已完�?,
        'cancelled': '已取�?
      };

      history.statusChanges.push({
        status: consultation.status,
        statusText: statusMapping[consultation.status] || consultation.status,
        timestamp: consultation.updated_at,
        assignedAdvisor: consultation.assigned_advisor_id
      });

      logger.info('获取指派历史成功', {
        consultationId: consultation.id,
        hasCurrentAdvisor: !!consultation.assigned_advisor_id,
        historyCount: history.assignmentHistory.length,
        adminId: req.admin._id.toString()
      });

      res.json({
        success: true,
        message: '指派歷史獲取成功',
        data: history
      });

    } catch (error) {
      logger.error('获取指派历史失败', {
        error: error.message,
        consultationId: req.params.consultationId,
        adminId: req.admin?._id?.toString()
      });

      res.status(500).json({
        success: false,
        message: '獲取指派歷史時發生錯�?,
        error: {
          code: 'ASSIGNMENT_HISTORY_ERROR',
          details: error.message
        }
      });
    }
  }
}

export default LaborAdvisorController; 
