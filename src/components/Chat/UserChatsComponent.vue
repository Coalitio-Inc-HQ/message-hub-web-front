<template>
    <div v-if="user_chats.length != 0">
      <h3>Прочитанные</h3>
      <ul class="chat-list read-chats">
        <il 
          v-for="chat in user_chats" 
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'active': chat.id == current_chat_id }" 
          @click="$emit('select-user-chat', chat.id)"
          >
          {{ chat.name }}
        </il>
      </ul>
    </div>
</template>
  
<script>
export default {
  props: ["user_chats","current_chat_id"]
};
</script>