<template>
  <div :class="{'flex-scale':button_waiting_chats, 'flex-list': true, 'overflow-h-hiddne': button_waiting_chats}" >
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListWaitingChats" >Ожидающие ответа чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_waiting_chats" step="20">
        <template v-if="chats.loaded">
          <template v-if="waitingAnswerChats.length">
            <template 
              v-for="chat in waitingAnswerChats"
              :key="chat.id" 
            >
              <ChatAvatarComponent
                :chat="chat"
                :is_iselected="chats.curentChat && chat.id == chats.curentChat.id"
                :platforms="platforms"
                @select-chat="(chat)=>{this.$emit('select-user-chat', chat)}"
              />
            </template>
          </template>
          <template v-else>
            <il class="chat-item flex-list-w align-items-center">
              <p class="chat-list-empty-text" >Ожидающие ответа чаты отсутствуют</p>
            </il>
          </template>
        </template>
        <template v-else>
          <ChatAvatarSceletonComponent v-for="i in 20" :key="i"/>
        </template>
      </ScrollPanel>
    </div>
  </div>
  <div :class="{'flex-scale':button_my_chats, 'flex-list': true, 'overflow-h-hiddne': button_my_chats}">
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListMyChats" >Ваши чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_my_chats" step="20">
        <template v-if="chats.loaded">
          <template v-if="myChats.length">
            <template 
              v-for="chat in myChats"
              :key="chat.id" 
            >
              <ChatAvatarComponent
                :chat="chat"
                :is_iselected="chats.curentChat && chat.id == chats.curentChat.id"
                :platforms="platforms"
                :count_unredeble_messgaes="chat.count_unredeble_messgaes"
                @select-chat="(chat)=>{this.$emit('select-user-chat', chat)}"
              />
            </template>
          </template>
          <template v-else>
            <il class="chat-item flex-list-w align-items-center">
              <p class="chat-list-empty-text" >Ваши чаты отсутствуют</p>
            </il>
          </template>
        </template>
        <template v-else>
          <ChatAvatarSceletonComponent v-for="i in 20" :key="i"/>
        </template>
      </ScrollPanel>
    </div>
  </div>
  <div :class="{'flex-scale':button_other_chats, 'flex-list': true, 'overflow-h-hiddne': button_other_chats}">
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListOtherChats" >Остальные чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_other_chats" step="20">
        <template v-if="chats.loaded">
          <template v-if="otherChats.length">
            <template 
              v-for="chat in otherChats"
              :key="chat.id" 
            >
              <ChatAvatarComponent
                :chat="chat"
                :is_iselected="chats.curentChat && chat.id == chats.curentChat.id"
                :platforms="platforms"
                @select-chat="(chat)=>{this.$emit('select-user-chat', chat)}"
              />
            </template>
          </template>
          <template v-else>
            <il class="chat-item flex-list-w align-items-center">
              <p class="chat-list-empty-text" >Остальные чаты отсутствуют</p>
            </il>
          </template>
        </template>
        <template v-else>
          <ChatAvatarSceletonComponent v-for="i in 20" :key="i"/>
        </template>
      </ScrollPanel>
    </div>
  </div>

  <div :class="{'flex-scale':button_archive_chats, 'flex-list': true, 'overflow-h-hiddne': button_archive_chats}">
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListArchiveChats" >Архивные чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_archive_chats" step="20">
        <template v-if="chats.loaded">
          <template v-if="archiveChats.length">
            <template 
              v-for="chat in archiveChats"
              :key="chat.id" 
            >
              <ChatAvatarComponent
                :chat="chat"
                :is_iselected="chats.curentChat && chat.id == chats.curentChat.id"
                :platforms="platforms"
                @select-chat="(chat)=>{this.$emit('select-user-chat', chat)}"
              />
            </template>
          </template>
          <template v-else>
            <il class="chat-item flex-list-w align-items-center">
              <p class="chat-list-empty-text" >Архивные чаты отсутствуют</p>
            </il>
          </template>
        </template>
        <template v-else>
          <ChatAvatarSceletonComponent v-for="i in 20" :key="i"/>
        </template>
      </ScrollPanel>
    </div>
  </div>
</template>

<script>
  import Button from 'primevue/button';
  import ScrollPanel from 'primevue/scrollpanel';
  import ChatAvatarComponent from './ChatAvatarComponent.vue';
  import ChatAvatarSceletonComponent from './ChatAvatarSceletonComponent.vue';
  export default {
    props: ["chats","search_name", "platforms"],
    components:{
      Button,
      ScrollPanel,
      ChatAvatarComponent,
      ChatAvatarSceletonComponent,
    },
    methods:{
      ClicOnButtonInListWaitingChats() {
        this.button_waiting_chats = true;
        this.button_my_chats = false;
        this.button_other_chats = false;
        this.button_archive_chats = false;
      },
      ClicOnButtonInListMyChats() {
        this.button_waiting_chats = false;
        this.button_my_chats = true;
        this.button_other_chats = false;
        this.button_archive_chats = false;
      },
      ClicOnButtonInListOtherChats() {
        this.button_waiting_chats = false;
        this.button_my_chats = false;
        this.button_other_chats = true;
        this.button_archive_chats = false;
      },
      ClicOnButtonInListArchiveChats() {
        this.button_waiting_chats = false;
        this.button_my_chats = false;
        this.button_other_chats = false;
        this.button_archive_chats = true;
      },
    },
    data() {
      return {
        button_waiting_chats: true,
        button_my_chats: false,
        button_other_chats: false,
        button_archive_chats: false,
      };
    },

    computed: {
      waitingAnswerChats() {
        let arr = [];
        this.$props.chats.chats.forEach(element => {
          if (element.is_waiting_answer && (!this.search_name ||element.name.toLowerCase().includes(this.search_name))){
            arr.push(element);
          }
        });
        return arr;
      },

      myChats() {
        let arr = [];
        this.$props.chats.chats.forEach(element => {
          if (!element.is_waiting_answer && !element.is_archive && !element.is_not_connected && (!this.search_name ||element.name.toLowerCase().includes(this.search_name))){
            arr.push(element);
          }
        });
        return arr;
      },

      otherChats(){
        let arr = [];
        this.$props.chats.chats.forEach(element => {
          if (!element.is_waiting_answer && !element.is_archive && element.is_not_connected && (!this.search_name ||element.name.toLowerCase().includes(this.search_name))){
            arr.push(element);
          }
        });
        return arr;
      },

      archiveChats(){
        let arr = [];
        this.$props.chats.chats.forEach(element => {
          if (element.is_archive && (!this.search_name ||element.name.toLowerCase().includes(this.search_name))){
            arr.push(element);
          }
        });
        return arr;
      },
    }
  };
</script>