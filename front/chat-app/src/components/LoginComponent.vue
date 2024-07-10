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
        <p class="switch-form">Еще не зарегистрированны? <a href="#" @click="toggleRegister">Регестрация</a></p>
      </form>

      <form v-else @submit.prevent="register">
        <h4>Зарегестрироваться</h4>
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
          <input type="password" id="passwordReg" v-model="passwordReg" required />
          <span>Пароль</span>
          <i></i>
        </div>
        <div class="button-container">
          <button type="submit">Регестрация</button>
        </div>
        <p class="switch-form">Уже зарегестрированны? <a href="#" @click="toggleRegister">Войти</a></p>
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
