<template>
  <div 
    :class="['conversation-item', isActive ? 'conversation-item-active' : '']" 
    @click="handleClick"
    @contextmenu.prevent="handleRightClick"
  >
    <div class="avatar-container">
      <div class="avatar avatar-ai">
        <span>AI</span>
      </div>
    </div>
    <div class="conversation-details">
      <div class="conversation-header">
        <div class="title-section">
          <input 
            v-if="isEditing"
            ref="titleInputRef"
            v-model="editingTitle"
            class="title-input"
            @blur="handleSaveTitle"
            @keydown.enter="handleSaveTitle"
            @keydown.escape="handleCancelEdit"
            @click.stop
          />
          <h3 v-else class="conversation-title">{{ title || '新的對話' }}</h3>
        </div>
        <div class="item-actions">
          <span class="conversation-time">{{ formattedTime }}</span>
          <div class="action-buttons" v-if="!isEditing">
            <button 
              class="action-button edit-button"
              @click.stop="handleEdit"
              title="編輯標題"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              class="action-button delete-button"
              @click.stop="handleDelete"
              title="刪除對話"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="edit-actions" v-else>
            <button 
              class="action-button save-button"
              @click.stop="handleSaveTitle"
              title="保存"
            >
              <i class="fas fa-check"></i>
            </button>
            <button 
              class="action-button cancel-button"
              @click.stop="handleCancelEdit"
              title="取消"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      <p class="conversation-preview">{{ preview }}</p>
    </div>
    
    <!-- 右鍵菜單 -->
    <div 
      v-if="showContextMenu" 
      class="context-menu"
      :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="handleEdit">
        <i class="fas fa-edit"></i>
        <span>編輯標題</span>
      </div>
      <div class="context-menu-item delete-item" @click="handleDelete">
        <i class="fas fa-trash"></i>
        <span>刪除對話</span>
      </div>
    </div>
  </div>
  
  <!-- 右鍵菜單遮罩 -->
  <div 
    v-if="showContextMenu" 
    class="context-menu-overlay" 
    @click="closeContextMenu"
  ></div>
</template>

<script setup>
import { computed, ref, nextTick, watch } from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  preview: {
    type: String,
    default: '開始一個新的對話...'
  },
  lastMessageTime: {
    type: [Date, String],
    default: () => new Date()
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select', 'edit', 'delete', 'save-title', 'cancel-edit']);

const titleInputRef = ref(null);
const editingTitle = ref('');
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const showContextMenu = ref(false);

// 監聽編輯狀態，當進入編輯模式時聚焦輸入框
watch(() => props.isEditing, (newValue) => {
  if (newValue) {
    editingTitle.value = props.title || '新的對話';
    nextTick(() => {
      if (titleInputRef.value) {
        titleInputRef.value.focus();
        titleInputRef.value.select();
      }
    });
  }
});

// 格式化时间为今天显示时间，昨天显示"昨天"，更早显示日期
const formattedTime = computed(() => {
  const date = props.lastMessageTime instanceof Date 
    ? props.lastMessageTime 
    : new Date(props.lastMessageTime);
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date >= today) {
    // 今天 - 显示时间
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } else if (date >= yesterday) {
    // 昨天
    return '昨天';
  } else {
    // 更早 - 显示日期
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }
});

// 處理點擊選擇會話
const handleClick = () => {
  if (!props.isEditing) {
    closeContextMenu();
    emit('select', props.id);
  }
};

// 處理右鍵菜單
const handleRightClick = (event) => {
  event.preventDefault();
  if (!props.isEditing) {
    contextMenuX.value = event.clientX;
    contextMenuY.value = event.clientY;
    showContextMenu.value = true;
  }
};

// 處理編輯標題
const handleEdit = () => {
  closeContextMenu();
  emit('edit', props.id);
};

// 處理保存標題
const handleSaveTitle = () => {
  const newTitle = editingTitle.value.trim();
  if (newTitle && newTitle !== props.title) {
    emit('save-title', { conversationId: props.id, newTitle });
  } else {
    emit('cancel-edit');
  }
};

// 處理取消編輯
const handleCancelEdit = () => {
  editingTitle.value = props.title;
  emit('cancel-edit');
};

// 處理刪除對話
const handleDelete = () => {
  closeContextMenu();
  emit('delete', props.id);
};

// 關閉右鍵菜單
const closeContextMenu = () => {
  showContextMenu.value = false;
};
</script>

<style scoped>
.conversation-item {
  display: flex;
  padding: 12px;
  border-radius: var(--ios-radius-medium, 8px);
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.conversation-item:hover {
  background-color: var(--ios-gray6, #f3f4f6);
}

.conversation-item-active {
  background-color: rgba(var(--color-primary-rgb, 59, 130, 246), 0.1);
}

.avatar-container {
  margin-right: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: white;
}

.avatar-ai {
  background-color: var(--ios-green, #10b981);
}

.conversation-details {
  flex: 1;
  min-width: 0; /* 确保文本溢出时ellipsis可以正常工作 */
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.title-section {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.title-input {
  background: white;
  border: 1px solid var(--color-primary, #3b82f6);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text, #111827);
  width: 100%;
  max-width: 150px;
}

.title-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.conversation-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text, #111827);
  flex: 1;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.conversation-time {
  font-size: 12px;
  color: var(--ios-gray, #6b7280);
  flex-shrink: 0;
}

.action-buttons, .edit-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.conversation-item:hover .action-buttons {
  opacity: 1;
}

.conversation-item.conversation-item-active .action-buttons {
  opacity: 1;
}

.edit-actions {
  opacity: 1;
}

.action-button {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.edit-button {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.edit-button:hover {
  background: var(--color-primary-dark, #2563eb);
}

.delete-button {
  background: #dc2626;
  color: white;
}

.delete-button:hover {
  background: #b91c1c;
}

.save-button {
  background: #10b981;
  color: white;
}

.save-button:hover {
  background: #059669;
}

.cancel-button {
  background: #6b7280;
  color: white;
}

.cancel-button:hover {
  background: #4b5563;
}

/* 右鍵菜單樣式 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  z-index: 1000;
  min-width: 140px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  color: #374151;
}

.context-menu-item:hover {
  background-color: #f3f4f6;
}

.context-menu-item.delete-item {
  color: #dc2626;
}

.context-menu-item.delete-item:hover {
  background-color: #fef2f2;
}

.context-menu-item i {
  margin-right: 8px;
  width: 14px;
  text-align: center;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
}

.conversation-preview {
  font-size: 12px;
  color: var(--ios-gray, #6b7280);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style> 