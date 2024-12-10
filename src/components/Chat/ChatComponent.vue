<template>
  <div class="dialog-main flex-list" ref="main_div">
    <div class="dialog-header-container flex-list-w">
      <Button variant="text" size="small" icon="pi pi-arrow-left" @click="this.$emit('set-null-chat')"/>

      <!-- Перенести в меню -->
      <button class="button_exit" @click="exit_chat">Выйти</button>
    </div>
    <ScrollPanel class="flex-scale overflow-h-hiddne overflow-w-hiddne">
      <div class="dialog-messges-base flex-list">
        <!-- <template v-if="this.current_chat">
          <div 
            v-for="group in messages_in_chat" 
            :key=""
            class="dialog-messges-group"
            >
            {{ group.length}} 
          </div>
        </template> -->
        
        <template v-if="this.current_chat">
          <div v-for="message in this.current_chat.messages" 
          :key="message.sender_id + message.sended_at" 
          :class="{ 
            'message': true,
            'flex-list': true,
            'message-self': message.sender_id == this.this_user_id, 
            'message-other': message.sender_id !== this.this_user_id,
            'max-mode': this.max_mode
            }"
          >
            <div class="message-sender-name">{{ get_user_name(message.sender_id) }}</div>
            <div class="message-text">{{ message.text }}</div>
            <div class="message-timestamp">{{ format_time_for_display(message.sended_at) }}</div>
          </div>
        </template>
      </div>
    </ScrollPanel>

    <form class="form flex-list-w" @submit.prevent="submit_message">
      <textarea 
        ref="messageInput" 
        v-model="message_input" 
        id="msg" 
        placeholder="Введите сообщение..." 
        @keydown="handle_key_down">
      </textarea>
      <button type="submit" class="send" :disabled="!current_chat">Отправить</button>
    </form>
  </div>
</template>

<script>
  import Button from 'primevue/button';
  import ScrollPanel from 'primevue/scrollpanel';

  import router from "@/router";
  import {format_time_for_display} from '@/services/dateUtils';
  // import { noop } from '@vueuse/core';
  export default {
    components:{
      Button,
      ScrollPanel
    },
    props: [
      "this_user_id",
      "user_name",
      "current_chat",
    ],

    watch: {
      'current_chat.messages': {
        handler() {
          this.scroll_down(true);
        },
        deep: true,
        immediate: true
      },
      'current_chat': {
        handler() {
          this.scroll_down(false);
        },
        deep: false,
        immediate: true
      }
    },

    data(){
      return{
        observer: null,
        max_mode: false,
      }
    },

    methods: {
      handleResize () {
        console.log(this.main_div)
      },

      format_time_for_display,

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
            container.style.scrollBehavior = smooth ? 'smooth' : 'auto';
            container.scrollTop = container.scrollHeight;

          }
          console.log("smooth:", smooth);
        });
      },

      onResize () {
        this.max_mode = this.$refs.main_div.offsetWidth>750 
        // console.log(this.$refs.main_div.offsetWidth);
      },
    },
    mounted() {
      this.scroll_down(false);
      this.observer = new ResizeObserver(this.onResize)
      this.observer.observe(this.$refs.main_div)
    },

    beforeUnmount () {
      this.observer.unobserve(this.$refs.main_div)
    }

    // computed: {
    //   messages_in_chat() {
    //     var arr = [];
    //     var last_sender = null;
    //     var last_arr = null;
    //     for (var i=0;i<this.current_chat.messages.length; i++){
    //       if (last_sender != this.current_chat.messags[i].sender_id){
    //         last_arr = [];
    //         arr.push(last_arr);
    //         last_sender = this.current_chat.messags[i].sender_id;
    //       }
    //       last_arr.push(this.current_chat.messags[i]);
    //     }
    //     return arr;
    //   }
    // }

  };
</script>

<style scoped>
@import '@/assets/ChatComponent.css'; 
@import 'primeicons/primeicons.css';
@import '@/assets/Layout.css';
</style>