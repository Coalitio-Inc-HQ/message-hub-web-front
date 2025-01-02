<template>
  <div class="dialog-main flex-list" ref="main_div">
    <div class="dialog-header-container flex-list-w">
      <Button variant="text" size="small" icon="pi pi-arrow-left" @click="this.$emit('set-null-chat')"/>

      <!-- Перенести в меню -->
      <button class="button_exit" @click="exit_chat">Выйти</button>
      <Button @click="this.$emit('chat-remove-to-archive')" style="width: auto;">Отправить в архив</Button>
    </div>
    <ScrollPanel class="flex-scale overflow-h-hiddne overflow-w-hiddne" ref="chat_scroll_container">
      <div class="dialog-messges-base flex-list">
        <template v-if="this.current_chat">
          <div v-for="message in this.current_chat.messages" 
          :key="message.sender_id + message.sended_at" 
          :class="{ 
            'message': true,
            'flex-list': true,
            'message-self': message.sender_id == this.this_user_id, 
            'message-other': message.sender_id !== this.this_user_id,
            'max-mode': this.max_mode
            }"
          >
            <div class="message-sender-name">{{ get_user_name(message.sender_id) }}</div>
            <ImageVideoGalleria v-if="message.attachments && (message.attachments.images && message.attachments.images.length>0 || message.attachments.videos && message.attachments.videos.length>0)" 
              :attachments="message.attachments"
              :is_temp_messge="message.is_temp_messge"
              :is_min_window="is_min_window"
              />
            <FileList v-if="message.attachments && message.attachments.files && message.attachments.files.length>0"
            :attachments="message.attachments"
            :is_temp_messge="message.is_temp_messge"  
            />
            <div class="message-text">{{ message.text }}</div>
            <div class="message-timestamp">
              <template v-if="message.id!=-1">
                {{ format_time_for_display(message.sended_at) }}
              </template>
              <i v-else class="pi pi-spin pi-spinner" style="font-size: 0.5rem"></i>
            </div>
          </div>
        </template>
      </div>
    </ScrollPanel>

    <form class="dialog-submit-form flex-list" >
      <div v-if="this.selected_files.length!=0" class="flex-list-w dialog-submit-file-scroll overflow-h-hiddne w-scrollbar">
        <FileAvatar v-for="file in this.selected_files" 
        :key="file.value.name"
        :file_info="file.value"
        :is_min_window="is_min_window"
        />
      </div>
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
          <Button class="dialog-button-send" :disabled="!current_chat" @click="add_file" icon="pi pi-file-plus"/>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
  import Button from 'primevue/button';
  import ScrollPanel from 'primevue/scrollpanel';

  import { upload_file } from '@/services/S3Service';
  // import Textarea from 'primevue/textarea';
  // console.log(Textarea)
  import router from "@/router";
  import {format_time_for_display} from '@/services/dateUtils';
  import FileAvatar from '@/components/File/FileAvatar.vue';

  import ImageVideoGalleria from '@/components/File/ImageVideoGalleria.vue';
  import FileList from '@/components/File/FileList.vue';

  import { ref, } from 'vue'
  // import { noop } from '@vueuse/core';
  export default {
    components:{
      Button,
      ScrollPanel,
      FileAvatar,
      // Textarea,
      ImageVideoGalleria,
      FileList,
    },
    props: [
      "this_user_id",
      "user_name",
      "current_chat",
      "is_min_window",
    ],

    watch: {
      'current_chat.messages': {
        handler(newValue, oldValue) {
          // console.log(oldValue,newValue, oldValue.length ==0);
          if (oldValue==null || oldValue.length ==0){
            this.scroll_down(true);
          } 
          else{
            const scrollPanel = this.$refs.chat_scroll_container.$el;
            const scrollContainer = scrollPanel.querySelector('.p-scrollpanel-content');

            const previousScrollHeight = scrollContainer.scrollHeight;
            const previousScrollTop = scrollContainer.scrollTop;

            this.$nextTick(() => {
              const newScrollHeight = scrollContainer.scrollHeight;
              const heightDiff = newScrollHeight - previousScrollHeight;

              scrollContainer.scrollTop = previousScrollTop + heightDiff;
            });
          }
        },
        deep: true,
        immediate: true
      },
      'current_chat': {
        handler() {
          this.scroll_down(false);
        },
        deep: false,
        immediate: true
      }
    },

    data(){
      return{
        observer: null,
        max_mode: false,
        selected_files: []
      }
    },

    methods: {
      add_file(){
        const input = document.createElement('input');
        input.type = 'file'; // Устанавливаем тип файла
        input.accept = '*'; // Ограничения на типы файлов (например, '.jpg,.png,.pdf')
        input.multiple = true;

        input.addEventListener('change', async () => {
          console.log(input.files)
          if (input.files.length > 0) {
            let token = this.get_cookie("token");
            let fails = [];
            for (let i = 0; i < input.files.length; i++){
              if (input.files[i].size > 52428800){
                fails.push(input.files[i]);
              }
              else{
                let file_info = {
                  file: input.files[i],
                  temp_url: URL.createObjectURL(input.files[i]),
                  uploaded: false,
                  download_call_back: null,
                  err_download_call_back: null,
                  delete: null,
                };
                file_info = ref(file_info);
                file_info.value.delete = ()=> {
                  this.selected_files.splice(this.selected_files.indexOf(file_info),1);
                }

                file_info.value.err_download_call_back = () =>{
                  alert(`Ошибка загрузки файла ${file_info.value.file.name}, он будет удалён из сообщения.`);
                  file_info.value.delete();
                }

                this.selected_files.push(file_info);

                await upload_file(file_info, token);
              }
            }
            if (fails.length>0){
              let msg = "";
              fails.forEach((item)=>{
                msg+= item.name + "\n";
              })
              msg+="Небыли загруженты так как их размер превышает 100Мб.";
              alert(msg);
            }
          }
        });

        // Вызываем файловый диалог
        input.click();
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
      },

      onScroll(){
        // console.log(e);
        if (this.$refs.chat_scroll_container.$el.querySelector('.p-scrollpanel-content').scrollTop === 0) {
          console.log("Scrolled to the top!");
          this.$emit('scrolled-top');
        }
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
        if (this.this_user_id === user_id) {
          return this.user_name;
        }

        const user = this.current_chat.users.find(user => user.id === user_id);
        return user ? user.name : "null";
      },

      submit_message() {
        this.$emit('send-message', this.message_input, this.selected_files);
        this.message_input = ''; 
        this.$refs.messageInput.value = '';
        this.scroll_down(true);
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

      delete_cookies() {
          const cookies = document.cookie.split(";");
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            if (name) {
              document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
              console.log(`Cookie удалена: ${name}`);
            } else {
              console.log('Куки не обнаружены для удаления.');
          }
        }
      },

      exit_chat() {
        alert('Вы вышли из системы');  
        this.delete_cookies();
        router.push('/login');
      },
      
      scroll_down(smooth = false) {
        this.$nextTick(() => {
          const container = this.$refs.chat_scroll_container.$el.querySelector('.p-scrollpanel-content');
          if (container) {
            container.style.scrollBehavior = smooth ? 'smooth' : 'auto';
            container.scrollTop = container.scrollHeight;
          }
          console.log("smooth:", smooth);
        });
      },

      onResize () {
        this.max_mode = this.$refs.main_div.offsetWidth>750 
        // console.log(this.$refs.main_div.offsetWidth);
      },
    },
    mounted() {
      this.scroll_down(false);
      this.observer = new ResizeObserver(this.onResize)
      this.observer.observe(this.$refs.main_div)

      this.$refs.chat_scroll_container.$el.querySelector('.p-scrollpanel-content').addEventListener('scroll', this.onScroll);
    },

    beforeUnmount () {
      this.observer.unobserve(this.$refs.main_div)
      this.$refs.chat_scroll_container.$el.querySelector('.p-scrollpanel-content').removeEventListener('scroll', this.onScroll);
    }
  };
</script>

<style scoped>
@import '@/assets/ChatComponent.css'; 
@import 'primeicons/primeicons.css';
@import '@/assets/Layout.css';
</style>