<template>
  <div class="chat-input-wrapper">
    <div class="chat-input-container">
      <input
        v-model="inputValue"
        ref="inputRef"
        @keydown.enter.prevent="sendMessage"
        type="text"
        class="chat-input"
        :placeholder="placeholder"
        :disabled="disabled"
        autocomplete="off"
        autofocus
      />
      <button
        @click="sendMessage"
        :disabled="disabled || !inputValue.trim()"
        class="send-button"
        :class="{ 'send-button-active': inputValue.trim() }"
      >
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
    <div class="input-footer">
      <small class="hint-text">按Enter發送</small>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '請輸入您的問題...'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['send']);

const inputValue = ref(props.value);
const inputRef = ref(null);

// 当外部value变化时，更新inputValue
watch(() => props.value, (newValue) => {
  inputValue.value = newValue;
});

// 发送消息
function sendMessage() {
  if (props.disabled || !inputValue.value.trim()) return;
  
  emit('send', inputValue.value);
  inputValue.value = '';
  
  // 自动聚焦回输入框
  setTimeout(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  }, 100);
}

// 方法：聚焦输入框
function focus() {
  if (inputRef.value) {
    inputRef.value.focus();
  }
}

// 暴露方法给父组件
defineExpose({
  focus
});
</script>

<style scoped>
.chat-input-wrapper {
  width: 100%;
}

.chat-input-container {
  display: flex;
  position: relative;
  border-radius: var(--ios-radius-xl, 20px);
  background-color: white;
  border: 1px solid var(--ios-gray5, #e5e7eb);
  margin-bottom: 4px;
  box-shadow: var(--ios-shadow-small, 0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02));
  transition: box-shadow 0.2s;
}

.chat-input-container:focus-within {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1);
  border-color: var(--color-primary, #3b82f6);
}

.chat-input {
  flex: 1;
  border: none;
  padding: 12px 16px;
  font-size: 15px;
  border-radius: var(--ios-radius-xl, 20px);
  outline: none;
  background-color: transparent;
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--ios-gray6, #f3f4f6);
  color: var(--ios-gray, #9ca3af);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin-right: 6px;
  align-self: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.send-button-active {
  background-color: var(--color-primary, #3b82f6);
  color: white;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-footer {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

.hint-text {
  font-size: 12px;
  color: var(--ios-gray, #9ca3af);
}
</style> 