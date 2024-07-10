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
  methods: {
    login() {
      if (this.username && this.password) {
        localStorage.setItem('isAuthenticated', 'true');
        this.$router.push('/chat');
      } else {
        alert('Please enter your username and password');
      }
    },
    toggleRegister() {
      this.registerActive = !this.registerActive;
    },
    register() {
      if (this.passwordReg !== this.confirmPasswordReg) {
        alert('Passwords do not match');
        return;
      }
      if (this.usernameReg && this.emailReg && this.passwordReg && this.confirmPasswordReg) {
        // Perform registration logic here
        alert('Registration successful');
        this.toggleRegister(); // Switch back to login form
      } else {
        alert('Please fill in all fields');
      }
    }
  }
};
</script>


<style scoped>
@import '@/assets/LoginComponent.css';
</style>
