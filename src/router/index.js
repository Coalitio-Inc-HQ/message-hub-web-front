import { createRouter, createWebHistory } from 'vue-router';

import logInView from '@/view/logInView.vue';
import mainView from '@/view/mainView.vue';
import adminView from '@/view/adminView.vue';
import changePasswordView from '@/view/changePasswordView.vue';
import MainChatComponent from '@/components/Chat/MainChatComponent.vue';

const routes = [
  { path: '/', component: logInView },
  { path: '/login', component: logInView },
  // { path: '/chat', component: MainChatComponent},
  { path: "/ui/menu", component: mainView},
  { path: "/ui/", component: mainView,
    children:[
      { path: 'chat', component: MainChatComponent},
      { path: 'admin', component: adminView},
    ]
  },
  { path: '/change-password', component: changePasswordView}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
