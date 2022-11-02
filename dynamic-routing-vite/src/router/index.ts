import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import commonRoutes from './routes';

const subProject = process.env.PROJECT

const modules = import.meta.glob('/src/projects/**/routes/index.ts', {
  import: 'default',
  eager: true,
});

const routes = <Array<RouteRecordRaw>>(
  modules[Object.keys(modules).find(key => key.includes(`/${subProject}/`)) || '']
);

const router = createRouter({
  history: createWebHistory(`/${subProject}/`),
  routes: [...commonRoutes, ...routes],
});

export default router;
