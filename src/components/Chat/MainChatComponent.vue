<template>
  <div class="chat-component full-height">
    <div class="wrapper">
      <Splitter style="min-height: 100%; min-width: 100%;" class="mb-8">
        <SplitterPanel v-if="!this.SizeServiceStore.minWindow  ||  this.SizeServiceStore.minWindow  &&  !this.chats.curentChat" style="min-width: 15em;" :size="1">
          <div class="left-panel flex-list full-height ">
            <div class="left-panel-header-container flex-list-w">
              <Button v-if="this.SizeServiceStore.minWindow" variant="text" size="small" icon="pi pi-arrow-left" @click="this.$router.push('/ui/menu');" ref="open_menu_button"/>
              <!-- <InputText type="text" v-model="value" style="flex-grow: 1;"/> -->
              <IconField class="flex-scale search-field-box">
                  <InputIcon class="pi pi-search" />
                  <InputText class="search-field " v-model="search_name" placeholder="Поиск" />
              </IconField>

            </div>
            <UserChatsComponent
              :chats="chats" 
              :search_name="search_name"
              :platforms="platforms"
              @select-user-chat="select_chat"/>
          </div>
        </SplitterPanel>
        <SplitterPanel v-if="!this.SizeServiceStore.minWindow  ||  this.SizeServiceStore.minWindow  &&  this.chats.curentChat" size="99">
          <ChatComponent 
          :user="AuthServiceStore.userInfo"
          :current_chat="chats.curentChat" 
          :is_min_window="this.SizeServiceStore.minWindow"
          @set-last-viseble-message="setLastVisebleMessage"
          ref="сhat_сomponent"
          @send-message="send_message"
          @set-null-chat="set_null_chat"
          @scrolled-top="scrolled_top"
          @scrolled-down="scrolled_down"
          @chat-remove-to-archive="chat_remove_to_archive"
          @delete-message="deleteMessage"
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
  import router from "@/router";

  import Button from 'primevue/button';
  
  import Drawer from 'primevue/drawer';

  import Avatar from 'primevue/avatar';

  const WS_URL = import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws') + import.meta.env.VITE_WS_LISTMER_URL;

  let setLastRedbleMessageTimeout = setTimeout(() => {}, 0);

  import { MessageHubService, MessageHubServiceEventRouterByAttribute } from '@/services/messageHubService/messageHubService';
  // import { refreshUser, setIsCompletedTutorialUser } from '@/services/messageHubService/userMessageHubService';
  import { refreshPlatforms } from '@/services/messageHubService/platformMessageHubService';
  import { refreshChats, create_message, getUsersByChatRequest, addUserToChatRequest, sendMessageToChat, getMessagesByChat ,handleNewUserInChat, removeChatToArchive, setLastReadMessageIdInChatTimeout, handleNewMessage, handleChatUpdate, handleEventSetLastReadMessageId, deleteMessageInChat, handleEventDeleteMessage,} from '@/services/messageHubService/chatMessageHubService';
  
  import { addTutorialStep, setTutorialStep, updateTutorialStepTargetFunc, addCloseTuturialEventHandlers, addEndTuturialEventHandlers } from '@/tutorial/tutorialPlugin';
  import tutorialWelcomeComponent from '../tutorial/tutorialWelcomeComponent.vue';
  import tutorialTextComponent from '../tutorial/tutorialTextComponent.vue';
  import {useTemplateRef} from 'vue';

  addTutorialStep("start",
    {
      type: "dialog",

      slot: tutorialWelcomeComponent,
      props:{
      },

      next_step: "close-tutorial-info",
      next_step_events: new Set(["next-button"]),

      back_step: null,
      back_step_events: new Set([]),
    }
  );
  addTutorialStep("close-tutorial-info",
    {
      type: "dialog",

      slot: tutorialTextComponent,
      props:{
        text: "\tДанное руководство пользователя можно пропустить в любой моент нажав кнопку X в правлм верхнем углу руководства пользователя.",
        button: true,
      },

      next_step: "awaiting-chats-info",
      next_step_events: new Set(["next-button"]),

      back_step: null,
      back_step_events: new Set([]),
    }
  );

  addTutorialStep("left-menu-info",
    {
      type: "popover",
      watch_ms_to_call_get_target_func:0,
      get_target_func: null,

      slot: tutorialTextComponent,
      props:{
        text: "\tДанная кнопка открывает основное приложения меню.",
        button: false,
      },

      reload_events: new Set(["select-chat", "unselect-chat"]),

      next_step: "logout-button",
      next_step_events: new Set(["open-left-menu"]),

      back_step: null,
      back_step_events: new Set([]),
    }
  );
  addTutorialStep("logout-button",
    {
      type: "popover",
      watch_ms_to_call_get_target_func:500,
      get_target_func: null,

      slot: tutorialTextComponent,
      props:{
        text: "\tДанная кнопка позволяет выйти из аккаунта.",
        button: true,
      },

      next_step: "end-tutorial",
      next_step_events: new Set(["next-button"]),

      back_step: "left-menu-info",
      back_step_events: new Set(["close-left-menu"]),
    }
  );

  addTutorialStep("end-tutorial",
    {
      type: "dialog",

      slot: tutorialTextComponent,
      props:{
        text: "\tРуководство пользователя завершено.",
        button: true,
      },

      next_step: null,
      next_step_events: new Set(["next-button"]),

      back_step:null,
      back_step_events: new Set([]),
    }
  );

  import Skeleton from 'primevue/skeleton';

  import { useAuthService } from '@/services/authService';
  import { useSizeService } from '@/services/sizeService';
  import { mapStores } from 'pinia'


  let MHS = null;

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
      Skeleton,
    },
    setup(){
      const open_menu_button = useTemplateRef('open_menu_button');
      updateTutorialStepTargetFunc("left-menu-info", ()=>{
        return open_menu_button;
      });

      const logout_button = useTemplateRef('logout_button');
      updateTutorialStepTargetFunc("logout-button", ()=>{
        return logout_button;
      });

      const AuthService = useAuthService();

      const set_is_complite_tutorial = ()=>{
        AuthService.set_settings("is_completed_tutorial", true);
      }

      addCloseTuturialEventHandlers(set_is_complite_tutorial);
      addEndTuturialEventHandlers(set_is_complite_tutorial);

      const MHSRouter = new MessageHubServiceEventRouterByAttribute('name');
      MHS = new MessageHubService(MHSRouter, ()=>{return AuthService.token;}, ()=>{console.log('Попытка перефтентификации');}, 1);
      MHS.changeAuthPermissionsEventHandlers.push((permisions)=>{
        AuthService.permissions = permisions;
      })
      MHS.failAuthEventHandlers.push(()=>{
        router.push('/login');
      });
      MHS.failSincEventHandlers.push(()=>{
        router.push('/ui/chat');
        // В посделствии сброс стореджа
      });
    },

    computed:{
      ...mapStores(useAuthService, useSizeService)
    },

    data() {
      return {
        // user:{
        //   loaded: false,
        //   name: null,
        //   id: null,
        //   is_completed_tutorial: null,
        // },

        platforms:{
          loaded: false,
          platforms:{},
        },

        chats: {
          loaded: false,
          chatsWhenLoaded: [],
          chats:[],
          curentChat:null,
        },

        search_name: '',
        message_iterator: 0,
        isSidebarVisible: true,
        // is_min_window: window.innerWidth <= 768? true : false,
        leftmenu_visible: false,
      };
    },

    async created() {
      MHS.eventRouter.addRoute("chat.add.user", handleNewUserInChat.bind(this));
      MHS.eventRouter.addRoute("chat.new_message", handleNewMessage.bind(this));
      MHS.eventRouter.addRoute("chat.update", handleChatUpdate.bind(this));
      MHS.eventRouter.addRoute("chat.set.last_read_message_id", handleEventSetLastReadMessageId.bind(this));
      MHS.eventRouter.addRoute("chat.delete_message", handleEventDeleteMessage.bind(this));

      MHS.connect(WS_URL);
      // refreshUser(this, MHS);
      refreshPlatforms(this, MHS);
      refreshChats(this, MHS);
    },

    watch:{
      'leftmenu_visible':{
        handler(newValue) {
            if (newValue){
              this.$tutorial.emit_event("open-left-menu");
            }
            else{
              this.$tutorial.emit_event("close-left-menu");
            }
          },
          deep: false,
          immediate: true
      },
      'user':{
        handler(newValue) {
            if (newValue && newValue.loaded && !newValue.is_completed_tutorial){
              setTutorialStep("start");
            }
          },
          deep: true,
          immediate: true
      }
    },

    // mounted(){
    //   window.addEventListener("resize", this.resize_window);
    // },
    // unmounted() {
    //   window.removeEventListener("resize", this.resize_window);
    // },

    methods: {

      deleteMessage(msg){
        let chatIndex = this.chats.chats.findIndex((item)=>{return item.id == msg.chat_id;});
        if (chatIndex>-1){
          let lastMessageIndex = this.chats.chats[chatIndex].messages.findIndex((item)=>{return item.id == msg.id;});
          if (lastMessageIndex>-1){
            if (msg.id>0){
              this.chats.chats[chatIndex].messages[lastMessageIndex].is_hide = true;
              deleteMessageInChat(this,MHS, msg.id);
            }
          }
        }
      },

      setLastVisebleMessage(chat, index){
        if(index){
          let lastMessageIndex = chat.messages.findIndex((item)=>{return item.id == chat.last_read_message_id;});
          if (lastMessageIndex>-1 && lastMessageIndex<index && chat.count_unredeble_messgaes!= null){
            chat.last_read_message_id = chat.messages[index].id;

            let dif_count_unredeble_messgaes = 0;
            for (let i = lastMessageIndex; i<=index;i++ ){
              if (!chat.messages[i].is_hide) dif_count_unredeble_messgaes+=1;
            }

            console.log(dif_count_unredeble_messgaes);

            let newcount = chat.count_unredeble_messgaes - dif_count_unredeble_messgaes;
            chat.count_unredeble_messgaes = newcount>-1?newcount:0;
            console.log(chat.count_unredeble_messgaes);

            clearTimeout(setLastRedbleMessageTimeout);
            if (chat.last_read_message_id >-1){
              setLastRedbleMessageTimeout = setTimeout(() => {
                setLastReadMessageIdInChatTimeout(this, MHS, chat.id, chat.last_read_message_id);
              }, 500);
            }
          } else if(chat.last_read_message_id==null){
            if (chat.messages[index].id>-1){
              setLastReadMessageIdInChatTimeout(this, MHS, chat.id, chat.messages[index].id);
            }
          }
        }
      },

      setPage(path){
        router.push(path);
      },

      chat_remove_to_archive(){
        this.chats.curentChat.is_waiting_answer = false;
        this.chats.curentChat.is_archive = true;
        this.chats.curentChat.is_not_connected = true;
        removeChatToArchive(this, MHS, this.chats.curentChat.id);
      },

      scrolled_top(chat){
        if (chat && chat.users && !chat.await_messages && !chat.scrolled_to_top){
          chat.await_messages = true;
          getMessagesByChat(this, MHS, chat, 50, chat.messages[0].id);
        }
      },

      scrolled_down(chat){
        if (chat && chat.users &&  !chat.scrolled_to_down && !chat.await_down_messages){
          chat.await_down_messages = true;
          chat.down_await_messages = [];
          getMessagesByChat(this, MHS, chat, 50, chat.messages[chat.messages.length-1].id, false, "down");
        }
      },


      set_null_chat(){
        this.chats.curentChat = null;
        this.$tutorial.emit_event("unselect-chat");
      },

      // resize_window(){
      // this.is_min_window = window.innerWidth <= 768? true : false;
      // },
      select_chat(chat) {
        console.log('Мы находимся в select_chat с chatId:', chat.id);
        this.$tutorial.emit_event("select-chat");

        if (this.chats.curentChat && this.chats.curentChat.id === chat.id) {
          console.log("Вы уже находитесь в этом чате"); 
        } else {
          console.log(`Сообщения для чата ${chat.id} отсутствуют, отправка запроса...`);
          // this.current_chat = []; 

          this.chats.curentChat = chat;
          if (!chat.users){
            getUsersByChatRequest(this, MHS, this.chats.curentChat.id);
            if (chat.last_read_message_id==-1 || chat.last_read_message_id ==null){
              if (! this.chats.curentChat.await_messages){ // Загружаем с последнего собщения
                this.chats.curentChat.await_messages = true;
                this.chats.curentChat.await_down_messages = true;
                chat.down_await_messages = [];
                getMessagesByChat(this, MHS, this.chats.curentChat);
              }
            }
            else{ // Загружаем с last_read_message_id
              if (! this.chats.curentChat.await_messages){
                this.chats.curentChat.await_messages = true;
                getMessagesByChat(this, MHS, this.chats.curentChat, 50, chat.last_read_message_id, true,"up");
              }
              if (!this.chats.curentChat.await_down_messages){
                chat.await_down_messages = true;
                chat.down_await_messages = [];
                getMessagesByChat(this, MHS, chat, 2147483647, chat.last_read_message_id, false, "down");
              }
            }
          }
        }
      },

      send_message(text, files) {
        if (files.length>0 || text){
          let local_current_chat = this.chats.curentChat;

          let msg = this.convertFilesTextToUIMessage(local_current_chat, text, files);

          let send_msg = ()=>{
            let chekUpload = true;
            let f = (item)=>{
              if (!item.uploaded) chekUpload = false;
            }

            let f_v = (item)=>{
              if (!item.uploaded) chekUpload = false;
              if (!item.miniature.uploaded) chekUpload = false;
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
                  sendMessageToChat(this, MHS, message);
                } else {
                  if (!local_current_chat.waiting_connaction) {
                    local_current_chat.waiting_messages = [];
                    local_current_chat.waiting_connaction = true;
                    addUserToChatRequest(this, MHS, local_current_chat.id, this.AuthServiceStore.userInfo.id);
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
            element.delete_call = ()=>{
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

            element.err_download_call_back = (e)=>{
              alert( `Произошла ошибка загрузки файла ${element.name}, он будет удалён.`);
              console.log("Произошла ошибка загрузки файла.",e);
              element.delete_call();
            };

            if (element.type == "video"){
                element.miniature_err_download_call_back = (e)=>{
                alert( `Произошла ошибка загрузки файла ${element.name}, он будет удалён.`);
                console.log("Произошла ошибка загрузки файла.",e);
                element.delete_call();
              };
            }

            let last_download_call_back =  element.download_call_back;

            element.download_call_back = (response)=>{
              last_download_call_back(response);
              send_msg();
            };

            let last_miniature_download_call_back =  element.miniature_download_call_back;

            element.miniature_download_call_back = (response)=>{
              last_miniature_download_call_back(response);
              send_msg();
            };
          });

          send_msg();

          this.chats.curentChat.messages.push(msg);
          if (this.chats.curentChat.last_message_send_at<msg.sended_at){
            this.chats.curentChat.last_message_send_at = msg.sended_at;

            this.chats.chats.sort((a,b)=>{ 
              if (a.last_message_send_at === null) {
                if (b.last_message_send_at === null) return 0;
                else return 1;
              } else{
                if (b.last_message_send_at === null) return -1;
                return b.last_message_send_at-a.last_message_send_at;
              }
            });
          }
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
          if (element.type.startsWith("image")){
            attachments.images.push(element);
          } else if (element.type.startsWith("video")){
            attachments.videos.push(element);
          } else {
            attachments.files.push(element);
          }
        });

        return {
          id: -chat.message_iterator,
          chat_id: chat.id,
          sender_id: this.AuthServiceStore.userInfo.id,
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

<style>
  @import '@/assets/ChatComponent.css'; 
  @import 'primeicons/primeicons.css';
  @import '@/assets/Layout.css';
</style>
