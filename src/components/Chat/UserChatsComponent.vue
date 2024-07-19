<template>
  <div v-if="chats.length != 0">
    <h3>Ваши чаты</h3>
    <ul class="chat-list read-chats">
      <il 
        v-for="chat in chats" 
        :key="chat.id" 
        :data-chat-id="chat.id" 
        :class="{ 'chat-item': true, 'active': current_chat && chat.id == current_chat.id }" 
        @click="$emit('select-user-chat', chat)"
        >
        {{ chat.name }}
      </il>
    </ul>
  </div>
</template>

<script>
export default {
props: ["chats","current_chat"]
};
</script>