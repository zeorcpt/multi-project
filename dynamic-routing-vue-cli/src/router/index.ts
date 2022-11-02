import { createRouter, createWebHistory } from 'vue-router';
import commonRoutes from './routes';

const modules = require(`/src/projects${process.env.BASE_URL}routes/index.ts`)

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [...commonRoutes, ...modules.default],
});

export default router;
