<template>
    <div v-if="waiting_chats.length != 0">
      <h2>Ожидающие</h2>
      <ul class="chat-list waiting-chats">
        <il 
          v-for="chat in waiting_chats" 
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'active': chat.id == current_chat_id }" 
          @click="$emit('select-waiting-chat', chat.id)"
          >
          {{ chat.name }}
        </il>
      </ul>
    </div>
</template>

<script>
export default {
  props: ["waiting_chats","current_chat_id"],
  emits: ['select-waiting-chat']
};
</script>
<!-- @click="$emit('select-waiting-chat', chat.id)" -->