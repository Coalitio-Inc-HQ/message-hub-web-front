
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
          <WaitingСhatsComponent :waitng_chats="waiting_chats"  :current_chat_id="current_chat_id" @select-waitng-chat="select_waitng_chat"/>
          <UserChatsComponent :user_chats="user_chats" :current_chat_id="current_chat_id" @select-user-chat="select_user_chat"/>
        </div>
      </div>
      <ChatComponent :this_user_id="this_user_id" :user_name="user_name" :current_chat_id="current_chat_id" :current_chat_messages="current_chat_messages" :current_chat_users="current_chat_users" @send-message="send_message"/>
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
        ///////////////////////////////////////////////////////////////////////////////////////
        message_input: '', //?
        isSubmitting: false,//?
        isSidebarVisible: true // Добавили переменную состояния
      };
    },

    async created() {
      this.connection = new WebSocket('ws://localhost:8000/ws_listener');

      setupMessageObserver(this, this.connection);
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

      send_message(text){
        if(text){
          let message = create_message(this,this.this_user_id, this.current_chat_id,text,this.message_iterator);
          if (!this.current_chat_is_waiting){
            send_message_to_chat_Request(this.connection.send.bind(this.connection),message);
            this.current_chat_messages.push(message);
          }
          else {
            if (!this.current_chat_waiting_connaction){
              this.current_chat_waiting_connaction=true;
              connect_to_waiting_chat_Request(this.connection.send.bind(this.connection), this.current_chat_id);
              let chat;
              let ind;
              for (let index = 0; index < this.waiting_chats.length; index++) {
                if (this.waiting_chats[index].id==this.current_chat_id){
                  chat= this.waiting_chats[index];
                  ind = index;
                  break;
                }
              }
              if (chat){
                this.waiting_chats.splice(ind, 1);
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

      moveChatToWaiting(chatId) {
        const index = this.readChats.findIndex(chat => chat.chatId === chatId);
        if (index !== -1) {
          const chat = this.readChats.splice(index, 1)[0];
          this.waitingChats.push(chat);
        }
      },

      moveChatToRead(chatId) {
        const index = this.waitingChats.findIndex(chat => chat.chatId === chatId);
        if (index !== -1) {
          const chat = this.waitingChats.splice(index, 1)[0];
          this.readChats.push(chat);
        }
      }
    },
  };
</script>


<style scoped>
@import '@/assets/ChatComponent.css'; 
</style>


