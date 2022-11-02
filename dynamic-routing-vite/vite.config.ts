import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default ({ command, mode }) => {
  const subProject = process.env.PROJECT;

  return defineConfig({
    define: {
      'process.env': process.env,
    },
    base: `/${subProject}/`,
    plugins: [vue()],
    build: {
      outDir: `dist/${subProject}`,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  });
};
