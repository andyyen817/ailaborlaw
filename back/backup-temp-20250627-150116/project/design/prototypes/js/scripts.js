// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化聊天输入框
  initChatInput();
  
  // 初始化模拟AI输入效果
  initAITypingEffect();
  
  // 初始化黑暗模式切换
  initDarkModeToggle();
  
  // 初始化验证表单
  initFormValidation();
  
  // 初始化iframes加载
  initIframesLoader();
});

// 聊天输入框功能
function initChatInput() {
  const chatInput = document.querySelector('.chat-input');
  const chatSendBtn = document.querySelector('.chat-send-btn');
  
  if (!chatInput || !chatSendBtn) return;
  
  // 发送消息功能
  function sendMessage() {
    const message = chatInput.value.trim();
    if (message === '') return;
    
    // 创建用户消息元素
    const chatBody = document.querySelector('.chat-body');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message chat-message-user';
    
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    messageElement.innerHTML = `
      <div class="chat-bubble chat-bubble-user">${message}</div>
      <div class="chat-time">${timeString}</div>
    `;
    
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // 清空输入框
    chatInput.value = '';
    
    // 显示AI正在输入状态
    showAITyping();
    
    // 模拟AI回复（延迟1-3秒）
    setTimeout(() => {
      sendAIResponse();
    }, Math.random() * 2000 + 1000);
  }
  
  // 点击发送按钮
  chatSendBtn.addEventListener('click', sendMessage);
  
  // 按下Enter键发送
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
      e.preventDefault();
    }
  });
}

// 显示AI正在输入状态
function showAITyping() {
  const chatBody = document.querySelector('.chat-body');
  if (!chatBody) return;
  
  const typingElement = document.createElement('div');
  typingElement.className = 'chat-message chat-message-ai ai-typing';
  typingElement.innerHTML = `
    <div class="chat-bubble chat-bubble-ai">
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  
  chatBody.appendChild(typingElement);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// 模拟AI回复
function sendAIResponse() {
  const chatBody = document.querySelector('.chat-body');
  if (!chatBody) return;
  
  // 移除正在输入状态
  const typingElement = document.querySelector('.ai-typing');
  if (typingElement) {
    typingElement.remove();
  }
  
  // 示例回复列表
  const responses = [
    {
      text: "根据台湾《劳动基准法》第24条规定，雇主延长工作时间时应依下列标准加给工资：<br>1. 平日延长工作时间在2小时以内者，按平日每小时工资额加给三分之一以上。<br>2. 平日延长工作时间在2小时以上者，按平日每小时工资额加给三分之二以上。<br>3. 休息日工作8小时以内者，按平日每小时工资额加给一又三分之一以上。<br>4. 休息日工作逾8小时者，按平日每小时工资额加给一又三分之二以上。",
      reference: "《劳动基准法》第24条"
    },
    {
      text: "根据台湾《劳动基准法》第30条规定，正常工作时间为每日不超过8小时，每周不超过40小时。若有调整工作时间的需求，应该遵守法定程序，并确保每月加班时间不超过46小时。",
      reference: "《劳动基准法》第30条、第32条"
    },
    {
      text: "关于特休假问题，台湾《劳动基准法》第38条规定，员工在同一雇主或事业单位连续工作满一定期间者，应依下列规定给予特休假：<br>1. 六个月以上一年未满者，三日。<br>2. 一年以上二年未满者，七日。<br>3. 二年以上三年未满者，十日。<br>4. 三年以上五年未满者，十四日。<br>5. 五年以上十年未满者，十五日。",
      reference: "《劳动基准法》第38条"
    }
  ];
  
  // 随机选择一个回复
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  // 创建AI回复元素
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-message chat-message-ai';
  
  const now = new Date();
  const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
  
  let messageHTML = `
    <div class="chat-bubble chat-bubble-ai">${response.text}</div>
  `;
  
  if (response.reference) {
    messageHTML += `
      <div class="chat-law-reference">
        <strong>法条引用：</strong> ${response.reference}
      </div>
    `;
  }
  
  messageHTML += `<div class="chat-time">${timeString}</div>`;
  
  messageElement.innerHTML = messageHTML;
  
  chatBody.appendChild(messageElement);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// 模拟AI输入效果
function initAITypingEffect() {
  // 为所有带有typing-effect类的元素添加打字效果
  document.querySelectorAll('.typing-effect').forEach(element => {
    const text = element.textContent;
    element.textContent = '';
    
    let i = 0;
    function typeEffect() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeEffect, Math.random() * 50 + 30);
      }
    }
    
    typeEffect();
  });
}

// 暗黑模式切换
function initDarkModeToggle() {
  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  if (!darkModeToggle) return;
  
  darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    // 保存用户偏好到localStorage
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('darkMode', 'enabled');
      this.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      localStorage.setItem('darkMode', 'disabled');
      this.innerHTML = '<i class="fas fa-moon"></i>';
    }
  });
  
  // 检查用户之前的偏好设置
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// 表单验证
function initFormValidation() {
  const forms = document.querySelectorAll('.needs-validation');
  
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
  });
}

// 加载所有原型页面到index.html
function initIframesLoader() {
  const prototypePages = [
    { name: "登录页面", file: "login.html", description: "用户登录界面" },
    { name: "注册页面", file: "register.html", description: "新用户注册界面" },
    { name: "首页", file: "home.html", description: "用户登录后的主页面" },
    { name: "AI咨询聊天", file: "ai-chat.html", description: "AI法律咨询聊天界面" },
    { name: "历史咨询记录", file: "chat-history.html", description: "用户历史咨询记录界面" },
    { name: "个人资料", file: "profile.html", description: "用户个人资料设置界面" },
    { name: "专家咨询申请", file: "expert-consult.html", description: "申请真人专家咨询界面" }
  ];
  
  const prototypesContainer = document.getElementById('prototypes-container');
  if (!prototypesContainer) return;
  
  prototypePages.forEach(page => {
    const prototypeCard = document.createElement('div');
    prototypeCard.className = 'prototype-card';
    
    prototypeCard.innerHTML = `
      <h3>${page.name}</h3>
      <p>${page.description}</p>
      <div class="prototype-iframe-container">
        <iframe src="${page.file}" title="${page.name}" frameborder="0"></iframe>
      </div>
      <div class="prototype-actions">
        <a href="${page.file}" target="_blank" class="btn btn-primary">
          <i class="fas fa-external-link-alt"></i> 新窗口打开
        </a>
      </div>
    `;
    
    prototypesContainer.appendChild(prototypeCard);
  });
}
