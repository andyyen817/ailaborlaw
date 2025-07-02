<template>
  <button 
    :type="type"
    :disabled="disabled || loading" 
    class="relative flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
    :class="[
      sizeClasses,
      colorClasses,
      fullWidth ? 'w-full' : '',
      disabled ? 'cursor-not-allowed opacity-70' : ''
    ]"
  >
    <span v-if="loading" class="inline-block mr-2 animate-spin">
      <i class="fas fa-circle-notch"></i>
    </span>
    <span v-else-if="icon && !iconRight" class="inline-block mr-2">
      <i :class="`fas fa-${icon}`"></i>
    </span>
    
    <slot></slot>
    
    <span v-if="icon && iconRight" class="inline-block ml-2">
      <i :class="`fas fa-${icon}`"></i>
    </span>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    type: {
      type: String,
      default: 'button',
      validator: (value) => ['button', 'submit', 'reset'].includes(value)
    },
    color: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    icon: {
      type: String,
      default: ''
    },
    iconRight: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    sizeClasses() {
      const classes = {
        'sm': 'px-3 py-2 text-xs',
        'md': 'px-4 py-3 text-sm',
        'lg': 'px-5 py-3.5 text-base'
      };
      return classes[this.size] || classes.md;
    },
    colorClasses() {
      const classes = {
        'primary': 'bg-blue-600 hover:bg-blue-700 text-white border border-transparent focus:ring-blue-500',
        'secondary': 'bg-gray-600 hover:bg-gray-700 text-white border border-transparent focus:ring-gray-500',
        'success': 'bg-green-600 hover:bg-green-700 text-white border border-transparent focus:ring-green-500',
        'danger': 'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-red-500',
        'warning': 'bg-yellow-500 hover:bg-yellow-600 text-white border border-transparent focus:ring-yellow-500',
        'info': 'bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent focus:ring-indigo-500',
        'light': 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 focus:ring-gray-500',
        'dark': 'bg-gray-800 hover:bg-gray-900 text-white border border-transparent focus:ring-gray-500'
      };
      return classes[this.color] || classes.primary;
    }
  }
};
</script> 