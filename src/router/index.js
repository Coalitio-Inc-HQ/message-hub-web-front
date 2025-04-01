import { createRouter, createWebHistory } from 'vue-router';

import logInView from '@/view/logInView.vue';
import MainChatComponent from '@/components/Chat/MainChatComponent.vue';

const routes = [
  { path: '/', component: logInView },
  { path: '/login', component: logInView },
  { path: '/chat', component: MainChatComponent}  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
