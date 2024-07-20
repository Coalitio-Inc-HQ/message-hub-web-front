<template>
  <div :class="['main', { 'main-expanded': !isSidebarVisible }]">
    <div :class="['name-display']" >
      <button class="button_exit" @click="exit_chat">  
        Выйти
      </button>
    </div>
    <ul class="chat" ref="scroll_container">
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
import moment from 'moment-timezone';

export default {
  props: [
    "this_user_id",
    "user_name",
    "current_chat"
  ],

  watch: {
    'current_chat.messages': {
      handler() {
        this.scroll_down(false);
      },
      deep: true
    }
  },
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
      this.scroll_down(true);
    },

    handle_key_down(event) {
      const textarea = this.$refs.messageInput;
      
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault(); 
          this.submit_message();  
          textarea.style.height =  `${40}px`;    
        } else if (event.key === 'Enter' && event.shiftKey) {
          textarea.style.height = `${textarea.scrollHeight + 10}px`;
        }
    },


    extractTimeFromTimestamp(timestamp) {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localDate = moment.tz(timestamp, timeZone);
        const localTimeString = localDate.format('HH:mm');
        const timezoneOffset = localDate.format('Z');
        console.log("Смещение относительно UTC:", `UTC${timezoneOffset}`);

        return localTimeString;
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
    },
    
    scroll_down(smooth = false) {
      this.$nextTick(() => {
        const container = this.$refs.scroll_container;
        if (container) {
          if (smooth) {
            container.style.scrollBehavior = 'smooth';
          } else {
            container.style.scrollBehavior = 'auto';
          }
          container.scrollTop = container.scrollHeight;
          console.log("smooth:", smooth);
          if (smooth) {
            setTimeout(() => {
              container.style.scrollBehavior = 'auto';
            }, 300);
          }
        }
      });
    },
  },
  mounted() {
    this.scroll_down(false);
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