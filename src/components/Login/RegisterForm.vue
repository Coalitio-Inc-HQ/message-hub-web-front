<template>
    <form @submit.prevent="handleRegister">
      <h4>Зарегистрироваться</h4>
      <div class="input-box">
        <input type="text" id="usernameReg" v-model="localFormData.usernameReg" required />
        <span>Имя</span>
        <i></i>
      </div>
      <div class="input-box">
        <input type="text" id="emailReg" v-model="localFormData.emailReg" required />
        <span>Email</span>
        <i></i>
      </div>
      <div class="input-box">
        <input type="password" id="passwordReg" v-model="localFormData.passwordReg" required />
        <span>Пароль</span>
        <i></i>
      </div>
      <div class="input-box">
        <input type="password" id="confirmPasswordReg" v-model="localFormData.confirmPasswordReg" required />
        <span>Подтвердите пароль</span>
        <i></i>
      </div>
      <div class="button-container">
        <button type="submit">Регистрация</button>
      </div>
      <p class="switch-form">Уже зарегистрированы? <a href="#" @click="toggleRegister">Войти</a></p>
    </form>
  </template>
  
  <script>
  export default {
    props: {
      formData: Object,
      onRegister: Function,
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
      handleRegister() {
        this.$emit('update:formData', this.localFormData);
        this.onRegister();
      }
    }
  };
  </script>
  