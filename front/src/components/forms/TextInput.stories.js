import TextInput from './TextInput.vue';

export default {
  title: 'Components/Forms/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    label: { control: 'text' },
    icon: { control: 'text' },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel'],
    },
    error: { control: 'text' },
    hint: { control: 'text' },
  },
};

export const Default = {
  args: {
    id: 'email',
    label: '電子郵箱',
    placeholder: '請輸入您的電子郵箱',
  },
};

export const WithIcon = {
  args: {
    id: 'email',
    label: '電子郵箱',
    icon: 'envelope',
    placeholder: '請輸入您的電子郵箱',
  },
};

export const WithHint = {
  args: {
    id: 'email',
    label: '電子郵箱',
    icon: 'envelope',
    placeholder: '請輸入您的電子郵箱',
    hint: '我們將發送驗證鏈接到此郵箱',
  },
};

export const WithError = {
  args: {
    id: 'email',
    label: '電子郵箱',
    icon: 'envelope',
    placeholder: '請輸入您的電子郵箱',
    error: '請輸入有效的電子郵箱地址',
  },
};

export const PasswordInput = {
  args: {
    id: 'password',
    label: '密碼',
    type: 'password',
    icon: 'lock',
    placeholder: '請輸入您的密碼',
  },
}; 