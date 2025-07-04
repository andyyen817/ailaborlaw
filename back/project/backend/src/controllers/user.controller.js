const User = require('../models/user.model.js');
const { AppError, errorUtils } = require('../utils/error.js');
const logger = require('../utils/logger.js');

/**
 * Get current user profile
 * @route GET /api/v1/users/me
 * @access Private
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: 'Unable to find current user data'
        }
      });
    }

    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      phoneNumber: user.profile?.phone || '',
      companyName: user.profile?.company || '',
      industry: user.profile?.industry || '',
      position: user.profile?.position || '',
      remainingQueries: user.remainingQueries,
      totalConsultations: user.totalConsultations,
      status: user.status,
      registrationDate: user.registrationDate
    };

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      success: true,
      data: {
        user: responseData
      }
    });
  } catch (error) {
    logger.error(`Get user data failed: ${error.message}`, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Error occurred while getting user data',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Update current user profile
 * @route PUT /api/v1/users/me
 * @access Private
 */
const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, company, industry, position, occupation } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates['profile.phone'] = phone;
    if (company) updates['profile.company'] = company;
    if (industry) updates['profile.industry'] = industry;
    
    const finalPosition = position || occupation;
    if (finalPosition) updates['profile.position'] = finalPosition;
    
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists',
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            details: `Email ${email} is already registered.`
          }
        });
      }
      updates.email = email.toLowerCase();
    }

    const userBeforeUpdate = await User.findById(userId);
    if (!userBeforeUpdate) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: 'Cannot update non-existent user'
        }
      });
    }
    
    logger.info(`User data before update: ${JSON.stringify({
      id: userBeforeUpdate._id,
      name: userBeforeUpdate.name,
      email: userBeforeUpdate.email,
      profile: userBeforeUpdate.profile
    })}`);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    logger.info(`User data after update: ${JSON.stringify({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profile: updatedUser.profile
    })}`);

    const responseData = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      userType: updatedUser.userType,
      phoneNumber: updatedUser.profile?.phone || '',
      companyName: updatedUser.profile?.company || '',
      industry: updatedUser.profile?.industry || '',
      position: updatedUser.profile?.position || '',
      status: updatedUser.status
    };

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      success: true,
      message: 'User data updated successfully',
      data: {
        user: responseData
      }
    });
  } catch (error) {
    logger.error(`Update user data failed: ${error.message}`, { userId: req.user?.id, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error occurred while updating user data',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Update current user password
 * @route PUT /api/v1/users/me/password
 * @access Private
 */
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: 'Cannot find current user'
        }
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          details: 'Cannot verify current password'
        }
      });
    }

    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error(`Update password failed: ${error.message}`, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Error occurred while updating password',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Delete current user (self-deactivation)
 * @route DELETE /api/v1/users/me
 * @access Private
 */
const deleteCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          status: 'deleted',
          deletedAt: new Date()
        } 
      },
      { new: true }
    );
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: 'Cannot find user to delete'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'User account deactivated successfully'
    });
  } catch (error) {
    logger.error(`Delete user failed: ${error.message}`, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Error occurred while deleting user',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Get current user remaining queries
 * @route GET /api/v1/users/me/queries
 * @access Private
 */
const getRemainingQueries = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('remainingQueries totalConsultations');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: 'Cannot find current user'
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        remainingQueries: user.remainingQueries,
        totalConsultations: user.totalConsultations
      }
    });
  } catch (error) {
    logger.error(`Get remaining queries failed: ${error.message}`, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Error occurred while getting query count',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Decrease user query count
 * @route POST /api/v1/users/me/queries/decrease
 * @access Private
 */
const decreaseQuery = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: 'Cannot find current user'
        }
      });
    }
    
    if (user.remainingQueries <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient queries',
        error: {
          code: 'INSUFFICIENT_QUERIES',
          details: 'No remaining consultation queries available'
        }
      });
    }
    
    const success = await user.decreaseRemainingQueries();
    
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to decrease query count',
        error: {
          code: 'DECREASE_QUERY_FAILED',
          details: 'Unable to decrease query count, may be already depleted'
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Successfully decreased one query count',
      data: {
        remainingQueries: user.remainingQueries,
        totalConsultations: user.totalConsultations
      }
    });
  } catch (error) {
    logger.error(`Decrease query count failed: ${error.message}`, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Error occurred while decreasing query count',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Increase user query count (Admin only)
 * @param {Object} req - Express request object 
 * @param {Object} res - Express response object
 */
const increaseQueries = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    
    const adminInfo = req.admin || req.user;
    
    logger.info(`Admin attempting to increase user queries: Admin ID ${adminInfo.id || adminInfo._id}, Target User ID ${userId}`);
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid increase amount',
        error: {
          code: 'INVALID_AMOUNT',
          details: 'Increase amount must be a positive number'
        }
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: 'Cannot find specified user'
        }
      });
    }
    
    const newRemainingQueries = await user.increaseRemainingQueries(amount);
    
    logger.info(`Admin successfully increased user queries: Admin ID ${adminInfo.id || adminInfo._id}, Target User ID ${userId}, Amount ${amount}`);
    
    res.status(200).json({
      success: true,
      message: `Successfully increased ${amount} query counts`,
      data: {
        userId: user._id,
        remainingQueries: newRemainingQueries,
        totalConsultations: user.totalConsultations
      }
    });
  } catch (error) {
    const adminInfo = req.admin || req.user;
    logger.error(`Increase query count failed: ${error.message}`, { 
      userId: req.params.userId,
      adminId: adminInfo?.id || adminInfo?._id || 'unknown'
    });
    res.status(500).json({
      success: false,
      message: 'Error occurred while increasing query count',
      error: {
        code: 'SERVER_ERROR',
        details: error.message
      }
    });
  }
}; 

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  updatePassword,
  deleteCurrentUser,
  getRemainingQueries,
  decreaseQuery,
  increaseQueries
}; 