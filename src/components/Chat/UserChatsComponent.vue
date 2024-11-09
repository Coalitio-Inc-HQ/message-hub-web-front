<template>
    <div class="button-container-chat-list">
      <Button class="chat-list-button" @click="ClicOnButtonInListWaitingChats" >Ожидающие ответа чаты</button>
    </div>
    <ul :class="{'chat-list': true, 'chat-list-active':button_waiting_chats}" v-if="button_waiting_chats">
      <template v-for="chat in chats">
        <il 
          v-if="chat.is_waiting_answer" 
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'active': current_chat && chat.id == current_chat.id }" 
          @click="$emit('select-user-chat', chat)"
          >
          <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
            <img :src="chat.icon_url" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
          </Avatar>
          <Avatar v-else :label="chat.name[0]"/>
          <p class="chat-item-text">{{ chat.name }}</p>
        </il>
      </template>
    </ul>
    <div class="button-container-chat-list">
      <Button class="chat-list-button"  @click="ClicOnButtonInListMyChats">Ваши чаты</Button>
    </div>
    <ul :class="{'chat-list': true, 'chat-list-active':button_my_chats}" v-if="button_my_chats">
      <template v-for="chat in chats" >
        <il 
          v-if="!chat.is_waiting_answer && !chat.is_archive && !chat.is_not_connected"
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'active': current_chat && chat.id == current_chat.id }" 
          @click="$emit('select-user-chat', chat)"
          >
          <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
            <img :src="chat.icon_url" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
          </Avatar>
          <Avatar v-else :label="chat.name[0]"/>
          <p class="chat-item-text">{{ chat.name }}</p>
        </il>
      </template>
    </ul>
    <div class="button-container-chat-list">
      <Button class="chat-list-button" @click="ClicOnButtonInListOtherChats" >Остальные чаты</button>
    </div>
    <ul :class="{'chat-list': true, 'chat-list-active':button_other_chats}" v-if="button_other_chats">
      <template v-for="chat in chats" >
        <il 
          v-if="!chat.is_waiting_answer && !chat.is_archive && chat.is_not_connected"
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'active': current_chat && chat.id == current_chat.id }" 
          @click="$emit('select-user-chat', chat)"
          >
          <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
              <img :src="chat.icon_url" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
            </Avatar>
            <Avatar v-else :label="chat.name[0]"/>
          <p class="chat-item-text">{{ chat.name }}</p>
        </il>
      </template>
    </ul>
    <div class="button-container-chat-list">
      <Button class="chat-list-button" @click="ClicOnButtonInListArchiveChats" >Архивные чаты</button>
    </div>
    <ul :class="{'chat-list': true, 'chat-list-active':button_archive_chats}" v-if="button_archive_chats">
      <template v-for="chat in chats" >
        <il 
          v-if="chat.is_archive"
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'active': current_chat && chat.id == current_chat.id }" 
          @click="$emit('select-user-chat', chat)"
          >
          <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
              <img :src="chat.icon_url" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
            </Avatar>
            <Avatar v-else :label="chat.name[0]"/>
          <p class="chat-item-text">{{ chat.name }}</p>
        </il>
      </template>
    </ul>
</template>

<script>
  import Avatar from 'primevue/avatar';
  import Button from 'primevue/button';

  export default {
    props: ["chats","current_chat"],
    components:{
      Avatar,
      Button,
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
  };
</script>