/**
 * 字符串工具函數
 * 處理各種字符串相關操作
 */

/**
 * 將全形字符轉換為半形字符
 * 特別處理常見的全形符號，如空格和@符號
 * 
 * @param {string} str - 要轉換的字符串
 * @returns {string} - 轉換後的字符串
 */
export function fullWidthToHalfWidth(str) {
  if (!str) return '';
  
  return str.replace(/[\uFF01-\uFF5E\u3000-\u30FF\uFF00-\uFFEF]/g, (ch) => {
    // 針對全形空格特殊處理
    if (ch === '\u3000') return ' ';
    
    // 針對全形@符號特殊處理
    if (ch === '\uFF20') return '@';
    
    // 其他全形字符轉換
    if (ch >= '\uFF01' && ch <= '\uFF5E') {
      return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
    }
    
    return ch;
  });
}

/**
 * 檢查兩個字符串是否實質相同，忽略全形/半形字符差異
 * 
 * @param {string} str1 - 第一個字符串
 * @param {string} str2 - 第二個字符串
 * @returns {boolean} - 兩個字符串是否實質相同
 */
export function isEssentiallyEqual(str1, str2) {
  if (str1 === str2) return true;
  
  const normalized1 = fullWidthToHalfWidth(str1);
  const normalized2 = fullWidthToHalfWidth(str2);
  
  return normalized1 === normalized2;
}

/**
 * 標準化密碼字符串
 * 1. 去除特殊符號（只保留英文字母和數字）
 * 2. 轉換為小寫（不區分大小寫）
 * 
 * @param {string} password - 密碼字符串
 * @returns {string} - 標準化後的密碼
 */
export function normalizePassword(password) {
  if (!password) return '';
  
  // 先進行全形轉半形處理
  const halfWidth = fullWidthToHalfWidth(password);
  
  // 只保留英文字母和數字，並轉換為小寫
  return halfWidth.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

/**
 * 檢查密碼是否符合規則（只包含英文字母和數字）
 * 
 * @param {string} password - 要檢查的密碼
 * @returns {boolean} - 密碼是否符合規則
 */
export function isValidPassword(password) {
  // 檢查是否只包含英文字母和數字
  return /^[a-zA-Z0-9]+$/.test(password);
}

export default {
  fullWidthToHalfWidth,
  isEssentiallyEqual,
  normalizePassword,
  isValidPassword
}; 