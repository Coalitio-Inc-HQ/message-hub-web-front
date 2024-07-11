import { createRouter, createWebHistory } from 'vue-router';

import LoginComponent from '@/components/LoginComponent.vue';
import MainChatComponent from '@/components/Chat/MainChatComponent.vue';

const routes = [
  { path: '/', component: MainChatComponent },
  { path: '/login', component: LoginComponent },
  { path: '/chat', component: MainChatComponent}  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
