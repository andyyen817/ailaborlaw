<template>
  <div class="invite-achievements">
    <div class="achievements-header">
      <h3 class="text-xl font-semibold text-gray-800 mb-2">邀请成就</h3>
      <p class="text-gray-600">达成成就，解锁更多奖励</p>
    </div>

    <!-- 进度概览 -->
    <div class="progress-overview bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h4 class="text-lg font-semibold text-gray-800">邀请进度</h4>
          <p class="text-sm text-gray-600">距离下一个成就还需邀请 {{ nextAchievementGap }} 人</p>
        </div>
        <div class="achievement-level">
          <div class="level-badge">
            <i class="fas fa-trophy text-yellow-500"></i>
            <span class="ml-1">{{ currentLevel }}</span>
          </div>
        </div>
      </div>
      
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="progress-text">
          {{ inviteCount }} / {{ nextAchievementTarget }} 人
        </div>
      </div>
    </div>

    <!-- 成就列表 -->
    <div class="achievements-list">
      <div 
        v-for="achievement in achievements" 
        :key="achievement.id"
        :class="['achievement-card', {
          'achieved': achievement.achieved,
          'current': achievement.isCurrent,
          'locked': !achievement.achieved && !achievement.isCurrent
        }]"
      >
        <div class="achievement-icon">
          <i :class="achievement.icon"></i>
          <div v-if="achievement.achieved" class="achievement-check">
            <i class="fas fa-check"></i>
          </div>
        </div>
        
        <div class="achievement-content">
          <h5 class="achievement-title">{{ achievement.title }}</h5>
          <p class="achievement-description">{{ achievement.description }}</p>
          
          <div class="achievement-reward">
            <i class="fas fa-gift text-green-600"></i>
            <span>奖励：{{ achievement.reward }}</span>
          </div>
          
          <div v-if="achievement.isCurrent" class="achievement-progress">
            <div class="mini-progress-bar">
              <div 
                class="mini-progress-fill"
                :style="{ width: `${(inviteCount / achievement.target) * 100}%` }"
              ></div>
            </div>
            <span class="progress-label">{{ inviteCount }}/{{ achievement.target }}</span>
          </div>
        </div>
        
        <div v-if="achievement.achieved" class="achievement-status achieved">
          <i class="fas fa-medal"></i>
          <span>已达成</span>
        </div>
        <div v-else-if="achievement.isCurrent" class="achievement-status current">
          <i class="fas fa-target"></i>
          <span>进行中</span>
        </div>
        <div v-else class="achievement-status locked">
          <i class="fas fa-lock"></i>
          <span>未解锁</span>
        </div>
      </div>
    </div>

    <!-- 特殊成就 -->
    <div v-if="specialAchievements.length > 0" class="special-achievements mt-8">
      <h4 class="text-lg font-semibold text-gray-800 mb-4">特殊成就</h4>
      <div class="special-grid">
        <div 
          v-for="special in specialAchievements"
          :key="special.id"
          :class="['special-card', { 'achieved': special.achieved }]"
        >
          <div class="special-icon">
            <i :class="special.icon"></i>
          </div>
          <h6 class="special-title">{{ special.title }}</h6>
          <p class="special-description">{{ special.description }}</p>
          <div v-if="special.achieved" class="special-date">
            获得时间：{{ formatDate(special.achievedAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 排行榜预览 -->
    <div class="leaderboard-preview mt-8">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-semibold text-gray-800">邀请排行榜</h4>
        <button 
          @click="$emit('view-leaderboard')"
          class="text-blue-600 hover:text-blue-800 text-sm"
        >
          查看完整排行榜 →
        </button>
      </div>
      
      <div class="leaderboard-cards">
        <div 
          v-for="(user, index) in topInviters" 
          :key="user.id"
          class="leaderboard-card"
        >
          <div class="rank-badge" :class="getRankClass(index + 1)">
            {{ index + 1 }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-count">{{ user.inviteCount }} 人</div>
          </div>
          <div v-if="user.isCurrentUser" class="current-user-indicator">
            <i class="fas fa-user"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import inviteService from '@/services/inviteService';

const props = defineProps({
  inviteCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['view-leaderboard']);

// 响应式数据
const achievements = ref([]);
const specialAchievements = ref([]);
const topInviters = ref([]);

// 预定义成就数据
const defaultAchievements = [
  {
    id: 1,
    title: '初来乍到',
    description: '邀请第1位好友',
    target: 1,
    reward: '10次免费咨询',
    icon: 'fas fa-star text-yellow-500',
    achieved: false,
    isCurrent: false
  },
  {
    id: 2,
    title: '小有成就',
    description: '邀请5位好友',
    target: 5,
    reward: '50次免费咨询',
    icon: 'fas fa-medal text-orange-500',
    achieved: false,
    isCurrent: false
  },
  {
    id: 3,
    title: '社交达人',
    description: '邀请10位好友',
    target: 10,
    reward: '100次免费咨询 + 专属徽章',
    icon: 'fas fa-crown text-purple-500',
    achieved: false,
    isCurrent: false
  },
  {
    id: 4,
    title: '传播大使',
    description: '邀请25位好友',
    target: 25,
    reward: '250次免费咨询 + VIP功能',
    icon: 'fas fa-gem text-blue-500',
    achieved: false,
    isCurrent: false
  },
  {
    id: 5,
    title: '超级推手',
    description: '邀请50位好友',
    target: 50,
    reward: '500次免费咨询 + 终身VIP',
    icon: 'fas fa-rocket text-red-500',
    achieved: false,
    isCurrent: false
  }
];

const defaultSpecialAchievements = [
  {
    id: 'first_day',
    title: '新手上路',
    description: '注册当天就邀请好友',
    icon: 'fas fa-bolt text-yellow-600',
    achieved: false,
    achievedAt: null
  },
  {
    id: 'weekend_warrior',
    title: '周末勇士',
    description: '在周末邀请超过3位好友',
    icon: 'fas fa-calendar-weekend text-purple-600',
    achieved: false,
    achievedAt: null
  },
  {
    id: 'streak_master',
    title: '连击大师',
    description: '连续7天每天都有新邀请',
    icon: 'fas fa-fire text-red-600',
    achieved: false,
    achievedAt: null
  }
];

// 计算属性
const currentLevel = computed(() => {
  const achieved = achievements.value.filter(a => a.achieved).length;
  const levels = ['新手', '初级', '中级', '高级', '专家', '大师'];
  return levels[achieved] || '传奇';
});

const nextAchievementTarget = computed(() => {
  const next = achievements.value.find(a => !a.achieved);
  return next ? next.target : achievements.value[achievements.value.length - 1]?.target || 100;
});

const nextAchievementGap = computed(() => {
  return Math.max(0, nextAchievementTarget.value - props.inviteCount);
});

const progressPercentage = computed(() => {
  if (nextAchievementTarget.value === 0) return 100;
  return Math.min(100, (props.inviteCount / nextAchievementTarget.value) * 100);
});

// 方法
async function loadAchievements() {
  try {
    // 获取邀请统计
    const statsResponse = await inviteService.getMyInviteStats();
    
    // 初始化成就状态
    achievements.value = defaultAchievements.map(achievement => {
      const achieved = props.inviteCount >= achievement.target;
      const isCurrent = !achieved && (achievements.value.find(a => !a.achieved)?.id === achievement.id || 
                                     (!achievements.value.some(a => !a.achieved) && achievement.id === 1));
      
      return {
        ...achievement,
        achieved,
        isCurrent
      };
    });

    // 设置当前目标成就
    const firstNotAchieved = achievements.value.find(a => !a.achieved);
    if (firstNotAchieved) {
      firstNotAchieved.isCurrent = true;
    }

    // 加载特殊成就（可以根据实际数据更新）
    specialAchievements.value = defaultSpecialAchievements;

  } catch (error) {
    console.error('加载成就数据失败:', error);
    // 使用默认数据
    achievements.value = defaultAchievements;
    specialAchievements.value = defaultSpecialAchievements;
  }
}

async function loadLeaderboard() {
  try {
    const leaderboardResponse = await inviteService.getInviteLeaderboard({ limit: 3 });
    if (leaderboardResponse.success && leaderboardResponse.data) {
      topInviters.value = leaderboardResponse.data.leaderboard || [];
    }
  } catch (error) {
    console.error('加载排行榜失败:', error);
    // 模拟数据
    topInviters.value = [
      { id: 1, name: '张三', inviteCount: 42, isCurrentUser: false },
      { id: 2, name: '李四', inviteCount: 38, isCurrentUser: false },
      { id: 3, name: '王五', inviteCount: 35, isCurrentUser: false }
    ];
  }
}

function getRankClass(rank) {
  const classes = {
    1: 'rank-gold',
    2: 'rank-silver',
    3: 'rank-bronze'
  };
  return classes[rank] || 'rank-default';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
}

// 监听邀请数量变化
import { watch } from 'vue';
watch(() => props.inviteCount, () => {
  loadAchievements();
});

// 初始化
onMounted(() => {
  loadAchievements();
  loadLeaderboard();
});
</script>

<style scoped>
.invite-achievements {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.achievements-header {
  margin-bottom: 24px;
}

.progress-overview {
  border: 1px solid #e5e7eb;
}

.level-badge {
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar-container {
  position: relative;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.progress-text {
  text-align: center;
  margin-top: 8px;
  color: #6b7280;
  font-size: 14px;
}

.achievements-list {
  display: grid;
  gap: 16px;
}

.achievement-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: white;
}

.achievement-card.achieved {
  border-color: #10b981;
  background: #f0fdf4;
}

.achievement-card.current {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.achievement-card.locked {
  opacity: 0.6;
  background: #f9fafb;
}

.achievement-icon {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.achievement-check {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.achievement-description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 8px;
}

.achievement-reward {
  display: flex;
  align-items: center;
  color: #059669;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.achievement-reward i {
  margin-right: 6px;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-progress-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-label {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.achievement-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.achievement-status.achieved {
  color: #10b981;
}

.achievement-status.current {
  color: #3b82f6;
}

.achievement-status.locked {
  color: #9ca3af;
}

.special-achievements {
  border-top: 1px solid #e5e7eb;
  padding-top: 32px;
}

.special-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.special-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.2s ease;
}

.special-card.achieved {
  border-color: #fbbf24;
  background: #fffbeb;
}

.special-card:hover {
  transform: translateY(-2px);
}

.special-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.special-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.special-description {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.special-date {
  font-size: 11px;
  color: #9ca3af;
}

.leaderboard-preview {
  border-top: 1px solid #e5e7eb;
  padding-top: 32px;
}

.leaderboard-cards {
  display: grid;
  gap: 12px;
}

.leaderboard-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.rank-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  margin-right: 12px;
}

.rank-badge.rank-gold {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.rank-badge.rank-silver {
  background: linear-gradient(135deg, #e5e7eb, #9ca3af);
}

.rank-badge.rank-bronze {
  background: linear-gradient(135deg, #92400e, #78350f);
}

.rank-badge.rank-default {
  background: #6b7280;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
}

.user-count {
  font-size: 12px;
  color: #6b7280;
}

.current-user-indicator {
  color: #3b82f6;
}

@media (max-width: 768px) {
  .invite-achievements {
    padding: 16px;
  }
  
  .achievement-card {
    padding: 16px;
  }
  
  .special-grid {
    grid-template-columns: 1fr;
  }
}
</style> 