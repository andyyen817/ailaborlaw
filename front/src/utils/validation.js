import { defineRule } from 'vee-validate'
import { required, min, email, confirmed } from '@vee-validate/rules'

/**
 * 定义表单验证规则
 */
export function defineRules() {
  // 必填字段规则
  defineRule('required', (value, params, ctx) => {
    console.log(`[Validation Rule "required"] Field: "${ctx.field}", Value:`, value, `Type:`, typeof value);
    // 使用从 @vee-validate/rules 导入的 required 函数进行实际验证
    // required(value) 会为 undefined, null, 空字符串, 空数组返回 false；对于布尔值，它会检查是否为 true
    const isValid = required(value); 
    if (!isValid) {
      // 如果导入的 required 函数认为值无效 (例如，复选框未勾选，值为 false)
      // 则返回自定义的错误消息
      return '此欄位為必填項';
    }
    // 如果值有效
    return true;
  })

  // 电子邮箱格式规则
  defineRule('email', (value) => {
    if (!email(value)) {
      return '請輸入有效的電子郵箱'
    }
    return true
  })

  // 最小长度规则
  defineRule('min', (value, [limit]) => {
    if (!min(value, { length: limit })) {
      return `此欄位必須至少包含 ${limit} 個字符`
    }
    return true
  })

  // 最大长度规则
  defineRule('max', (value, [limit]) => {
    if (!value) return true
    if (value.length > limit) {
      return `此欄位不能超過 ${limit} 個字符`
    }
    return true
  })

  // 确认密码匹配规则
  defineRule('confirmed', (value, params, ctx) => { 
    // params 数组的第一个元素现在应该是目标字段的名称，例如 'password'
    const targetFieldName = params[0]; 
    console.log(`[Validation Rule "confirmed"] Expecting target field name from params[0]: "${targetFieldName}"`);

    const targetFieldValue = targetFieldName ? ctx.form[targetFieldName] : undefined;
    
    console.log(`[Validation Rule "confirmed"] Current Field ("${ctx.field}") Value: "${value}", Target Field Name from Rule: "${targetFieldName}", Found Target Field Value in Form: "${targetFieldValue}"`);
    
    // 使用从 @vee-validate/rules 导入的 confirmed 函数进行比较，它需要一个对象 { target: value }
    // 或者直接比较: if (value !== targetFieldValue)
    if (!confirmed(value, { target: targetFieldValue })) {
      return '兩次輸入的密碼不匹配';
    }
    return true;
  })

  // 条款同意规则
  defineRule('required:true', (value) => {
    console.log('[Validation Rule "required:true"] Value:', value, 'Type:', typeof value);
    if (value !== true) {
      return '請同意服務條款和隱私政策'
    }
    return true
  })
  
  // 密码复杂度规则 - 与后端保持一致：英文字母+数字，至少8位，大小写不分
  defineRule('password', (value) => {
    if (!value) return true
    
    // 检查是否符合规则：至少包含一个英文字母和一个数字，只允许英文字母和数字，至少8位
    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const isValidCharacters = /^[A-Za-z0-9]+$/.test(value);
    const isValidLength = value.length >= 8;
    
    const errors = [];
    
    if (!isValidLength) {
      errors.push('至少8個字符');
    }
    
    if (!hasLetter) {
      errors.push('至少包含一個英文字母');
    }
    
    if (!hasNumber) {
      errors.push('至少包含一個數字');
    }
    
    if (!isValidCharacters) {
      errors.push('只能包含英文字母和數字');
    }
    
    if (errors.length > 0) {
      return `密碼必須: ${errors.join('、')}`;
    }
    
    return true;
  })
}
