import { createRouter, createWebHistory } from 'vue-router';

//import LoginComponent from '@/components/Login/LoginComponent.vue';
import MainChatComponent from '@/components/Chat/MainChatComponent.vue';

const routes = [
  { path: '/', component: MainChatComponent },
  // { path: '/login', component: LoginComponent },
  { path: '/login', component: MainChatComponent },

  { path: '/chat', component: MainChatComponent}  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
