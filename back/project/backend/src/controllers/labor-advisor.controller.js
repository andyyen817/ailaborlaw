const LaborAdvisor = require('../models/labor_advisor.model');
const ExpertConsultation = require('../models/expert_consultation.model');
const logger = require('../utils/logger');

/**
 * 創建勞資顧問
 * @route POST /api/v1/labor-advisors
 */
const createLaborAdvisor = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      line_id,
      region,
      specialties,
      notes
    } = req.body;

    // 檢查是否已存在相同郵箱的顧問
    const existingAdvisor = await LaborAdvisor.findOne({ email });
    if (existingAdvisor) {
      return res.status(409).json({
        success: false,
        message: '該郵箱已被使用',
        error: { code: 'EMAIL_ALREADY_EXISTS' }
      });
    }

    // 創建新顧問
    const advisor = new LaborAdvisor({
      name,
      phone,
      email,
      line_id,
      region,
      specialties,
      notes,
      is_active: true,
      created_by_admin: req.admin ? req.admin._id : null
    });

    await advisor.save();

    logger.info('創建勞資顧問成功', {
      advisorId: advisor._id.toString(),
      adminId: req.admin ? req.admin._id.toString() : 'unknown'
    });

    res.status(201).json({
      success: true,
      message: '勞資顧問創建成功',
      data: { advisor }
    });

  } catch (error) {
    logger.error('創建勞資顧問失敗', {
      error: error.message,
      adminId: req.admin ? req.admin._id.toString() : 'unknown'
    });

    res.status(500).json({
      success: false,
      message: '創建顧問時發生錯誤',
      error: {
        code: 'ADVISOR_CREATE_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * 獲取勞資顧問列表
 * @route GET /api/v1/labor-advisors
 */
const getLaborAdvisors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      region,
      specialty,
      status,
      search
    } = req.query;

    // 構建查詢條件
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

    // 分頁查詢
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const advisors = await LaborAdvisor.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // 獲取總數
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
    logger.error('獲取勞資顧問列表失敗', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: '獲取顧問列表時發生錯誤',
      error: {
        code: 'ADVISOR_LIST_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * 更新勞資顧問
 * @route PUT /api/v1/labor-advisors/:id
 */
const updateLaborAdvisor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const advisor = await LaborAdvisor.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: '勞資顧問不存在',
        error: { code: 'ADVISOR_NOT_FOUND' }
      });
    }

    logger.info('更新勞資顧問成功', {
      advisorId: id,
      adminId: req.admin ? req.admin._id.toString() : 'unknown'
    });

    res.json({
      success: true,
      message: '顧問信息更新成功',
      data: { advisor }
    });

  } catch (error) {
    logger.error('更新勞資顧問失敗', {
      error: error.message,
      advisorId: req.params.id,
      adminId: req.admin ? req.admin._id.toString() : 'unknown'
    });

    res.status(500).json({
      success: false,
      message: '更新顧問時發生錯誤',
      error: {
        code: 'ADVISOR_UPDATE_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * 刪除勞資顧問
 * @route DELETE /api/v1/labor-advisors/:id
 */
const deleteLaborAdvisor = async (req, res) => {
  try {
    const { id } = req.params;

    const advisor = await LaborAdvisor.findById(id);
    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: '勞資顧問不存在',
        error: { code: 'ADVISOR_NOT_FOUND' }
      });
    }

    // 軟刪除：設置為非活躍狀態
    advisor.is_active = false;
    advisor.deleted_at = new Date();
    await advisor.save();

    logger.info('刪除勞資顧問成功', {
      advisorId: id,
      adminId: req.admin ? req.admin._id.toString() : 'unknown'
    });

    res.json({
      success: true,
      message: '顧問已被停用'
    });

  } catch (error) {
    logger.error('刪除勞資顧問失敗', {
      error: error.message,
      advisorId: req.params.id,
      adminId: req.admin ? req.admin._id.toString() : 'unknown'
    });

    res.status(500).json({
      success: false,
      message: '刪除顧問時發生錯誤',
      error: {
        code: 'ADVISOR_DELETE_ERROR',
        details: error.message
      }
    });
  }
};

module.exports = {
  createLaborAdvisor,
  getLaborAdvisors,
  updateLaborAdvisor,
  deleteLaborAdvisor
}; 