<template>
  <div v-if="isVisible" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
    <div class="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">添加新用户</h3>
        <form @submit.prevent="submitForm" class="mt-2 space-y-4 text-left">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">姓名</label>
            <input type="text" id="name" v-model="formData.name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">邮箱</label>
            <input type="email" id="email" v-model="formData.email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <div>
            <label for="phoneNumber" class="block text-sm font-medium text-gray-700">手機號碼</label>
            <input type="tel" id="phoneNumber" v-model="formData.phoneNumber" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <div>
            <label for="position" class="block text-sm font-medium text-gray-700">職業</label>
            <select id="position" v-model="formData.position" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="">請選擇</option>
              <option value="employee">一般員工</option>
              <option value="manager">管理者</option>
              <option value="hr">人力資源</option>
              <option value="boss">企業主/雇主</option>
              <option value="others">其他</option>
            </select>
          </div>

          <div>
            <label for="industry" class="block text-sm font-medium text-gray-700">行業</label>
            <select id="industry" v-model="formData.industry" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
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

          <div>
            <label for="companyName" class="block text-sm font-medium text-gray-700">公司名稱</label>
            <input type="text" id="companyName" v-model="formData.companyName" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">密码</label>
            <input type="password" id="password" v-model="formData.password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">确认密码</label>
            <input type="password" id="confirmPassword" v-model="formData.confirmPassword" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <p v-if="passwordMismatchError" class="text-xs text-red-500 mt-1">密码不匹配</p>
          </div>

          <div>
            <label for="userType" class="block text-sm font-medium text-gray-700">用户类型</label>
            <select id="userType" v-model="formData.userType" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="employee">员工</option>
              <option value="employer">雇主</option>
              <option value="hr">HR人员</option>
              <option value="admin">管理员</option>
            </select>
          </div>

          <div>
            <label for="remainingQueries" class="block text-sm font-medium text-gray-700">初始咨询次数</label>
            <input type="number" id="remainingQueries" v-model.number="formData.remainingQueries" min="0" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">账户状态</label>
            <select id="status" v-model="formData.status" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="active">活跃</option>
              <option value="pending">待验证</option>
              <option value="disabled">已禁用</option>
            </select>
          </div>

          <div class="items-center px-4 py-3">
            <button type="submit" :disabled="passwordMismatchError" class="w-full px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              保存用户
            </button>
            <button type="button" @click="closeModal" class="mt-3 w-full px-4 py-2 bg-white text-gray-700 text-base font-medium rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  }
});

const emit = defineEmits(['close', 'save']);

// 表單數據
const formData = ref({
  name: '',
  email: '',
  phoneNumber: '',
  position: '',
  industry: '',
  companyName: '',
  userType: 'employee',
  password: '',
  confirmPassword: '',
  status: 'active',
  remainingQueries: 10
});

// 密碼不匹配錯誤
const passwordMismatchError = ref(false);

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phoneNumber: '',
    position: '',
    industry: '',
    companyName: '',
    userType: 'employee',
    password: '',
    confirmPassword: '',
    status: 'active',
    remainingQueries: 10
  };
  passwordMismatchError.value = false;
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const submitForm = () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    passwordMismatchError.value = true;
    return;
  }
  passwordMismatchError.value = false;

  // 構建要保存的資料對象
  const userData = {
    name: formData.value.name,
    email: formData.value.email,
    phoneNumber: formData.value.phoneNumber,
    position: formData.value.position,
    industry: formData.value.industry,
    companyName: formData.value.companyName,
    userType: formData.value.userType,
    password: formData.value.password,
    status: formData.value.status,
    remainingQueries: formData.value.remainingQueries
  };

  // 觸發保存事件
  emit('save', userData);
  
  // 重置表單並關閉彈窗
  resetForm();
};
</script>
