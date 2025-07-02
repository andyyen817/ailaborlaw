/**
 * 劳资顾问管理控制器
 * 提供劳资顾问管理功能
 */

// 临时存储劳资顾问数据
const advisors = new Map();

/**
 * 生成顾问ID
 */
function generateAdvisorId() {
  return 'advisor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 专业领域映射
 */
const SPECIALTY_TYPES = {
  'labor_contract': '勞動合同',
  'compensation': '薪資福利', 
  'termination': '終止勞動關係',
  'workplace_safety': '工作場所安全',
  'discrimination': '歧視問題',
  'other': '其他'
};

/**
 * 台湾地区列表
 */
const TAIWAN_REGIONS = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '新竹市', '新竹縣', '彰化縣', '雲林縣', '嘉義市', '嘉義縣',
  '屏東縣', '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣',
  '連江縣', '其他'
];

/**
 * 计算工作负载状态
 */
function calculateWorkloadStatus(totalAssigned) {
  if (totalAssigned <= 5) return 'light';
  if (totalAssigned <= 15) return 'normal';
  return 'heavy';
}

const laborAdvisorController = {
  /**
   * 获取顾问列表
   */
  async getAdvisorList(req, res) {
    try {
      const { page = 1, limit = 10, region, specialty, is_active, search } = req.query;

      let filteredAdvisors = Array.from(advisors.values());

      // 筛选
      if (region && region !== '') {
        filteredAdvisors = filteredAdvisors.filter(a => a.region === region);
      }

      if (specialty && specialty !== '') {
        filteredAdvisors = filteredAdvisors.filter(a => 
          a.specialties.includes(specialty)
        );
      }

      if (is_active !== undefined) {
        const isActiveBoolean = is_active === 'true';
        filteredAdvisors = filteredAdvisors.filter(a => a.is_active === isActiveBoolean);
      }

      if (search && search !== '') {
        const searchLower = search.toLowerCase();
        filteredAdvisors = filteredAdvisors.filter(a => 
          a.name.toLowerCase().includes(searchLower) ||
          a.phone.includes(search) ||
          (a.email && a.email.toLowerCase().includes(searchLower)) ||
          (a.line_id && a.line_id.toLowerCase().includes(searchLower))
        );
      }

      // 排序
      filteredAdvisors.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // 分页
      const totalItems = filteredAdvisors.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const paginatedAdvisors = filteredAdvisors.slice(startIndex, startIndex + parseInt(limit));

      res.json({
        success: true,
        data: {
          advisors: paginatedAdvisors,
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
      console.error('获取顾问列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取顾问列表失败',
        error: { code: 'ADVISOR_LIST_ERROR' }
      });
    }
  },

  /**
   * 创建新顾问
   */
  async createAdvisor(req, res) {
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

      // 基本验证
      if (!name || !phone || !email || !region || !specialties) {
        return res.status(400).json({
          success: false,
          message: '缺少必填字段',
          error: { code: 'MISSING_REQUIRED_FIELDS' }
        });
      }

      // 检查邮箱唯一性
      const existingAdvisor = Array.from(advisors.values()).find(a => a.email === email);
      if (existingAdvisor) {
        return res.status(409).json({
          success: false,
          message: '邮箱已存在',
          error: { code: 'EMAIL_EXISTS' }
        });
      }

      // 验证地区
      if (!TAIWAN_REGIONS.includes(region)) {
        return res.status(400).json({
          success: false,
          message: '无效的地区',
          error: { code: 'INVALID_REGION' }
        });
      }

      // 验证专业领域
      const validSpecialties = Array.isArray(specialties) ? specialties : [specialties];
      const invalidSpecialties = validSpecialties.filter(s => !Object.keys(SPECIALTY_TYPES).includes(s));
      if (invalidSpecialties.length > 0) {
        return res.status(400).json({
          success: false,
          message: `无效的专业领域: ${invalidSpecialties.join(', ')}`,
          error: { code: 'INVALID_SPECIALTIES' }
        });
      }

      const advisorId = generateAdvisorId();
      const now = new Date();

      const advisor = {
        _id: advisorId,
        name,
        phone,
        email,
        line_id: lineId || '',
        region,
        specialties: validSpecialties,
        is_active: true,
        total_assigned: 0,
        total_completed: 0,
        avg_completion_time: 0,
        workload_status: 'light',
        notes: notes || '',
        id: advisorId,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };

      advisors.set(advisorId, advisor);

      res.json({
        success: true,
        message: `✅ 顧問創建成功！顧問ID: ${advisorId}`,
        data: advisor
      });
    } catch (error) {
      console.error('创建顾问失败:', error);
      res.status(500).json({
        success: false,
        message: '创建顾问失败',
        error: { code: 'ADVISOR_CREATE_ERROR' }
      });
    }
  },

  /**
   * 获取顾问详情
   */
  async getAdvisorDetails(req, res) {
    try {
      const { id } = req.params;
      const advisor = advisors.get(id);

      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: '顾问不存在',
          error: { code: 'ADVISOR_NOT_FOUND' }
        });
      }

      // 模拟咨询统计和最近咨询（实际应该从consultation表查询）
      const consultationStats = [];
      const recentConsultations = [];

      res.json({
        success: true,
        data: {
          advisor,
          consultationStats,
          recentConsultations
        }
      });
    } catch (error) {
      console.error('获取顾问详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取顾问详情失败',
        error: { code: 'ADVISOR_DETAILS_ERROR' }
      });
    }
  },

  /**
   * 更新顾问信息
   */
  async updateAdvisor(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const advisor = advisors.get(id);

      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: '顾问不存在',
          error: { code: 'ADVISOR_NOT_FOUND' }
        });
      }

      // 如果更新邮箱，检查唯一性
      if (updateData.email && updateData.email !== advisor.email) {
        const existingAdvisor = Array.from(advisors.values()).find(a => a.email === updateData.email && a.id !== id);
        if (existingAdvisor) {
          return res.status(409).json({
            success: false,
            message: '邮箱已存在',
            error: { code: 'EMAIL_EXISTS' }
          });
        }
      }

      // 验证地区
      if (updateData.region && !TAIWAN_REGIONS.includes(updateData.region)) {
        return res.status(400).json({
          success: false,
          message: '无效的地区',
          error: { code: 'INVALID_REGION' }
        });
      }

      // 验证专业领域
      if (updateData.specialties) {
        const validSpecialties = Array.isArray(updateData.specialties) ? updateData.specialties : [updateData.specialties];
        const invalidSpecialties = validSpecialties.filter(s => !Object.keys(SPECIALTY_TYPES).includes(s));
        if (invalidSpecialties.length > 0) {
          return res.status(400).json({
            success: false,
            message: `无效的专业领域: ${invalidSpecialties.join(', ')}`,
            error: { code: 'INVALID_SPECIALTIES' }
          });
        }
        updateData.specialties = validSpecialties;
      }

      // 更新顾问信息
      const updatedAdvisor = {
        ...advisor,
        ...updateData,
        updated_at: new Date().toISOString()
      };

      advisors.set(id, updatedAdvisor);

      res.json({
        success: true,
        message: '顾问信息已更新',
        data: updatedAdvisor
      });
    } catch (error) {
      console.error('更新顾问信息失败:', error);
      res.status(500).json({
        success: false,
        message: '更新顾问信息失败',
        error: { code: 'ADVISOR_UPDATE_ERROR' }
      });
    }
  },

  /**
   * 切换顾问状态
   */
  async toggleAdvisorStatus(req, res) {
    try {
      const { id } = req.params;
      const advisor = advisors.get(id);

      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: '顾问不存在',
          error: { code: 'ADVISOR_NOT_FOUND' }
        });
      }

      advisor.is_active = !advisor.is_active;
      advisor.updated_at = new Date().toISOString();

      advisors.set(id, advisor);

      res.json({
        success: true,
        message: advisor.is_active ? '顧問已啟用' : '顧問已停用',
        data: {
          id: advisor.id,
          name: advisor.name,
          is_active: advisor.is_active
        }
      });
    } catch (error) {
      console.error('切换顾问状态失败:', error);
      res.status(500).json({
        success: false,
        message: '切换顾问状态失败',
        error: { code: 'ADVISOR_TOGGLE_ERROR' }
      });
    }
  },

  /**
   * 删除顾问
   */
  async deleteAdvisor(req, res) {
    try {
      const { id } = req.params;
      
      if (!advisors.has(id)) {
        return res.status(404).json({
          success: false,
          message: '顾问不存在',
          error: { code: 'ADVISOR_NOT_FOUND' }
        });
      }

      advisors.delete(id);

      res.json({
        success: true,
        message: '顧問已刪除'
      });
    } catch (error) {
      console.error('删除顾问失败:', error);
      res.status(500).json({
        success: false,
        message: '删除顾问失败',
        error: { code: 'ADVISOR_DELETE_ERROR' }
      });
    }
  },

  /**
   * 搜索可用顾问
   */
  async searchAvailableAdvisors(req, res) {
    try {
      const { region, specialty, available = 'true' } = req.query;

      let filteredAdvisors = Array.from(advisors.values());

      // 只搜索激活的顾问
      if (available === 'true') {
        filteredAdvisors = filteredAdvisors.filter(a => a.is_active);
      }

      // 按地区筛选
      if (region && region !== '') {
        filteredAdvisors = filteredAdvisors.filter(a => a.region === region);
      }

      // 按专业领域筛选
      if (specialty && specialty !== '') {
        filteredAdvisors = filteredAdvisors.filter(a => 
          a.specialties.includes(specialty)
        );
      }

      // 按工作负载排序（轻负载优先）
      filteredAdvisors.sort((a, b) => {
        const workloadOrder = { 'light': 0, 'normal': 1, 'heavy': 2 };
        return workloadOrder[a.workload_status] - workloadOrder[b.workload_status];
      });

      res.json({
        success: true,
        data: {
          advisors: filteredAdvisors,
          total: filteredAdvisors.length,
          searchCriteria: {
            region: region || '',
            specialty: specialty || '',
            available
          }
        }
      });
    } catch (error) {
      console.error('搜索可用顾问失败:', error);
      res.status(500).json({
        success: false,
        message: '搜索可用顾问失败',
        error: { code: 'ADVISOR_SEARCH_ERROR' }
      });
    }
  },

  /**
   * 获取顾问统计数据
   */
  async getAdvisorStatistics(req, res) {
    try {
      const allAdvisors = Array.from(advisors.values());

      // 总体统计
      const overview = {
        _id: null,
        total: allAdvisors.length,
        active: allAdvisors.filter(a => a.is_active).length,
        inactive: allAdvisors.filter(a => !a.is_active).length,
        light_workload: allAdvisors.filter(a => a.workload_status === 'light').length,
        normal_workload: allAdvisors.filter(a => a.workload_status === 'normal').length,
        heavy_workload: allAdvisors.filter(a => a.workload_status === 'heavy').length,
        total_assigned: allAdvisors.reduce((sum, a) => sum + a.total_assigned, 0),
        total_completed: allAdvisors.reduce((sum, a) => sum + a.total_completed, 0),
        avg_completion_time: allAdvisors.length > 0 ? 
          allAdvisors.reduce((sum, a) => sum + a.avg_completion_time, 0) / allAdvisors.length : 0
      };

      // 地区分布
      const regionDistribution = TAIWAN_REGIONS.map(region => {
        const regionAdvisors = allAdvisors.filter(a => a.region === region);
        return {
          _id: region,
          count: regionAdvisors.length,
          avg_completion_time: regionAdvisors.length > 0 ? 
            regionAdvisors.reduce((sum, a) => sum + a.avg_completion_time, 0) / regionAdvisors.length : 0,
          total_completed: regionAdvisors.reduce((sum, a) => sum + a.total_completed, 0)
        };
      }).filter(item => item.count > 0);

      // 工作负载分布
      const workloadDistribution = ['light', 'normal', 'heavy'].map(workload => {
        const workloadAdvisors = allAdvisors.filter(a => a.workload_status === workload);
        return {
          _id: workload,
          count: workloadAdvisors.length,
          advisors: workloadAdvisors.map(a => ({
            id: a.id,
            name: a.name,
            total_assigned: a.total_assigned
          }))
        };
      }).filter(item => item.count > 0);

      // 效率排名（模拟数据）
      const efficiencyRanking = [];

      // 月度指派情况（模拟数据）
      const monthlyAssignments = [];

      res.json({
        success: true,
        data: {
          overview,
          regionDistribution,
          workloadDistribution,
          efficiencyRanking,
          monthlyAssignments
        }
      });
    } catch (error) {
      console.error('获取顾问统计数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取顾问统计数据失败',
        error: { code: 'ADVISOR_STATISTICS_ERROR' }
      });
    }
  },

  /**
   * 手动指派顾问
   */
  async assignAdvisorManually(req, res) {
    try {
      const { consultationId } = req.params;
      const { advisorId } = req.body;

      if (!advisorId) {
        return res.status(400).json({
          success: false,
          message: '缺少顾问ID',
          error: { code: 'MISSING_ADVISOR_ID' }
        });
      }

      const advisor = advisors.get(advisorId);
      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: '顾问不存在',
          error: { code: 'ADVISOR_NOT_FOUND' }
        });
      }

      if (!advisor.is_active) {
        return res.status(400).json({
          success: false,
          message: '顾问未激活',
          error: { code: 'ADVISOR_INACTIVE' }
        });
      }

      // 这里应该更新consultation表，现在模拟成功
      // 在实际实现中，需要从expert-consultation controller中获取consultation数据
      
      // 更新顾问的指派统计
      advisor.total_assigned += 1;
      advisor.workload_status = calculateWorkloadStatus(advisor.total_assigned);
      advisor.updated_at = new Date().toISOString();
      advisors.set(advisorId, advisor);

      res.json({
        success: true,
        message: '顧問指派成功',
        data: {
          consultation: {
            id: consultationId,
            assigned_advisor_id: advisorId
          },
          advisor: {
            id: advisor.id,
            name: advisor.name,
            workload_status: advisor.workload_status
          }
        }
      });
    } catch (error) {
      console.error('手动指派顾问失败:', error);
      res.status(500).json({
        success: false,
        message: '手动指派顾问失败',
        error: { code: 'ADVISOR_ASSIGN_ERROR' }
      });
    }
  },

  /**
   * 自动指派最佳顾问
   */
  async autoAssignBestAdvisor(req, res) {
    try {
      const { consultationId } = req.params;

      // 这里需要获取consultation的详情来匹配最佳顾问
      // 现在模拟没有地区信息的情况
      res.status(400).json({
        success: false,
        message: '該案件缺少地區信息，無法自動指派',
        error: { code: 'MISSING_REGION_INFO' }
      });
    } catch (error) {
      console.error('自动指派顾问失败:', error);
      res.status(500).json({
        success: false,
        message: '自动指派顾问失败',
        error: { code: 'ADVISOR_AUTO_ASSIGN_ERROR' }
      });
    }
  },

  /**
   * 获取指派历史
   */
  async getAssignmentHistory(req, res) {
    try {
      const { consultationId } = req.params;

      // 模拟指派历史数据
      const assignmentHistory = [];
      const statusChanges = [
        {
          status: 'pending',
          statusText: '待處理',
          timestamp: new Date().toISOString(),
          assignedAdvisor: null
        }
      ];

      res.json({
        success: true,
        message: '指派歷史獲取成功',
        data: {
          consultationId,
          currentAdvisor: null,
          assignmentHistory,
          statusChanges
        }
      });
    } catch (error) {
      console.error('获取指派历史失败:', error);
      res.status(500).json({
        success: false,
        message: '获取指派历史失败',
        error: { code: 'ASSIGNMENT_HISTORY_ERROR' }
      });
    }
  }
};

module.exports = laborAdvisorController; 