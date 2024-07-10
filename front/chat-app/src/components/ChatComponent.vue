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

import {
  setupMessageObserver
} from '@/websocket/observers/messageObserver';

import { convertToUTCFormatted } from '@/services/dateUtils';

import { 
         get_messages_by_chat_Request,
         new_user_in_chat_Request

       } from "@/services/wsRequests.js";


export default {
  data() {
    return {
      username: '',
      thisUserId: null, // ID веба текущего пользователя
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


  async created() {
    this.connection = new WebSocket('ws://localhost:8000/ws_listener');



    setupMessageObserver(this, this.connection);
  },

  methods: {
    
   
   convertToUTCFormatted,

    toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    },


  //   getLastMessageId(chatId) {
  //     if (this.messages[chatId] && this.messages[chatId].length > 0) {
  //       // Происк максимального messageId
  //       return Math.max(...this.messages[chatId].map(message => message.messageId));
  //     }
  //     return 0; // Если сообщений нет, возвращаем 0
  //   },


  //   async sendMessage() {
  //   // Проверка условий для отправки сообщения
  //   if (this.messageInput.trim() !== "" && this.currentChatId !== null && !this.isSubmitting) {
  //     this.isSubmitting = true;

  //     // Получение последнего messageId и его инкрементация
  //     let lastMessageId = this.getLastMessageId(this.currentChatId);
  //       if (lastMessageId === 0) {
  //         // Если сообщений нет, присваиваем messageId значение 1
  //         lastMessageId = 1;
  //       } else {
  //         lastMessageId++;
  //       }
  //     // Создание нового сообщения 
  //     const message = { 
  //       id: this.currentChatId, 
  //       messageId: lastMessageId, 
  //       name: this.username, 
  //       body: this.messageInput, 
  //       sender_id: this.thisUserId, 
  //       sended_at:  (new Date().toISOString())

  //     };

  //     console.log('Сообщение:', message);
  //     console.log('Дата отправки (форматированная):', convertToUTCFormatted(message.sended_at));

  //     // Проверка существования массива сообщений для текущего чата и добавление нового сообщения
  //     if (!this.messages[this.currentChatId]) {
  //       this.messages[this.currentChatId] = [];
  //     }
  //     this.messages[this.currentChatId].push(message);

  //     // Логирование обновленного массива сообщений
  //     console.log('Обновленный messages:', this.messages);

  //     // Очистка поля ввода сообщения и обновление состояния чата
  //     this.messageInput = '';
  //     this.moveChatToRead(this.currentChatId);
  //     this.isSubmitting = false;
      
  //     // Обновление текущих сообщений чата
  //     this.currentChatMessages=[];
  //     this.currentChatMessages = this.messages[this.currentChatId];
  //     this.currentChatMessages = this.currentChatMessages.map(msg => ({
  //     ...msg,
  //     sended_at: convertToUTCFormatted(msg.sended_at)
  //     }));
            
  //     // Отправляем сообщение на сервер, используя функцию send_message_to_chat
  //     send_message_to_chat(
  //           this.send, 
  //           this.thisUserId, 
  //           this.currentChatId, 
  //             {
  //             id: message.messageId,
  //             chat_id: this.currentChatId,
  //             sender_id: this.thisUserId,
  //             sended_at: message.sended_at,
  //             text: message.body,
  //             }
  //     );
    
  //   }
  //   },


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
          this.loadChatMessages(chatId);
        }
      }
    },
    async loadChatMessages(chatId) {
    try {
      if (this.connection && this.connection.send) {
          
          new_user_in_chat_Request(this.connection.send.bind(this.connection), this.thisUserId,chatId);
          get_messages_by_chat_Request(this.connection.send.bind(this.connection), chatId);
        
        } 
      else {
          console.error('Соединение с WebSocket недоступно');
        }    
      }
    catch (error) {
      console.error(`Ошибка при загрузке сообщений для чата ${chatId}:`, error);
    }
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


