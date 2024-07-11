<template>
    <template v-if="waitng_chats.length!=0">
      <h2>Ожидающие</h2>
      <ul class="chat-list waiting-chats">
        <li v-for="chat in waitng_chats" :key="chat.id" :data-chat-id="chat.id" :class="{ 'chat-item': true, 'active': chat.id == current_chat_id }" @click="$emit('select-waitng-chat',chat.id)">
          {{ chat.name }}
        </li>
      </ul>
    </template>
</template> 

<script>
export default {
  props: ["waitng_chats","current_chat_id"]
};
</script>