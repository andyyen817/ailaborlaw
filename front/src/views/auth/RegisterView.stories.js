import RegisterView from './RegisterView.vue';

export default {
  title: 'Views/Auth/RegisterView',
  component: RegisterView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default = {};

export const WithProfileSectionOpen = {
  render: (args) => ({
    components: { RegisterView },
    setup() {
      return { args };
    },
    template: '<RegisterView ref="registerView" />',
    mounted() {
      const vm = this.$refs.registerView;
      if (vm) {
        vm.showProfileSection = true;
      }
    }
  }),
};

export const WithError = {
  render: (args) => ({
    components: { RegisterView },
    setup() {
      return { args };
    },
    template: '<RegisterView ref="registerView" />',
    mounted() {
      const vm = this.$refs.registerView;
      if (vm) {
        vm.error = '電子郵箱已被註冊，請使用其他郵箱或直接登錄';
      }
    }
  }),
};

export const Loading = {
  render: (args) => ({
    components: { RegisterView },
    setup() {
      return { args };
    },
    template: '<RegisterView ref="registerView" />',
    mounted() {
      const vm = this.$refs.registerView;
      if (vm) {
        vm.loading = true;
      }
    }
  }),
};

export const Success = {
  render: (args) => ({
    components: { RegisterView },
    setup() {
      return { args };
    },
    template: '<RegisterView ref="registerView" />',
    mounted() {
      const vm = this.$refs.registerView;
      if (vm) {
        vm.registerSuccess = true;
      }
    }
  }),
}; 