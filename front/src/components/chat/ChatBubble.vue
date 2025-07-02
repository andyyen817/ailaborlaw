<template>
  <div :class="['chat-message', isUser ? 'chat-message-user' : 'chat-message-ai']">
    <div class="message-content">
      <!-- 发送方头像 -->
      <div class="avatar-container">
        <slot name="avatar">
          <div :class="['avatar', isUser ? 'avatar-user' : 'avatar-ai']">
            <span v-if="isUser">{{ userInitial }}</span>
            <span v-else>AI</span>
          </div>
        </slot>
        <div class="sender-name">{{ isUser ? userName : '勞法通AI' }}</div>
      </div>

      <!-- 消息气泡内容 -->
      <div class="bubble-container">
        <div
          :class="[
            'chat-bubble',
            isUser
              ? 'chat-bubble-user'
              : 'chat-bubble-ai'
          ]"
        >
          <slot>{{ content }}</slot>
        </div>
        
        <!-- 法条引用 (如果有) - 🔧 只在AI消息中显示 -->
        <div v-if="!isUser && hasValidReferences" class="chat-law-reference">
          <div class="reference-header">
            <i class="fas fa-gavel"></i>
            <strong>相關法條</strong>
          </div>
          <div class="reference-list">
            <div v-for="ref in formattedReferences" :key="ref._id || ref.id" class="reference-item">
              <div class="reference-title">
                <a :href="ref.url" target="_blank" class="law-link">
                  {{ ref.law }} {{ ref.article }}
                  <i class="fas fa-external-link-alt"></i>
                </a>
              </div>
              <div v-if="ref.content" class="reference-content">
                {{ ref.content }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 备份模式指示器 -->
        <div v-if="isFallback" class="chat-fallback-indicator">
          <i class="fas fa-exclamation-triangle"></i> 備份模式：連接服務時出現問題
        </div>
        
        <div class="chat-time">{{ formattedTime }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  timestamp: {
    type: [Date, String],
    default: () => new Date()
  },
  isUser: {
    type: Boolean,
    default: false
  },
  userName: {
    type: String,
    default: '用戶'
  },
  reference: {
    type: [Array, String],
    default: () => []
  },
  isFallback: {
    type: Boolean,
    default: false
  }
});

// 🔧 添加法条引用相关的计算属性
const hasValidReferences = computed(() => {
  return Array.isArray(props.reference) && props.reference.length > 0;
});

const formattedReferences = computed(() => {
  if (!Array.isArray(props.reference)) return [];
  return props.reference.filter(ref => ref && (ref.law || ref.article));
});

// 格式化时间为HH:MM
const formattedTime = computed(() => {
  const date = props.timestamp instanceof Date ? props.timestamp : new Date(props.timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
});

// 获取用户名首字母作为头像显示
const userInitial = computed(() => {
  if (!props.userName) return '?';
  return props.userName.charAt(0).toUpperCase();
});
</script>

<style scoped>
.chat-message {
  margin-bottom: 20px;
  clear: both;
  width: 100%;
}

.message-content {
  display: flex;
  max-width: 85%;
}

.chat-message-user .message-content {
  flex-direction: row-reverse;
  margin-left: auto;
}

.chat-message-ai .message-content {
  margin-right: auto;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 8px;
  width: 40px;
}

.chat-message-user .avatar-container {
  margin-right: 0;
}

.chat-message-ai .avatar-container {
  margin-left: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}

.avatar-user {
  background-color: var(--color-primary, #3b82f6);
  color: white;
}

.avatar-ai {
  background-color: var(--ios-green, #10b981);
  color: white;
}

.sender-name {
  font-size: 10px;
  color: var(--ios-gray, #6b7280);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.bubble-container {
  display: flex;
  flex-direction: column;
}

.chat-bubble {
  padding: 12px 16px;
  border-radius: var(--ios-radius-large, 18px);
  word-break: break-word;
  position: relative;
  box-shadow: var(--ios-shadow-small, 0 1px 2px rgba(0, 0, 0, 0.1));
  margin-bottom: 4px;
}

.chat-bubble-user {
  background-color: var(--chat-bubble-user, var(--color-primary, #3b82f6));
  color: var(--chat-text-user, white);
  border-top-right-radius: 4px;
}

.chat-bubble-ai {
  background-color: var(--chat-bubble-ai, white);
  color: var(--chat-text-ai, #374151);
  border-top-left-radius: 4px;
}

.chat-time {
  font-size: 10px;
  color: var(--ios-gray, #6b7280);
  margin-top: 2px;
  align-self: flex-end;
}

.chat-message-user .chat-time {
  text-align: right;
}

.chat-law-reference {
  background-color: #f8faff;
  border-left: 4px solid #3b82f6;
  padding: 12px;
  margin-top: 8px;
  border-radius: 6px;
  font-size: 14px;
}

.reference-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #1e40af;
  font-weight: 600;
}

.reference-header i {
  font-size: 12px;
}

.reference-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reference-item {
  background-color: white;
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.reference-title {
  margin-bottom: 4px;
}

.law-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.law-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.law-link i {
  font-size: 10px;
}

.reference-content {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .chat-law-reference {
    font-size: 13px;
    padding: 10px;
  }
  
  .reference-content {
    font-size: 11px;
  }
  
  .law-link {
    font-size: 13px;
  }
}

.chat-fallback-indicator {
  background-color: #fffbeb;
  border-left: 3px solid var(--ios-orange, #f59e0b);
  padding: 6px 10px;
  margin-top: 8px;
  font-size: 12px;
  color: #92400e;
  border-radius: var(--ios-radius-small, 6px);
  display: flex;
  align-items: center;
}

.chat-fallback-indicator i {
  margin-right: 6px;
}
</style> 