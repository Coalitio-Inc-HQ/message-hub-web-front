<template>
  <div class="login-body">
    <div class="login-container">
      <login-form      
        :form_data="login_data"
        @update:form_data="update_login_data"
        :on_login="login"
      />
    </div>
  </div>
</template>

<script>
import LoginForm from './LoginForm.vue';
import { request_login } from '@/services/authService';

export default {
  components: {
    LoginForm
  },
  data() {
    return {
      login_data: {
        username: '',
        password: ''
      }
    };
  },
  methods: {
    login() {
      request_login(this.login_data.username, this.login_data.password, this.set_cookie);
    },

    set_cookie(name, value, days) {
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
      }
      document.cookie = `${name}=${value || ""}${expires}; path=/`;
    },

    update_login_data(new_data) {
      console.log('Login form data:', new_data);
      this.login_data = new_data;
    }
  }
};
</script>


<style scoped>
@import '@/assets/LoginComponent.css';
</style>
