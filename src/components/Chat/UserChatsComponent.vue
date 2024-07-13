<template>
    <div v-if="user_chats.length != 0">
      <h2>Прочитанные</h2>
      <ul class="chat-list read-chats">
        <button 
          v-for="chat in user_chats" 
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'active': chat.id == current_chat_id }" 
          @click="$emit('select-user-chat', chat.id)">
          {{ chat.name }}
        </button>
      </ul>
    </div>
</template>
  
<script>
export default {
  props: ["user_chats","current_chat_id"]
};
</script>