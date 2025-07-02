/**
 * 缓存修复脚本
 * 清除所有无用户隔离的旧缓存数据，解决用户数据混乱问题
 */

import cacheService from '@/services/cacheService';

/**
 * 修复缓存数据混乱问题
 * 清除所有可能包含混合用户数据的缓存
 */
export function fixCacheIsolation() {
  console.log('🔧 开始修复缓存用户隔离问题...');
  
  try {
    // 1. 清除所有聊天会话相关的缓存
    cacheService.invalidatePattern('/chat/sessions');
    console.log('✅ 已清除所有聊天會話相關缓存');
    
    // 2. 清除可能的旧键格式缓存
    const oldCachePatterns = [
      'sessions_',
      'session_',
      'sessions_{"page":1,"limit":5}',
      'sessions_{"limit":50}',
      'sessions_{"limit":10}',
      'sessions_{"page":1,"limit":10}'
    ];
    
    // 从localStorage中清除旧的缓存键
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('labor_law_cache_')) {
        const cacheKey = key.replace('labor_law_cache_', '');
        
        // 检查是否是旧的无用户隔离的缓存键
        const isOldCacheKey = oldCachePatterns.some(pattern => 
          cacheKey.startsWith(pattern) && !cacheKey.includes('_user_')
        );
        
        if (isOldCacheKey) {
          keysToRemove.push(key);
        }
      }
    }
    
    // 删除找到的旧缓存键
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ 已删除旧缓存键: ${key}`);
    });
    
    console.log(`✅ 缓存修复完成，共清除 ${keysToRemove.length} 个旧缓存项`);
    
    // 3. 触发页面数据刷新事件
    window.dispatchEvent(new CustomEvent('cache_fixed', {
      detail: { 
        clearedKeys: keysToRemove.length,
        timestamp: new Date().toISOString()
      }
    }));
    
    return {
      success: true,
      clearedKeys: keysToRemove.length,
      message: '缓存修复完成'
    };
    
  } catch (error) {
    console.error('❌ 缓存修复失败:', error);
    return {
      success: false,
      error: error.message,
      message: '缓存修复失败'
    };
  }
}

/**
 * 强制刷新所有会话数据
 * 绕过缓存重新从API获取数据
 */
export async function forceRefreshSessionData() {
  console.log('🔄 强制刷新会话数据...');
  
  try {
    // 动态导入aiChatService
    const aiChatServiceModule = await import('@/services/aiChatService');
    const aiChatService = aiChatServiceModule.default;
    
    // 强制刷新会话列表（绕过缓存）
    await aiChatService.getSessionList({ limit: 50 }, true);
    console.log('✅ 会话列表已强制刷新');
    
    // 触发数据刷新事件
    window.dispatchEvent(new CustomEvent('session_data_refreshed', {
      detail: { timestamp: new Date().toISOString() }
    }));
    
    return { success: true, message: '会话数据已强制刷新' };
    
  } catch (error) {
    console.error('❌ 强制刷新失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 完整的缓存修复流程
 * 包括清除旧缓存和强制刷新数据
 */
export async function completeCacheFix() {
  console.log('🚀 开始完整的缓存修复流程...');
  
  // Step 1: 修复缓存隔离
  const fixResult = fixCacheIsolation();
  
  // Step 2: 强制刷新数据
  const refreshResult = await forceRefreshSessionData();
  
  const result = {
    success: fixResult.success && refreshResult.success,
    fixResult,
    refreshResult,
    message: '缓存修复流程完成'
  };
  
  console.log('✅ 完整缓存修复结果:', result);
  return result;
}

// 自动修复（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  // 页面加载完成后自动执行一次修复
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('🔧 开发环境自动执行缓存修复...');
      fixCacheIsolation();
    }, 1000);
  });
}

export default {
  fixCacheIsolation,
  forceRefreshSessionData,
  completeCacheFix
}; 