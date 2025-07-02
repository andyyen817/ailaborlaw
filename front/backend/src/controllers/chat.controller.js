/**
 * 聊天控制器
 * 提供AI聊天功能的基本实现
 */

// 临时存储聊天会话数据
const sessions = new Map();
const messages = new Map();

/**
 * 生成会话ID
 */
function generateSessionId() {
  return 'conv_' + Math.random().toString(36).substr(2, 20);
}

/**
 * 生成消息ID
 */
function generateMessageId() {
  return 'msg_' + Math.random().toString(36).substr(2, 16);
}

/**
 * 模拟AI响应
 */
function generateAIResponse(userMessage) {
  const responses = [
    '感謝您的提問。根據相關勞動法規，我來為您詳細說明...',
    '這是一個很重要的勞動法問題。根據法規規定...',
    '關於您提到的情況，建議您注意以下幾點：...',
    '根據現行勞動基準法，您的權益受到以下保障：...',
    '這種情況在實務上確實常見，法律角度的分析如下：...'
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // 根据用户消息内容提供更相关的回复
  if (userMessage.includes('加班') || userMessage.includes('工時')) {
    return '關於加班工時的問題，根據勞動基準法第32條規定，雇主延長工作時間連同正常工作時間，一日不得超過十二小時...';
  }
  
  if (userMessage.includes('薪資') || userMessage.includes('工資')) {
    return '關於薪資的問題，根據勞動基準法規定，工資應全額直接給付勞工，不得預扣或扣發...';
  }
  
  if (userMessage.includes('請假') || userMessage.includes('休假')) {
    return '關於請假權益，勞工享有特別休假、病假、事假等不同類型的假別，每種假別都有相應的法律保障...';
  }
  
  return randomResponse;
}

const chatController = {
  /**
   * 获取会话列表
   */
  async getSessionList(req, res) {
    try {
      const userId = req.user.id;
      const userSessions = Array.from(sessions.values())
        .filter(session => session.userId === userId)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      res.json({
        success: true,
        data: {
          sessions: userSessions,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: userSessions.length
          },
          total: userSessions.length
        }
      });
    } catch (error) {
      console.error('获取会话列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取会话列表失败',
        error: { code: 'CHAT_SESSION_LIST_ERROR' }
      });
    }
  },

  /**
   * 创建新会话
   */
  async createSession(req, res) {
    try {
      const userId = req.user.id;
      const { title = '新对话' } = req.body;

      const sessionId = generateSessionId();
      const session = {
        id: sessionId,
        userId,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      sessions.set(sessionId, session);

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('创建会话失败:', error);
      res.status(500).json({
        success: false,
        message: '创建会话失败',
        error: { code: 'CHAT_SESSION_CREATE_ERROR' }
      });
    }
  },

  /**
   * 获取会话详情
   */
  async getSessionDetails(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = sessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: '会话不存在',
          error: { code: 'CHAT_SESSION_NOT_FOUND' }
        });
      }

      const sessionMessages = messages.get(sessionId) || [];

      res.json({
        success: true,
        data: {
          ...session,
          messages: sessionMessages
        }
      });
    } catch (error) {
      console.error('获取会话详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取会话详情失败',
        error: { code: 'CHAT_SESSION_DETAILS_ERROR' }
      });
    }
  },

  /**
   * 更新会话标题
   */
  async updateSessionTitle(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const { title } = req.body;

      const session = sessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: '会话不存在',
          error: { code: 'CHAT_SESSION_NOT_FOUND' }
        });
      }

      session.title = title;
      session.updatedAt = new Date().toISOString();
      sessions.set(sessionId, session);

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('更新会话标题失败:', error);
      res.status(500).json({
        success: false,
        message: '更新会话标题失败',
        error: { code: 'CHAT_SESSION_UPDATE_ERROR' }
      });
    }
  },

  /**
   * 删除会话
   */
  async deleteSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = sessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: '会话不存在',
          error: { code: 'CHAT_SESSION_NOT_FOUND' }
        });
      }

      sessions.delete(sessionId);
      messages.delete(sessionId);

      res.json({
        success: true,
        data: { sessionId }
      });
    } catch (error) {
      console.error('删除会话失败:', error);
      res.status(500).json({
        success: false,
        message: '删除会话失败',
        error: { code: 'CHAT_SESSION_DELETE_ERROR' }
      });
    }
  },

  /**
   * 发送消息
   */
  async sendMessage(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const { content, type = 'question' } = req.body;

      const session = sessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: '会话不存在',
          error: { code: 'CHAT_SESSION_NOT_FOUND' }
        });
      }

      if (!content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: '消息内容不能为空',
          error: { code: 'EMPTY_MESSAGE' }
        });
      }

      // 添加用户消息
      const userMessageId = generateMessageId();
      const userMessage = {
        id: userMessageId,
        type: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString()
      };

      // 生成AI回复
      const aiMessageId = generateMessageId();
      const aiMessage = {
        id: aiMessageId,
        type: 'ai',
        content: generateAIResponse(content),
        timestamp: new Date().toISOString()
      };

      // 获取或创建消息列表
      const sessionMessages = messages.get(sessionId) || [];
      sessionMessages.push(userMessage, aiMessage);
      messages.set(sessionId, sessionMessages);

      // 更新会话最后修改时间
      session.updatedAt = new Date().toISOString();
      sessions.set(sessionId, session);

      res.json({
        success: true,
        data: {
          userMessage,
          aiMessage
        }
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      res.status(500).json({
        success: false,
        message: '发送消息失败',
        error: { code: 'CHAT_MESSAGE_SEND_ERROR' }
      });
    }
  },

  /**
   * 提交消息反馈
   */
  async submitMessageFeedback(req, res) {
    try {
      const { sessionId, messageId } = req.params;
      const userId = req.user.id;
      const { feedback } = req.body;

      const session = sessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: '会话不存在',
          error: { code: 'CHAT_SESSION_NOT_FOUND' }
        });
      }

      const sessionMessages = messages.get(sessionId) || [];
      const message = sessionMessages.find(m => m.id === messageId);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: '消息不存在',
          error: { code: 'CHAT_MESSAGE_NOT_FOUND' }
        });
      }

      // 记录反馈（这里可以扩展为保存到数据库）
      console.log(`用户 ${userId} 对消息 ${messageId} 提交反馈: ${feedback}`);

      res.json({
        success: true,
        data: {
          messageId,
          feedback,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('提交消息反馈失败:', error);
      res.status(500).json({
        success: false,
        message: '提交消息反馈失败',
        error: { code: 'CHAT_FEEDBACK_ERROR' }
      });
    }
  }
};

module.exports = chatController; 