const Conversation = require('../models/conversation.model.js');
const Message = require('../models/message.model.js');
const User = require('../models/user.model.js');
const n8nService = require('../services/n8n.service.js');
const logger = require('../utils/logger.js');

/**
 * Create a new chat session
 * POST /api/v1/chat/sessions
 */
const createSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    logger.info(`User creating new session`, { userId, title });

    // Create new conversation
    const conversation = new Conversation({
      userId,
      title: title || 'New Labor Law Consultation'
    });

    await conversation.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: {
        sessionId: conversation.sessionId,
        title: conversation.title,
        status: conversation.status,
        messageCount: conversation.messageCount,
        createdAt: conversation.createdAt,
        lastMessageAt: conversation.lastMessageAt
      }
    });

    logger.info(`Session created successfully`, { 
      userId, 
      sessionId: conversation.sessionId,
      title: conversation.title 
    });

  } catch (error) {
    logger.error(`Create session failed: ${error.message}`, { 
      userId: req.user?.id, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_007',
        message: 'Failed to create session',
        details: error.message
      }
    });
  }
};

/**
 * Get user session list
 * GET /api/v1/chat/sessions
 */
const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      search = ''
    } = req.query;

    // Parameter validation
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    logger.info(`Getting user session list`, { userId, page: pageNum, limit: limitNum, search });

    // Build query conditions
    const query = { userId };
    if (search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    // Execute query
    const [sessions, totalCount] = await Promise.all([
      Conversation.find(query)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('sessionId title status messageCount lastMessageAt createdAt duration'),
      Conversation.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalSessions: totalCount,
          hasNextPage,
          hasPrevPage
        }
      }
    });

    logger.info(`Get session list success`, { 
      userId, 
      sessionCount: sessions.length, 
      totalCount 
    });

  } catch (error) {
    logger.error(`Get session list failed: ${error.message}`, { 
      userId: req.user?.id, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_008',
        message: 'Failed to get session list',
        details: error.message
      }
    });
  }
};

/**
 * Get session detail and messages
 * GET /api/v1/chat/sessions/:sessionId
 */
const getSessionDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    logger.info(`Getting session detail`, { userId, sessionId });

    // Validate session permission
    const conversation = await Conversation.findOne({ sessionId, userId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_001',
          message: 'Session not found'
        }
      });
    }

    // Get session messages
    const messages = await Message.getSessionMessages(sessionId, { limit: 100 });

    res.json({
      success: true,
      data: {
        session: {
          sessionId: conversation.sessionId,
          title: conversation.title,
          status: conversation.status,
          messageCount: conversation.messageCount,
          createdAt: conversation.createdAt,
          lastMessageAt: conversation.lastMessageAt,
          duration: conversation.duration
        },
        messages
      }
    });

    logger.info(`Get session detail success`, { 
      userId, 
      sessionId, 
      messageCount: messages.length 
    });

  } catch (error) {
    logger.error(`Get session detail failed: ${error.message}`, { 
      userId: req.user?.id, 
      sessionId: req.params?.sessionId, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_009',
        message: 'Failed to get session detail',
        details: error.message
      }
    });
  }
};

/**
 * Update session title
 * PUT /api/v1/chat/sessions/:sessionId
 */
const updateSessionTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { title } = req.body;

    logger.info(`Updating session title`, { userId, sessionId, newTitle: title });

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHAT_004',
          message: 'Invalid title format'
        }
      });
    }

    // Find and update session
    const conversation = await Conversation.findOneAndUpdate(
      { sessionId, userId },
      { title: title.trim() },
      { new: true, runValidators: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_001',
          message: 'Session not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Session title updated successfully',
      data: {
        sessionId: conversation.sessionId,
        title: conversation.title
      }
    });

    logger.info(`Session title updated successfully`, { 
      userId, 
      sessionId, 
      newTitle: conversation.title 
    });

  } catch (error) {
    logger.error(`Update session title failed: ${error.message}`, { 
      userId: req.user?.id, 
      sessionId: req.params?.sessionId, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_010',
        message: 'Failed to update session title',
        details: error.message
      }
    });
  }
};

/**
 * Delete a session
 * DELETE /api/v1/chat/sessions/:sessionId
 */
const deleteSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    logger.info(`Deleting session`, { userId, sessionId });

    // Soft delete conversation
    const conversation = await Conversation.findOneAndUpdate(
      { sessionId, userId, status: { $ne: 'deleted' } },
      { 
        status: 'deleted',
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_001',
          message: 'Session not found or already deleted'
        }
      });
    }

    // Soft delete associated messages
    await Message.updateMany(
      { sessionId },
      { 
        status: 'deleted',
        deletedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });

    logger.info(`Session deleted successfully`, { userId, sessionId });

  } catch (error) {
    logger.error(`Delete session failed: ${error.message}`, { 
      userId: req.user?.id, 
      sessionId: req.params?.sessionId, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_011',
        message: 'Failed to delete session',
        details: error.message
      }
    });
  }
};

/**
 * Send message and get AI response
 * POST /api/v1/chat/sessions/:sessionId/messages
 */
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { content, messageType = 'text' } = req.body;

    logger.info(`Sending message`, { userId, sessionId, messageType });

    // Validate input
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHAT_005',
          message: 'Message content cannot be empty'
        }
      });
    }

    // Verify conversation exists and belongs to user
    const conversation = await Conversation.findOne({ 
      sessionId, 
      userId,
      status: { $ne: 'deleted' }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_001',
          message: 'Session not found'
        }
      });
    }

    // Check user query limit
    const user = await User.findById(userId);
    if (!user || user.remainingQueries <= 0) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'CHAT_002',
          message: 'Insufficient consultation queries remaining'
        }
      });
    }

    // Create user message
    const userMessage = new Message({
      sessionId,
      userId,
      content: content.trim(),
      messageType,
      sender: 'user'
    });

    await userMessage.save();

    // Get AI response
    let aiResponse;
    try {
      aiResponse = await n8nService.getAIResponse({
        sessionId,
        userMessage: content.trim(),
        userId
      });
    } catch (aiError) {
      logger.error(`AI service error: ${aiError.message}`, { userId, sessionId });
      
      // Create error response message
      const errorMessage = new Message({
        sessionId,
        userId,
        content: 'Sorry, our AI consultant is temporarily unavailable. Please try again later.',
        messageType: 'error',
        sender: 'assistant'
      });
      
      await errorMessage.save();
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'CHAT_006',
          message: 'AI service temporarily unavailable',
          details: 'Please try again later'
        }
      });
    }

    // Create AI response message
    const aiMessage = new Message({
      sessionId,
      userId,
      content: aiResponse.content || 'Sorry, I could not generate a response.',
      messageType: 'text',
      sender: 'assistant',
      metadata: {
        responseTime: aiResponse.responseTime || 0,
        confidence: aiResponse.confidence || 0
      }
    });

    await aiMessage.save();

    // Update conversation
    await conversation.updateLastActivity();
    await conversation.incrementMessageCount(2); // User + AI messages

    // Decrease user query count
    await user.decreaseRemainingQueries();

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        userMessage: {
          id: userMessage._id,
          content: userMessage.content,
          sender: userMessage.sender,
          timestamp: userMessage.createdAt
        },
        aiMessage: {
          id: aiMessage._id,
          content: aiMessage.content,
          sender: aiMessage.sender,
          timestamp: aiMessage.createdAt
        },
        remainingQueries: user.remainingQueries - 1
      }
    });

    logger.info(`Message exchange completed`, { 
      userId, 
      sessionId,
      remainingQueries: user.remainingQueries - 1
    });

  } catch (error) {
    logger.error(`Send message failed: ${error.message}`, { 
      userId: req.user?.id, 
      sessionId: req.params?.sessionId, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_012',
        message: 'Failed to send message',
        details: error.message
      }
    });
  }
};

/**
 * Get messages for a session
 * GET /api/v1/chat/sessions/:sessionId/messages
 */
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const {
      page = 1,
      limit = 50,
      before = null
    } = req.query;

    logger.info(`Getting messages`, { userId, sessionId, page, limit });

    // Verify conversation permission
    const conversation = await Conversation.findOne({ 
      sessionId, 
      userId,
      status: { $ne: 'deleted' }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_001',
          message: 'Session not found'
        }
      });
    }

    // Get messages with pagination
    const options = {
      page: Math.max(1, parseInt(page)),
      limit: Math.min(100, Math.max(1, parseInt(limit))),
      before: before ? new Date(before) : null
    };

    const messages = await Message.getSessionMessages(sessionId, options);

    res.json({
      success: true,
      data: {
        messages,
        sessionId,
        hasMore: messages.length === options.limit
      }
    });

    logger.info(`Get messages success`, { 
      userId, 
      sessionId, 
      messageCount: messages.length 
    });

  } catch (error) {
    logger.error(`Get messages failed: ${error.message}`, { 
      userId: req.user?.id, 
      sessionId: req.params?.sessionId, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_013',
        message: 'Failed to get messages',
        details: error.message
      }
    });
  }
};

module.exports = {
  createSession,
  getUserSessions,
  getSessionDetail,
  updateSessionTitle,
  deleteSession,
  sendMessage,
  getMessages
}; 