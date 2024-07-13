<template>
  <div class="login-body">
    <div class="login-container">
      <form v-if="!registerActive" @submit.prevent="login">
        <h4>Войти</h4>
        <div class="input-box">
          <input type="text" id="username" v-model="username" required />
          <span>Логин</span>
          <i></i>
        </div>
        <div class="input-box">
          <input type="password" id="password" v-model="password" required />
          <span>Пароль</span>
          <i></i>
        </div>
        <div class="button-container-log">
          <button type="submit">Войти</button>
        </div>
        <p class="switch-form">Еще не зарегистрированы? <a href="#" @click="toggleRegister">Регистрация</a></p>
      </form>

      <form v-else @submit.prevent="register">
        <h4>Зарегистрироваться</h4>
        <div class="input-box">
          <input type="text" id="usernameReg" v-model="usernameReg" required />
          <span>Имя</span>
          <i></i>
        </div>
        <div class="input-box">
          <input type="text" id="emailReg" v-model="emailReg" required />
          <span>Email</span>
          <i></i>
        </div>
        <div class="input-box">
          <input type="password" id="passwordReg" v-model="passwordReg"  required />
          <span>Пароль</span>
          <i></i>
        </div>
        <div class="button-container">
          <button type="submit">Регистрация</button>
        </div>
        <p class="switch-form">Уже зарегистрированы? <a href="#" @click="toggleRegister">Войти</a></p>
      </form>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import router from "@/router";
  const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
  const AUTH_REGISTER_URL = `${API_BASE_URL}${process.env.VUE_APP_AUTH_REGISTER_URL}`;
  const AUTH_LOGIN_URL = `${API_BASE_URL}${process.env.VUE_APP_AUTH_LOGIN_URL}`;


  export default {
    data() {
      return {
        username: '',
        password: '',
        registerActive: false,
        usernameReg: '',
        emailReg: '',
        passwordReg: '',
        confirmPasswordReg: ''
      };
    },

    mounted(){
      // console.log('VUE_APP_WS_URL:', process.env.VUE_APP_WS_URL);
      if (localStorage.already_registered){
        this.registerActive = !localStorage.already_registered;
      }
    },

    methods: {
      login() {
        if (!this.validateLoginPassword()) {
        alert('Пароль должен содержать минимум 8 символов');
        return;
        }
        this.request_login(this.username, this.password)
      },
      
      toggleRegister() {
        this.registerActive = !this.registerActive;
      },

      validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
        return re.test(email);
      },

      validateLoginPassword() {
      const minLength = 8;
      return this.password.length >= minLength;
    },

    validateRegistrationPassword(value) {
      const minLength = 8;
      const containsUppercase = /[A-Z]/.test(value);
      const containsLowercase = /[a-z]/.test(value);
      const containsNumber = /[0-9]/.test(value);
      const containsSpecial = /[#?!@$%^&*-]/.test(value);
      return value.length >= minLength && containsUppercase && containsLowercase && containsNumber && containsSpecial;
    },


      register() {
        if (!this.validateRegistrationPassword(this.passwordReg)) {
        alert('Пароль должен содержать минимум 8 символов, заглавную и строчную буквы, цифру и специальный символ (#?!@$%^&*-).');
        return;
      } else if (!this.validateEmail(this.emailReg)) {
        alert("Пожалуйста, введите корректный email.");
        return;
      }

        let temp_emailReg = this.emailReg;
        let temp_passwordReg = this.passwordReg;
        let metod = this.request_login;

        axios.post(AUTH_REGISTER_URL, {
          name: this.usernameReg,
          email: this.emailReg,
          password: this.passwordReg
        }
        )
        .then(function (response) {
          console.log(response);
          if (response.status == 201){
            localStorage.already_registered =true;
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
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
        )
        .then(function (response) {
          console.log(response);
          if (response.status >= 200 && response.status < 300){
            if (response.data.access_token){
              setcookie("token",response.data.access_token,1)
              router.push('/chat');
            }
          }
        })
        .catch(function (error) {
          console.log(error);
        });
      },

      setCookie(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
      }
    }
  };
  </script>


 <style scoped>
  @import '@/assets/LoginComponent.css';
</style>
