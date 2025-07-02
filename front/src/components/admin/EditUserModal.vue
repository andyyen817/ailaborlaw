<template>
  <div v-if="isVisible" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
    <div class="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">编辑用户 - {{ userToEdit.name || userToEdit.email }}</h3>
        <form @submit.prevent="handleSubmit" class="mt-4 px-7 py-3 text-left">
          <div class="mb-4">
            <label for="edit-name" class="block text-sm font-medium text-gray-700">姓名</label>
            <input type="text" id="edit-name" v-model="formData.name"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   placeholder="用户姓名">
          </div>
          
          <div class="mb-4">
            <label for="edit-email" class="block text-sm font-medium text-gray-700">電子郵箱</label>
            <input type="email" id="edit-email" v-model="formData.email"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          
          <div class="mb-4">
            <label for="edit-industry" class="block text-sm font-medium text-gray-700">行業</label>
            <select id="edit-industry" v-model="formData.industry"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">請選擇</option>
              <option value="tech">科技/IT</option>
              <option value="manufacturing">製造業</option>
              <option value="retail">零售/貿易</option>
              <option value="finance">金融/保險</option>
              <option value="education">教育/培訓</option>
              <option value="healthcare">醫療/健康</option>
              <option value="service">服務業</option>
              <option value="others">其他</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label for="edit-position" class="block text-sm font-medium text-gray-700">職業</label>
            <select id="edit-position" v-model="formData.position"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">請選擇</option>
              <option value="employee">一般員工</option>
              <option value="manager">管理者</option>
              <option value="hr">人力資源</option>
              <option value="boss">企業主/雇主</option>
              <option value="others">其他</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label for="edit-company" class="block text-sm font-medium text-gray-700">公司名稱</label>
            <input type="text" id="edit-company" v-model="formData.companyName"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   placeholder="用户公司名稱">
          </div>
          
          <div class="mb-4">
            <label for="edit-phone" class="block text-sm font-medium text-gray-700">手機號碼</label>
            <input type="tel" id="edit-phone" v-model="formData.phoneNumber"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   placeholder="用户手機號碼">
          </div>
          
          <div class="mb-4">
            <label for="edit-userType" class="block text-sm font-medium text-gray-700">用戶類型</label>
            <select id="edit-userType" v-model="formData.userType"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="admin">管理員</option>
              <option value="hr">HR人員</option>
              <option value="employer">雇主</option>
              <option value="employee">員工</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label for="edit-status" class="block text-sm font-medium text-gray-700">賬戶狀態</label>
            <select id="edit-status" v-model="formData.status"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="active">活躍</option>
              <option value="pending">待驗證</option>
              <option value="disabled">已禁用</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label for="edit-remainingQueries" class="block text-sm font-medium text-gray-700">剩餘免費次數</label>
            <input type="number" id="edit-remainingQueries" v-model.number="formData.remainingQueries"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   min="0">
          </div>
          <div class="items-center gap-4 py-3 flex justify-end">
            <button type="button" @click="closeModal"
                    class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              取消
            </button>
            <button type="submit"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              保存更改
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  userToEdit: {
    type: Object,
    default: () => null
  }
});

const emit = defineEmits(['close', 'save']);

// 表单数据
const formData = ref({
  name: '',
  email: '',
  phoneNumber: '',
  industry: '',
  position: '',
  companyName: '',
  userType: '',
  status: '',
  remainingQueries: 0
});

// 监听userToEdit变化，更新表单
watch(() => props.userToEdit, (newUser) => {
  if (newUser) {
    formData.value.name = newUser.name || '';
    formData.value.email = newUser.email || '';
    formData.value.phoneNumber = newUser.phoneNumber || '';
    formData.value.industry = newUser.industry || '';
    formData.value.position = newUser.position || newUser.occupation || '';
    formData.value.companyName = newUser.companyName || '';
    formData.value.userType = newUser.userType || '';
    formData.value.status = newUser.status || '';
    formData.value.remainingQueries = newUser.remainingQueries || 0;
  }
}, { immediate: true });

const closeModal = () => {
  emit('close');
};

const handleSubmit = () => {
  // 构建要保存的数据对象
  const dataToSave = {
    name: formData.value.name,
    email: formData.value.email,
    phoneNumber: formData.value.phoneNumber,
    industry: formData.value.industry,
    position: formData.value.position,
    companyName: formData.value.companyName,
    userType: formData.value.userType,
    status: formData.value.status,
    remainingQueries: formData.value.remainingQueries
  };
  
  // 触发保存事件，并传递数据
  emit('save', dataToSave);
  
  // 关闭模态框
  closeModal();
};
</script>

<style scoped>
/* 如果需要，可以添加特定于此组件的样式 */
</style>
