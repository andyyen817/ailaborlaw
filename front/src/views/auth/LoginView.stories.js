import LoginView from './LoginView.vue';

export default {
  title: 'Views/Auth/LoginView',
  component: LoginView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default = {};

export const WithError = {
  render: (args) => ({
    components: { LoginView },
    setup() {
      return { args };
    },
    template: '<LoginView />',
    mounted() {
      this.$el.querySelector('form').dispatchEvent(new Event('submit'));
    }
  }),
};

export const Loading = {
  render: (args) => ({
    components: { LoginView },
    setup() {
      return { args };
    },
    template: '<LoginView />',
    mounted() {
      const vm = this.$refs.loginView;
      if (vm) {
        vm.loading = true;
      }
    }
  }),
  args: {},
};

export const Success = {
  render: (args) => ({
    components: { LoginView },
    setup() {
      return { args };
    },
    template: '<LoginView ref="loginView" />',
    mounted() {
      const vm = this.$refs.loginView;
      if (vm) {
        vm.loginSuccess = true;
      }
    }
  }),
  args: {},
}; 