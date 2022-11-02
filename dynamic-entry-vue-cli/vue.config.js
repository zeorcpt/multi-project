const { defineConfig } = require('@vue/cli-service');

// 请注意，只有 NODE_ENV，BASE_URL 和以 VUE_APP_ 开头的变量将通过 webpack.DefinePlugin 静态地嵌入到客户端侧的代码中。
// 所以 process.env.PROJECT 这个变量是无法在客户端(浏览器)环境里访问的，这里能访问是因为vue.config.js被运行在node环境中
const subProject = process.env.PROJECT;

module.exports = defineConfig({
  pages: {
    index: {
      entry: `./src/projects/${subProject}/main.ts`,
    },
  },
  outputDir: `dist/${subProject}`,
  // 会被注入到 process.env.BASE_URL
  publicPath: `/${subProject}/`,

  // // 这种真正多入口会将每个入口(项目)打包在一起，不符合我们多项目的需求
  // pages: {
  //   'project-a': {
  //     entry: './src/projects/project-a/main.ts'
  //   },
  //   'project-b': {
  //     entry: './src/projects/project-b/main.ts'
  //   },
  // },
  // outputDir: 'dist',
  // publicPath: '/',
});
