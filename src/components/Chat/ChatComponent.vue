<template>
  <div class="dialog-main flex-list" ref="main_div">
    <div class="dialog-header-container flex-list-w">
      <Button ref="chat_out_button" variant="text" size="small" icon="pi pi-arrow-left" @click="this.$emit('set-null-chat')"/>
      <div class="flex-list-w" v-if="current_chat" style="align-items:  center;">
        <Avatar v-if="current_chat.icon_url" :image="current_chat.icon_url" shape="square" style="border-radius: 8px;">
          <img :src="current_chat.icon_url" loading="lazy" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
        </Avatar>
        <Avatar v-else :label="current_chat.name[0]" />
        <p class="chat-item-text">{{ current_chat.name }}</p>
      </div>
      <div class="flex-scale"/>
      <Button ref="b" variant="text" size="small" icon="pi pi-list" style="width: auto;" @click="(e)=>{this.$refs.popower.show(e); }"/>
      <Popover ref="popower" >
        <div class="flex-list gap">
          <Button @click="if(this.$props.current_chat){this.$emit('chat-remove-to-archive'); this.$refs.popower.hide();}" style="width: auto;">Отправить чат в архив</Button>
          <Button @click="this.show_deleted_messages = !this.show_deleted_messages" style="width: auto;">{{this.show_deleted_messages?"Скрыть удалённые сообщения":"Показать удалённые сообщения" }}</Button>
        </div>
      </Popover>
    </div>
    <VirtualScroll 
      ref="chat_scroll_container" 
      :current_chat="current_chat" 
      :max_mode="max_mode" 
      :this_user_id="user.id"
      :show_deleted_messages="show_deleted_messages"
      @scrollde-to-top="(chat)=>{this.$emit('scrolled-top', chat);}"
      @scrollde-to-down="(chat)=>{this.$emit('scrolled-down', chat);}"
      @set-last-viseble-message="(chat, message_index)=>{this.$emit('set-last-viseble-message', chat, message_index);}" 
      @contextmenu-on-message="onMessageContextmenu"
    >
      <template #message="{ message }">
            <div class="message-sender-name">{{ get_user_name(message.sender_id) }}</div>
            <template v-if="'use_ref' in message.attachments && message.attachments.use_ref">
              <ImageVideoGalleriaUseRefs v-if="message.attachments && (message.attachments.images && message.attachments.images.length>0 || message.attachments.videos && message.attachments.videos.length>0)" 
              :attachments="message.attachments"
              />
              <FileListUseRefs v-if="message.attachments && message.attachments.files && message.attachments.files.length>0"
              :attachments="message.attachments"  
              />
            </template>
            <template v-else>
              <ImageVideoGalleria v-if="message.attachments && (message.attachments.images && message.attachments.images.length>0 || message.attachments.videos && message.attachments.videos.length>0)" 
              :attachments="message.attachments"
              />
              <FileList v-if="message.attachments && message.attachments.files && message.attachments.files.length>0"
              :attachments="message.attachments"  
              />
            </template>
            <div class="message-text">{{ message.text }}</div>
            <div class="message-timestamp">
              <template v-if="message.id>=0">
                {{ (message.is_hide?"удалено/":"") + format_time_for_display(message.sended_at) }}
              </template>
              <i v-else class="pi pi-spin pi-spinner" style="font-size: 0.5rem"></i>
            </div>
      </template>
    </VirtualScroll>

    <form class="dialog-submit-form flex-list" >
      <!-- <div v-if="this.selected_files.length!=0" class="flex-list-w dialog-submit-file-scroll overflow-h-hiddne w-scrollbar">
        <FileAvatar v-for="file in this.selected_files" 
        :key="file.value.name"
        :file_info="file.value"
        :is_min_window="is_min_window"
        />
      </div> -->
      <UploadedFileList ref="dialog_submit_form" :files="this.selected_files"/>
      <div class="flex-list-w dialog-submit-div">
        <textarea 
          ref="messageInput" 
          v-model="message_input" 
          id="msg" 
          placeholder="Введите сообщение..." 
          @keydown="handle_key_down"
          @input="autoResize"
          class="p-inputtext  p-component flex-scale dialog-submit-message-text"
        />
        <!-- <button type="submit" class="send" :disabled="!current_chat">Отправить</button> -->
        <div class="flex-list dialog-buttons-group">
          <Button class="dialog-button-send" :disabled="!current_chat" @click="submit_message" icon="pi pi-send"/>
          <Button class="dialog-button-send" :disabled="!current_chat" @click="choise_files" icon="pi pi-file-plus"/>
        </div>
      </div>
    </form>
  </div>

  <ContextMenu ref="message_context_menu" :model="context_menu_items" @hide="this.selected_message=null" />
</template>

<script>
  import ContextMenu from 'primevue/contextmenu';
  import Avatar from 'primevue/avatar';
  import Popover from 'primevue/popover';
  import Button from 'primevue/button';
  // import ScrollPanel from 'primevue/scrollpanel';

  import { upload_file } from '@/services/S3Service';
  // import Textarea from 'primevue/textarea';
  // console.log(Textarea)
  import {format_time_for_display} from '@/services/dateUtils';
  // import FileAvatar from '@/components/File/FileAvatar.vue';

  import ImageVideoGalleria from '@/components/File/ImageVideoGalleria.vue';
  import ImageVideoGalleriaUseRefs from '../File/ImageVideoGalleriaUseRefs.vue';
  import FileList from '@/components/File/FileList.vue';

  import { getCookie} from '@/utilities/cookie';

  import UploadedFileList from '../File/UploadedFileList.vue';
  import FileListUseRefs from '../File/FileListUseRefs.vue';
  import VirtualScroll from './VirtualScroll.vue';
  // import { ref, } from 'vue'
  // import { noop } from '@vueuse/core';

  import { addTutorialStep, updateTutorialStepTargetFunc } from '@/tutorial/tutorialPlugin';
  import tutorialTextComponent from '../tutorial/tutorialTextComponent.vue';
  import {useTemplateRef} from 'vue';

  addTutorialStep("dialog-submit-form-info",
    {
      type: "popover",
      watch_ms_to_call_get_target_func:0,
      get_target_func: null,

      slot: tutorialTextComponent,
      props:{
        text: "\tДанная часть интерфеса отвечает за редактирование сообщения. Здась можно ввести текст сообщения, прикрепить к сообщению файлы и отправить сообщение.",
        button: true,
      },

      reload_events: new Set(["select-chat", "unselect-chat"]),

      next_step: "chat-menu-info",
      next_step_events: new Set(["next-button"]),

      back_step: null,
      back_step_events: new Set([]),
    }
  );
  addTutorialStep("chat-menu-info",
    {
      type: "popover",
      watch_ms_to_call_get_target_func:0,
      get_target_func: null,

      slot: tutorialTextComponent,
      props:{
        text: "\tДанная кнопка отвечает за открытие меню в котором можно отправить чат в архив или просмотреть удалённые сообщения.",
        button: true,
      },

      reload_events: new Set(["select-chat", "unselect-chat"]),

      next_step: "chat-out-button-info",
      next_step_events: new Set(["next-button"]),

      back_step: null,
      back_step_events: new Set([]),
    }
  );
  addTutorialStep("chat-out-button-info",
    {
      type: "popover",
      watch_ms_to_call_get_target_func:0,
      get_target_func: null,

      slot: tutorialTextComponent,
      props:{
        text: "\tЭта кнопка отвечает за закрытие чата, в мобильной вресии её необходимо нажать чтобы вернутся к списку чатов.",
        button: true,
      },

      reload_events: new Set(["select-chat", "unselect-chat"]),

      next_step: "left-menu-info",
      next_step_events: new Set(["next-button"]),

      back_step: null,
      back_step_events: new Set([]),
    }
  );


  export default {
    components:{
      Button,
      // ScrollPanel,
      // FileAvatar,
      // Textarea,
      Avatar,
      ImageVideoGalleria,
      ImageVideoGalleriaUseRefs,
      FileList,
      FileListUseRefs,
      UploadedFileList,
      Popover,
      VirtualScroll,
      ContextMenu,
    },
    props: [
      "user",
      "current_chat",
      "is_min_window",
    ],

    watch: { 
    //   'current_chat.messages': {
    //     handler(newValue, oldValue) {
    //       // console.log(oldValue,newValue, oldValue.length ==0);
    //       if (oldValue==null || oldValue.length ==0){
    //         this.scroll_down(true);
    //       } 
    //       else{
    //         const scrollPanel = this.$refs.chat_scroll_container.$el;
    //         const scrollContainer = scrollPanel.querySelector('.p-scrollpanel-content');

    //         const previousScrollHeight = scrollContainer.scrollHeight;
    //         const previousScrollTop = scrollContainer.scrollTop;

    //         this.$nextTick(() => {
    //           const newScrollHeight = scrollContainer.scrollHeight;
    //           const heightDiff = newScrollHeight - previousScrollHeight;

    //           scrollContainer.scrollTop = previousScrollTop + heightDiff;
    //         });
    //       }
    //     },
    //     deep: true,
    //     immediate: true
    //   },
      'current_chat': {
        handler() {
          this.message_input = ''; 
          if(this.$refs.messageInput) this.$refs.messageInput.value = '';
          this.selected_files = [];
        },
        deep: false,
        immediate: true
      }
    },

    data(){
      return{
        observer: null,
        max_mode: false,
        selected_files: [],
        context_menu_items:[
          { label: 'Удалить', icon: 'pi pi-trash' },
        ],
        show_deleted_messages: false,
        selected_message: null,
      }
    },

    setup(){
      const dialog_submit_form = useTemplateRef('dialog_submit_form');
      updateTutorialStepTargetFunc("dialog-submit-form-info", ()=>{
        return dialog_submit_form;
      });

      const b = useTemplateRef('b');
      updateTutorialStepTargetFunc("chat-menu-info", ()=>{
        return b;
      });

      const chat_out_button = useTemplateRef('chat_out_button');
      updateTutorialStepTargetFunc("chat-out-button-info", ()=>{
        return chat_out_button;
      });
    },

    methods: {
      onMessageContextmenu(e, message){
        if (message.sender_id == this.$props.user.id){
          this.selected_message = message;
          this.$refs.message_context_menu.show(e);
        }
      },

      deleteMessage(){
        this.$emit("delete-message", this.selected_message);
      },

      choise_files(){
        const input = document.createElement('input');
        input.type = 'file'; // Устанавливаем тип файла
        input.accept = '*'; // Ограничения на типы файлов (например, '.jpg,.png,.pdf')
        input.multiple = true;

        input.addEventListener('change', () => {
          if (input.files.length > 0) {
            let token = getCookie("token");
            let fails = []
            for (let i = 0; i < input.files.length; i++){
              try{
                let u_file = upload_file(input.files[i], token)
                u_file.value.delete_call = ()=>{
                  let index = this.selected_files.indexOf(u_file);
                  if (index>-1) this.selected_files.splice(index,1);
                };
                u_file.value.err_download_call_back = ()=>{
                  alert(`Ошибка загрузки файла ${u_file.value.name}. Он будет удалён.`);
                  u_file.value.delete_call();
                };
                this.selected_files.push(u_file);
              }catch (e){
                fails.push(input.files[i]);
                console.log(e);
              }
            }
            if (fails.length>0){
              let msg = "";
              fails.forEach((item)=>{
                msg+= item.name + "\n";
              })
              msg+="Небыли загруженты так как их размер превышает 50Мб.";
              alert(msg);
            }
          }
        });

        input.click();
      },

      autoResize(){
        this.$refs.messageInput.style.height = 'auto'; // Сбрасываем текущую высоту
        const scrollHeight = this.$refs.messageInput.scrollHeight;

        const style = getComputedStyle(this.$refs.messageInput);
        var maxHeight = null;
        if (style.lineHeight=="normal"){
          maxHeight = parseInt(style.fontSize.slice(0, -2)) * 10; // Высота для 5 строк
        }
        else{
          maxHeight = parseInt(style.lineHeight.slice(0, -2)) * 10; // Высота для 5 строк
        }
        this.$refs.messageInput.style.height = Math.min(scrollHeight, maxHeight) + 'px'; // Устанавливаем высоту, но не больше maxHeight
        this.$refs.messageInput.style.overflowY = scrollHeight > maxHeight? "auto": "hidden";
      },

      handleResize () {
        console.log(this.main_div)
      },

      format_time_for_display,

      get_user_name(user_id) {
        if (this.$props.user.id === user_id) {
          return this.$props.user.name;
        }

        const user = this.current_chat.users.find(user => user.id === user_id);
        return user ? user.name : "null";
      },

      submit_message() {
        this.$emit('send-message', this.message_input, this.selected_files);
        this.message_input = ''; 
        this.$refs.messageInput.value = '';
        this.selected_files = [];

        this.$nextTick(()=>{
          this.$refs.chat_scroll_container.scrollToElement(this.$props.current_chat.messages.length-1);
        })
      },

      handle_key_down(event) {
        if (event.key === 'Enter') {
          if (!event.ctrlKey){
            event.preventDefault(); 
            this.submit_message(); 
          } else{
            const cursorPos = this.$refs.messageInput.selectionStart; // Позиция курсора
            const cursorEnd = this.$refs.messageInput.selectionEnd; // Позиция окончания курсора
            const textBefore = this.$refs.messageInput.value.substring(0, cursorPos); // Текст до курсора
            const textAfter = this.$refs.messageInput.value.substring(cursorEnd); // Текст после курсора
            
            // Обновляем значение textarea, добавив \n в позицию курсора
            this.$refs.messageInput.value = textBefore + '\n' + textAfter;
            this.message_input = textBefore + '\n' + textAfter;

            // Устанавливаем курсор в правильную позицию (после вставленного \n)
            this.$refs.messageInput.selectionStart = this.$refs.messageInput.selectionEnd = cursorPos + 1;

            this.autoResize();
          }
        }
      },
      
      // scroll_down(smooth = false) {
      //   // this.$nextTick(() => {
      //   //   const container = this.$refs.chat_scroll_container.$el.querySelector('.p-scrollpanel-content');
      //   //   if (container) {
      //   //     container.style.scrollBehavior = smooth ? 'smooth' : 'auto';
      //   //     container.scrollTop = container.scrollHeight;
      //   //   }
      //   //   console.log("smooth:", smooth);
      //   // });
      //   console.log("smooth:", smooth);
      // },

      onResize () {
        this.max_mode = this.$refs.main_div.offsetWidth>750 
      },
    },

    mounted() {
      // this.scroll_down(false);
      this.context_menu_items[0].command = this.deleteMessage;

      this.observer = new ResizeObserver(this.onResize);
      this.observer.observe(this.$refs.main_div);
    },

    beforeUnmount () {
      this.observer.unobserve(this.$refs.main_div)
    }
  };
</script>

<style scoped>
@import '@/assets/ChatComponent.css'; 
@import 'primeicons/primeicons.css';
@import '@/assets/Layout.css';
</style>