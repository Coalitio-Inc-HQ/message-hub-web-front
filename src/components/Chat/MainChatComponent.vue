<template>
  <div class="chat-component full-height">
    <div class="wrapper">
      <Splitter style="min-height: 100%; min-width: 100%;" class="mb-8">
        <SplitterPanel v-if="!this.is_min_window  ||  this.is_min_window  &&  !this.current_chat" class="flex items-center justify-center" style="min-width: 15em;" :size="1">
          <div class="left-panel flex-list full-height ">
            <div class="left-panel-header-container flex-list-w">
              <Button variant="text" size="small" icon="pi pi-bars" @click="leftmenu_visible=true;"/>
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
          @set-last-viseble-message="setLastVisebleMessage"
          ref="сhat_сomponent"
          @send-message="send_message"
          @set-null-chat="set_null_chat"
          @scrolled-top="scrolled_top"
          @scrolled-down="scrolled_down"
          @chat-remove-to-archive="chat_remove_to_archive"
          />
        </SplitterPanel>
      </Splitter>
    </div>
  </div>

  <Drawer v-model:visible="leftmenu_visible" header="Drawer">
    <template #header>
      <div class="flex-list-w" style="align-items:  center;">
        <Avatar :label="this.user_name[0]" />
        <p class="chat-item-text">{{ this.user_name }}</p>
      </div>
    </template>
    <div class="flex-list left-drawer-container">
      <div class="flex-scale"/>
      <Button @click="this.deleteCookies(); this.setPage('/login');">Выйти</Button>
    </div>
  </Drawer>
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
    remove_to_archive_Request,
    set_last_read_message_id_Request,
  } from '@/services/wsRequests';
  import router from "@/router";

  import Button from 'primevue/button';
  
  import Drawer from 'primevue/drawer';

  import { deleteCookies,  } from '@/utilities/cookie';

  import Avatar from 'primevue/avatar';

  const WS_URL = process.env.VUE_APP_WS_URL;

  let setLastRedbleMessageTimeout = setTimeout(() => {}, 0);

  export default {
    components: {
      IconField,
      InputIcon,
      UserChatsComponent,
      ChatComponent,
      Splitter,
      SplitterPanel,
      Button,
      InputText,
      Drawer,
      Avatar,
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
        leftmenu_visible: false,
      };
    },

    async created() {
      let token = this.get_cookie("token");
      if (token) {

        let onClose = null;
        onClose=()=>{
          this.connection = new WebSocket(WS_URL + "?token=" + token);
          setupMessageObserver(this, this.connection, onClose, true);
        };
        this.connection = new WebSocket(WS_URL + "?token=" + token);
        setupMessageObserver(this, this.connection, onClose, false);
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
      deleteCookies,

      setLastVisebleMessage(chat, index){
        if(index){
          let lastMessageIndex = chat.messages.findIndex((item)=>{return item.id == chat.last_read_message_id;});
          if (lastMessageIndex>-1 && lastMessageIndex<index && chat.count_unredeble_messgaes!= null){
            chat.last_read_message_id = chat.messages[index].id;
            let newcount = chat.count_unredeble_messgaes - (index-lastMessageIndex);
            chat.count_unredeble_messgaes = newcount>-1?newcount:0;
            console.log(chat.count_unredeble_messgaes);

            clearTimeout(setLastRedbleMessageTimeout);
            if (chat.last_read_message_id >-1){
              setLastRedbleMessageTimeout = setTimeout(() => {
                set_last_read_message_id_Request(this, chat.id, chat.last_read_message_id);
              }, 500);
            }
          } else if(chat.last_read_message_id==null){
            if (chat.messages[index].id>-1){
              set_last_read_message_id_Request(this, chat.id, chat.messages[index].id);
            }
          }
        }
      },

      setPage(path){
        router.push(path);
      },

      chat_remove_to_archive(){
        this.current_chat.is_waiting_answer = false;
        this.current_chat.is_archive = true;
        this.current_chat.is_not_connected = true;
        remove_to_archive_Request(this, this.current_chat.id);
      },

      scrolled_top(chat){
        if (chat && chat.users && !chat.await_messages && !chat.scrolled_to_top){
          chat.await_messages = true;
          get_messages_by_chat_Request(this, chat, 50, chat.messages[0].id);
        }
      },

      scrolled_down(chat){
        if (chat && chat.users &&  !chat.scrolled_to_down && !chat.await_down_messages){
          chat.await_down_messages = true;
          chat.down_await_messages = [];
          get_messages_by_chat_Request(this, chat, 50, chat.messages[chat.messages.length-1].id, false, "down");
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
            get_users_by_chat_Request(this, this.current_chat.id);
            if (chat.last_read_message_id==-1 || chat.last_read_message_id ==null){
              if (! this.current_chat.await_messages){ // Загружаем с последнего собщения
                this.current_chat.await_messages = true;
                this.current_chat.await_down_messages = true;
                chat.down_await_messages = [];
                get_messages_by_chat_Request(this, this.current_chat);
              }
            }
            else{ // Загружаем с last_read_message_id
              if (! this.current_chat.await_messages){
                this.current_chat.await_messages = true;
                get_messages_by_chat_Request(this, this.current_chat, 50, chat.last_read_message_id, true,"up");
              }
              if (!this.current_chat.await_down_messages){
                chat.await_down_messages = true;
                chat.down_await_messages = [];
                get_messages_by_chat_Request(this, chat, 2147483647, chat.last_read_message_id, false, "down");
              }
            }
          }
        }
      },

      send_message(text, files) {
        if (files.length>0 || text){
          let local_current_chat = this.current_chat;

          let msg = this.convertFilesTextToUIMessage(local_current_chat, text, files);

          let send_msg = ()=>{
            let chekUpload = true;
            let f = (item)=>{
              if (!item.value.uploaded) chekUpload = false;
            }

            let f_v = (item)=>{
              if (!item.value.uploaded) chekUpload = false;
              if (!item.value.miniature.uploaded) chekUpload = false;
            }

            msg.attachments.images.forEach(f);
            msg.attachments.videos.forEach(f_v);
            msg.attachments.files.forEach(f);

            if (chekUpload && !msg.sended){
              if (msg.text || msg.attachments.images.length || msg.attachments.videos.length || msg.attachments.files.length){
                msg.sended = true;

                let message = create_message(msg);
                console.log('sending message:', message);

                if (!local_current_chat.is_not_connected) {
                  send_message_to_chat_Request(this, message);
                } else {
                  if (!local_current_chat.waiting_connaction) {
                    local_current_chat.waiting_messages = [];
                    local_current_chat.waiting_connaction = true;
                    add_user_to_chat_Request(this, local_current_chat.id, this.this_user_id);
                  }
                  local_current_chat.waiting_messages.push(message);
                }
              } else{
                // Удаление сообщения
                let message_index = local_current_chat.messages.findIndex((item)=>{return item.front_message_id == msg.front_message_id});
                if (message_index>-1){
                  local_current_chat.messages.splice(message_index,1);
                }
              }
            }
          }

          files.forEach(element => {
            element.value.delete_call = ()=>{
              if (!msg.sended){
                let file_index = msg.attachments.images.findIndex((item)=> item == element);
                if (file_index!=-1){
                  msg.attachments.images.splice(file_index,1);
                } else {
                  file_index = msg.attachments.videos.findIndex((item)=> item == element);
                  if (file_index!=-1){
                    msg.attachments.videos.splice(file_index,1);
                  } else{
                    file_index = msg.attachments.files.findIndex((item)=> item == element);
                    if (file_index!=-1){
                      msg.attachments.files.splice(file_index,1);
                    }
                  }
                }
                send_msg();
              }
            };

            element.value.err_download_call_back = (e)=>{
              alert( `Произошла ошибка загрузки файла ${element.value.name}, он будет удалён.`);
              console.log("Произошла ошибка загрузки файла.",e);
              element.value.delete_call();
            };

            if (element.value.type == "video"){
                element.value.miniature_err_download_call_back = (e)=>{
                alert( `Произошла ошибка загрузки файла ${element.value.name}, он будет удалён.`);
                console.log("Произошла ошибка загрузки файла.",e);
                element.value.delete_call();
              };
            }

            let last_download_call_back =  element.value.download_call_back;

            element.value.download_call_back = (response)=>{
              last_download_call_back(response);
              send_msg();
            };

            let last_miniature_download_call_back =  element.value.miniature_download_call_back;

            element.value.miniature_download_call_back = (response)=>{
              last_miniature_download_call_back(response);
              send_msg();
            };
          });

          send_msg();

          this.current_chat.messages.push(msg);
          this.$refs.сhat_сomponent.message_input = ''; 
          this.$refs.сhat_сomponent.selected_files = [];
        }
      },

      convertFilesTextToUIMessage(chat, text, files){
        if(chat.message_iterator){
          chat.message_iterator=chat.message_iterator+=1;
        }else{
          chat.message_iterator=10;
        }

        let attachments = {
          use_ref: true,
          images: [],
          videos: [],
          files: [],
        }

        files.forEach(element => {
          if (element.value.type.startsWith("image")){
            attachments.images.push(element);
          } else if (element.value.type.startsWith("video")){
            attachments.videos.push(element);
          } else {
            attachments.files.push(element);
          }
        });

        return {
          id: -chat.message_iterator,
          chat_id: chat.id,
          sender_id: this.this_user_id,
          sended_at: new Date(),
          text: text,
          front_message_id: chat.message_iterator,
          attachments: attachments,
          is_temp_messge: true,
          sended: false,
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
