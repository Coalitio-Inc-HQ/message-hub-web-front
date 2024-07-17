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


        <div class="input-box" :class="{ focused: isPasswordFocused }">
          <input :type="passwordFieldType" 
          id="password"
          v-model="password" required 
                 @focus="handleFocusInputBox" 
                 @blur="handleBlurInputBox" />
          <span>Пароль</span>
          <i @click.stop="togglePasswordVisibility" class="toggle-password">
            <svg v-if="showPassword" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <path d="M3 3l18 18"></path>
            </svg>
          </i>
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
        confirmPasswordReg: '',


        showPassword: false,
        showPasswordReg: false,
        isPasswordFocused: false

      };
    },

 mounted(){
      // console.log('VUE_APP_WS_URL:', process.env.VUE_APP_WS_URL);
      if (localStorage.already_registered){
        this.registerActive = !localStorage.already_registered;
      }
      // document.addEventListener('click', this.handleOutsideClick);
      document.addEventListener('mousedown', this.handleOutsideMouseDown);
      document.addEventListener('mouseup', this.handleOutsideMouseUp);

    }, 
    beforeUnmount() {
    // document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('mousedown', this.handleOutsideMouseDown);
    document.removeEventListener('mouseup', this.handleOutsideMouseUp);
  },


    computed: {
      passwordFieldType() {
        return this.showPassword ? 'text' : 'password';
      },
      passwordFieldTypeReg() {
        return this.showPasswordReg ? 'text' : 'password';
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
      return value.length >= minLength;
    },


      register() {
        if (!this.validateRegistrationPassword(this.passwordReg)) {
        alert('Пароль должен содержать минимум 8 символов');
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
      },
      togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
        this.isPasswordFocused = true;

      },
      togglePasswordVisibilityReg() {
        this.showPasswordReg = !this.showPasswordReg;
      },




    handleFocusInputBox() {
      this.isPasswordFocused = false;
    },

    handleBlurInputBox() {
      if (!this.password) {
      this.isPasswordFocused = !this.isPasswordFocused;
    }
    },
  //   handleOutsideClick(event) {
  //   const inputBox = this.$el.querySelector('.input-box');
  //   if (!inputBox.contains(event.target) && !this.isPasswordFocused) {
  //     this.isPasswordFocused = false;
  //   }
  // },

  // handleMouseDown() {
  //   this.isPasswordFocused = true;
  // }

  // клик внутри input-box
  handleOutsideMouseDown(event) {
      const inputBox = this.$el.querySelector('.input-box');
      if (inputBox.contains(event.target) && !this.isPasswordFocused) {
        this.isPasswordFocused = true;
      }
    },
    // клик вне input-box
    handleOutsideMouseUp(event) {
      const inputBox = this.$el.querySelector('.input-box');
      if (!inputBox.contains(event.target) && this.isPasswordFocused) {
        this.isPasswordFocused =  !this.isPasswordFocused;
      }
    }
    

    }
  };
  </script>


 <style scoped>
  @import '@/assets/LoginComponent.css';
</style>
