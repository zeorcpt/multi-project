import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/page',
    component: () => import('../pages/page.vue'),
  },
];

export default routes;
