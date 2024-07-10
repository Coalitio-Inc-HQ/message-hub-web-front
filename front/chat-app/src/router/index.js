import { createRouter, createWebHistory } from 'vue-router';

import LoginComponent from '@/components/LoginComponent.vue';
import ChatComponent from '@/components/ChatComponent.vue';

const routes = [
  { path: '/', component: ChatComponent },
  { path: '/login', component: LoginComponent },
  { path: '/chat', component: ChatComponent}  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
