/**
 * 异步处理中间件
 * 用于包装异步路由处理器，自动捕获异常并传递给错误处理中间件
 */

/**
 * 异步处理器包装函数
 * @param {Function} fn - 异步路由处理器函数
 * @returns {Function} Express中间件函数
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler; 