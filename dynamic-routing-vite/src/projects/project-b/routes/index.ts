import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> =
  process.env.PROJECT === 'project-b'
    ? [
        {
          path: '/page',
          component: () => import('../pages/page.vue'),
        },
      ]
    : [];

export default routes;
