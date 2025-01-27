<template>
  <form class="flex-list" @submit.prevent="handleLogin">
    <h4 class="heder">TestName</h4>
    <FloatLabel class="input-field-box">
      <InputText class="input-field" name="username" type="text" id="username" v-model="localFormData.username"/>
      <label for="username">Логин</label>
    </FloatLabel>
    <FloatLabel class="input-field-box">
      <Password inputClass="input-field" class="input-field" v-model="localFormData.password" :feedback="false" toggleMask />
      <label for="password">Пароль</label>
    </FloatLabel>
    <div class="button-container">
      <Button type="submit">Войти</button>
    </div>
  <!-- <p class="switch-form">Еще не зарегистрированы? <a href="#" @click="toggleRegister">Регистрация</a></p> -->
  </form>
</template>
  
<script>
  import InputText from 'primevue/inputtext';
  import FloatLabel from 'primevue/floatlabel';
  import Password from 'primevue/password';
  import Button from 'primevue/button';
  export default {
    components:{
      InputText,
      FloatLabel,
      Password,
      Button
    },
    props: {
      formData: Object,
      onLogin: Function,
      toggleRegister: Function,
      loginfail:Boolean
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
  