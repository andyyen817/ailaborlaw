<template>
  <div class="flex h-screen bg-gray-50">
    <!-- 侧边栏 -->
    <aside class="w-64 bg-gray-800 text-white">
      <div class="p-4 border-b border-gray-700">
        <div class="flex items-center gap-3">
          <!-- Heroicon - outline - scale -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c-.317.047-.634.088-.95.125M18.75 4.97A48.354 48.354 0 0 1 12 4.5c2.291 0 4.545.16 6.75.47m-13.5 0c.317.047.634.088.95.125m11.632 2.865A48.603 48.603 0 0 1 12 7.5c-2.632 0-5.207.19-7.732.55m15.464 0A48.603 48.603 0 0 0 12 7.5c2.632 0 5.207.19 7.732.55M4.5 7.5A48.603 48.603 0 0 0 12 7.5c-2.632 0-5.207.19-7.732.55" />
          </svg>
          <span class="text-lg font-semibold">劳法通AI</span>
        </div>
      </div>
      
      <nav class="mt-4">
        <ul>
          <li class="mb-1">
            <router-link to="/admin/dashboard" class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded" active-class="bg-blue-600 text-white">
              <!-- Heroicon - outline - chart-pie -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
              </svg>
              <span>仪表盘</span>
            </router-link>
          </li>
          <li class="mb-1">
            <router-link to="/admin/users" class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded" active-class="bg-blue-600 text-white">
              <!-- Heroicon - outline - users -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              <span>用户管理</span>
            </router-link>
          </li>
          <li class="mb-1">
            <router-link to="/admin/chat-records" class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded" active-class="bg-blue-600 text-white">
              <!-- Heroicon - outline - chat-bubble-left-right -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.68-3.091a1.153 1.153 0 0 0-.76-.31H7.625S6.875 16.5 6.875 15V11.5c0-.97.616-1.813 1.5-2.097m14.25-3.866A2.25 2.25 0 0 0 18.75 2.25H13.5A2.25 2.25 0 0 0 11.25 4.5v2.25c0 .517.212.992.55 1.352l-2.282 2.282c-1.041-.331-2.235-.463-3.46-.369a2.25 2.25 0 0 0-1.98 2.193v4.286c0 .517.212.992.55 1.352l-2.282 2.282c-1.041-.331-2.235-.463-3.46-.369a2.25 2.25 0 0 0-1.98 2.193v1.516c0 .97.616 1.813 1.5 2.097A2.25 2.25 0 0 0 4.5 21.75H9A2.25 2.25 0 0 0 11.25 19.5v-2.25c0-.517-.212-.992-.55-1.352l2.282-2.282c1.041.331 2.235.463 3.46.369a2.25 2.25 0 0 0 1.98-2.193V11.5c0-.517-.212-.992-.55-1.352l2.282-2.282c1.041.331 2.235.463 3.46.369a2.25 2.25 0 0 0 1.98-2.193V4.5A2.25 2.25 0 0 0 20.25 8.511Z" />
              </svg>
              <span>AI聊天记录</span>
            </router-link>
          </li>
          <li class="mb-1">
            <router-link to="/admin/consultation-requests" class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded" active-class="bg-blue-600 text-white">
              <!-- Heroicon - outline - identification -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <span>专人咨询申请</span>
            </router-link>
          </li>
          <li class="mb-1">
            <router-link to="/admin/labor-advisors" class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded" active-class="bg-blue-600 text-white">
              <!-- Heroicon - outline - user-group -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              <span>劳工顾问管理</span>
            </router-link>
          </li>
          <li class="mb-1">
            <router-link to="/admin/invites" class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded" active-class="bg-blue-600 text-white">
              <!-- Heroicon - outline - user-plus -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              <span>邀请管理</span>
            </router-link>
          </li>
          <li class="mb-1">
            <router-link to="/admin/settings" class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded" active-class="bg-blue-600 text-white">
              <!-- Heroicon - outline - cog-6-tooth -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 1.905c-.007.378.138.75.431.99l1.005.828c.289.237.387.628.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.333.183-.583.495-.646.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.645-.87-.074-.04-.147-.083-.22-.127-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 0 1 0-1.905c.007-.378-.137-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span>系统设置</span>
            </router-link>
          </li>
          <!-- 其他导航项可以根据 design/prototypes/admin-users.html 添加 -->
          <li class="mb-1">
            <a href="#" @click.prevent="logoutAdmin" class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded">
              <!-- Heroicon - outline - arrow-left-on-rectangle -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              <span>退出登录</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <!-- 固定在底部的退出登录按钮 (原型中有，但侧边栏已包含一个，可以考虑是否保留或修改) -->
      <!-- 
      <div class="absolute bottom-0 w-64 p-4 border-t border-gray-700">
        <a href="#" @click.prevent="logoutAdmin" class="flex items-center text-gray-300 hover:text-white">
          <i class="fas fa-sign-out-alt mr-3"></i>
          <span>退出登录</span>
        </a>
      </div>
      -->
    </aside>
    
    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部栏 -->
      <header class="flex justify-between items-center p-4 bg-white border-b">
        <!-- 动态页面标题，或者可以从子组件通过事件传递上来 -->
        <h1 class="text-2xl font-semibold text-gray-800">{{ $route.meta.title || '管理后台' }}</h1>
        
        <div class="flex items-center gap-4">
          <!-- 搜索框 (如果全局需要) -->
          <div class="relative hidden md:block">
            <input type="text" placeholder="搜索..." class="pl-10 pr-4 py-2 border rounded-lg w-64">
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i> <!-- 这个搜索图标也可能需要替换 -->
          </div>
          
          <div class="flex items-center gap-3">
            <!-- 通知图标 -->
            <div class="relative">
              <i class="fas fa-bell text-gray-500 text-xl"></i> <!-- 这个通知图标也可能需要替换 -->
              <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </div>
            
            <!-- 用户头像和名称 -->
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                A <!-- 可以替换为用户首字母或头像 -->
              </div>
              <span class="text-gray-700">{{ adminUserDisplayName }}</span>
            </div>
          </div>
        </div>
      </header>
      
      <!-- 页面内容 -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/auth';
import adminAuthService from '@/services/adminAuth';

export default {
  name: 'AdminLayout',
  setup() {
    const router = useRouter();
    const adminUser = adminAuthService.getCurrentAdmin();

    const adminUserDisplayName = computed(() => {
      return adminUser?.name || adminUser?.email || 'Admin';
    });

    const logoutAdmin = async () => {
      try {
        const result = await adminAuthService.logout(true);
        console.log('管理員登出結果:', result);
        
        if (result.success && result.shouldRedirect) {
          // 使用Vue Router導航到登入頁面
          router.push({
            path: result.redirectPath,
            query: { t: new Date().getTime() } // 添加時間戳防止緩存
          });
        }
      } catch (error) {
        console.error('登出過程發生錯誤:', error);
        // 即使發生錯誤，也嘗試導航到登入頁面
        router.push('/admin/login');
      }
    };

    return {
      adminUserDisplayName,
      logoutAdmin,
    };
  }
};
</script>

<style scoped>
/* 使用 Tailwind CSS，大部分样式已内联。如果需要额外样式，可在此处添加 */
.router-link-exact-active { /* active-class 已经处理了，这里可以不写或做备用 */
  /* background-color: #2563eb; /* blue-600 */
  /* color: white; */
}
</style>
