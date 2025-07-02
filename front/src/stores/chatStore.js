import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import aiChatService from '@/services/aiChatService'

export const useChatStore = defineStore('chat', () => {
  // 狀態定義
  const currentSession = ref(null)
  const sessionList = ref([])
  const messages = ref([])
  const isLoading = ref(false)
  const isTyping = ref(false)
  const connectionError = ref(false)
  
  // 分頁狀態
  const pagination = reactive({
    currentPage: 1,
    pageSize: 20,
    totalSessions: 0,
    hasMore: true
  })
  
  // 用戶信息
  const userInfo = computed(() => {
    try {
      const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}')
      return {
        name: authUser.name || '用戶',
        email: authUser.email || '',
        remainingQueries: authUser.remaining_free_queries || 0
      }
    } catch (error) {
      console.error('獲取用戶信息時出錯:', error)
      return {
        name: '用戶',
        email: '',
        remainingQueries: 0
      }
    }
  })
  
  // Actions
  
  /**
   * 創建新會話
   */
  async function createSession(title = null) {
    try {
      isLoading.value = true
      const newSession = await aiChatService.createSession(title)
      
      // 添加到會話列表頭部
      sessionList.value.unshift({
        id: newSession.sessionId,
        title: newSession.title,
        lastMessage: '',
        messageCount: 0,
        createdAt: newSession.createdAt,
        updatedAt: newSession.createdAt
      })
      
      // 設置為當前會話
      currentSession.value = newSession.sessionId
      messages.value = []
      
      console.log('✅ 新會話創建成功:', newSession.sessionId)
      return newSession
      
    } catch (error) {
      console.error('❌ 創建會話失敗:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 加載會話列表
   */
  async function loadSessionList(refresh = false) {
    try {
      isLoading.value = true
      
      if (refresh) {
        pagination.currentPage = 1
        sessionList.value = []
      }
      
      const response = await aiChatService.getSessionList({
        page: pagination.currentPage,
        limit: pagination.pageSize
      })
      
      if (response.sessions) {
        const formattedSessions = response.sessions.map(session => ({
          id: session.sessionId,
          title: session.title,
          lastMessage: session.lastMessage || '',
          messageCount: session.messageCount,
          createdAt: session.createdAt,
          updatedAt: session.lastMessageAt
        }))
        
        if (refresh) {
          sessionList.value = formattedSessions
        } else {
          sessionList.value = [...sessionList.value, ...formattedSessions]
        }
        
        // 更新分頁信息
        pagination.totalSessions = response.pagination.totalSessions
        pagination.hasMore = response.pagination.hasNext
        
        console.log(`✅ 會話列表加載成功: ${formattedSessions.length} 個會話`)
      }
      
    } catch (error) {
      console.error('❌ 加載會話列表失敗:', error)
      connectionError.value = true
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 選擇會話並加載消息
   */
  async function selectSession(sessionId) {
    try {
      if (currentSession.value === sessionId) {
        return // 已經是當前會話
      }
      
      isLoading.value = true
      currentSession.value = sessionId
      
      const sessionDetails = await aiChatService.getSessionDetails(sessionId)
      
      // 轉換消息格式
      messages.value = sessionDetails.messages.map(msg => ({
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        reference: msg.references || null,
        timestamp: new Date(msg.createdAt)
      }))
      
      console.log(`✅ 會話切換成功: ${sessionId}`)
      
    } catch (error) {
      console.error('❌ 選擇會話失敗:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 發送消息
   */
  async function sendMessage(content) {
    try {
      if (!content.trim()) {
        throw new Error('消息內容不能為空')
      }
      
      // 如果沒有當前會話，先創建一個
      if (!currentSession.value) {
        await createSession()
      }
      
      // 添加用戶消息到UI
      const userMessage = {
        type: 'user',
        content: content,
        timestamp: new Date()
      }
      messages.value.push(userMessage)
      
      // 顯示AI正在輸入
      isTyping.value = true
      
      // 發送消息到後端
      const response = await aiChatService.sendMessage(
        currentSession.value,
        content,
        'question'
      )
      
      // 添加AI回復到UI
      const aiMessage = {
        type: 'ai',
        content: response.aiResponse.content,
        reference: response.aiResponse.references,
        timestamp: new Date(response.aiResponse.createdAt)
      }
      messages.value.push(aiMessage)
      
      // 更新用戶剩餘諮詢次數
      if (response.remainingQueries !== undefined) {
        updateUserQueries(response.remainingQueries)
      }
      
      // 更新會話列表中的最後消息
      updateSessionInList(currentSession.value, content)
      
      console.log('✅ 消息發送成功')
      return response
      
    } catch (error) {
      console.error('❌ 發送消息失敗:', error)
      throw error
    } finally {
      isTyping.value = false
    }
  }
  
  /**
   * 更新會話標題
   */
  async function updateSessionTitle(sessionId, newTitle) {
    try {
      await aiChatService.updateSessionTitle(sessionId, newTitle)
      
      // 更新本地會話列表
      const sessionIndex = sessionList.value.findIndex(s => s.id === sessionId)
      if (sessionIndex !== -1) {
        sessionList.value[sessionIndex].title = newTitle
      }
      
      console.log('✅ 會話標題更新成功')
      
    } catch (error) {
      console.error('❌ 更新會話標題失敗:', error)
      throw error
    }
  }
  
  /**
   * 刪除會話
   */
  async function deleteSession(sessionId) {
    try {
      await aiChatService.deleteSession(sessionId)
      
      // 從本地會話列表中移除
      const sessionIndex = sessionList.value.findIndex(s => s.id === sessionId)
      if (sessionIndex !== -1) {
        sessionList.value.splice(sessionIndex, 1)
      }
      
      // 如果刪除的是當前會話，需要選擇新的會話
      if (currentSession.value === sessionId) {
        if (sessionList.value.length > 0) {
          await selectSession(sessionList.value[0].id)
        } else {
          currentSession.value = null
          messages.value = []
        }
      }
      
      console.log('✅ 會話刪除成功')
      
    } catch (error) {
      console.error('❌ 刪除會話失敗:', error)
      throw error
    }
  }
  
  /**
   * 提交反饋
   */
  async function submitFeedback(messageId, feedback) {
    try {
      if (!currentSession.value) {
        throw new Error('沒有當前會話')
      }
      
      await aiChatService.submitFeedback(currentSession.value, messageId, feedback)
      console.log('✅ 反饋提交成功')
      
    } catch (error) {
      console.error('❌ 提交反饋失敗:', error)
      throw error
    }
  }
  
  /**
   * 測試連接
   */
  async function testConnection() {
    try {
      const isConnected = await aiChatService.testConnection()
      connectionError.value = !isConnected
      return isConnected
    } catch (error) {
      connectionError.value = true
      return false
    }
  }
  
  // 輔助函數
  
  /**
   * 更新用戶諮詢次數
   */
  function updateUserQueries(remainingQueries) {
    try {
      const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}')
      authUser.remaining_free_queries = remainingQueries
      localStorage.setItem('auth_user', JSON.stringify(authUser))
    } catch (error) {
      console.error('更新用戶諮詢次數失敗:', error)
    }
  }
  
  /**
   * 更新會話列表中的會話信息
   */
  function updateSessionInList(sessionId, lastMessage) {
    const sessionIndex = sessionList.value.findIndex(s => s.id === sessionId)
    if (sessionIndex !== -1) {
      sessionList.value[sessionIndex].lastMessage = lastMessage
      sessionList.value[sessionIndex].messageCount += 2 // 用戶消息 + AI回復
      sessionList.value[sessionIndex].updatedAt = new Date().toISOString()
      
      // 移到列表頂部
      const session = sessionList.value.splice(sessionIndex, 1)[0]
      sessionList.value.unshift(session)
    }
  }
  
  /**
   * 清除所有狀態
   */
  function clearState() {
    currentSession.value = null
    sessionList.value = []
    messages.value = []
    isLoading.value = false
    isTyping.value = false
    connectionError.value = false
    
    pagination.currentPage = 1
    pagination.totalSessions = 0
    pagination.hasMore = true
  }
  
  // 返回狀態和方法
  return {
    // 狀態
    currentSession,
    sessionList,
    messages,
    isLoading,
    isTyping,
    connectionError,
    pagination,
    userInfo,
    
    // 方法
    createSession,
    loadSessionList,
    selectSession,
    sendMessage,
    updateSessionTitle,
    deleteSession,
    submitFeedback,
    testConnection,
    clearState
  }
}) 