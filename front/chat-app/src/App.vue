<!-- <template>
  <div id="app">
    <ChatComponent />
  </div>
</template>

<script>

import ChatComponent from './components/ChatComponent.vue';

export default {
  name: 'App',
  components: {
    ChatComponent
  }
};
</script>

<style>
@import './assets/style.css'; /* Импорт стилей */


</style> -->


<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>

