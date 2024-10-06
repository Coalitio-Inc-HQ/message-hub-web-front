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
            {{ chat.name }}
          </il>
        </template>
      </ul>
    </div>
  <div v-if="chats.length != 0">
    <h3>Ваши чаты</h3>
    <ul class="chat-list read-chats">
      <template v-for="chat in chats" >
        <il 
          v-if="!chat.is_waiting_answer && !chat.is_archive"
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'active': current_chat && chat.id == current_chat.id }" 
          @click="$emit('select-user-chat', chat)"
          >
          {{ chat.name }}
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
          {{ chat.name }}
        </il>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
props: ["chats","current_chat"]
};
</script>