<template>
  <div class="login-body">
    <div :class="['login-container', {'expanded': registerActive}]">
      <!-- <login-form      
        v-if="!registerActive"  
      :formData="loginData"
        @update:formData="updateLoginData"
        :onLogin="login"
        :toggleRegister="toggleRegister"
      /> -->

      <login-form      
        :formData="loginData"
        @update:formData="updateLoginData"
        :onLogin="login"
        :toggleRegister="toggleRegister"
      />
      <!-- <register-form
        v-else
        :formData="registerData"
        @update:formData="updateRegisterData"
        :onRegister="register"
        :toggleRegister="toggleRegister"
      /> -->
    </div>
  </div>
</template>

<script>
import LoginForm from './LoginForm.vue';
//import RegisterForm from './RegisterForm.vue';
import axios from 'axios';
import router from "@/router";

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
const AUTH_REGISTER_URL = `${API_BASE_URL}${process.env.VUE_APP_AUTH_REGISTER_URL}`;
const AUTH_LOGIN_URL = `${API_BASE_URL}${process.env.VUE_APP_AUTH_LOGIN_URL}`;

export default {
  components: {
    LoginForm,
    //RegisterForm
  },
  data() {
    return {
      registerActive: false,
      loginData: {
        username: '',
        password: ''
      },
      // registerData: {
      //   usernameReg: '',
      //   emailReg: '',
      //   passwordReg: '',
      //   confirmPasswordReg: ''
      // }
    };
  },
  mounted(){
    if (localStorage.already_registered){
      this.registerActive = !localStorage.already_registered;
    }
  },
  methods: {
    login() {
      // if (!this.validateLoginPassword()) {
      //   alert('Пароль должен содержать минимум 8 символов');
      //   return;
      // }
      this.request_login(this.loginData.username, this.loginData.password)
    },
    toggleRegister() {
      this.registerActive = !this.registerActive;
    },
    validateEmail(email) {
      const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/;
      return re.test(email);
    },
    // validateLoginPassword() {
    //   const minLength = 8;
    //   return this.loginData.password.length >= minLength;
    // },
    validateRegistrationPassword(value) {
      const minLength = 8;
      return value.length >= minLength;
    },
    register() {
      if (!this.validateRegistrationPassword(this.registerData.passwordReg)) {
        alert('Пароль должен содержать минимум 8 символов');
        return;
      } else if (!this.validateEmail(this.registerData.emailReg)) {
        alert("Пожалуйста, введите корректный email.");
        return;
      } else if (this.registerData.passwordReg !== this.registerData.confirmPasswordReg) {
        alert("Пароли не совпадают. Пожалуйста, повторите попытку.");
        return;
      }
      let temp_emailReg = this.registerData.emailReg;
      let temp_passwordReg = this.registerData.passwordReg;
      let metod = this.request_login;

      axios.post(AUTH_REGISTER_URL, {
        name: this.registerData.usernameReg,
        email: this.registerData.emailReg,
        password: this.registerData.passwordReg
      })
      .then(function (response) {
        if (response.status == 201){
          localStorage.already_registered = true;
          metod(temp_emailReg, temp_passwordReg);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    },
    request_login(email, password){
      let setcookie = this.setCookie;
      axios.post(AUTH_LOGIN_URL, {
        username: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      })
      .then(function (response) {
        if (response.status >= 200 && response.status < 300){
          if (response.data.access_token){
            setcookie("token", response.data.access_token, 1)
            router.push('/chat');
          }
        }
      })
      .catch(function (error) {
        console.log(error);
        alert("Неправильный логин или пароль. Пожалуйста, повторите попытку.");
      });
    },
    setCookie(name, value, days) {
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


<!-- .login-container {
  transition: height 0.5s ease;
  overflow: hidden;
}

.login-container.expanded {
  height: 360px;
} -->
<style scoped>
@import '@/assets/LoginComponent.css';
</style>
