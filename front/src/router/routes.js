// 🔧 P3 更新：路由配置集成新功能
import { createRouter, createWebHistory } from 'vue-router';

// 用户页面
const ChatView = () => import('@/views/ChatView.vue');
const InviteFriendsView = () => import('@/views/InviteFriendsView.vue');
const ProfileView = () => import('@/views/ProfileView.vue');
const QueryRecordsView = () => import('@/views/QueryRecordsView.vue');

// 管理员页面
const AdminLoginView = () => import('@/views/admin/AdminLoginView.vue');
const AdminDashboardView = () => import('@/views/admin/AdminDashboardView.vue');
const UserManagementView = () => import('@/views/admin/UserManagementView.vue');
const InviteManagementView = () => import('@/views/admin/InviteManagementView.vue');
const SystemSettingsView = () => import('@/views/admin/SystemSettingsView.vue');

// 认证相关
const UserLoginView = () => import('@/views/auth/LoginView.vue');
const UserRegisterView = () => import('@/views/auth/RegisterView.vue');

const routes = [
  // 根路径重定向
  {
    path: '/',
    redirect: '/chat'
  },

  // 用户认证路由
  {
    path: '/login',
    name: 'UserLogin',
    component: UserLoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'UserRegister',
    component: UserRegisterView,
    meta: { requiresGuest: true }
  },

  // 用户功能路由
  {
    path: '/chat',
    name: 'Chat',
    component: ChatView,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:userId/chat',
    name: 'UserChat',
    component: ChatView,
    meta: { requiresAuth: true }
  },
  
  // 🔧 P3 新增：邀请相关路由
  {
    path: '/invite',
    name: 'InviteFriends',
    component: InviteFriendsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:userId/invite',
    name: 'UserInviteFriends',
    component: InviteFriendsView,
    meta: { requiresAuth: true }
  },

  // 🔧 P3 新增：用户资料和记录路由
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:userId/profile',
    name: 'UserProfile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/records',
    name: 'QueryRecords',
    component: QueryRecordsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:userId/records',
    name: 'UserQueryRecords',
    component: QueryRecordsView,
    meta: { requiresAuth: true }
  },

  // 管理员认证
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLoginView,
    meta: { requiresGuest: true }
  },

  // 管理员后台路由
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboardView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  
  // 🔧 P3 更新：用户管理 (集成咨询次数管理)
  {
    path: '/admin/users',
    name: 'AdminUserManagement',
    component: UserManagementView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  
  // 🔧 P3 更新：邀请管理 (全新功能)
  {
    path: '/admin/invites',
    name: 'AdminInviteManagement',
    component: InviteManagementView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  
  // 🔧 P3 更新：系统设置 (集成邀请和咨询设置)
  {
    path: '/admin/settings',
    name: 'AdminSystemSettings',
    component: SystemSettingsView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  // 邀请注册路由
  {
    path: '/register/:inviteCode',
    name: 'InviteRegister',
    component: UserRegisterView,
    meta: { requiresGuest: true },
    props: true
  },

  // 测试页面 (仅在开发环境)
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/TestView.vue'),
    meta: { dev: true }
  },

  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// 🔧 P3 新增：路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('auth_token');
  const isAdmin = localStorage.getItem('auth_role') === 'admin';
  const userId = localStorage.getItem('auth_user_id');

  // 🔧 修复：开发环境路由（如测试页面）允许直接访问
  if (to.meta.dev === true) {
    next();
    return;
  }

  // 检查需要认证的路由
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  // 检查需要管理员权限的路由
  if (to.meta.requiresAdmin && !isAdmin) {
    next('/chat');
    return;
  }

  // 检查已登录用户不应访问的页面
  if (to.meta.requiresGuest && isAuthenticated) {
    if (isAdmin) {
      next('/admin/dashboard');
    } else {
      next('/chat');
    }
    return;
  }

  // 自动重定向到用户专属路由
  if (isAuthenticated && !isAdmin && userId) {
    const userSpecificRoutes = {
      'Chat': `/user/${userId}/chat`,
      'InviteFriends': `/user/${userId}/invite`,
      'Profile': `/user/${userId}/profile`,
      'QueryRecords': `/user/${userId}/records`
    };

    if (userSpecificRoutes[to.name] && to.path !== userSpecificRoutes[to.name]) {
      next(userSpecificRoutes[to.name]);
      return;
    }
  }

  next();
});

// 🔧 P3 新增：注销处理
export const handleLogout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user_id');
  localStorage.removeItem('auth_role');
  localStorage.removeItem('user_data');
  
  // 清除其他用户数据
  localStorage.removeItem('invite_code');
  localStorage.removeItem('remaining_queries');
  localStorage.removeItem('invite_stats');
  
  router.push('/login');
};

export default router; 