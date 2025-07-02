import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import EmailVerificationView from '@/views/auth/EmailVerificationView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'
import MobileLoginView from '@/views/auth/MobileLoginView.vue'
import MobileRegisterView from '@/views/auth/MobileRegisterView.vue'
import MobileEmailVerificationView from '@/views/auth/MobileEmailVerificationView.vue'
import MobileForgotPasswordView from '@/views/auth/MobileForgotPasswordView.vue'
import MobileResetPasswordView from '@/views/auth/MobileResetPasswordView.vue'
import ChangePasswordView from '@/views/auth/ChangePasswordView.vue'
import MobileChangePasswordView from '@/views/auth/MobileChangePasswordView.vue'
import HomeView from '@/views/HomeView.vue'
import ChatView from '@/views/ChatView.vue'
import ConsultationView from '@/views/ConsultationView.vue'
import ProfileView from '@/views/ProfileView.vue'
import MobileProfileView from '@/views/MobileProfileView.vue'
import AdminLoginView from '@/views/admin/AdminLoginView.vue'
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue' // 新增导入
import UserManagementView from '@/views/admin/UserManagementView.vue'
import ChatRecordsView from '@/views/admin/ChatRecordsView.vue'
// import ChatDiagnosticView from '@/views/admin/ChatDiagnosticView.vue' // 暫時註釋 - 需要重寫以使用API
import ConsultationRequestsView from '@/views/admin/ConsultationRequestsView.vue' // This will be our ExpertConsultationManagementView
import InviteManagementView from '@/views/admin/InviteManagementView.vue';
import SystemSettingsView from '@/views/admin/SystemSettingsView.vue';
import authService from '@/services/auth'
import { authGuard } from '@/utils/auth.utils'
import MobileHomeView from '@/views/MobileHomeView.vue'
import MobileChatView from '@/views/MobileChatView.vue'
import MobileConsultationView from '../views/MobileConsultationView.vue'
import InviteFriendsView from '@/views/InviteFriendsView.vue'
import MobileInviteFriendsView from '@/views/MobileInviteFriendsView.vue'
import AuthTestView from '@/views/AuthTestView.vue' // 新增导入

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      requiresAuth: true // 需要认证的路由
    }
  },
  {
    path: '/user/:userId',
    name: 'userHome',
    component: HomeView,
    meta: {
      requiresAuth: true // 需要认证的路由
    }
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView,
    meta: {
      requiresAuth: true // 需要认证的路由
    }
  },
  {
    path: '/user/:userId/chat',
    name: 'userChat',
    component: ChatView,
    meta: {
      requiresAuth: true // 需要认证的路由
    }
  },
  {
    path: '/consultation',
    name: 'consultation',
    component: ConsultationView,
    meta: {
      requiresAuth: true // 需要认证的路由
    }
  },
  {
    path: '/user/:userId/consultation',
    name: 'userConsultation',
    component: ConsultationView,
    meta: {
      requiresAuth: true // 需要认证的路由
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      requiresAuth: true,
      title: '個人資料 - 勞法通AI'
    }
  },
  {
    path: '/user/:userId/profile',
    name: 'userProfile',
    component: ProfileView,
    meta: {
      requiresAuth: true // 需要认证的路由
    }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      public: true // 公开路由，无需认证
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      public: true // 公开路由，无需认证
    }
  },
  {
    path: '/email-verification',
    name: 'EmailVerification',
    component: EmailVerificationView,
    meta: {
      public: true, // 公開路由，但需要正確的參數
      title: '郵箱驗證 - 勞法通AI'
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: {
      public: true,
      title: '忘記密碼 - 勞法通AI'
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordView,
    meta: {
      public: true,
      title: '重置密碼 - 勞法通AI'
    }
  },
  {
    path: '/mobile',
    name: 'mobileHome',
    component: MobileHomeView,
    meta: {
      public: true // 暂时改为公开路由，方便开发测试
    }
  },
  {
    path: '/mobile/user/:userId',
    name: 'mobileUserHome',
    component: MobileHomeView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/mobile/chat',
    name: 'mobileChat',
    component: MobileChatView,
    meta: {
      public: true // 暂时改为公开路由，方便开发测试
    }
  },
  {
    path: '/mobile/profile',
    name: 'mobile-profile',
    component: MobileProfileView,
    meta: {
      requiresAuth: true,
      title: '個人資料 - 勞法通AI'
    }
  },
  {
    path: '/mobile/login',
    name: 'mobileLogin',
    component: MobileLoginView,
    meta: {
      public: true // 修改為公開路由，無需認證，避免重定向循環
    }
  },
  {
    path: '/mobile/register',
    name: 'mobileRegister',
    component: MobileRegisterView,
    meta: {
      public: true // 公开路由，无需认证
    }
  },
  {
    path: '/mobile/email-verification',
    name: 'MobileEmailVerification',
    component: MobileEmailVerificationView,
    meta: {
      public: true, // 公開路由，但需要正確的參數
      title: '郵箱驗證 - 勞法通AI'
    }
  },
  {
    path: '/mobile/forgot-password',
    name: 'MobileForgotPassword',
    component: MobileForgotPasswordView,
    meta: {
      public: true,
      title: '忘記密碼 - 勞法通AI'
    }
  },
  {
    path: '/mobile/reset-password',
    name: 'MobileResetPassword',
    component: MobileResetPasswordView,
    meta: {
      public: true,
      title: '重置密碼 - 勞法通AI'
    }
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: ChangePasswordView,
    meta: {
      requiresAuth: true,
      title: '更改密碼 - 勞法通AI'
    }
  },
  {
    path: '/mobile-change-password',
    name: 'mobile-change-password',
    component: MobileChangePasswordView,
    meta: {
      requiresAuth: true,
      title: '更改密碼 - 勞法通AI'
    }
  },
  {
    path: '/admin/login',
    name: 'adminLogin',
    component: AdminLoginView,
    meta: {
      public: true // 通常管理员登录页是公开的，但登录后需要特殊权限
    }
  },
  {
    path: '/admin', // 父路由
    component: AdminLayout,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    },
    children: [
      {
        path: '', // 设置为空路径，作为 /admin 的默认子路由
        name: 'adminDashboard', // 保持名称，或可以改为 adminDefault, adminIndex 等
        component: AdminDashboardView,
        meta: { title: '仪表盘' } // 用于在 AdminLayout 中显示标题
      },
      {
        path: 'dashboard', // 仍然保留 /admin/dashboard 路径，以防有地方直接使用
        name: 'adminDashboardExplicit', // 可以给一个不同的名字或重用，但路径为空的会优先匹配 /admin
        component: AdminDashboardView, // 或者重定向到 name: 'adminDashboard'
        meta: { title: '仪表盘' } 
      },
      {
        path: 'users',
        name: 'adminUsers',
        component: UserManagementView, 
        meta: { title: '用户管理' }
      },
      {
        path: 'chat-records',
        name: 'adminChatRecords',
        component: ChatRecordsView,
        meta: { title: 'AI聊天记录' }
      },
      {
        path: 'consultation-requests',
        name: 'adminConsultationRequests',
        component: ConsultationRequestsView,
        meta: { title: '专人咨询申请' }
      },
      {
        path: 'labor-advisors',
        name: 'adminLaborAdvisors',
        component: () => import('@/views/admin/LaborAdvisorsView.vue'),
        meta: { title: '劳工顾问管理' }
      },
      {
        path: 'invites',
        name: 'adminInvites',
        component: InviteManagementView,
        meta: { title: '邀请管理' }
      },
      {
        path: 'settings',
        name: 'adminSettings',
        component: SystemSettingsView,
        meta: { 
          title: '系统设置',
          requiresSuperAdmin: true // 需要超级管理员权限
        }
      },
      {
        path: 'managers',
        name: 'adminManagers',
        component: () => import('@/views/admin/ManagersView.vue'), // 懒加载管理员管理组件
        meta: { 
          title: '管理员管理',
          requiresSuperAdmin: true // 需要超级管理员权限
        }
      },
      {
        path: 'monitor',
        name: 'adminSystemMonitor',
        component: () => import('@/views/admin/SystemMonitorView.vue'), // 懒加载系统监控组件
        meta: { 
          title: '系统监控',
          requiresSuperAdmin: true // 需要超级管理员权限
        }
      }
      // 可以在此添加更多 admin 子路由
    ]
  },
  {
    path: '/m/consultation',
    name: 'MobileConsultation',
    component: MobileConsultationView,
    meta: {
      requiresAuth: true, // 添加強制用戶認證
      title: '專家諮詢 - 勞法通AI'
    }
  },
  {
    path: '/invite',
    name: 'invite',
    component: InviteFriendsView,
    meta: {
      requiresAuth: true // 需要認證的路由
    }
  },
  {
    path: '/user/:userId/invite',
    name: 'userInvite',
    component: InviteFriendsView,
    meta: {
      requiresAuth: true // 需要認證的路由
    }
  },
  {
    path: '/mobile/invite',
    name: 'mobileInvite',
    component: MobileInviteFriendsView,
    meta: {
      requiresAuth: true // 需要認證的路由
    }
  },
  // 添加认证测试视图路由
  {
    path: '/auth-test',
    name: 'authTest',
    component: AuthTestView,
    meta: {
      requiresAuth: true // 需要认证才能访问
    }
  },
  // 添加测试页面路由 (仅在开发环境)
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/TestView.vue'),
    meta: {
      dev: true,
      public: true // 设为公开路由，方便测试
    }
  },
  // 注意：原 '/admin/dashboard' 路由已被移至 AdminLayout 的 children 中
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 使用authGuard作為全局路由守衛
router.beforeEach(authGuard);

// 導出路由相關工具方法

/**
 * 獲取登入後的重定向路徑
 * @param {Object} route - Vue 路由對象
 * @param {Boolean} isMobile - 是否為移動端
 * @returns {String} 重定向路徑
 */
export const getRedirectPath = (route, isMobile = false) => {
  // 優先使用 query 參數中的 redirect
  if (route.query.redirect) {
    return route.query.redirect;
  }
  
  // 否則使用默認路徑
  return isMobile ? '/mobile' : '/home';
};

/**
 * 處理登出操作
 * @param {Boolean} redirect - 是否重定向到登入頁
 */
export const handleLogout = (redirect = true) => {
  authService.logout(redirect);
};

export default router
