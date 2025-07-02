<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>批量调整咨询次数</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="selected-users-info">
          <p class="info-text">
            <i class="fas fa-users"></i>
            已选择 <strong>{{ selectedUsers.length }}</strong> 个用户
          </p>
          <div class="users-preview" v-if="selectedUsers.length > 0">
            <div class="user-tag" v-for="user in selectedUsers.slice(0, 3)" :key="user.id">
              {{ user.name || user.email }}
            </div>
            <div v-if="selectedUsers.length > 3" class="more-users">
              +{{ selectedUsers.length - 3 }} 更多...
            </div>
          </div>
        </div>

        <form @submit.prevent="submitBatchOperation">
          <div class="form-group">
            <label for="operation">操作类型</label>
            <select id="operation" v-model="operation" required class="form-select">
              <option value="">请选择操作类型</option>
              <option value="increase">增加次数</option>
              <option value="decrease">减少次数</option>
              <option value="set">设置为指定次数</option>
            </select>
          </div>

          <div class="form-group">
            <label for="amount">数量</label>
            <input 
              id="amount"
              v-model.number="amount" 
              type="number" 
              min="1" 
              max="1000"
              required 
              class="form-input"
              :placeholder="operation === 'set' ? '设置为多少次' : '调整多少次'"
            >
          </div>

          <div class="form-group">
            <label for="reason">操作原因</label>
            <textarea 
              id="reason"
              v-model="reason" 
              required 
              class="form-textarea"
              placeholder="请输入调整原因，例如：活动奖励、客服补偿等"
              rows="3"
            ></textarea>
          </div>

          <div class="preview-section" v-if="operation && amount">
            <h4>操作预览</h4>
            <div class="preview-content">
              <p class="preview-text">
                将对 <strong>{{ selectedUsers.length }}</strong> 个用户执行：
                <span class="operation-desc">
                  <template v-if="operation === 'increase'">
                    增加 <strong>{{ amount }}</strong> 次咨询次数
                  </template>
                  <template v-else-if="operation === 'decrease'">
                    减少 <strong>{{ amount }}</strong> 次咨询次数
                  </template>
                  <template v-else-if="operation === 'set'">
                    设置咨询次数为 <strong>{{ amount }}</strong> 次
                  </template>
                </span>
              </p>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              取消
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="!operation || !amount || !reason.trim()"
            >
              <i class="fas fa-check"></i>
              确认执行
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  selectedUsers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'submit']);

const operation = ref('');
const amount = ref(1);
const reason = ref('');

const operationText = computed(() => {
  switch (operation.value) {
    case 'increase': return '增加';
    case 'decrease': return '减少';
    case 'set': return '设置为';
    default: return '';
  }
});

function closeModal() {
  // 重置表单
  operation.value = '';
  amount.value = 1;
  reason.value = '';
  
  emit('close');
}

function submitBatchOperation() {
  if (!operation.value || !amount.value || !reason.value.trim()) {
    return;
  }

  const userIds = props.selectedUsers.map(user => user.id);
  
  emit('submit', {
    userIds,
    operation: operation.value,
    amount: amount.value,
    reason: reason.value.trim()
  });

  closeModal();
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.selected-users-info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-text {
  margin: 0 0 12px 0;
  color: #1e40af;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.users-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.user-tag {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.more-users {
  background: #e5e7eb;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-style: italic;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.preview-section {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.preview-section h4 {
  margin: 0 0 12px 0;
  color: #166534;
  font-size: 14px;
  font-weight: 600;
}

.preview-content {
  color: #166534;
}

.preview-text {
  margin: 0;
  font-size: 14px;
}

.operation-desc {
  color: #059669;
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 