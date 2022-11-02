import { createRouter, createWebHistory } from 'vue-router';
import commonRoutes from '@/routes';
import routes from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...commonRoutes, ...routes],
});

export default router;
