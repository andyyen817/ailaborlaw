/**
 * 異步中間件包裝器
 * 自動捕獲異步函數中的錯誤並傳遞給錯誤處理中間件
 */

/**
 * 包裝異步中間件函數，自動處理錯誤
 * @param {Function} fn - 異步中間件函數
 * @returns {Function} 包裝後的中間件函數
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
module.exports.asyncHandler = asyncHandler; 