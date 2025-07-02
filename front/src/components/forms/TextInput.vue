<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <div class="relative rounded-md shadow-sm">
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i :class="['text-gray-400', `fas fa-${icon}`]"></i>
      </div>
      <input 
        :id="id" 
        :type="showPassword && type === 'password' ? 'text' : type"
        v-bind="$attrs"
        class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm transition-all duration-200" 
        :class="[
          icon ? 'pl-10' : '',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
          $attrs.class
        ]"
      />
      <!-- Password visibility toggle -->
      <div v-if="type === 'password'" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <button
          type="button"
          @click="togglePassword"
          class="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
        </button>
      </div>
      <!-- Error icon -->
      <div v-else-if="error" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <i class="fas fa-exclamation-circle text-red-500"></i>
      </div>
    </div>
    <p v-if="error" class="mt-1.5 text-sm text-red-500 h-5">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-xs text-gray-500">{{ hint }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'TextInput',
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    error: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const showPassword = ref(false);
    
    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };
    
    return {
      showPassword,
      togglePassword
    };
  }
};
</script> 