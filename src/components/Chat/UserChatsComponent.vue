<template>
  <div :class="{'chat-list-warper':true, 'chat-list-warper-awaiting':button_waiting_chats,'chat-list-warper-my':button_my_chats,'chat-list-warper-other': button_other_chats,'chat-list-warper-archive':button_archive_chats}">
    <div>
      <div class="button-container-list">
        <button class="chat-list-button" @click="ClicOnButtonInListWaitingChats" >Ожидающие ответа чаты</button>
      </div>
      <!-- <ScrollPanel style="width: 100%; height: 200px;"  v-if="button_waiting_chats"> -->
        <ul class="chat-list" v-if="button_waiting_chats">
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
      <!-- </ScrollPanel> -->
    </div>
    <div :class="{'chat-list-active': button_my_chats}">
      <div class="button-container-list">
        <Button class="chat-list-button"  @click="ClicOnButtonInListMyChats">Ваши чаты</Button>
      </div>
      <ul class="chat-list read-chats" v-if="button_my_chats">
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
    </div>
    <div v-if="chats.length != 0">
      <div class="button-container-list">
        <button class="chat-list-button" @click="ClicOnButtonInListOtherChats" >Остальные чаты</button>
      </div>
      <ul class="chat-list read-chats" v-if="button_other_chats">
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
    </div>
    <div>
      <div class="button-container-list">
        <button class="chat-list-button" @click="ClicOnButtonInListArchiveChats" >Архивные чаты</button>
      </div>
      <ul class="chat-list read-chats" v-if="button_archive_chats">
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
    </div>
  </div>
</template>

<script>
  import Avatar from 'primevue/avatar';
  // import ScrollPanel from 'primevue/scrollpanel';

  export default {
    props: ["chats","current_chat"],
    components:{
      Avatar,
      // ScrollPanel,
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