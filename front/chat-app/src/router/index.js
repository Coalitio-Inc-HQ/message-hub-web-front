import { createRouter, createWebHistory } from 'vue-router';

import LoginComponent from '@/components/LoginComponent.vue';
import ChatComponent from '@/components/ChatComponent.vue';

const routes = [
  { path: '/', component: LoginComponent },
  { path: '/login', component: LoginComponent },
  { path: '/chat', component: ChatComponent, meta: { requiresAuth: true } }  // Изменено на true
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Глобальный перехватчик навигации
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ path: '/login' });
  } else {
    next();
  }
});

export default router;
