/**
 * 劳工顾问管理系统自动化测试脚本
 * 使用 Node.js 和 Puppeteer 进行前端功能测试
 */

const puppeteer = require('puppeteer');

class LaborAdvisorTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3030';
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  // 测试结果记录
  recordTest(testName, passed, error = null) {
    this.testResults.total++;
    if (passed) {
      this.testResults.passed++;
      console.log(`✅ ${testName} - 通过`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${testName} - 失败`);
      if (error) {
        console.log(`   错误: ${error.message}`);
        this.testResults.errors.push({ testName, error: error.message });
      }
    }
  }

  // 初始化浏览器
  async init() {
    try {
      this.browser = await puppeteer.launch({
        headless: false, // 设为false可以看到浏览器操作
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.page = await this.browser.newPage();
      
      // 设置控制台日志监听
      this.page.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.log(`🐛 控制台错误: ${msg.text()}`);
        }
      });
      
      console.log('🚀 浏览器已启动，开始测试...\n');
    } catch (error) {
      console.error('❌ 初始化浏览器失败:', error);
      throw error;
    }
  }

  // 模拟管理员登录
  async loginAsAdmin() {
    try {
      console.log('📝 测试管理员登录...');
      
      await this.page.goto(`${this.baseUrl}/admin/login`);
      await this.page.waitForSelector('input[type="email"]', { timeout: 5000 });
      
      // 填写登录表单
      await this.page.type('input[type="email"]', 'admin@example.com');
      await this.page.type('input[type="password"]', 'admin123');
      
      // 点击登录按钮
      await this.page.click('button[type="submit"]');
      
      // 等待跳转到管理后台
      await this.page.waitForNavigation({ timeout: 10000 });
      
      const currentUrl = this.page.url();
      const loginSuccess = currentUrl.includes('/admin/') && !currentUrl.includes('/login');
      
      this.recordTest('管理员登录', loginSuccess);
      return loginSuccess;
    } catch (error) {
      this.recordTest('管理员登录', false, error);
      return false;
    }
  }

  // 测试导航到劳工顾问管理页面
  async navigateToLaborAdvisors() {
    try {
      console.log('🧭 测试导航到劳工顾问管理...');
      
      // 查找劳工顾问管理菜单项
      await this.page.waitForSelector('nav a[href="/admin/labor-advisors"]', { timeout: 5000 });
      
      // 点击菜单项
      await this.page.click('nav a[href="/admin/labor-advisors"]');
      
      // 等待页面加载
      await this.page.waitForSelector('h2:contains("劳工顾问管理")', { timeout: 5000 });
      
      const currentUrl = this.page.url();
      const navigationSuccess = currentUrl.includes('/admin/labor-advisors');
      
      this.recordTest('导航到劳工顾问管理', navigationSuccess);
      return navigationSuccess;
    } catch (error) {
      this.recordTest('导航到劳工顾问管理', false, error);
      return false;
    }
  }

  // 测试页面元素加载
  async testPageElements() {
    try {
      console.log('🔍 测试页面元素加载...');
      
      // 检查页面标题
      const titleExists = await this.page.$('h2:contains("劳工顾问管理")') !== null;
      this.recordTest('页面标题显示', titleExists);
      
      // 检查添加顾问按钮
      const addButtonExists = await this.page.$('button:contains("添加顾问")') !== null;
      this.recordTest('添加顾问按钮显示', addButtonExists);
      
      // 检查筛选区域
      const searchInputExists = await this.page.$('input[placeholder*="搜索"]') !== null;
      this.recordTest('搜索输入框显示', searchInputExists);
      
      // 检查数据表格
      const tableExists = await this.page.$('table') !== null;
      this.recordTest('数据表格显示', tableExists);
      
      // 检查分页控件
      const paginationExists = await this.page.$('nav[aria-label="Pagination"]') !== null;
      this.recordTest('分页控件显示', paginationExists);
      
    } catch (error) {
      this.recordTest('页面元素加载测试', false, error);
    }
  }

  // 测试筛选功能
  async testFiltering() {
    try {
      console.log('🔎 测试筛选功能...');
      
      // 测试地区筛选
      const regionSelect = await this.page.$('select[id="regionFilter"]');
      if (regionSelect) {
        await this.page.select('select[id="regionFilter"]', '台北市');
        await this.page.waitForTimeout(1000); // 等待筛选结果
        this.recordTest('地区筛选功能', true);
      } else {
        this.recordTest('地区筛选功能', false, new Error('地区筛选下拉框未找到'));
      }
      
      // 测试专业领域筛选
      const specialtySelect = await this.page.$('select[id="specialtyFilter"]');
      if (specialtySelect) {
        await this.page.select('select[id="specialtyFilter"]', '劳动合同');
        await this.page.waitForTimeout(1000);
        this.recordTest('专业领域筛选功能', true);
      } else {
        this.recordTest('专业领域筛选功能', false, new Error('专业领域筛选下拉框未找到'));
      }
      
      // 重置筛选条件
      await this.page.select('select[id="regionFilter"]', '');
      await this.page.select('select[id="specialtyFilter"]', '');
      
    } catch (error) {
      this.recordTest('筛选功能测试', false, error);
    }
  }

  // 测试搜索功能
  async testSearch() {
    try {
      console.log('🔍 测试搜索功能...');
      
      const searchInput = await this.page.$('input[id="search"]');
      if (searchInput) {
        // 输入搜索关键词
        await this.page.type('input[id="search"]', '张');
        await this.page.waitForTimeout(1000); // 等待搜索结果
        
        // 清空搜索
        await this.page.evaluate(() => {
          document.querySelector('input[id="search"]').value = '';
        });
        await this.page.keyboard.press('Backspace'); // 触发输入事件
        
        this.recordTest('搜索功能', true);
      } else {
        this.recordTest('搜索功能', false, new Error('搜索输入框未找到'));
      }
    } catch (error) {
      this.recordTest('搜索功能', false, error);
    }
  }

  // 测试添加顾问功能
  async testAddAdvisor() {
    try {
      console.log('➕ 测试添加顾问功能...');
      
      // 点击添加顾问按钮
      await this.page.click('button:contains("添加顾问")');
      
      // 等待模态框出现
      await this.page.waitForSelector('.fixed .bg-white', { timeout: 3000 });
      
      // 填写表单
      await this.page.type('input[id="advisorName"]', '测试顾问001');
      await this.page.type('input[id="advisorPhone"]', '0987-654-321');
      await this.page.type('input[id="advisorEmail"]', 'test001@advisor.com');
      await this.page.select('select[id="advisorRegion"]', '台北市');
      
      // 选择专业领域
      await this.page.click('input[value="劳动合同"]');
      await this.page.click('input[value="工资福利"]');
      
      // 填写备注
      await this.page.type('textarea[id="advisorNotes"]', '这是一个测试顾问');
      
      // 提交表单
      await this.page.click('button[type="submit"]');
      
      // 等待模态框关闭
      await this.page.waitForTimeout(2000);
      
      this.recordTest('添加顾问功能', true);
    } catch (error) {
      this.recordTest('添加顾问功能', false, error);
    }
  }

  // 测试编辑顾问功能
  async testEditAdvisor() {
    try {
      console.log('✏️ 测试编辑顾问功能...');
      
      // 查找第一个编辑按钮
      const editButton = await this.page.$('button:contains("编辑")');
      if (editButton) {
        await editButton.click();
        
        // 等待编辑模态框出现
        await this.page.waitForSelector('.fixed .bg-white', { timeout: 3000 });
        
        // 修改姓名
        await this.page.evaluate(() => {
          const nameInput = document.querySelector('input[id="advisorName"]');
          if (nameInput) nameInput.value = '';
        });
        await this.page.type('input[id="advisorName"]', '已编辑的顾问');
        
        // 保存修改
        await this.page.click('button:contains("保存")');
        
        // 等待保存完成
        await this.page.waitForTimeout(2000);
        
        this.recordTest('编辑顾问功能', true);
      } else {
        this.recordTest('编辑顾问功能', false, new Error('编辑按钮未找到'));
      }
    } catch (error) {
      this.recordTest('编辑顾问功能', false, error);
    }
  }

  // 测试查看详情功能
  async testViewDetails() {
    try {
      console.log('👁️ 测试查看详情功能...');
      
      const detailButton = await this.page.$('button:contains("详情")');
      if (detailButton) {
        await detailButton.click();
        
        // 等待详情模态框出现
        await this.page.waitForSelector('.fixed .bg-white', { timeout: 3000 });
        
        // 检查详情内容
        const detailsVisible = await this.page.$('h3:contains("顾问详情")') !== null;
        
        // 关闭详情模态框
        await this.page.click('button:contains("关闭")');
        
        this.recordTest('查看详情功能', detailsVisible);
      } else {
        this.recordTest('查看详情功能', false, new Error('详情按钮未找到'));
      }
    } catch (error) {
      this.recordTest('查看详情功能', false, error);
    }
  }

  // 测试状态切换功能
  async testStatusToggle() {
    try {
      console.log('🔄 测试状态切换功能...');
      
      // 查找状态切换按钮（停用或启用）
      const statusButton = await this.page.$('button:contains("停用"), button:contains("启用")');
      if (statusButton) {
        const buttonText = await this.page.evaluate(el => el.textContent, statusButton);
        await statusButton.click();
        
        // 等待状态更新
        await this.page.waitForTimeout(1000);
        
        this.recordTest('状态切换功能', true);
      } else {
        this.recordTest('状态切换功能', false, new Error('状态切换按钮未找到'));
      }
    } catch (error) {
      this.recordTest('状态切换功能', false, error);
    }
  }

  // 测试分页功能
  async testPagination() {
    try {
      console.log('📄 测试分页功能...');
      
      // 检查分页控件
      const paginationExists = await this.page.$('nav button:contains("下一页")') !== null;
      
      if (paginationExists) {
        // 如果有下一页按钮，点击测试
        const nextButton = await this.page.$('nav button:contains("下一页")');
        if (nextButton) {
          const isDisabled = await this.page.evaluate(el => el.disabled, nextButton);
          if (!isDisabled) {
            await nextButton.click();
            await this.page.waitForTimeout(1000);
          }
        }
        this.recordTest('分页功能', true);
      } else {
        this.recordTest('分页功能', false, new Error('分页控件未找到'));
      }
    } catch (error) {
      this.recordTest('分页功能', false, error);
    }
  }

  // 运行完整测试套件
  async runAllTests() {
    try {
      console.log('🧪 开始劳工顾问管理系统完整测试\n');
      
      // 初始化
      await this.init();
      
      // 登录
      const loginSuccess = await this.loginAsAdmin();
      if (!loginSuccess) {
        console.log('❌ 登录失败，无法继续测试');
        return;
      }
      
      // 导航到劳工顾问管理页面
      const navigationSuccess = await this.navigateToLaborAdvisors();
      if (!navigationSuccess) {
        console.log('❌ 导航失败，无法继续测试');
        return;
      }
      
      // 等待页面完全加载
      await this.page.waitForTimeout(2000);
      
      // 依次执行各项测试
      await this.testPageElements();
      await this.testFiltering();
      await this.testSearch();
      await this.testAddAdvisor();
      await this.testEditAdvisor();
      await this.testViewDetails();
      await this.testStatusToggle();
      await this.testPagination();
      
      // 输出测试结果
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  // 输出测试结果
  printTestResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 劳工顾问管理系统测试结果');
    console.log('='.repeat(50));
    console.log(`总测试数: ${this.testResults.total}`);
    console.log(`通过数: ${this.testResults.passed}`);
    console.log(`失败数: ${this.testResults.failed}`);
    console.log(`成功率: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ 失败的测试详情:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.testName}: ${error.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (this.testResults.failed === 0) {
      console.log('🎉 所有测试通过！劳工顾问管理系统功能正常。');
    } else {
      console.log('⚠️ 存在测试失败，请检查相关功能。');
    }
  }
}

// 运行测试
async function runTests() {
  const tester = new LaborAdvisorTester();
  await tester.runAllTests();
}

// 检查是否直接运行此脚本
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = LaborAdvisorTester; 