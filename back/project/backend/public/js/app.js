/**
 * 主應用初始化文件
 * 統一管理所有模組的初始化
 */

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    console.log('開始初始化 API 測試平台...');
    
    try {
        // 初始化標籤頁管理器
        initTabManager();
        console.log('✅ 標籤頁管理器初始化完成');
        
        // 初始化認證模組
        initAuthEventListeners();
        console.log('✅ 認證模組初始化完成');
        
        // 初始化其他模組（如果存在）
        if (typeof initChatEventListeners === 'function') {
            initChatEventListeners();
            console.log('✅ 聊天模組初始化完成');
        }
        
        if (typeof initEmailVerificationEventListeners === 'function') {
            initEmailVerificationEventListeners();
            console.log('✅ 郵箱驗證模組初始化完成');
        }
        
        if (typeof initQueryEventListeners === 'function') {
            initQueryEventListeners();
            console.log('✅ 查詢模組初始化完成');
        }
        
        if (typeof initInviteEventListeners === 'function') {
            initInviteEventListeners();
            console.log('✅ 邀請模組初始化完成');
        }
        
        if (typeof initAdminEventListeners === 'function') {
            initAdminEventListeners();
            console.log('✅ 管理員模組初始化完成');
        }
        
        // 更新登入狀態
        updateLoginStatus();
        console.log('✅ 登入狀態更新完成');
        
        console.log('🎉 API 測試平台初始化完成！');
        
    } catch (error) {
        console.error('❌ 初始化過程中發生錯誤:', error);
        alert('頁面初始化失敗，請刷新頁面重試');
    }
}); 