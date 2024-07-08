import { createRouter, createWebHistory } from 'vue-router';
import LoginComponent from '@/components/LoginComponent.vue';
import ChatComponent from '@/components/ChatComponent.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginComponent
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatComponent
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
