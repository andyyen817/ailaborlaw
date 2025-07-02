/**
 * 聊天會話管理服務
 */

// 默认欢迎消息
const WELCOME_MESSAGE = {
  type: 'ai',
  content: '您好！我是勞法通AI，請問有什麼勞動法規相關問題我可以協助您解答？',
  timestamp: new Date(),
};

/**
 * 生成唯一会话ID
 * @returns {string} 会话ID
 */
function generateConversationId() {
  return 'conv_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * 获取会话标题
 * @param {Array} messages - 消息列表
 * @returns {string} 会话标题
 */
function generateTitle(messages) {
  // 查找第一条用户消息作为标题
  const firstUserMessage = messages.find(m => m.type === 'user');
  if (firstUserMessage) {
    // 截取前20个字符作为标题
    const title = firstUserMessage.content.trim().substring(0, 20);
    return title + (firstUserMessage.content.length > 20 ? '...' : '');
  }
  return '新的對話';
}

/**
 * 获取预览文本
 * @param {Array} messages - 消息列表
 * @returns {string} 预览文本
 */
function generatePreview(messages) {
  // 使用最后一条消息作为预览
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    const prefix = lastMessage.type === 'user' ? '您: ' : 'AI: ';
    const preview = lastMessage.content.trim().substring(0, 30);
    return prefix + preview + (lastMessage.content.length > 30 ? '...' : '');
  }
  return '開始一個新的對話...';
}

/**
 * 統一獲取用戶ID的方法
 * @returns {string} 用戶ID
 */
function getUserId() {
  // 優先使用auth_user_id(新的標準方式)
  let userId = localStorage.getItem('auth_user_id');
  
  // 如果沒有auth_user_id，嘗試從auth_user獲取
  if (!userId) {
    try {
      const authUserStr = localStorage.getItem('auth_user');
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr);
        if (authUser && authUser.id) {
          userId = authUser.id;
          // 存儲到標準位置
          localStorage.setItem('auth_user_id', userId);
          console.log('從auth_user獲取並設置userId:', userId);
        }
      }
    } catch (e) {
      console.error('解析auth_user時出錯:', e);
    }
  }
  
  // 最後嘗試使用舊的userId格式(作為後備)
  if (!userId) {
    userId = localStorage.getItem('userId');
    if (userId) {
      // 將舊格式的userId遷移到新格式
      localStorage.setItem('auth_user_id', userId);
      console.log('從舊格式遷移userId:', userId);
    }
  }
  
  // 如果以上都沒有，生成訪客ID
  if (!userId) {
    userId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('userId', userId); // 為兼容性保留舊格式
    console.log('設置臨時guest userId:', userId);
  }
  
  return userId;
}

/**
 * 获取所有会话
 * @returns {Array} 会话列表
 */
function getAllConversations() {
  try {
    const userId = getUserId();
    
    // 从localStorage获取所有会话
    const storageKey = userId ? `conversations_${userId}` : 'conversations_guest';
    
    // 从localStorage获取会话数据
    let conversationsData = localStorage.getItem(storageKey);
    
    // 如果会话数据不存在，打印警告并返回空数组
    if (!conversationsData) {
      console.log('找不到会话数据，使用默认键:', storageKey);
      return [];
    }
    
    let conversations;
    try {
      conversations = JSON.parse(conversationsData);
      
      // 验证数据格式
      if (!Array.isArray(conversations)) {
        console.error('格式错误，预期为数组');
        return [];
      }
      
      // 过滤掉无效的会话
      const validConversations = conversations.filter(conv => {
        return conv && typeof conv === 'object' && conv.id;
      });
      
      if (validConversations.length !== conversations.length) {
        console.warn('存在无效的会话，已清除');
        // 保存有效的会话数据
        localStorage.setItem(storageKey, JSON.stringify(validConversations));
      }
      
      // 处理时间
      validConversations.forEach(conv => {
        if (conv.lastMessageTime) {
          try {
            conv.lastMessageTime = new Date(conv.lastMessageTime);
          } catch (e) {
            conv.lastMessageTime = new Date();
          }
        } else {
          conv.lastMessageTime = new Date();
        }
        
        if (conv.createdAt) {
          try {
            conv.createdAt = new Date(conv.createdAt);
          } catch (e) {
            conv.createdAt = new Date();
          }
        } else {
          conv.createdAt = new Date();
        }
      });
      
      // 按最后消息时间排序（最新的在前面）
      return validConversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    } catch (parseError) {
      console.error('解析会话数据时出错:', parseError);
      return [];
    }
  } catch (error) {
    console.error('获取所有会话时出错:', error);
    return [];
  }
}

/**
 * 获取会话
 * @param {string} conversationId - 会话ID
 * @returns {Object|null} 会话对象
 */
function getConversation(conversationId) {
  try {
    const userId = getUserId();
    if (!userId || !conversationId) return null;
    
    // 获取会话元数据
    const conversations = getAllConversations();
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) return null;
    
    // 获取会话消息
    const messagesKey = `chat_${userId}_${conversationId}`;
    const messagesData = localStorage.getItem(messagesKey);
    
    if (!messagesData) {
      conversation.messages = [];
    } else {
      let messages = JSON.parse(messagesData);
      
      // 将字符串时间转回Date对象
      messages.forEach(msg => {
        msg.timestamp = new Date(msg.timestamp);
      });
      
      conversation.messages = messages;
    }
    
    return conversation;
  } catch (error) {
    console.error('获取会话时出错:', error);
    return null;
  }
}

/**
 * 创建新会话
 * @param {string} initialQuestion - 可選的初始問題（僅用於設置標題，不添加到消息列表）
 * @returns {Object} 新会话对象
 */
function createConversation(initialQuestion = null) {
  try {
    let userId = getUserId();
    
    const conversationId = generateConversationId();
    const messages = []; // 創建一個空白的對話，不添加任何消息
    const now = new Date();
    
    // 创建会话对象，使用initialQuestion作為標題參考，但不添加到消息列表中
    const conversation = {
      id: conversationId,
      title: initialQuestion ? (initialQuestion.substring(0, 20) + (initialQuestion.length > 20 ? '...' : '')) : '新的對話',
      preview: '開始一個新的對話...',
      lastMessageTime: now,
      createdAt: now,
      messages: messages
    };
    
    // 保存会话元数据
    const conversations = getAllConversations();
    conversations.unshift(conversation); // 添加到列表开头
    
    const conversationsKey = `conversations_${userId}`;
    console.log('保存会话元数据，使用key:', conversationsKey);
    localStorage.setItem(conversationsKey, JSON.stringify(conversations));
    
    // 保存会话消息
    const messagesKey = `chat_${userId}_${conversationId}`;
    console.log('保存会话消息，使用key:', messagesKey);
    localStorage.setItem(messagesKey, JSON.stringify(messages));
    
    // 触发同步事件
    triggerAppDataSync();
    
    return conversation;
  } catch (error) {
    console.error('创建会话时出错:', error);
    return null;
  }
}

/**
 * 更新会话
 * @param {string} conversationId - 会话ID
 * @param {Array} messages - 消息列表
 */
function updateConversation(conversationId, messages) {
  try {
    const userId = getUserId();
    if (!userId || !conversationId || !messages) return false;
    
    // 获取所有会话
    const conversations = getAllConversations();
    const conversationIndex = conversations.findIndex(c => c.id === conversationId);
    
    if (conversationIndex === -1) return false;
    
    // 更新会话元数据
    const now = new Date();
    conversations[conversationIndex].title = generateTitle(messages);
    conversations[conversationIndex].preview = generatePreview(messages);
    conversations[conversationIndex].lastMessageTime = now;
    
    // 保存会话元数据
    const conversationsKey = `conversations_${userId}`;
    localStorage.setItem(conversationsKey, JSON.stringify(conversations));
    
    // 保存会话消息
    const messagesKey = `chat_${userId}_${conversationId}`;
    localStorage.setItem(messagesKey, JSON.stringify(messages));
    
    // 触发同步事件，通知其他组件数据已更新
    triggerAppDataSync();
    
    return true;
  } catch (error) {
    console.error('更新会话时出错:', error);
    return false;
  }
}

/**
 * 删除会话
 * @param {string} conversationId - 会话ID
 * @returns {boolean} 是否成功删除
 */
function deleteConversation(conversationId) {
  try {
    const userId = getUserId();
    if (!userId || !conversationId) return false;
    
    // 获取所有会话
    const conversations = getAllConversations();
    const filteredConversations = conversations.filter(c => c.id !== conversationId);
    
    // 如果会话不存在，直接返回
    if (filteredConversations.length === conversations.length) {
      return false;
    }
    
    // 保存更新后的会话列表
    const conversationsKey = `conversations_${userId}`;
    localStorage.setItem(conversationsKey, JSON.stringify(filteredConversations));
    
    // 删除会话消息
    const messagesKey = `chat_${userId}_${conversationId}`;
    localStorage.removeItem(messagesKey);
    
    return true;
  } catch (error) {
    console.error('删除会话时出错:', error);
    return false;
  }
}

/**
 * 清除所有会话
 * @returns {boolean} 是否成功清除
 */
function clearAllConversations() {
  try {
    const userId = getUserId();
    if (!userId) return false;
    
    // 获取所有会话
    const conversations = getAllConversations();
    
    // 删除每个会话的消息
    conversations.forEach(conversation => {
      const messagesKey = `chat_${userId}_${conversation.id}`;
      localStorage.removeItem(messagesKey);
    });
    
    // 清除会话列表
    const conversationsKey = `conversations_${userId}`;
    localStorage.removeItem(conversationsKey);
    
    return true;
  } catch (error) {
    console.error('清除所有会话时出错:', error);
    return false;
  }
}

/**
 * 获取会话消息
 * @param {string} conversationId - 会话ID
 * @returns {Array} 消息列表
 */
function getConversationMessages(conversationId) {
  try {
    const userId = getUserId();
    if (!userId || !conversationId) {
      console.error('缺少conversationId');
      return [];
    }

    // 获取所有对话数据
    const storageKey = userId ? `chat_${userId}_${conversationId}` : `chat_guest_${conversationId}`;
    
    // 获取所有对话数据
    const messagesData = localStorage.getItem(storageKey);
    
    if (!messagesData) {
      console.log(`找不到${conversationId}的对话数据，对话不存在`);
      return [];
    }
    
    try {
      const messages = JSON.parse(messagesData);
      
      // 验证消息格式
      if (!Array.isArray(messages)) {
        console.error('消息格式错误，预期为数组');
        return [];
      }
      
      // 将字符串时间转回Date对象
      messages.forEach(msg => {
        if (msg.timestamp) {
          try {
            msg.timestamp = new Date(msg.timestamp);
          } catch (e) {
            msg.timestamp = new Date();
          }
        } else {
          msg.timestamp = new Date();
        }
      });
      
      return messages;
    } catch (parseError) {
      console.error(`解析${conversationId}的消息数据时出错:`, parseError);
      return [];
    }
  } catch (error) {
    console.error(`获取${conversationId}的消息时出错:`, error);
    return [];
  }
}

/**
 * 创建新会话
 * @param {string} initialQuestion - 可選的初始問題
 * @returns {string} 新会话ID
 */
function createNewConversation(initialQuestion = null) {
  try {
    console.log('创建新会话', initialQuestion ? `初始問題: ${initialQuestion}` : '');
    const conversation = createConversation(initialQuestion);
    console.log('新会话创建结果:', conversation);
    if (conversation && conversation.id) {
      return conversation.id;
    } else {
      console.error('创建会话失败，没有返回有效ID');
      return null;
    }
  } catch (error) {
    console.error('创建新会话时出错:', error);
    return null;
  }
}

/**
 * u89f8u767cu61c9u7528u6578u64dau540cu6b65u4e8bu4ef6
 * u7528u65bcu901au77e5u5176u4ed6u7d44u4ef6u6216u9801u9762u6578u64dau5df2u66f4u65b0
 */
function triggerAppDataSync() {
  try {
    // u5efau7acbu4e00u500bu7c21u55aeu7684u81eau5b9au7fa9u4e8bu4ef6
    const syncEvent = new CustomEvent('app_data_sync', {
      detail: { timestamp: new Date().getTime() }
    });
    
    // u89f8u767cu4e8bu4ef6
    window.dispatchEvent(syncEvent);
    console.log('u89f8u767cu61c9u7528u6578u64dau540cu6b65u4e8bu4ef6');
    
    // u76e3u807du4f86u81eachatu670du52d9u7684u540cu6b65u4e8bu4ef6
    window.addEventListener('chat:sync', handleChatSync);
  } catch (error) {
    console.error('u89f8u767cu61c9u7528u6578u64dau540cu6b65u4e8bu4ef6u5931u6557:', error);
  }
}

// 記錄已處理的消息ID
const processedMessageIds = new Set();

// 去重組件 - 比較兩個消息是否本質上相同
function isSameMessage(msg1, msg2) {
  // 檢查兩個消息的類型和內容是否相同
  if (msg1.type !== msg2.type || msg1.content !== msg2.content) {
    return false;
  }
  
  // 檢查時間戳是否接近 (2秒內視為同一消息)
  const time1 = new Date(msg1.timestamp || new Date());
  const time2 = new Date(msg2.timestamp || new Date());
  return Math.abs(time1 - time2) < 2000;
}

/**
 * u8655u7406u4f86u81eachatu670du52d9u7684u540cu6b65u4e8bu4ef6
 * @param {CustomEvent} event - u81eau5b9au7fa9u4e8bu4ef6u5c0du8c61
 */
function handleChatSync(event) {
  try {
    const { action, data } = event.detail;
    
    if (action === 'new_message' && data.conversationId) {
      // 創建消息ID (用於去重)
      const messageId = data.message.messageId || 
                       `${data.message.type}_${data.message.content}_${data.message.timestamp || Date.now()}`;
      
      console.log('處理新消息:', messageId.substring(0, 30) + '...');
      
      // 檢查是否已處理過該消息
      if (processedMessageIds.has(messageId)) {
        console.log('此消息已被處理過，忽略:', messageId.substring(0, 30) + '...');
        return;
      }
      
      // 使用延遲處理避免事件循環和競態條件
      setTimeout(() => {
        // 將消息ID添加到已處理集合中
        processedMessageIds.add(messageId);
        
        // 限制已處理消息集合大小，防止記憶體洩漏
        if (processedMessageIds.size > 100) {
          // 清理較早的記錄
          const oldestKeys = Array.from(processedMessageIds).slice(0, 50);
          oldestKeys.forEach(key => processedMessageIds.delete(key));
        }
        
        // u7372u53d6u76eeu524du6703u8a71u7684u6d88u606f
        const messages = getConversationMessages(data.conversationId) || [];
        
        // u907fu514du91cdu8907u6dfbu52a0u76f8u540cu7684u6d88u606f (增強版)
        const isDuplicate = messages.some(msg => isSameMessage(msg, data.message));
        
        if (!isDuplicate) {
          console.log('添加新消息到會話:', data.message.type);
          
          // u6dfbu52a0u65b0u6d88u606f
          messages.push({
            ...data.message,
            timestamp: new Date(data.message.timestamp || new Date())
          });
          
          // u66f4u65b0u6703u8a71
          updateConversation(data.conversationId, messages);
          
          // u89f8u767cu61c9u7528u6578u64dau540cu6b65u4e8bu4ef6 (避免無限循環)
          setTimeout(() => {
            triggerAppDataSync();
          }, 100);
        } else {
          console.log('檢測到重複消息，已忽略');
        }
      }, 50);  // 使用短延遲避免競態問題
    }
  } catch (error) {
    console.error('u8655u7406chatu540cu6b65u4e8bu4ef6u5931u6557:', error);
  }
}

// u521du59cbu5316u76e3u807du5668
// u5982u679cu60f3u8981u5f9eu5176u4ed6u4f4du7f6eu89f8u767cu540cu6b65u4e8bu4ef6uff0cu53efu4ee5u4f7fu7528triggerAppDataSyncu51fdu6578
export default {
  createConversation,
  getConversation,
  getAllConversations,
  updateConversation,
  deleteConversation,
  clearAllConversations,
  getConversationMessages,
  createNewConversation,
  triggerAppDataSync // u5c0du5916u66b4u9732u540cu6b65u89f8u767cu51fdu6578
}; 