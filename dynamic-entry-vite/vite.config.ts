import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default ({ command, mode }) => {
  const subProject = process.env.PROJECT;

  return defineConfig({
    /**
     * root 是项目根目录（index.html 文件所在的位置）。可以是一个绝对路径，或者一个相对于该`配置文件`本身的相对路径。
     * publicDir 是静态资源服务的文件夹。可以是文件系统的绝对路径，也可以是相对于项目的根目录 `root` 的相对路径。
     * 
     * 启动时添加 --debug 参数可以查看完整 root 和 publicDir 路径
     * vite --debug
     * 
     * 因为我们更改了 `root` 的路径，为了避免路径混乱，后面的路径最好使用 `文件系统的绝对路径` 来表示
     * 并且因为 `outDir` 在根目录 `root` 之外，vite 会抛出一个警告(outDir is not inside project root and will not be emptied.)避免意外删除掉重要的文件
     * 我们可以设置 `build.emptyOutDir: true` 来关闭这个警告
     */
    root: `src/projects/${subProject}/`,
    publicDir: resolve(__dirname, 'public'),
    // base 会赋值给 import.meta.env.BASE_URL
    base: `/${subProject}/`,
    plugins: [vue()],
    build: {
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, `src/projects/${subProject}/index.html`),
        output: { dir: resolve(__dirname, `dist/${subProject}`) },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  });
};
