<template>
  <div :class="{'flex-scale':button_waiting_chats, 'flex-list': true, 'overflow-h-hiddne': button_waiting_chats}" >
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListWaitingChats" >Ожидающие ответа чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne" v-if="button_waiting_chats">
        <template v-for="chat in chats">
          <il 
            v-if="chat.is_waiting_answer" 
            :key="chat.id" 
            :data-chat-id="chat.id" 
            :class="{ 'chat-item': true,  'flex-list-w': true, 'align-items-center':true, 'active': current_chat && chat.id == current_chat.id }" 
            @click="$emit('select-user-chat', chat)"
            >
            <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
              <img :src="chat.icon_url" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
            </Avatar>
            <Avatar v-else :label="chat.name[0]" />
            <p class="chat-item-text">{{ chat.name }}</p>
          </il>
        </template>
      </ScrollPanel>
    </div>
  </div>
  <div :class="{'flex-scale':button_my_chats, 'flex-list': true, 'overflow-h-hiddne': button_my_chats}">
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListMyChats" >Ваши чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne" v-if="button_my_chats">
        <template v-for="chat in chats">
          <il 
          v-if="!chat.is_waiting_answer && !chat.is_archive && !chat.is_not_connected"
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'flex-list-w': true, 'align-items-center':true, 'active': current_chat && chat.id == current_chat.id }" 
          @click="$emit('select-user-chat', chat)"
          >
            <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
              <img :src="chat.icon_url" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
            </Avatar>
            <Avatar v-else :label="chat.name[0]"/>
            <p class="chat-item-text">{{ chat.name }}</p>
          </il>
        </template>
      </ScrollPanel>
    </div>
  </div>
  <div :class="{'flex-scale':button_other_chats, 'flex-list': true, 'overflow-h-hiddne': button_other_chats}">
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListOtherChats" >Остальные чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne" v-if="button_other_chats">
        <template v-for="chat in chats">
          <il 
          v-if="!chat.is_waiting_answer && !chat.is_archive && chat.is_not_connected"
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'flex-list-w': true,'align-items-center':true, 'active': current_chat && chat.id == current_chat.id }" 
          @click="$emit('select-user-chat', chat)"
          >
              <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
                <img :src="chat.icon_url" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
              </Avatar>
              <Avatar v-else :label="chat.name[0]"/>
            <p class="chat-item-text">{{ chat.name }}</p>
          </il>
        </template>
      </ScrollPanel>
    </div>
  </div>

  <div :class="{'flex-scale':button_archive_chats, 'flex-list': true, 'overflow-h-hiddne': button_archive_chats}">
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListArchiveChats" >Архивные чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne" v-if="button_archive_chats">
        <template v-for="chat in chats">
          <il 
          v-if="chat.is_archive"
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'flex-list-w': true, 'align-items-center':true, 'active': current_chat && chat.id == current_chat.id }" 
          @click="$emit('select-user-chat', chat)"
          >
            <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
              <img :src="chat.icon_url" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
            </Avatar>
            <Avatar v-else :label="chat.name[0]"/>
          <p class="chat-item-text">{{ chat.name }}</p>
        </il>
        </template>
      </ScrollPanel>
    </div>
  </div>
</template>

<script>
  import Avatar from 'primevue/avatar';
  import Button from 'primevue/button';
  import ScrollPanel from 'primevue/scrollpanel';

  export default {
    props: ["chats","current_chat"],
    components:{
      Avatar,
      Button,
      ScrollPanel
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