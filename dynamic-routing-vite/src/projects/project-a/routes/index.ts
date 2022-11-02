import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> =
  process.env.PROJECT === 'project-a'
    ? [
        {
          path: '/page',
          component: () => import('../pages/page.vue'),
        },
      ]
    : [];

export default routes;
