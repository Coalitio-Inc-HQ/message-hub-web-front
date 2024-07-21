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
          <UserChatsComponent 
            :chats="chats" 
            :current_chat="current_chat" 
            @select-user-chat="select_user_chat"/>
        </div>
      </div>
      <ChatComponent 
        :this_user_id="this_user_id" 
        :user_name="user_name" 
        :current_chat="current_chat" 
        ref="сhat_сomponent"
        @send-message="send_message"/>
    </div>
  </div>
</template>

<script>
  import {
    setupMessageObserver
  } from '@/websocket/observers/messageObserver';
  import UserChatsComponent from './UserChatsComponent.vue';
  import ChatComponent from './ChatComponent.vue';
//import { fillTestData } from '@/services/testData';
  import {
    get_messages_by_chat_Request,
    get_users_by_chat_Request,
    send_message_to_chat_Request,
    add_user_to_chat_Request,
    create_message
  } from '@/services/wsRequests';
  import router from "@/router";

  const WS_URL = process.env.VUE_APP_WS_URL;

  export default {
    components: {
      UserChatsComponent,
      ChatComponent,
    },

    data() {
      return {
        user_name: '',
        this_user_id: null,
        chats: [],
        current_chat: [], //null,
        message_iterator: 0,
        isSidebarVisible: true
      };
    },

    async created() {
      let token = this.getCookie("token");
      if (token) {
        this.connection = new WebSocket(WS_URL + "?token=" + token);
        setupMessageObserver(this, this.connection);
      } else {
        // fillTestData(this);
        router.push('/login');
      }
    },

    methods: {
      select_user_chat(chat) {
        this.current_chat = chat;
        get_users_by_chat_Request(this.connection.send.bind(this.connection), this.current_chat.id);
        get_messages_by_chat_Request(this.connection.send.bind(this.connection), this.current_chat.id);
      },

      send_message(text) {
        if (text) {
          let message = create_message(this.current_chat, this.this_user_id, text);
          console.log('sending message:', message);

          if (!this.current_chat.is_not_connected) {
            send_message_to_chat_Request(this.connection.send.bind(this.connection), message);
            this.current_chat.messages.push(message);

          } else {

            if (!this.current_chat.waiting_connaction) {
              this.current_chat.waiting_messages = [];
              this.current_chat.waiting_connaction = true;
              add_user_to_chat_Request(this.connection.send.bind(this.connection), this.current_chat.id, this.this_user_id);
            }
            this.current_chat.messages.push(message);
            this.current_chat.waiting_messages.push(message);
          }
          this.$refs.сhat_сomponent.message_input = '';
        }
      },

      toggleSidebar() {
        this.isSidebarVisible = !this.isSidebarVisible;
      },

      getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
      }
    },
  };
</script>

<style scoped>
@import '@/assets/ChatComponent.css'; 
</style>
