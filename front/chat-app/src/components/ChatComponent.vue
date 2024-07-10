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
          <h2>Ожидающие</h2>
          <ul class="chat-list waiting-chats">
            <li v-for="chat in waitingChats" :key="chat.chatId" :data-chat-id="chat.chatId" :class="{ 'chat-item': true, 'active': chat.chatId === currentChatId }" @click="selectChat(chat.chatId)">
              {{ chat.name }}
            </li>
          </ul>
          <h2>Прочитанные</h2>
          <ul class="chat-list read-chats">
            <li v-for="chat in readChats" :key="chat.chatId" :data-chat-id="chat.chatId" :class="{ 'chat-item': true, 'active': chat.chatId === currentChatId }" @click="selectChat(chat.chatId)">
              {{ chat.name }}
            </li>
          </ul>
        </div>
      </div>

      <div :class="['main', { 'main-expanded': !isSidebarVisible }]">
        <div :class="['name-display', { 'name-shifted': !isSidebarVisible }]" id="name">Вы: {{ username }}</div>
        <ul class="chat">
          <li v-for="message in currentChatMessages" :key="'message-' + message.messageId" :class="{ 'message': true, 'self': message.sender_id === thisUserId, 'other': message.sender_id !== thisUserId }">
            <div class="message-content">
              <div class="name">{{ message.name }}</div>
              <div class="body">{{ message.body }}</div>
              <div class="timestamp">{{ message.sended_at }}</div>
            </div>
          </li>
        </ul>
        <form class="form" @submit.prevent="sendMessage">
          <textarea v-model="messageInput" id="msg" placeholder="Введите сообщение..."></textarea>
          <button type="submit" class="send" :disabled="isSubmitting || !currentChatId">Отправить</button>
        </form>
      </div>
    </div>
  </div>
</template>




<script>
import { useWebSocket } from '@vueuse/core';

import { 
  get_chats_by_user_Request,
  get_waiting_chats_Request,
  get_messages_by_chat_Request,
  send_message_to_chat
 
} from '@/services/wsRequests'; 



import {
  setupMessageObserver
} from '@/observers/messageObserver';

import {
  
  convertToUTCFormatted
} from '@/services/dateUtils'

export default {
  data() {
    return {
      username: '',
      thisUserId: 1, // ID веба текущего пользователя
      waitingChats: [],
      readChats: [],
      currentChatId: null,
      messages: {},
      messageInput: '',
      currentChatMessages: [],
      isSubmitting: false,
      isSidebarVisible: true // Добавили переменную состояния

    };
  },

  setup() {
    const { status, data, send, open, close } = useWebSocket('ws://localhost:8000/ws_listener'); 
    return { status, data, send, open, close};
  },

  name: 'ChatComponent',
  async created() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      this.$router.push('/login');
    }
    this.username = prompt('Как вас зовут?');

    try {
      console.log('WebSocket connection opened. Все ок');
       
      get_chats_by_user_Request(this.send, this.thisUserId);
      get_waiting_chats_Request(this.send);

    } catch (error) {
      console.error('Что-то не так, по любому бэк косякнул: ', error);
    }

    // // Слушаем сообщения от сервера
    // this.$watch('data', (newData) => {
    //   if (newData) {
    //     const message = JSON.parse(newData);
    //     console.log('Получено какое-то сообщение:', message); 
    //     switch(message.name) {
          
    //     //Old requests
    //     case 'get_waiting_chats':{
    //       handleGetWaitingChats(this,message);
    //       break;
    //     }

    //     //Old requests
    //     case 'get_chats_by_user':{
    //       handleGetChatsByUser(this, message);
    //       break;      
    //     }

    //     //Old requests  
    //     case 'get_messages_by_chat':{
    //       handleGetMessagesByChat(this, message);
    //       break;
    //     }

    //     //Old send
    //     case 'send_message_to_chat':{
    //       console.log('Сообщение отправлено:', message);
    //       break;
    //     }

    //     //new requests
    //     case 'new_waiting_chats': {
    //       handleNewWaitingChats(this, message);
    //       break;
    //     }

    //     //new requests
    //     case 'new_message': {
    //       //trigger_front_new_message_in_chat_Listen(message);
    //       handleNewMessage(this, message);
    //       break;
    //     }

    //     //new
    //     case 'new_user_in_chat': {
    //       //trigger_front_new_user_in_chat_Listen(message);
    //       console.log('new_user_in_chat');
    //       console.log('------------------------------------------------------');
    //       console.log('Получили данные по new_user_in_chat:', message.body);
    //       console.log('В разработке');
    //       console.log('------------------------------------------------------');
    //       break;
    //     }
        
    //     case 'status': {
    //       console.log('status:',message.body);
    //       break;
    //     }
        
    //     default: {
    //       console.log('Необработанный тип сообщения:', message.name);
    //       break;
    //     }

    //     }
    //   }
    //   });
    
    setupMessageObserver(this);

  },

  methods: {
    
   
    convertToUTCFormatted,

    toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    },


    getLastMessageId(chatId) {
      if (this.messages[chatId] && this.messages[chatId].length > 0) {
        // Происк максимального messageId
        return Math.max(...this.messages[chatId].map(message => message.messageId));
      }
      return 0; // Если сообщений нет, возвращаем 0
    },


    async sendMessage() {
    // Проверка условий для отправки сообщения
    if (this.messageInput.trim() !== "" && this.currentChatId !== null && !this.isSubmitting) {
      this.isSubmitting = true;

      // Получение последнего messageId и его инкрементация
      let lastMessageId = this.getLastMessageId(this.currentChatId);
        if (lastMessageId === 0) {
          // Если сообщений нет, присваиваем messageId значение 1
          lastMessageId = 1;
        } else {
          lastMessageId++;
        }
      // Создание нового сообщения 
      const message = { 
        id: this.currentChatId, 
        messageId: lastMessageId, 
        name: this.username, 
        body: this.messageInput, 
        sender_id: this.thisUserId, 
        sended_at:  (new Date().toISOString())

      };

      console.log('Сообщение:', message);
      console.log('Дата отправки (форматированная):', convertToUTCFormatted(message.sended_at));

      // Проверка существования массива сообщений для текущего чата и добавление нового сообщения
      if (!this.messages[this.currentChatId]) {
        this.messages[this.currentChatId] = [];
      }
      this.messages[this.currentChatId].push(message);

      // Логирование обновленного массива сообщений
      console.log('Обновленный messages:', this.messages);

      // Очистка поля ввода сообщения и обновление состояния чата
      this.messageInput = '';
      this.moveChatToRead(this.currentChatId);
      this.isSubmitting = false;
      
      // Обновление текущих сообщений чата
      this.currentChatMessages=[];
      this.currentChatMessages = this.messages[this.currentChatId];
      this.currentChatMessages = this.currentChatMessages.map(msg => ({
      ...msg,
      sended_at: convertToUTCFormatted(msg.sended_at)
      }));
            
      // Отправляем сообщение на сервер, используя функцию send_message_to_chat
      send_message_to_chat(
            this.send, 
            this.thisUserId, 
            this.currentChatId, 
              {
              id: message.messageId,
              chat_id: this.currentChatId,
              sender_id: this.thisUserId,
              sended_at: message.sended_at,
              text: message.body,
              }
      );
    
    }
    },


    selectChat(chatId) {
      console.log('------------------------------------------------------');
      console.log('Мы находимся в selectChat с chatId:', chatId);

      if (chatId !== this.currentChatId) {
        this.currentChatId = chatId;
        console.log(`Текущий чат обновлен: ${this.currentChatId}`);

        if (this.messages[chatId]) {
          // Если сообщения для чата уже есть, просто присваиваем их
          this.currentChatMessages = [];
          this.currentChatMessages = this.messages[chatId];
          this.currentChatMessages = this.currentChatMessages.map(msg => ({
            ...msg,
            sended_at: convertToUTCFormatted(msg.sended_at)
          }));
          console.log(`Сообщения для чата ${chatId} уже загружены`);

        } else {
          console.log(`Сообщения для чата ${chatId} отсутствуют, отправка запроса`);
          // Если сообщений для чата нет, запрашиваем их
          this.currentChatMessages = [];
          get_messages_by_chat_Request(this.send, chatId);
        }
      }
      console.log('------------------------------------------------------');
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


