import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import commonRoutes from '@/routes';
import routes from './routes';

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [...commonRoutes, ...routes],
});

export default router;
