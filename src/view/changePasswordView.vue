<template>
    <div class="full-screen center-container">
      <div class="login-container">
        <form class="flex-list" @submit.prevent="handleChangePassword">
          <h4 class="heder">TestName</h4>
          <FloatLabel class="input-field-box">
            <Password inputClass="input-field" class="input-field" v-model="password" :feedback="false" toggleMask />
            <label for="password">Новый пароль</label>
          </FloatLabel>
          <FloatLabel class="input-field-box">
            <Password inputClass="input-field" class="input-field" v-model="password1" :feedback="false" toggleMask />
            <label for="password1">Подтверждение пароля</label>
          </FloatLabel>
          <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="error" severity="error">{{error}}</Message>
          <div class="button-container">
            <Button type="submit" class="w-full">Сменить пароль</button>
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

    import { Message } from 'primevue';
  
    import { mapStores } from 'pinia'
    import { useAuthService, failAuthFuncBracers } from '@/services/authService';
    
    const baraker = ()=> {return true;}

    import router from '@/router';
  
    export default {
      components:{
        InputText,
        FloatLabel,
        Password,
        Button,
        Message,
      },
      props: {
      },
      computed:{
        ...mapStores(useAuthService)
      },
      data() {
        return {
          password: null,
          password1: null,
          error: null,
        };
      },
      methods: {
        async handleChangePassword() {
            if (this.password!=this.password1){
                this.error="пароли не совподпют.";
                return;
            }

            let res = await this.AuthServiceStore.changePassword(this.$route.query.token, this.$route.query.user_id, this.password);
            if (res === true){
                router.push('/ui/chat');
            } 
            else {
                this.error = res.description;
            }
        }
      },
      mounted(){
        failAuthFuncBracers.push(baraker);
      },
      unmounted(){
        const index = failAuthFuncBracers.indexOf(baraker);
        if (index !== -1) {
          failAuthFuncBracers.splice(index, 1);
        }
      }
    };
  </script>
  
  
  <style>
    @import '@/assets/LoginComponent.css';
    @import '@/assets/Layout.css';
  </style>
  