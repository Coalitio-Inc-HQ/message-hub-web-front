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
        <p class="switch-form">Еще не зарегистрированны? <a href="#" @click="toggleRegister">Регистрация</a></p>
      </form>

      <form v-else @submit.prevent="register">
        <h4>Зарегистрироваться</h4>
        <div class="input-box">
          <input type="text" id="usernameReg" v-model="usernameReg" required />
          <span>Имя</span>
          <i></i>
        </div>
        <div class="input-box">
            <input type="text" id="emailReg" v-model="emailReg" @blur="validateEmail" required />
            <span>Email</span>
            <i></i>
            <p v-if="emailError" style="color:red; margin-left: 100px;">Введите корректный email</p>
          </div>
        <div class="input-box">
          <input type="password" id="passwordReg" v-model="passwordReg" required />
          <span>Пароль</span>
          <i></i>
        </div>
        <div class="button-container">
          <button type="submit">Регистрация</button>
        </div>
        <p class="switch-form">Уже зарегистрированны? <a href="#" @click="toggleRegister">Войти</a></p>
      </form>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import router from "@/router";

  // axios.defaults.withCredentials = true

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
      if (localStorage.already_registered){
        this.registerActive = !localStorage.already_registered;
      }
    },


    methods: {
      login() {
        this.rquest_login(this.username, this.password)
      },
      validateEmail() {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      this.emailError = !regex.test(this.emailReg);
    },

      toggleRegister() {
        this.registerActive = !this.registerActive;
      },

      
      register() {
        let temp_emailReg = this.emailReg;
        let temp_passwordReg = this.passwordReg;
        let metod = this.rquest_login;

        axios.post('http://localhost:8000/auth/register/', {
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

      rquest_login(email, password){
        axios.post('http://localhost:8000/auth/jwt/login', {
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
          if (response.status == 204){
            router.push('/chat');
          }
        })
        .catch(function (error) {
          console.log(error);
        });
      }
    }
  };
  </script>


 <style scoped>
  @import '@/assets/LoginComponent.css';
</style>
