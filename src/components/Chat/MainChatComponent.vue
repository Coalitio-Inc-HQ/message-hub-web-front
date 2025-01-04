<template>
  <div class="chat-component full-height">
    <div class="wrapper">
      <Splitter style="min-height: 100%; min-width: 100%;" class="mb-8">
        <SplitterPanel v-if="!this.is_min_window  ||  this.is_min_window  &&  !this.current_chat" class="flex items-center justify-center" style="min-width: 15em;" :size="1">
          <div class="left-panel flex-list full-height ">
            <div class="left-panel-header-container flex-list-w">
              <Button variant="text" size="small" icon="pi pi-bars" />
              <!-- <InputText type="text" v-model="value" style="flex-grow: 1;"/> -->
              <IconField class="flex-scale search-field-box">
                  <InputIcon class="pi pi-search" />
                  <InputText class="search-field " v-model="search_name" placeholder="Поиск" />
              </IconField>

            </div>
            <UserChatsComponent
              :chats="chats" 
              :current_chat="current_chat" 
              :search_name="search_name"
              @select-user-chat="select_chat"/>
          </div>
        </SplitterPanel>
        <SplitterPanel v-if="!this.is_min_window  ||  this.is_min_window  &&  this.current_chat" class="flex items-center justify-center" size="99">
          <ChatComponent 
          :this_user_id="this_user_id" 
          :user_name="user_name" 
          :current_chat="current_chat" 
          :is_min_window="is_min_window"
          ref="сhat_сomponent"
          @send-message="send_message"
          @set-null-chat="set_null_chat"
          @scrolled-top="scrolled_top"
          @chat-remove-to-archive="chat_remove_to_archive"
          />
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
  import UserChatsComponent from './UserChatsComponent.vue';
  import ChatComponent from './ChatComponent.vue';
  import {
    get_messages_by_chat_Request,
    get_users_by_chat_Request,
    send_message_to_chat_Request,
    add_user_to_chat_Request,
    create_message,
    remove_to_archive_Request,
  } from '@/services/wsRequests';
  import router from "@/router";

  import Button from 'primevue/button';

  import {connect} from '@/services/messageHubService/websoket.js'

  const WS_URL = process.env.VUE_APP_WS_URL;
  import { setupMessageObserver } from '@/websocket/observers/messageObserver';

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
        search_name: '',
        user_name: '',
        this_user_id: null,
        chats: [],
        current_chat: null,
        message_iterator: 0,
        isSidebarVisible: true,
        is_min_window: window.innerWidth <= 768? true : false,
      };
    },

    async created() {
      let token = this.get_cookie("token");
      if (token) {
        this.connection = new WebSocket(WS_URL + "?token=" + token);
        setupMessageObserver(this, this.connection);
        connect(token);
      } else {
        router.push('/login');
      }
    },

    mounted(){
      window.addEventListener("resize", this.resize_window);
    },
    unmounted() {
      window.removeEventListener("resize", this.resize_window);
    },

    methods: {
      chat_remove_to_archive(){
        this.current_chat.is_waiting_answer = false;
        this.current_chat.is_archive = true;
        this.current_chat.is_not_connected = true;
        remove_to_archive_Request(this.connection.send.bind(this.connection), this.current_chat.id);
      },

      scrolled_top(){
        if (this.current_chat.users){
          get_messages_by_chat_Request(this.connection.send.bind(this.connection), this.current_chat, 50, this.current_chat.messages[0].id);
        }
      },

      set_null_chat(){
        this.current_chat = null;
      },

      resize_window(){
        this.is_min_window = window.innerWidth <= 768? true : false;
      },
      select_chat(chat) {
        console.log('Мы находимся в select_chat с chatId:', chat.id);

        if (this.current_chat && this.current_chat.id === chat.id) {
          console.log("Вы уже находитесь в этом чате"); 
        } else {
          console.log(`Сообщения для чата ${chat.id} отсутствуют, отправка запроса...`);
          // this.current_chat = []; 

          this.current_chat = chat;
          if (!chat.users){
            get_users_by_chat_Request(this.connection.send.bind(this.connection), this.current_chat.id);
            get_messages_by_chat_Request(this.connection.send.bind(this.connection), this.current_chat);
          }
        }
      },

      send_message(text, files) {
        if (files.length>0 || text){
          let upload_ok = true;
          files.forEach(element => {
            if (!element.value.uploaded){
              upload_ok = false;
            }
          });

          if (!text){
            text = "";
          }

          if (upload_ok){
            let message = create_message(this.current_chat, this.this_user_id, text, files);
            console.log('sending message:', message);

            if (!this.current_chat.is_not_connected) {
              send_message_to_chat_Request(this.connection.send.bind(this.connection), message);
            } else {
              if (!this.current_chat.waiting_connaction) {
                this.current_chat.waiting_messages = [];
                this.current_chat.waiting_connaction = true;
                add_user_to_chat_Request(this.connection.send.bind(this.connection), this.current_chat.id, this.this_user_id);
              }
              this.current_chat.waiting_messages.push(message);
            }

            this.current_chat.messages.push(message);
          }


          else{
            let files_copy = files.slice();

            let temp_message = this.create_temp_message(this.current_chat, this.this_user_id, text, files_copy);

            let sendet = false;

            let download_call_back = () =>{
              //  проверить на отправленность сообщения
              if (!sendet){
                let upload_ok = true;
                files_copy.forEach(element => {
                  if (!element.value.uploaded){
                    upload_ok = false;
                  }
                });
                if (upload_ok){
                  let message = create_message(this.current_chat, this.this_user_id, text, files_copy, temp_message.front_message_id);
                  console.log('sending message:', message);

                  if (!this.current_chat.is_not_connected) {
                    send_message_to_chat_Request(this.connection.send.bind(this.connection), message);
                  } else {
                    if (!this.current_chat.waiting_connaction) {
                      this.current_chat.waiting_messages = [];
                      this.current_chat.waiting_connaction = true;
                      add_user_to_chat_Request(this.connection.send.bind(this.connection), this.current_chat.id, this.this_user_id);
                    }
                    this.current_chat.waiting_messages.push(message);
                  }
                  sendet = true;
                }
              }
            };

            files_copy.forEach(element => {
              element.value.download_call_back = download_call_back;
              element.value.err_download_call_back = ()=>{
                alert( `Произошла ошибка загрузки файла ${element.value.file.name}, он будет удалён.`);
                element.value.delete();
              };
              element.value.delete = () =>{
                if (!sendet){
                  files_copy.splice(files_copy.indexOf(element),1);
                  element.value.download_call_back;
                } else{
                  alert( `Файл ${element.value.file.name} неможет быть удалён так как сообщение уже отправленно.`);
                }
              };
            });

            this.current_chat.messages.push(temp_message);
          }

          this.$refs.сhat_сomponent.message_input = ''; 
          this.$refs.сhat_сomponent.selected_files = [];
        }
      },

      create_temp_message(chat, user_id, text, files){
        if(chat.message_iterator){
          chat.message_iterator=chat.message_iterator+=1;
        }else{
          chat.message_iterator=1;
        }

        let attachments = {
          images: [],
          videos: [],
          files: [],
        }

        files.forEach(element => {
          if (element.value.file.type.startsWith('image/')){
            attachments.images.push(element);
          } else if (element.value.file.type.startsWith('video/')){
            attachments.videos.push(element);
          } else {
            attachments.files.push(element);
          }
        });

        return {
          id: -1,
          chat_id: chat.id,
          sender_id: user_id,
          sended_at: new Date().toISOString(),
          text: text,
          front_message_id: chat.message_iterator,
          attachments: attachments,
          is_temp_messge: true,
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
