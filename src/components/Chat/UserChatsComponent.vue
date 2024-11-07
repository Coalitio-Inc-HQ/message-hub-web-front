<template>
  <div v-if="chats.length != 0">
      <h3>Ожидающие ответа чаты</h3>
      <ul class="chat-list waiting-chats">
        <template v-for="chat in chats" >
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
    </div>
  <div v-if="chats.length != 0">
    <h3>Ваши чаты</h3>
    <ul class="chat-list read-chats">
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
    <h3>Чужие чаты</h3>
    <ul class="chat-list read-chats">
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
  <div v-if="chats.length != 0">
    <h3>Архивные чаты</h3>
    <ul class="chat-list read-chats">
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
</template>

<script>
  import Avatar from 'primevue/avatar';

  export default {
    props: ["chats","current_chat"],
    components:{
      Avatar
    }
  };
</script>