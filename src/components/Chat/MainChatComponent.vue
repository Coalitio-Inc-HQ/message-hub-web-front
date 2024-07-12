<template>
  <div class="chat-component full-height">
    <div class="wrapper">
      <div :class="['sidebar-container', { 'sidebar-container-hidden': !isSidebarVisible }]">
        <div class="toggle-btn-container">
          <button @click="toggleSidebar" class="toggle-sidebar-btn" title="toggle-sidebar" type="button">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 12H21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 6H21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 18H21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div :class="['sidebar', { 'sidebar-hidden': !isSidebarVisible }]">
          <WaitingСhatsComponent 
          :waiting_chats="waiting_chats"
          :current_chat_id="current_chat_id"
          @select-waitng-chat="select_waitng_chat"
          />
          <UserChatsComponent 
          :user_chats="user_chats" 
          :current_chat_id="current_chat_id" 
          @select-user-chat="select_user_chat"/>
        </div>
      </div>
      <ChatComponent 
      :this_user_id="this_user_id" 
      :user_name="user_name" 
      :current_chat_id="current_chat_id" 
      :current_chat_messages="current_chat_messages" 
      :current_chat_users="current_chat_users" 
      @send-message="send_message"/>
    </div>
  </div>
</template>

<script>
  import {
    setupMessageObserver
  } from '@/websocket/observers/messageObserver';

  import WaitingСhatsComponent from './WaitingСhatsComponent.vue'
  import UserChatsComponent from './UserChatsComponent.vue'
  import ChatComponent from './ChatComponent.vue'

  import {
    get_messages_by_waiting_chat_Request, 
    get_messages_by_chat_Request,
    get_users_by_chat_Request,
    send_message_to_chat_Request,
    connect_to_waiting_chat_Request,
    create_message
  } from '@/services/wsRequests'

  import router from "@/router";

  const WS_URL = process.env.VUE_APP_WS_URL;

  export default {
    components: {
      WaitingСhatsComponent,
      UserChatsComponent,
      ChatComponent,
    },

    data() {
      return {
        user_name: '', // Имя текущего пользователя
        this_user_id: null, // ID веба текущего пользователя

        waiting_chats: [], // ожидающие чаты
        user_chats: [], // чаты пользователя
        current_chat_id: null, // выбранный чат
        current_chat_messages: [], // сообщения выбраного чата
        current_chat_users: [], // пользователи выбраного чата
        current_chat_is_waiting:null, // выбранный чат ожидающий

        message_iterator:0, // внутренние индексы сообщений, нужны для согласования message.id
        waiting_messages:[], // сообщения, которые могут накопится при подключенни к чату
        current_chat_waiting_connaction: false,// ожидает ли текущий чат подключения
        
        isSidebarVisible: true // переменная состояния для боковой панели
      };
    },


    async created() {
      token=getCookie(token);
      if (token){
        this.connection = new WebSocket(WS_URL+"?token="+token);
        setupMessageObserver(this, this.connection);
      } else{
        router.push('/login');
      }
    },

    methods: {
      select_waitng_chat(chat_id){
        console.log(chat_id);

        if (this.current_chat_id!=chat_id){
          this.current_chat_id=chat_id;
          this.current_chat_messages=[];
          this.current_chat_users=[];
          this.current_chat_is_waiting=true;
          this.current_chat_waiting_connaction=false;
          get_users_by_chat_Request(this.connection.send.bind(this.connection),chat_id);
          get_messages_by_waiting_chat_Request(this.connection.send.bind(this.connection),chat_id);
        }
      },

      select_user_chat(chat_id){
        console.log(chat_id);

        if (this.current_chat_id!=chat_id){
          this.current_chat_id=chat_id;
          this.current_chat_messages=[];
          this.current_chat_users=[];
          this.current_chat_is_waiting=false;
          this.current_chat_waiting_connaction=false;
          get_users_by_chat_Request(this.connection.send.bind(this.connection),chat_id);
          get_messages_by_chat_Request(this.connection.send.bind(this.connection),chat_id);
        }
      },

      send_message(text) {
          if (text) {
              let message = create_message(this, this.this_user_id, this.current_chat_id, text, this.message_iterator);
              
              if (!this.current_chat_is_waiting) {
                  send_message_to_chat_Request(this.connection.send.bind(this.connection), message);
                  this.current_chat_messages.push(message);
              } else {
                  if (!this.current_chat_waiting_connection) {
                      this.current_chat_waiting_connection = true;
                      connect_to_waiting_chat_Request(this.connection.send.bind(this.connection), this.current_chat_id);

                      let chatIndex = this.waiting_chats.findIndex(chat => chat.id === this.current_chat_id);
                      if (chatIndex !== -1) {
                          let chat = this.waiting_chats.splice(chatIndex, 1)[0];
                          this.user_chats.push(chat);
                      }
                  }
                  this.current_chat_messages.push(message);
                  this.waiting_messages.push(message);
              }
          }
      },

      toggleSidebar() {
        this.isSidebarVisible = !this.isSidebarVisible;
      },

      getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
      }
    },
  };
</script>


<style scoped>
@import '@/assets/ChatComponent.css'; 
</style>


