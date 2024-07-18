<template>
    <form @submit.prevent="handleLogin">
      <h4>Войти</h4>
      <div class="input-box">
        <input type="text" id="username" v-model="localFormData.username" required />
        <span>Логин</span>
        <i></i>
      </div>
      <div class="input-box">
        <input type="password" id="password" v-model="localFormData.password" required />
        <span>Пароль</span>
        <i></i>
      </div>
      <div class="button-container-log">
        <button type="submit">Войти</button>
      </div>
      <p class="switch-form">Еще не зарегистрированы? <a href="#" @click="toggleRegister">Регистрация</a></p>
    </form>
  </template>
  
  <script>
  export default {
    props: {
      formData: Object,
      onLogin: Function,
      toggleRegister: Function
    },
    data() {
      return {
        localFormData: { ...this.formData }
      };
    },
    watch: {
      formData: {
        handler(newVal) {
          this.localFormData = { ...newVal };
        },
        deep: true
      }
    },
    methods: {
      handleLogin() {
        this.$emit('update:formData', this.localFormData);
        this.onLogin();
      }
    }
  };
  </script>
  