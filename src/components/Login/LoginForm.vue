<template>
  <form @submit.prevent="handle_login">
      <h4>Войти</h4>
      <div class="input-box">
        <input type="text" id="username" v-model="local_form_data.username" required />
        <span>Логин</span>
        <i></i>
      </div>
      <div class="input-box">
        <input type="password" id="password" v-model="local_form_data.password" required />
        <span>Пароль</span>
        <i></i>
      </div>
      <div class="button-container-log">
        <button type="submit">Войти</button>
      </div>
  </form>
</template>

  
<script>
export default {
  props: {
    form_data: Object,
    on_login: Function
  },
  data() {
    return {
      local_form_data: { ...this.form_data }
    };
  },
  watch: {
    form_data: {
      handler(new_val) {
        this.local_form_data = { ...new_val };
      },
      deep: true
    }
  },
  methods: {
    handle_login() {
      this.$emit('update:form_data', this.local_form_data);
      this.on_login();
    }
  }
};
</script>
