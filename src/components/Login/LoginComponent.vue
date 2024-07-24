<template>
  <div class="login-body">
    <div :class="['login-container', {'expanded': registerActive}]">
      <login-form      
        :formData="loginData"
        @update:formData="updateLoginData"
        :onLogin="login"
        :toggleRegister="toggleRegister"
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
      registerActive: false,
      loginData: {
        username: '',
        password: ''
      }
    };
  },
  mounted(){
    if (localStorage.already_registered){
      this.registerActive = !localStorage.already_registered;
    }
  },
  methods: {
    login() {
      request_login(this.loginData.username, this.loginData.password, this.set_cookie);
    },
    toggleRegister() {
      this.registerActive = !this.registerActive;
    },


    set_cookie(name, value, days) {
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    },
    updateLoginData(newData) {
      console.log('Login form data:', newData);
      this.loginData = newData;
    },
    updateRegisterData(newData) {
      console.log('Register form data updated:', newData);
      this.registerData = newData;
    }
  }
};
</script>


<style scoped>
@import '@/assets/LoginComponent.css';
</style>
