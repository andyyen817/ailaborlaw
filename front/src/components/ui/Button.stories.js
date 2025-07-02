import Button from './Button.vue';

export default {
  title: 'Components/UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    icon: { control: 'text' },
    iconRight: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export const Primary = {
  args: {
    color: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false,
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">登錄</Button>',
  }),
};

export const Secondary = {
  args: {
    color: 'secondary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false,
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">取消</Button>',
  }),
};

export const WithIcon = {
  args: {
    color: 'primary',
    size: 'md',
    icon: 'user',
    disabled: false,
    loading: false,
    fullWidth: false,
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">註冊</Button>',
  }),
};

export const WithIconRight = {
  args: {
    color: 'primary',
    size: 'md',
    icon: 'arrow-right',
    iconRight: true,
    disabled: false,
    loading: false,
    fullWidth: false,
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">下一步</Button>',
  }),
};

export const Loading = {
  args: {
    color: 'primary',
    size: 'md',
    loading: true,
    disabled: false,
    fullWidth: false,
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">提交中...</Button>',
  }),
};

export const Disabled = {
  args: {
    color: 'primary',
    size: 'md',
    disabled: true,
    loading: false,
    fullWidth: false,
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">無法點擊</Button>',
  }),
};

export const FullWidth = {
  args: {
    color: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: true,
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<div style="width: 300px"><Button v-bind="args">全寬按鈕</Button></div>',
  }),
}; 