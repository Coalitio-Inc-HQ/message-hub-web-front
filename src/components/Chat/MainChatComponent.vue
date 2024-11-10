<template>
  <div class="chat-component full-height">
    <div class="wrapper">
      <Splitter style="min-height: 100%; min-width: 100%;" class="mb-8">
        <SplitterPanel class="flex items-center justify-center" style="min-width: 15em;" :size="1">
          <div class="left-panel flex-list full-height ">
            <div class="left-panel-header-container flex-list-w">
              <Button variant="text" size="small" icon="pi pi-bars" />
              <!-- <InputText type="text" v-model="value" style="flex-grow: 1;"/> -->
              <IconField class="flex-scale search-field-box">
                  <InputIcon class="pi pi-search" />
                  <InputText class="search-field " v-model="value1" placeholder="Поиск" />
              </IconField>

            </div>
            <UserChatsComponent
              :chats="chats" 
              :current_chat="current_chat" 
              @select-user-chat="select_chat"/>
          </div>
        </SplitterPanel>
        <SplitterPanel class="flex items-center justify-center" size="99">
          <ChatComponent 
          :this_user_id="this_user_id" 
          :user_name="user_name" 
          :current_chat="current_chat" 
          ref="сhat_сomponent"
          @send-message="send_message"/>
          
        </SplitterPanel>
      </Splitter>
    </div>
  </div>
</template>

<script>
  import InputText from 'primevue/inputtext';

  import IconField from 'primevue/iconfield';
  import InputIcon from 'primevue/inputicon';

  import Splitter from 'primevue/splitter';
  import SplitterPanel from 'primevue/splitterpanel';
  import { setupMessageObserver } from '@/websocket/observers/messageObserver';
  import UserChatsComponent from './UserChatsComponent.vue';
  import ChatComponent from './ChatComponent.vue';
  import {
    get_messages_by_chat_Request,
    get_users_by_chat_Request,
    send_message_to_chat_Request,
    add_user_to_chat_Request,
    create_message,
  } from '@/services/wsRequests';
  import router from "@/router";

  import Button from 'primevue/button';

  const WS_URL = process.env.VUE_APP_WS_URL;

  export default {
    components: {
      IconField,
      InputIcon,
      UserChatsComponent,
      ChatComponent,
      Splitter,
      SplitterPanel,
      Button,
      InputText
    },

    data() {
      return {
        user_name: '',
        this_user_id: null,
        chats: [],
        current_chat: [],
        message_iterator: 0,
        isSidebarVisible: true
      };
    },

    async created() {
      let token = this.get_cookie("token");
      if (token) {
        this.connection = new WebSocket(WS_URL + "?token=" + token);
        setupMessageObserver(this, this.connection);
      } else {
        router.push('/login');
      }
    },

    methods: {
      select_chat(chat) {
        console.log('Мы находимся в select_chat с chatId:', chat.id);

        if (this.current_chat && this.current_chat.id === chat.id) {
          console.log("Вы уже находитесь в этом чате"); 
        } else {
          console.log(`Сообщения для чата ${chat.id} отсутствуют, отправка запроса...`);
          this.current_chat = []; 

          this.current_chat = chat;
          get_users_by_chat_Request(this.connection.send.bind(this.connection), this.current_chat.id);
          get_messages_by_chat_Request(this.connection.send.bind(this.connection), this.current_chat.id);
        }
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

      get_cookie(name) {
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
@import 'primeicons/primeicons.css';
@import '@/assets/Layout.css';
</style>
