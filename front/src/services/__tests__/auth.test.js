import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// 創建模擬的 localStorage
const setupLocalStorageMock = () => {
  const localStorage = {};
  
  return {
    getItem: vi.fn((key) => localStorage[key] || null),
    setItem: vi.fn((key, value) => {
      localStorage[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete localStorage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(localStorage).forEach(key => {
        delete localStorage[key];
      });
    }),
    getAllItems: () => ({ ...localStorage }),
    length: Object.keys(localStorage).length
  };
};

// 用戶登出不刪除用戶數據的測試
describe('用戶登出功能測試', () => {
  let authService;
  let mockLocalStorage;
  let mockConsole;
  
  beforeEach(async () => {
    // 為測試準備 DOM 環境
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
    });
    
    global.window = dom.window;
    global.document = dom.window.document;
    
    // 模擬 localStorage
    mockLocalStorage = setupLocalStorageMock();
    global.localStorage = mockLocalStorage;
    
    // 模擬 console.log 和 console.error
    mockConsole = {
      log: vi.fn(),
      error: vi.fn(),
    };
    global.console.log = mockConsole.log;
    global.console.error = mockConsole.error;
    
    // 動態導入 authService (確保每次測試使用乾淨的模塊)
    vi.resetModules();
    const authModule = await import('../auth.js');
    authService = authModule.default;
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('登出時不應該刪除用戶註冊數據', () => {
    // 準備測試數據
    const userId = 'test_user_123';
    const testUser = {
      id: userId,
      email: 'test@example.com',
      name: 'Test User'
    };
    
    // 設置模擬數據
    mockLocalStorage.setItem('auth_user', JSON.stringify(testUser));
    mockLocalStorage.setItem('auth_user_id', userId);
    mockLocalStorage.setItem('auth_token', 'test-token');
    
    // 設置用戶註冊數據
    const mockUsers = [testUser];
    mockLocalStorage.setItem('app_users_mock_data', JSON.stringify(mockUsers));
    
    // 執行登出操作
    authService.logout();
    
    // 驗證: 認證數據應該被清除
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_user');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_user_id');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
    
    // 關鍵驗證: 用戶註冊數據不應該被清除
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('app_users_mock_data');
    
    // 驗證: 已註冊用戶數據仍然存在
    const storedUsers = mockLocalStorage.getItem('app_users_mock_data');
    expect(storedUsers).not.toBeNull();
    expect(JSON.parse(storedUsers)).toEqual(mockUsers);
  });
}); 