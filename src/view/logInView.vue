<template>
    <div class="full-screen center-container">
      <div class="login-container">
        <form class="flex-list" @submit.prevent="handleLogin">
          <h4 class="heder">TestName</h4>
          <FloatLabel class="input-field-box">
            <InputText class="input-field" name="username" type="text" id="username" v-model="username"/>
            <label for="username">Логин</label>
          </FloatLabel>
          <FloatLabel class="input-field-box">
            <Password inputClass="input-field" class="input-field" v-model="password" :feedback="false" toggleMask />
            <label for="password">Пароль</label>
          </FloatLabel>
          <div class="button-container">
            <Button type="submit" class="w-full">Войти</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
    import InputText from 'primevue/inputtext';
    import FloatLabel from 'primevue/floatlabel';
    import Password from 'primevue/password';
    import Button from 'primevue/button';
  
    import { mapStores } from 'pinia'
    import { useAuthService } from '@/services/authService';
    
    import router from '@/router';
  
    export default {
      components:{
        InputText,
        FloatLabel,
        Password,
        Button
      },
      props: {
      },
      computed:{
        ...mapStores(useAuthService)
      },
      data() {
        return {
          username: null,
          password: null,
        };
      },
      methods: {
        async handleLogin() {
          let res = await this.AuthServiceStore.login(this.username, this.password);
          if (res === true){
            router.push('/ui/chat');
          } 
          else {
            alert(res.description);
          }
        }
      }
    };
  </script>
  
  
  <style>
    @import '@/assets/LoginComponent.css';
    @import '@/assets/Layout.css';
  </style>
  