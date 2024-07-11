<template>
  <div :class="['main', { 'main-expanded': !isSidebarVisible }]">
    <div :class="['name-display', { 'name-shifted': !isSidebarVisible }]" id="name">Вы: {{ user_name }}</div>
    <ul class="chat">
      <li v-for="message in current_chat_messages" :key="message.sender_id + message.sended_at" :class="{ 'message': true, 'self': message.sender_id == this_user_id, 'other': message.sender_id !== this_user_id }">
        <div class="message-content">
          <div class="name">{{ get_user_name(message.sender_id) }}</div>
          <div class="body">{{ message.text }}</div>
          <div class="timestamp">{{ message.sended_at }}</div>
        </div>
      </li>
    </ul>
    <form class="form" @submit.prevent="$emit('send-message', message_input)">
      <textarea v-model="message_input" id="msg" placeholder="Введите сообщение..."></textarea>
      <button type="submit" class="send" :disabled="!current_chat_id">Отправить</button>
    </form>
  </div>
</template>

<script>
export default {
  props: ["this_user_id", "user_name", "current_chat_id", "current_chat_messages", "current_chat_users"],
  methods: {
    get_user_name(user_id) {
      if (this.this_user_id === user_id) {
        return this.user_name;
      }

      const user = this.current_chat_users.find(user => user.id === user_id);
      return user ? user.name : "null";
    }
  }
};
</script>


