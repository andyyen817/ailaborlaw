<template>
  <div class="consultation-container max-w-4xl mx-auto p-4 md:p-6">
    <!-- 回到首頁按鈕 -->
    <div class="flex items-center mb-4">
      <router-link :to="homeRoute" class="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
        <svg width="20" height="20" viewBox="0 0 576 512" fill="currentColor" class="mr-1">
          <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"/>
        </svg>
        <span>回到首頁</span>
      </router-link>
    </div>

    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">專人勞基法諮詢服務</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">即時諮詢管道</h2>
      <p class="text-gray-600 mb-6">
        針對較為複雜或特殊的勞動法規問題，建議您聯繫我們的專業顧問獲取更詳細的指導。
      </p>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div class="contact-method border border-gray-200 rounded-lg p-4 flex items-start">
          <div class="icon-wrapper bg-green-100 rounded-full p-3 mr-4">
            <i class="fab fa-line text-xl text-green-600"></i>
          </div>
          <div>
            <h3 class="font-medium text-gray-800 mb-1">LINE 諮詢</h3>
            <p class="text-gray-600 mb-2">ID: wed11223</p>
            <p class="text-sm text-gray-500">推薦用於即時對話和快速問答</p>
          </div>
        </div>
        
        <div class="contact-method border border-gray-200 rounded-lg p-4 flex items-start">
          <div class="icon-wrapper bg-blue-100 rounded-full p-3 mr-4">
            <i class="fas fa-envelope text-xl text-blue-600"></i>
          </div>
          <div>
            <h3 class="font-medium text-gray-800 mb-1">電子郵件諮詢</h3>
            <p class="text-gray-600 mb-2">wed801001@gmail.com</p>
            <p class="text-sm text-gray-500">適合詳細問題和需要文件附件的情況</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">專人諮詢預約表單</h2>
      <p class="text-gray-600 mb-6">
        填寫以下表單，我們的專業顧問將在24小時內與您聯繫，為您提供針對性的勞動法規諮詢服務。
      </p>
      
      <form @submit.prevent="submitForm">
        <!-- 左列 - 個人信息 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">個人資訊</h3>
          <div class="space-y-4">
            <!-- 姓名 -->
            <div class="form-group">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                姓名 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                id="name"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="請輸入您的真實姓名，例如：陳大明"
                required
                maxlength="50"
                @blur="validateField('name')"
              />
              <small class="text-gray-500 text-xs mt-1 block">請輸入中文或英文姓名，2-50個字符</small>
              <span v-if="errors.name" class="text-red-600 text-xs mt-1 block">{{ errors.name }}</span>
            </div>
            
            <!-- 地區選擇 -->
            <div class="form-group">
              <label for="region" class="block text-sm font-medium text-gray-700 mb-1">
                所在地區 <span class="text-gray-400">(可選)</span>
              </label>
              <select
                v-model="form.region"
                id="region"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                @change="validateField('region')"
              >
                <option value="">請選擇您所在的縣市</option>
                <!-- 直轄市 -->
                <optgroup label="直轄市">
                  <option value="台北市">台北市</option>
                  <option value="新北市">新北市</option>
                  <option value="桃園市">桃園市</option>
                  <option value="台中市">台中市</option>
                  <option value="台南市">台南市</option>
                  <option value="高雄市">高雄市</option>
                </optgroup>
                <!-- 縣市 -->
                <optgroup label="縣市">
                  <option value="基隆市">基隆市</option>
                  <option value="新竹市">新竹市</option>
                  <option value="新竹縣">新竹縣</option>
                  <option value="苗栗縣">苗栗縣</option>
                  <option value="彰化縣">彰化縣</option>
                  <option value="南投縣">南投縣</option>
                  <option value="雲林縣">雲林縣</option>
                  <option value="嘉義市">嘉義市</option>
                  <option value="嘉義縣">嘉義縣</option>
                  <option value="屏東縣">屏東縣</option>
                  <option value="宜蘭縣">宜蘭縣</option>
                  <option value="花蓮縣">花蓮縣</option>
                  <option value="台東縣">台東縣</option>
                  <option value="澎湖縣">澎湖縣</option>
                  <option value="金門縣">金門縣</option>
                  <option value="連江縣">連江縣</option>
                </optgroup>
              </select>
              <small class="text-gray-500 text-xs mt-1 block">選擇您所在的縣市，有助於我們安排當地的專業顧問</small>
              <span v-if="errors.region" class="text-red-600 text-xs mt-1 block">{{ errors.region }}</span>
            </div>
            
            <!-- 聯絡電話 -->
            <div class="form-group">
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                聯絡電話 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.phone"
                type="tel"
                id="phone"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="請輸入台灣手機號碼，例如：0912345678"
                required
                maxlength="15"
                @blur="validateField('phone')"
                @input="formatPhoneNumber"
              />
              <small class="text-gray-500 text-xs mt-1 block">請輸入台灣手機號碼格式：09xxxxxxxx 或市話格式</small>
              <span v-if="errors.phone" class="text-red-600 text-xs mt-1 block">{{ errors.phone }}</span>
            </div>
            
            <!-- Line ID -->
            <div class="form-group">
              <label for="lineId" class="block text-sm font-medium text-gray-700 mb-1">
                Line ID <span class="text-gray-400">(可選)</span>
              </label>
              <input
                v-model="form.lineId"
                type="text"
                id="lineId"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="請輸入您的Line ID，例如：mylineid123"
                maxlength="50"
                @blur="validateField('lineId')"
              />
              <small class="text-gray-500 text-xs mt-1 block">如果您有Line帳號，可提供Line ID方便聯繫</small>
              <span v-if="errors.lineId" class="text-red-600 text-xs mt-1 block">{{ errors.lineId }}</span>
            </div>
            
            <!-- 電子郵件 -->
            <div class="form-group">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                電子郵件 <span class="text-gray-400">(可選)</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                id="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="請輸入您的電子郵箱，例如：example@gmail.com"
                maxlength="100"
                @blur="validateField('email')"
              />
              <small class="text-gray-500 text-xs mt-1 block">請輸入有效的電子郵箱地址，格式：user@domain.com</small>
              <span v-if="errors.email" class="text-red-600 text-xs mt-1 block">{{ errors.email }}</span>
            </div>
          </div>
        </div>
        
        <!-- 右列 - 諮詢詳情 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">諮詢需求</h3>
          <div class="space-y-4">
            <!-- 希望獲得的服務 -->
            <div class="form-group">
              <label for="service" class="block text-sm font-medium text-gray-700 mb-1">
                希望獲得的服務 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.service"
                id="service"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                required
                @change="validateField('service')"
              >
                <option value="" disabled>請選擇您需要的服務類型</option>
                <option value="labor_contract">勞動契約審核 - 合約條款、簽約問題</option>
                <option value="compensation">薪資與加班費問題 - 工資計算、加班費糾紛</option>
                <option value="termination">終止僱傭關係 - 解僱、離職、資遣相關</option>
                <option value="workplace_safety">職場安全問題 - 工作環境、職業傷害</option>
                <option value="discrimination">就業歧視問題 - 性別、年齡、種族歧視</option>
                <option value="other">其他問題 - 上述未涵蓋的勞動法規問題</option>
              </select>
              <small class="text-gray-500 text-xs mt-1 block">請選擇最符合您問題的服務類型，以便安排專業顧問</small>
              <span v-if="errors.service" class="text-red-600 text-xs mt-1 block">{{ errors.service }}</span>
            </div>
            
            <!-- 希望諮詢時間 -->
            <div class="form-group">
              <label for="consultationTime" class="block text-sm font-medium text-gray-700 mb-1">
                希望諮詢時間 <span class="text-gray-400">(可選)</span>
              </label>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="text-xs text-gray-500">時間段</label>
                  <select
                    v-model="form.timeOfDay"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                    @change="validateField('consultationTime')"
                  >
                    <option value="morning">上午 (09:00-12:00)</option>
                    <option value="afternoon">下午 (13:00-18:00)</option>
                    <option value="evening">晚上 (19:00-21:00)</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs text-gray-500">偏好開始時間</label>
                  <select
                    v-model="form.startTime"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                    @change="validateField('consultationTime')"
                  >
                    <option value="">選擇時間</option>
                    <option value="09:00">09:00</option>
                    <option value="09:30">09:30</option>
                    <option value="10:00">10:00</option>
                    <option value="10:30">10:30</option>
                    <option value="11:00">11:00</option>
                    <option value="11:30">11:30</option>
                    <option value="13:00">13:00</option>
                    <option value="13:30">13:30</option>
                    <option value="14:00">14:00</option>
                    <option value="14:30">14:30</option>
                    <option value="15:00">15:00</option>
                    <option value="15:30">15:30</option>
                    <option value="16:00">16:00</option>
                    <option value="16:30">16:30</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs text-gray-500">偏好結束時間</label>
                  <select
                    v-model="form.endTime"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                    @change="validateField('consultationTime')"
                  >
                    <option value="">選擇時間</option>
                    <option value="09:30">09:30</option>
                    <option value="10:00">10:00</option>
                    <option value="10:30">10:30</option>
                    <option value="11:00">11:00</option>
                    <option value="11:30">11:30</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="13:30">13:30</option>
                    <option value="14:00">14:00</option>
                    <option value="14:30">14:30</option>
                    <option value="15:00">15:00</option>
                    <option value="15:30">15:30</option>
                    <option value="16:00">16:00</option>
                    <option value="16:30">16:30</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                  </select>
                </div>
              </div>
              <small class="text-gray-500 text-xs mt-1 block">請選擇您方便接受諮詢的時間段，我們會盡量配合您的時間安排</small>
              <span v-if="errors.consultationTime" class="text-red-600 text-xs mt-1 block">{{ errors.consultationTime }}</span>
            </div>
            
            <!-- 問題詳情 -->
            <div class="form-group">
              <label for="details" class="block text-sm font-medium text-gray-700 mb-1">
                問題詳情 <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.details"
                id="details"
                rows="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="請詳細描述您遇到的問題或需要諮詢的內容，例如：&#10;• 具體發生了什麼事情？&#10;• 涉及哪些條款或規定？&#10;• 您希望了解哪些法律權益？&#10;&#10;詳細的描述有助於我們為您提供更精準的法律建議。"
                required
                minlength="10"
                maxlength="1000"
                @blur="validateField('details')"
                @input="updateDetailsCount"
              ></textarea>
              <div class="flex justify-between items-center mt-1">
                <small class="text-gray-500 text-xs">請詳細描述您的問題，至少10個字符，最多1000個字符</small>
                <small class="text-gray-500 text-xs">{{ form.details.length }}/1000</small>
              </div>
              <span v-if="errors.details" class="text-red-600 text-xs mt-1 block">{{ errors.details }}</span>
            </div>
            
            <!-- 偏好聯絡方式 -->
            <div class="form-group">
              <label for="preferred_contact" class="block text-sm font-medium text-gray-700 mb-2">
                偏好聯絡方式 <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-3 gap-4">
                <label class="bg-white border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-50" :class="{ 'border-primary bg-primary-50': form.preferredContact.phone }">
                  <input type="checkbox" v-model="form.preferredContact.phone" class="sr-only" @change="validateField('preferredContact')" />
                  <svg class="text-2xl mb-2" width="24" height="24" viewBox="0 0 512 512" fill="currentColor" :class="form.preferredContact.phone ? 'text-primary' : 'text-gray-500'">
                    <path d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"/>
                  </svg>
                  <span class="text-sm font-medium" :class="form.preferredContact.phone ? 'text-primary' : 'text-gray-500'">電話</span>
                  <span class="text-xs text-gray-400 mt-1">快速聯繫</span>
                </label>
                <label class="bg-white border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-50" :class="{ 'border-primary bg-primary-50': form.preferredContact.line }">
                  <input type="checkbox" v-model="form.preferredContact.line" class="sr-only" @change="validateField('preferredContact')" />
                  <i class="fab fa-line text-2xl mb-2" :class="form.preferredContact.line ? 'text-primary' : 'text-gray-500'"></i>
                  <span class="text-sm font-medium" :class="form.preferredContact.line ? 'text-primary' : 'text-gray-500'">LINE</span>
                  <span class="text-xs text-gray-400 mt-1">即時對話</span>
                </label>
                <label class="bg-white border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-50" :class="{ 'border-primary bg-primary-50': form.preferredContact.email }">
                  <input type="checkbox" v-model="form.preferredContact.email" class="sr-only" @change="validateField('preferredContact')" />
                  <i class="fas fa-envelope text-2xl mb-2" :class="form.preferredContact.email ? 'text-primary' : 'text-gray-500'"></i>
                  <span class="text-sm font-medium" :class="form.preferredContact.email ? 'text-primary' : 'text-gray-500'">電子郵件</span>
                  <span class="text-xs text-gray-400 mt-1">正式回覆</span>
                </label>
              </div>
              <small class="text-gray-500 text-xs mt-2 block">請至少選擇一種聯絡方式，我們會透過您選擇的方式與您聯繫</small>
              <span v-if="errors.preferredContact" class="text-red-600 text-xs mt-1 block">{{ errors.preferredContact }}</span>
            </div>
          </div>
        </div>
        
        <div class="mt-8">
          <button
            type="submit"
            class="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin mr-2"></i>提交中...
            </span>
            <span v-else>提交諮詢申請</span>
          </button>
        </div>
      </form>
    </div>
    
    <!-- 成功提交消息 -->
    <div v-if="isSubmitSuccess" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-lg p-6 max-w-md">
        <div class="text-center mb-4">
          <i class="fas fa-check-circle text-green-500 text-5xl"></i>
        </div>
        <h3 class="text-xl font-semibold text-center mb-2">申請提交成功！</h3>
        <p class="text-gray-600 text-center mb-6">
          我們已收到您的諮詢申請，專業顧問將在24小時內與您聯繫。
        </p>
        <div class="flex space-x-3">
          <button 
            @click="isSubmitSuccess = false" 
            class="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
          >
            確定
          </button>
          <router-link 
            to="/" 
            class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors text-center"
          >
            回到勞法通AI
          </router-link>
        </div>
        <button 
          @click="isSubmitSuccess = false" 
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="關閉"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/auth';
import dataManager, { DATA_TYPES } from '../services/dataManager.js';
import expertConsultationService from '../services/expertConsultationService.js';

const router = useRouter();

// 表单数据
const form = reactive({
  name: '',
  region: '',  // 新增地區字段
  phone: '',
  email: '',
  lineId: '',
  service: '',
  details: '',
  preferredContact: {
    phone: false,
    line: false,
    email: false
  },
  timeOfDay: 'morning',
  startTime: '',
  endTime: ''
});

// 错误信息
const errors = reactive({
  name: '',
  region: '',  // 新增地區錯誤字段
  phone: '',
  email: '',
  lineId: '',
  service: '',
  details: '',
  preferredContact: '',
  consultationTime: ''
});

// 提交状态
const isSubmitting = ref(false);
const isSubmitSuccess = ref(false);

// 計算返回首頁路由，保留用戶ID
const homeRoute = computed(() => {
  const userId = localStorage.getItem('auth_user_id') || '';
  // 如果有用戶ID，返回到用戶專屬頁面，否則返回根路徑
  return userId ? { path: `/user/${userId}` } : { path: '/' };
});

// 尝试从用户信息中预填表单
try {
  const user = authService.getCurrentUser();
  if (user) {
    form.name = user.name || '';
    form.email = user.email || '';
    form.phone = user.phoneNumber || '';
  }
} catch (error) {
  console.error('获取用户信息失败:', error);
}

// 驗證表單
function validateForm() {
  let isValid = true;
  
  // 重置錯誤信息
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  
  // 驗證姓名
  if (!form.name.trim()) {
    errors.name = '請輸入您的姓名';
    isValid = false;
  } else if (form.name.trim().length < 2) {
    errors.name = '姓名至少需要2個字符';
    isValid = false;
  } else if (form.name.trim().length > 50) {
    errors.name = '姓名不能超過50個字符';
    isValid = false;
  }
  
  // 驗證電話（台灣手機號碼格式）
  if (!form.phone.trim()) {
    errors.phone = '請輸入您的聯絡電話';
    isValid = false;
  } else {
    // 🔧 修復：在驗證前先移除所有非數字字符，以兼容格式化後的電話號碼
    const cleanPhone = form.phone.replace(/\D/g, '');
    
    // 台灣手機號碼格式驗證：09xxxxxxxx
    const phoneRegex = /^0?9\d{8}$/;  // 簡化為純數字驗證
    // 也支援市話格式：02-xxxxxxxx, 03-xxxxxxx, 04-xxxxxxxx, 05-xxxxxxx, 06-xxxxxxx, 07-xxxxxxx, 08-xxxxxxxx
    const landlineRegex = /^0[2-8]\d{7,8}$/;  // 簡化為純數字驗證
    
    if (!phoneRegex.test(cleanPhone) && !landlineRegex.test(cleanPhone)) {
      errors.phone = '請輸入有效的台灣電話號碼格式，例如：0912345678 或 02-12345678';
      isValid = false;
    }
  }
  
  // 驗證郵箱 (如果填寫了)
  if (form.email && form.email.trim()) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email.trim())) {
      errors.email = '請輸入有效的電子郵箱地址格式';
      isValid = false;
    }
  }
  
  // 驗證Line ID (如果填寫了)
  if (form.lineId && form.lineId.trim()) {
    if (form.lineId.trim().length < 3) {
      errors.lineId = 'Line ID至少需要3個字符';
      isValid = false;
    } else if (form.lineId.trim().length > 50) {
      errors.lineId = 'Line ID不能超過50個字符';
      isValid = false;
    }
  }
  
  // 驗證服務類型
  if (!form.service) {
    errors.service = '請選擇您需要的服務類型';
    isValid = false;
  }
  
  // 驗證諮詢時間
  if (form.startTime && form.endTime) {
    if (form.startTime >= form.endTime) {
      errors.consultationTime = '結束時間必須晚於開始時間';
      isValid = false;
    }
  }
  
  // 驗證問題詳情
  if (!form.details.trim()) {
    errors.details = '請描述您的問題';
    isValid = false;
  } else if (form.details.trim().length < 10) {
    errors.details = '問題描述至少需要10個字符，請提供更詳細的資訊';
    isValid = false;
  } else if (form.details.trim().length > 1000) {
    errors.details = '問題描述不能超過1000個字符';
    isValid = false;
  }
  
  // 驗證首選聯絡方式
  if (!form.preferredContact.phone && !form.preferredContact.line && !form.preferredContact.email) {
    errors.preferredContact = '請至少選擇一種聯絡方式';
    isValid = false;
  }
  
  return isValid;
}

// 🔧 新增：單個字段驗證函數
function validateField(fieldName) {
  // 清除該字段的錯誤信息
  errors[fieldName] = '';
  
  switch (fieldName) {
    case 'name':
      if (!form.name.trim()) {
        errors.name = '請輸入您的姓名';
      } else if (form.name.trim().length < 2) {
        errors.name = '姓名至少需要2個字符';
      } else if (form.name.trim().length > 50) {
        errors.name = '姓名不能超過50個字符';
      }
      break;
      
    case 'phone':
      if (!form.phone.trim()) {
        errors.phone = '請輸入您的聯絡電話';
      } else {
        // 🔧 修復：在驗證前先移除所有非數字字符，以兼容格式化後的電話號碼
        const cleanPhone = form.phone.replace(/\D/g, '');
        
        // 台灣手機號碼格式驗證：09xxxxxxxx
        const phoneRegex = /^0?9\d{8}$/;  // 簡化為純數字驗證
        // 也支援市話格式：02-xxxxxxxx, 03-xxxxxxx, 04-xxxxxxxx, 05-xxxxxxx, 06-xxxxxxx, 07-xxxxxxx, 08-xxxxxxxx
        const landlineRegex = /^0[2-8]\d{7,8}$/;  // 簡化為純數字驗證
        
        if (!phoneRegex.test(cleanPhone) && !landlineRegex.test(cleanPhone)) {
          errors.phone = '請輸入有效的台灣電話號碼格式';
        }
      }
      break;
      
    case 'email':
      if (form.email && form.email.trim()) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(form.email.trim())) {
          errors.email = '請輸入有效的電子郵箱地址格式';
        }
      }
      break;
      
    case 'lineId':
      if (form.lineId && form.lineId.trim()) {
        if (form.lineId.trim().length < 3) {
          errors.lineId = 'Line ID至少需要3個字符';
        } else if (form.lineId.trim().length > 50) {
          errors.lineId = 'Line ID不能超過50個字符';
        }
      }
      break;
      
    case 'service':
      if (!form.service) {
        errors.service = '請選擇您需要的服務類型';
      }
      break;
      
    case 'details':
      if (!form.details.trim()) {
        errors.details = '請描述您的問題';
      } else if (form.details.trim().length < 10) {
        errors.details = '問題描述至少需要10個字符，請提供更詳細的資訊';
      } else if (form.details.trim().length > 1000) {
        errors.details = '問題描述不能超過1000個字符';
      }
      break;
      
    case 'consultationTime':
      if (form.startTime && form.endTime && form.startTime >= form.endTime) {
        errors.consultationTime = '結束時間必須晚於開始時間';
      }
      break;
      
    case 'preferredContact':
      if (!form.preferredContact.phone && !form.preferredContact.line && !form.preferredContact.email) {
        errors.preferredContact = '請至少選擇一種聯絡方式';
      }
      break;
  }
}

// 🔧 新增：電話號碼格式化
function formatPhoneNumber() {
  // 移除所有非數字字符
  let phone = form.phone.replace(/\D/g, '');
  
  // 台灣手機號碼格式化
  if (phone.startsWith('09') && phone.length <= 10) {
    // 手機號碼格式：0912-345-678
    if (phone.length > 4 && phone.length <= 7) {
      form.phone = phone.slice(0, 4) + '-' + phone.slice(4);
    } else if (phone.length > 7) {
      form.phone = phone.slice(0, 4) + '-' + phone.slice(4, 7) + '-' + phone.slice(7, 10);
    } else {
      form.phone = phone;
    }
  } else if (phone.length <= 15) {
    // 保留原始輸入，支援其他格式
    form.phone = phone;
  }
}

// 🔧 新增：更新字符計數
function updateDetailsCount() {
  // 這個函數會自動觸發響應式更新，顯示字符計數
}

// 提交表单
async function submitForm() {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // 🔒 確認用戶認證信息
    const userToken = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('auth_user_id');
    
    if (!userToken || !userId) {
      console.error('ConsultationView: submitForm - 無法獲取用戶認證信息');
      alert('登錄狀態已過期，請重新登錄');
      router.push('/login?redirect=/consultation');
      return;
    }
    
    // 整理聯繫方式數據格式
    const preferredContactMethods = [];
    if (form.preferredContact.phone) preferredContactMethods.push('phone');
    if (form.preferredContact.line) preferredContactMethods.push('line');
    if (form.preferredContact.email) preferredContactMethods.push('email');
    
    // 🔧 修复：验证联系方式
    if (preferredContactMethods.length === 0) {
      throw new Error('請至少選擇一種偏好聯絡方式');
    }
    
    // 🔧 修复：移除formattedConsultationTime格式化逻辑
    
    // 準備API提交數據
    const consultationData = {
      name: form.name,
      region: form.region,
      phone: form.phone,
      email: form.email,
      lineId: form.lineId,
      service: form.service,
      details: form.details,
      preferredContact: preferredContactMethods,
      // 🔧 修复：根据API文档，只传递后端需要的时间字段
      timeOfDay: form.timeOfDay,
      startTime: form.startTime,
      endTime: form.endTime
      // 🔧 修复：不再生成consultationTime字段，expertConsultationService会处理simplifiedTime
    };
    
    console.log('🎯 網頁版準備提交專家諮詢申請，數據:', consultationData);
    
    // 🔧 修复：直接使用expertConsultationService提交，不再使用降级方案
    try {
      const apiResponse = await expertConsultationService.submitConsultation(consultationData, userToken);
      
      if (apiResponse && apiResponse.success) {
        console.log('✅ 網頁版專家諮詢申請API提交成功:', apiResponse);
        
        // 🔧 修复：真正的API成功后再处理后续逻辑
        // 同時更新用戶個人資料中的手機號碼（如果用戶已登入）
        try {
          const user = authService.getCurrentUser();
          if (user && user.id && form.phone) {
            // 只有當手機號碼有變更時才更新用戶資料
            if (user.phoneNumber !== form.phone) {
              console.log('更新用戶手機號碼:', form.phone);
              await authService.updateProfile({
                phoneNumber: form.phone,
              });
            }
          }
        } catch (updateError) {
          console.error('更新用戶手機號碼失敗:', updateError);
          // 即使更新失敗，也繼續提交表單，不影響主流程
        }
        
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 重置表单
        Object.keys(form).forEach(key => {
          if (key === 'preferredContact') {
            form[key] = {
              phone: false,
              line: false,
              email: false
            };
          } else if (key === 'timeOfDay') {
            form[key] = 'morning';
          } else {
            form[key] = '';
          }
        });
        
        isSubmitSuccess.value = true;
        alert('✅ 專家諮詢申請提交成功！我們會盡快與您聯繫。');
        
      } else {
        throw new Error(apiResponse?.message || 'API響應異常');
      }
      
    } catch (apiError) {
      console.error('❌ 網頁版專家諮詢API調用失敗:', apiError);
      
      // 🔧 修复：API失败时，不再使用DataManager降级，直接显示错误
      // 移除所有DataManager降级逻辑，确保用户看到真实的API失败状态
      
      // 🔧 修复：提供更准确的错误提示
      let errorMessage = '提交申請時出錯，請稍後再試。';
      
      if (apiError.message?.includes('缺少必填字段')) {
        errorMessage = `表單驗證失敗：${apiError.message}`;
      } else if (apiError.message?.includes('聯絡方式')) {
        errorMessage = '請至少選擇一種偏好聯絡方式';
      } else if (apiError.message?.includes('輸入數據驗證失敗')) {
        errorMessage = '提交的數據格式有誤，請檢查表單內容後重新提交';
      } else if (apiError.message?.includes('網路') || apiError.message?.includes('Network')) {
        errorMessage = '網路連接失敗，請檢查網路後重試';
      } else if (apiError.message?.includes('認證') || apiError.message?.includes('token')) {
        errorMessage = '登錄狀態已過期，請重新登錄';
        setTimeout(() => {
          router.push('/login?redirect=/consultation');
        }, 2000);
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }
      
      // 🔧 修复：直接抛出错误，让外层catch处理
      throw new Error(errorMessage);
    }
    
  } catch (error) {
    console.error('ConsultationView: 網頁版提交專家諮詢請求時出錯:', error);
    
    // 🔧 修复：提供更准确的错误提示
    let errorMessage = '提交申請時出錯，請稍後再試。';
    
    if (error.message?.includes('缺少必填字段')) {
      errorMessage = `表單驗證失敗：${error.message}`;
    } else if (error.message?.includes('聯絡方式')) {
      errorMessage = '請至少選擇一種偏好聯絡方式';
    } else if (error.message?.includes('輸入數據驗證失敗')) {
      errorMessage = '提交的數據格式有誤，請檢查表單內容';
    } else if (error.message?.includes('網路') || error.message?.includes('Network')) {
      errorMessage = '網路連接失敗，請檢查網路後重試';
    } else if (error.message?.includes('認證') || error.message?.includes('token')) {
      errorMessage = '登錄狀態已過期，請重新登錄';
      setTimeout(() => {
        router.push('/login?redirect=/consultation');
      }, 2000);
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(errorMessage);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.consultation-container {
  min-height: calc(100vh - 64px);
  padding-bottom: 2rem;
}

@media (min-width: 768px) {
  .consultation-container {
    padding-top: 2rem;
  }
}

/* 🔧 修復：添加缺失的CSS變量定義，使聯絡方式選擇視覺反饋正常顯示 */
:root {
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-primary-50: #eff6ff;
}

.text-primary {
  color: var(--color-primary);
}

.bg-primary {
  background-color: var(--color-primary);
}

.bg-primary-50 {
  background-color: var(--color-primary-50);
}

.hover\:bg-primary-dark:hover {
  background-color: var(--color-primary-dark);
}

.border-primary {
  border-color: var(--color-primary);
}

.focus\:ring-primary:focus {
  --tw-ring-color: var(--color-primary);
}
</style> 