/**
 * 共享應用狀態
 * 用於在不同模塊之間共享狀態變量
 */

// 是否使用內存存儲模式
let usingMemoryMode = false;

module.exports = {
  // 獲取內存模式狀態
  isUsingMemoryMode: () => usingMemoryMode,
  
  // 設置內存模式狀態
  setUsingMemoryMode: (value) => {
    usingMemoryMode = value;
  }
}; 