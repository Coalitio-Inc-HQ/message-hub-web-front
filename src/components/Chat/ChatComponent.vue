<template>
  <div :class="['main', { 'main-expanded': !isSidebarVisible }]">
    <div :class="['name-display']" >
      <button class="button_exit" @click="exit_chat">  
        Выйти
      </button>
    </div>
    <ul class="chat">
        <li v-for="message in this.current_chat.messages" :key="message.sender_id + message.sended_at" :class="{ 'message': true, 'self': message.sender_id == this.this_user_id, 'other': message.sender_id !== this.this_user_id }">
          <div class="message-content">
            <div class="name">{{ get_user_name(message.sender_id) }}</div>
            <div class="body">{{ message.text }}</div>
            <div class="timestamp">{{ extractTimeFromTimestamp(message.sended_at) }}</div>
          </div>
        </li>
    </ul>
    <form class="form" @submit.prevent="submit_message">
      <textarea ref="messageInput" v-model="message_input" id="msg" placeholder="Введите сообщение..." @keydown="handle_key_down"></textarea>
      <button type="submit" class="send" :disabled="!current_chat">Отправить</button>
    </form>
  </div>
</template>

<script>
import router from "@/router";

export default {
  props: [
    "this_user_id",
    "user_name",
    "current_chat"
  ],
  methods: {

  get_user_name(user_id) {
    if (this.this_user_id === user_id) {
      return this.user_name;
    }

    const user = this.current_chat.users.find(user => user.id === user_id);
    return user ? user.name : "null";
  },

  submit_message() {
    this.$emit('send-message', this.message_input);
    this.message_input = ''; 
  },

  handle_key_down(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); 
      this.submit_message();
    }
  },

  extractTimeFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
  },

  delete_cookies() {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (name) {
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          console.log(`Cookie удалена: ${name}`);
        } else {
          console.log('Куки не обнаружены для удаления.');
      }
    }
  },

  exit_chat() {
    alert('Вы вышли из системы');  
    this.delete_cookies();
    router.push('/login');
    }
  }

};
</script>

<style scoped>
.name-display {
  display: flex;
  padding: 8px;
 
 
}
.button_exit{

  margin-left: auto;
  height: 30px;  
  width: 70px;
  background-color: #3e3e3e;
  border-width: 0;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
} 
.button_exit:hover{
  background-color: light-dark(rgba(239, 239, 239, 0.3), rgba(19, 1, 1, 0.3));
}

</style>