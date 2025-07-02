// 管理后台全局功能
document.addEventListener('DOMContentLoaded', function() {
    // 侧边栏菜单激活状态
    const navItems = document.querySelectorAll('nav li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 登出按钮功能
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // 这里应该调用登出API，然后重定向到登录页
            window.location.href = 'login.html';
        });
    }

    // 模拟加载仪表盘数据
    loadDashboardData();
});

// 加载仪表盘数据
function loadDashboardData() {
    // 这里应该是API调用获取真实数据
    // 现在使用模拟数据
    const mockData = {
        totalUsers: 1234,
        todayConsultations: 56,
        activeExperts: 12,
        conversionRate: 15,
        recentActivities: [
            { 
                id: 1,
                user: '张先生',
                action: '进行了AI咨询',
                time: '10分钟前',
                icon: 'fa-comment'
            },
            { 
                id: 2,
                user: '李小姐',
                action: '完成了注册',
                time: '30分钟前',
                icon: 'fa-user-plus'
            },
            { 
                id: 3,
                user: '王专家',
                action: '处理了一个咨询工单',
                time: '1小时前',
                icon: 'fa-check-circle'
            },
            { 
                id: 4,
                user: '陈经理',
                action: '升级了企业会员',
                time: '2小时前',
                icon: 'fa-crown'
            }
        ]
    };

    // 更新统计卡片
    document.querySelector('.stats-cards .bg-blue + .card-info p').textContent = mockData.totalUsers.toLocaleString();
    document.querySelector('.stats-cards .bg-green + .card-info p').textContent = mockData.todayConsultations;
    document.querySelector('.stats-cards .bg-orange + .card-info p').textContent = mockData.activeExperts;
    document.querySelector('.stats-cards .bg-purple + .card-info p').textContent = mockData.conversionRate + '%';

    // 更新最近活动
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = mockData.recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <strong>${activity.user}</strong> ${activity.action}
                    <small>${activity.time}</small>
                </div>
            </div>
        `).join('');
    }
}

// 搜索功能
function setupSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                // 这里应该实现搜索功能
                alert('搜索: ' + this.value);
                this.value = '';
            }
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    setupSearch();
    
    // 模拟加载完成后隐藏加载动画
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.remove();
            }, 300);
        }
    }, 1000);
});
