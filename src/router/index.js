import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/punch' },
  { path: '/punch', name: 'punch', component: () => import('../views/PunchView.vue'), meta: { title: '打我' } },
  { path: '/period', name: 'period', component: () => import('../views/PeriodView.vue'), meta: { title: '姨妈记' } },
  { path: '/record', name: 'record', component: () => import('../views/RecordView.vue'), meta: { title: '小本本' } },
  { path: '/mine', name: 'mine', component: () => import('../views/MineView.vue'), meta: { title: '我呀' } },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
