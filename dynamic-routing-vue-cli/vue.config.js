const { defineConfig } = require('@vue/cli-service');

const subProject = process.env.PROJECT;

module.exports = defineConfig({
  outputDir: `dist/${subProject}`,
  publicPath: `/${subProject}/`,
});
