<template>
  <div class="conversation-list">
    <div class="conversation-list-header">
      <h2 class="list-title">對話歷史</h2>
      <div class="new-conversation">
        <button @click="$emit('new-conversation')" class="new-conversation-button">
          <i class="fas fa-plus mr-2"></i>
          新對話
        </button>
      </div>
    </div>
    
    <div class="search-container">
      <div class="search-input-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          class="search-input" 
          placeholder="搜尋對話..." 
          v-model="searchQuery"
        />
        <button 
          v-if="searchQuery" 
          class="clear-search-button"
          @click="searchQuery = ''"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div class="conversations-container">
      <template v-if="filteredConversations.length">
        <ConversationItem
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          :id="conversation.id"
          :title="conversation.title"
          :preview="conversation.preview"
          :lastMessageTime="conversation.lastMessageTime"
          :isActive="activeConversationId === conversation.id"
          :isEditing="editingConversationId === conversation.id"
          @select="handleSelectConversation"
          @edit="handleEditConversation"
          @delete="handleDeleteConversation"
          @save-title="handleSaveTitle"
          @cancel-edit="handleCancelEdit"
        />
      </template>
      
      <div v-else-if="searchQuery" class="empty-search-result">
        <i class="fas fa-search empty-icon"></i>
        <p>找不到符合 "{{ searchQuery }}" 的對話</p>
      </div>
      
      <div v-else class="empty-conversations">
        <i class="fas fa-comments empty-icon"></i>
        <p>還沒有對話歷史</p>
        <button 
          class="start-new-chat-button"
          @click="$emit('new-conversation')"
        >
          開始新對話
        </button>
      </div>
    </div>
    
    <!-- 確認刪除對話框 -->
    <div v-if="showDeleteConfirm" class="delete-confirm-overlay" @click="handleCancelDelete">
      <div class="delete-confirm-dialog" @click.stop>
        <div class="delete-confirm-header">
          <h3>確認刪除</h3>
        </div>
        <div class="delete-confirm-body">
          <p>確定要刪除這個對話嗎？此操作無法撤銷。</p>
          <div class="conversation-to-delete">
            <strong>{{ conversationToDelete?.title || '新的對話' }}</strong>
          </div>
        </div>
        <div class="delete-confirm-actions">
          <button class="cancel-button" @click="handleCancelDelete">
            取消
          </button>
          <button class="delete-button" @click="handleConfirmDelete">
            <i class="fas fa-trash mr-1"></i>
            刪除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ConversationItem from './ConversationItem.vue';

const props = defineProps({
  conversations: {
    type: Array,
    default: () => []
  },
  activeConversationId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  'select-conversation', 
  'new-conversation', 
  'edit-conversation-title',
  'delete-conversation'
]);

const searchQuery = ref('');
const editingConversationId = ref('');
const showDeleteConfirm = ref(false);
const conversationToDelete = ref(null);

// 过滤会话列表
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.conversations;
  }
  
  const query = searchQuery.value.toLowerCase();
  return props.conversations.filter(conversation => {
    return (
      (conversation.title && conversation.title.toLowerCase().includes(query)) ||
      (conversation.preview && conversation.preview.toLowerCase().includes(query))
    );
  });
});

// 處理選擇會話
function handleSelectConversation(conversationId) {
  // 如果正在編輯，先取消編輯
  if (editingConversationId.value) {
    editingConversationId.value = '';
  }
  emit('select-conversation', conversationId);
}

// 處理編輯會話標題
function handleEditConversation(conversationId) {
  editingConversationId.value = conversationId;
}

// 處理保存會話標題
function handleSaveTitle({ conversationId, newTitle }) {
  editingConversationId.value = '';
  emit('edit-conversation-title', { conversationId, newTitle });
}

// 處理取消編輯
function handleCancelEdit() {
  editingConversationId.value = '';
}

// 處理刪除會話
function handleDeleteConversation(conversationId) {
  const conversation = props.conversations.find(c => c.id === conversationId);
  conversationToDelete.value = conversation;
  showDeleteConfirm.value = true;
}

// 處理取消刪除
function handleCancelDelete() {
  showDeleteConfirm.value = false;
  conversationToDelete.value = null;
}

// 處理確認刪除
function handleConfirmDelete() {
  if (conversationToDelete.value) {
    emit('delete-conversation', conversationToDelete.value.id);
    showDeleteConfirm.value = false;
    conversationToDelete.value = null;
  }
}
</script>

<style scoped>
.conversation-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
}

.conversation-list-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.new-conversation {
  display: flex;
  align-items: center;
}

.new-conversation-button {
  background-color: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.new-conversation-button:hover {
  background-color: var(--color-primary-dark, #2563eb);
}

.new-conversation-button i {
  margin-right: 6px;
  font-size: 12px;
}

.search-container {
  padding: 12px 16px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background-color: white;
  font-size: 14px;
  outline: none;
}

.search-input:focus {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.clear-search-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
}

.clear-search-button:hover {
  color: #6b7280;
}

.conversations-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

.empty-search-result,
.empty-conversations {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 24px;
  margin-bottom: 12px;
  color: #9ca3af;
}

.start-new-chat-button {
  background-color: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.2s;
}

.start-new-chat-button:hover {
  background-color: var(--color-primary-dark, #2563eb);
}

/* 刪除確認對話框樣式 */
.delete-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-confirm-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.delete-confirm-header {
  padding: 20px 20px 0;
  border-bottom: none;
}

.delete-confirm-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.delete-confirm-body {
  padding: 16px 20px;
}

.delete-confirm-body p {
  margin: 0 0 12px;
  color: #6b7280;
  line-height: 1.5;
}

.conversation-to-delete {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.conversation-to-delete strong {
  color: #111827;
  font-weight: 500;
}

.delete-confirm-actions {
  padding: 16px 20px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button {
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background: #e5e7eb;
}

.delete-button {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}

.delete-button:hover {
  background: #b91c1c;
}

.delete-button i {
  margin-right: 4px;
}
</style> 