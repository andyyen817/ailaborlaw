<template>
  <div v-if="hasRequiredRole">
    <slot></slot>
  </div>
  <div v-else-if="showFallback">
    <slot name="fallback">
      <div class="p-4 bg-red-50 text-red-700 rounded">
        您無權訪問此功能。需要 {{ requiredRole }} 權限。
      </div>
    </slot>
  </div>
</template>

<script>
import { computed } from 'vue';
import adminAuthService from '@/services/adminAuth';

export default {
  name: 'AdminRoleCheck',
  props: {
    role: {
      type: String,
      default: 'admin', // 默認要求普通管理員權限
      validator: (value) => ['admin', 'super_admin'].includes(value)
    },
    showFallback: {
      type: Boolean,
      default: true // 是否顯示無權限時的提示
    }
  },
  setup(props) {
    const hasRequiredRole = computed(() => {
      // 超級管理員擁有所有權限
      if (adminAuthService.isSuperAdmin()) {
        return true;
      }
      
      // 如果需要超級管理員權限，普通管理員無法訪問
      if (props.role === 'super_admin') {
        return false;
      }
      
      // 普通管理員可以訪問普通權限
      return adminAuthService.isAuthenticated();
    });
    
    const requiredRole = computed(() => {
      return props.role === 'super_admin' ? '超級管理員' : '管理員';
    });
    
    return {
      hasRequiredRole,
      requiredRole
    };
  }
};
</script> 