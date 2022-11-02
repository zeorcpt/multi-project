低成本构建"类monorepo"项目

- [前言](#前言)
- [一、多页面应用(multi-page)模式(多入口、动态入口)](#一多页面应用multi-page模式多入口动态入口)
  - [基于 vue-cli (webpack) 构建](#基于-vue-cli-webpack-构建)
    - [1. 初始化](#1-初始化)
    - [2. 路由](#2-路由)
    - [3. 入口](#3-入口)
    - [4. 配置](#4-配置)
    - [5. 环境变量](#5-环境变量)
  - [基于 vite 构建](#基于-vite-构建)
    - [1. 入口](#1-入口)
    - [2. 配置](#2-配置)
  - [总结](#总结)
- [二、动态路由(dynamic-routing)模式(单入口、静态入口)](#二动态路由dynamic-routing模式单入口静态入口)
  - [基于 vite 构建](#基于-vite-构建-1)
    - [1. 入口](#1-入口-1)
    - [2. 路由](#2-路由-1)
    - [3. 配置](#3-配置)
  - [基于 vue-cli 构建](#基于-vue-cli-构建)
    - [1. 路由](#1-路由)
    - [2. 配置](#2-配置-1)
  - [总结](#总结-1)
- [三、npm 交互式命令启动项目](#三npm-交互式命令启动项目)
  - [精简优化命令](#精简优化命令)
  - [交互式命令](#交互式命令)


# 前言

假如有这样一个场景，不同的业务方向都对应着一个项目，这些项目的基本框架(包括登录、菜单、样式风格等)都相同，只有具体的业务内容不同，这个时候该怎么合理、高效地管理项目呢？

很多人会第一时间想到 `monorepo`，是的，monorepo 是一个非常好的解决方案。但我就是不用，哎，就是玩儿～我们不妨尝试换一种低成本方案来构建项目😏

项目示例在这里 [github](https://github.com/zeorcpt/multi-project)

# 一、多页面应用(multi-page)模式(多入口、动态入口)

多页面应用即拥有多个入口的应用，每个 'page' 对应一个入口。我们可以将这里的 'page' 替换成我们的 'project'，`每个项目对应一个入口`。

## 基于 vue-cli (webpack) 构建

### 1. 初始化

1.1 创建项目

```sh
npx @vue/cli create multi-project-vue-cli
```

1.2 创建子项目文件夹

创建 **src/projects** 文件夹，在 projects 下分别创建文件夹 project-a、project-b 作为子项目

### 2. 路由

2.1 安装路由

```sh
npm i vue-router@4
```

2.2 配置路由

创建 **src/pages** 文件夹作为公共页面，创建 **src/routes** 文件夹作为公共路由

```ts
// src/routes/index.ts

import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('../pages/index.vue'),
  },
];

export default routes;
```

分别在 project-a、project-b 下创建 **pages** 文件夹作为每个子项目的页面，创建 **router** 文件夹作为每个子项目的路由

```ts
// src/projects/project-a/router/routes.ts

import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/page',
    component: () => import('../pages/page.vue'),
  },
];

export default routes;
```

```ts
// src/projects/project-a/router/index.ts

import { createRouter, createWebHistory } from 'vue-router';
import commonRoutes from '@/routes';
import routes from './routes';

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [...commonRoutes, ...routes],
});

export default router;
```

### 3. 入口

因为每个子项目都有一个`独立的入口`，所以将原本项目的入口 **src/main.ts** 删除，在每个子项目下分别创建 **main.ts** 入口

```ts
// src/projects/project-a/main.ts

import { createApp } from 'vue'
import App from '@/App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
```

### 4. 配置

在 **vue.config.js** 中我们需要进行多页面的配置

```js
// vue.config.js

const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  pages: {
    'project-a': {
      entry: './src/projects/project-a/main.ts'
    },
    'project-b': {
      entry: './src/projects/project-b/main.ts'
    },
  },
  outputDir: 'dist',
  publicPath: '/',
});
```

如果这样配置，那么打包后的 project-a、project-b 是混在一个项目里的，成了一个真正的多页面应用。但是我们要的结果是每个子项目是独立的，所以我们需要想个办法，每次打包只生成一个独立的子项目。也就是说 pages 属性里同时只有一个入口，打包时通过外部传值，来动态改变这个入口。

```js
// 修改后的 vue.config.js

const { defineConfig } = require('@vue/cli-service');

const subProject = process.env.PROJECT;

module.exports = defineConfig({
  pages: {
    index: {
      entry: `./src/projects/${subProject}/main.ts`,
    },
  },
  outputDir: `dist/${subProject}`,
  publicPath: `/${subProject}/`,
});
```

分析一下：

打包时传入环境变量 `process.env.PROJECT`，值为子项目(文件夹)的名称，通过环境变量来确定入口的路径，并且打包输出到不同的文件夹下

> 顺带一提：
> 
> `publicPath` 会由vue-cli注入到 `process.env.BASE_URL` ，在路由配置里有用到这个值：createWebHistory(process.env.BASE_URL)
> 
> 只有 NODE_ENV，BASE_URL 和以 VUE_APP_ 开头的变量将通过 webpack.DefinePlugin 静态地嵌入到客户端侧的代码中
> 
> 所以 `process.env.PROJECT` 这个变量是无法在客户端(浏览器)环境里访问的，这里能访问是因为vue.config.js被运行在node环境中。并且 process.env.PROJECT 通过 publicPath 传递给了 process.env.BASE_URL，从而能在 router 中获取到。
> 
> 或者将变量设置为 `VUE_APP_PROJECT`，那么就能在任意地方通过 process.env.VUE_APP_PROJECT 访问了

### 5. 环境变量

前面提到，需要在构建时传入一个环境变量

```json
// package.json

{
  "scripts": {
    "serve:project-a": "cross-env PROJECT=project-a vue-cli-service serve",
    "build:project-a": "cross-env PROJECT=project-a vue-cli-service build",
    "serve:project-b": "cross-env PROJECT=project-b vue-cli-service serve",
    "build:project-b": "cross-env PROJECT=project-b vue-cli-service build",
  },
}
```

## 基于 vite 构建

基于vite的实现主要的区别是配置文件 vite.config.ts 和 模板文件 index.html

### 1. 入口

首先看vite官方文档: [index.html 与项目根目录](https://cn.vitejs.dev/guide/#index-html-and-project-root)

> 在一个 Vite 项目中，index.html 在项目最外层而不是在 public 文件夹内
> 
> 在开发期间 Vite 是一个服务器，而 index.html 是该 Vite 项目的入口文件

由此得知：**vite项目的入口文件是 index.html，而不是 vue-cli(webpack) 项目的 main.ts**

我们这个方案是每个子项目都有一个入口，vue-cli 的实现是每个子项目都有一个 main.ts，而这里基于vite的实现我们需要给每个子项目添加一个 index.html 入口，以及 main.ts

将项目根目录的 index.html 以及 src 下的 main.ts 移至每个子项目下，并且修改 index.html 中引入 main.ts 的路径：
```html
<!-- src/projects/project-a/index.html -->

<script type="module" src="./main.ts"></script>
```

### 2. 配置

```ts
// vite.config.ts

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default ({ command, mode }) => {
  const subProject = process.env.PROJECT;
  return defineConfig({
    root: `src/projects/${subProject}/`,
    base: `/${subProject}/`,
    plugins: [vue()],
    build: {
      rollupOptions: {
        input: `src/projects/${subProject}/index.html`,
        output: { dir: `dist/${subProject}` },
      },
    },
  });
};
```

+ root 是项目根目录（index.html 文件所在的位置）。可以是一个绝对路径，或者一个相对于该`配置文件`本身的相对路径。
+ base 类似 vue-cli 配置中的 publicPath，会被 vite 注入到 `import.meta.env.BASE_URL`，同样的只有 `VITE_`SOME_KEY 会被暴露为 import.meta.env.VITE_SOME_KEY 提供给客户端源码
+ rollupOptions 即 vite 版的多页面(入口)配置项

到这里，其实还是有点问题的

首先是 public 文件夹的路径不对，会导致引用 public 资源错误：
publicDir 默认是 `root/public`，在我们的配置里，root 为 `src/projects/${subProject}/`，而我们的 public 目录是放在 `工作空间根目录` 下

[vite配置-publicDir](https://cn.vitejs.dev/config/shared-options.html#publicdir)

> publicDir 是静态资源服务的文件夹。可以是文件系统的绝对路径，也可以是相对于项目的根目录 `root` 的相对路径
> 
> publicDir 的真实路径在开发阶段可以通过在启动命令添加参数`--debug`，然后在控制台查看  

因为我们更改了 `root` 的路径，为了避免路径混乱，后面的路径最好使用 `文件系统的绝对路径` 来表示

并且因为 `outDir` 在根目录 `root` 之外，vite 会抛出一个警告(outDir is not inside project root and will not be emptied.)避免意外删除掉重要的文件，我们可以设置 `build.emptyOutDir: true` 来关闭这个警告

```ts
// 修改后的 vite.config.ts

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default ({ command, mode }) => {
  const subProject = process.env.PROJECT;
  return defineConfig({
    root: `src/projects/${subProject}/`,
    publicDir: resolve(__dirname, 'public'),
    base: `/${subProject}/`,
    plugins: [vue()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, `src/projects/${subProject}/index.html`),
        output: { dir: resolve(__dirname, `dist/${subProject}`) },
      },
    },
  });
};
```

有木有感觉在vite中改变入口文件是一件很麻烦的事呢😅 (后面会进行优化🤫)


## 总结

回顾上面的实现步骤，有用到多页面应用(multi-page)吗？有，但只有一点点🤏

基于vue-cli实现中步骤1、2、3都跟多页面没啥关系，关键的步骤4，多页面的配置，也只是借用了多页面应用中可以自定义入口文件的能力。vite实现中[多页面的配置](https://cn.vitejs.dev/guide/build.html#multi-page-app) 本身就是通过rollup修改入口实现的。如果vue-cli中通过 `configureWebpack` 来修改项目的入口，那么可以说这种方案跟多页面应用一毛钱关系都没有，引入多页面应用的概念只是为了帮助理解🤪

所以这个方案更确切的名称应该是 `动态入口(dynamic-entry)模式`

这个方案，只适用于子项目之间是**相似**的，“**重复**”的。不同业务的页面、api、组件等可以放在 `projects/${subProject}` 下方，其他公共组件、公共api、框架相关、公共方法等都可以放在 `src` 下方。和 **monorepo** 方案相比，所有子项目共用一个 `package.json`，耦合度更高，对有不同版本第三方包使用需求的
不太友好(虽然也有办法解决，比如自定义包名来安装不同版本😏)。

# 二、动态路由(dynamic-routing)模式(单入口、静态入口)

前面我们讲到 `多页面应用(multi-page)模式` 应该叫做 `动态入口(dynamic-entry)模式`。动态入口模式的入口是在子项目，路由也是在子项目中再引入公共路由，可以理解为这是一种 `自下而上` 的模式。那么如果换一种相反的思路呢？只有一个入口，并且入口是静态的，固定的，路由(router)也是只有一个，但是路由表(routes)是动态的。简单说就是 router 根据不同的配置，去加载不同子项目的 routes。这是一种`自上而下`的方式，也就是这一节要讲的 `动态路由(dynamic-routing)模式`。

## 基于 vite 构建

### 1. 入口

和`动态入口(dynamic-entry)模式`不同的是，入口文件 `index.html` 在**根目录**，`main.ts` 在 **src** 下

```html
<!-- index.html -->

<script type="module" src="/src/main.ts"></script>
```

```ts
// src/main.ts

import { createApp } from 'vue'
import App from '@/App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
```

### 2. 路由

`子路由表(routes)` 在子项目目录下: 
```ts
// src/projects/project-a/routes/index.ts

import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/page',
    component: () => import('../pages/page.vue'),
  },
]

export default routes;
```

重点是在`路由(router)`中动态引入子项目路由表，先上结果：
```ts
// src/router/index.ts

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
```

[vite: Glob 导入](https://cn.vitejs.dev/guide/features.html#glob-import)

通过 Glob 导入所有子项目的路由表(routes)，然后根据传进来的子项目名(process.env.PROJECT)进行匹配，最后跟公共路由 commonRoutes 合并。

到这里还有个问题，因为我们是将所有子项目的路由模块都导入了的，打包时会将所有子项目的页面都给打包到一个项目里，恐怖如斯😱 我们进行一个小改动，在子项目路由模块里判断是否是当前子项目，否则返回空数组，利用 tree-shaking 剔除掉非当前子项目路由模块。

```ts
// 修改后的 src/projects/project-a/routes/index.ts

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
```

### 3. 配置

动态路由这种模式的配置文件就比较简单了，因为是只有一个入口，和普通项目无二，只是改下 base 和 outDir：

```ts
// vite.config.ts

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
```

## 基于 vue-cli 构建

同样的，动态路由这种模式的入口和普通项目一样，仅需要更改`路由(router)` 和 `vue.config.js`

### 1. 路由

和 vite 实现里的路由配置不同的是，这里使用 webpack 的 `require` 语法动态导入模块，require 是支持变量的，所以不需要像 vite 那样先导入所有模块再去匹配，打包后也不会将所有子项目页面给打包进去，所以也不需要在子项目的路由表(routes)中进行特殊处理

```ts
// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router';
import commonRoutes from './routes';

const modules = require(`/src/projects${process.env.BASE_URL}routes/index.ts`)

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [...commonRoutes, ...modules.default],
});

export default router;
```

### 2. 配置

因为不需要修改项目入口，自然也不需要用到多页面的配置了，只需要修改 `outputDir` 和 `publicPath`

```js
// vue.config.js

const { defineConfig } = require('@vue/cli-service');

const subProject = process.env.PROJECT;

module.exports = defineConfig({
  outputDir: `dist/${subProject}`,
  // 会被注入到 process.env.BASE_URL
  publicPath: `/${subProject}/`,
});
```
## 总结

`动态路由(dynamic-routing)`模式：

+ 是一种`自上而下`的模式
+ 简单，主要修改路由和配置文件
+ 耦合度高，子项目只有路由表(routes)可修改

`动态入口(dynamic-entry)`模式：

+ 是一种`自下而上`的模式
+ 稍繁琐，需要修改入口，并且重复性地将入口放置在每个子项目下
+ 耦合度稍低，每个子项目都有自己的入口，可进行一些有限的自定义修改

总的来说，这两种模式都是一个 `超低成本` 构建多项目的方案，非常适合快速构建规模较小的多项目平台。但是也有其局限性，耦合度很高，仅适合子项目之间具有高“相似性”的项目。
# 三、npm 交互式命令启动项目

前面 `动态路由(dynamic-routing)模式` 和 `动态入口(dynamic-entry)模式` 两种实现方式中，都需要通过命令传入子项目名作为环境变量，试想一下，假如我们有好多个子项目，拿 vite 项目举例，那么我们的 package.json 中 scripts 可能是这样的：

```json
// package.json

{
  "scripts": {
    "dev:project-a": "cross-env PROJECT=project-a vite",
    "build:project-a": "vue-tsc && cross-env PROJECT=project-a vite build",
    "dev:project-b": "cross-env PROJECT=project-b vite",
    "build:project-b": "vue-tsc && cross-env PROJECT=project-b vite build",
    "dev:project-c": "cross-env PROJECT=project-c vite",
    "build:project-c": "vue-tsc && cross-env PROJECT=project-c vite build",
    ...
  }
}
```

这也太不优雅了吧😱，我们来进行一些改造

## 精简优化命令

前置知识：[【从入门到提桶】package.json 之 npm run scripts 命令传参](https://juejin.cn/post/7156122369109524494)

```json
// package.json

{
  "scripts": {
    "dev": "cross-env PROJECT=$npm_config_project vite",
    "build": "vue-tsc && cross-env PROJECT=$npm_config_project vite build",
    "dev:project-a": "npm run dev --project=project-a",
    "build:project-a": "npm run build --project=project-a",
    "dev:project-b": "npm run dev --project=project-b",
    "build:project-b": "npm run build --project=project-b",
    "dev:project-c": "npm run dev --project=project-c",
    "build:project-c": "npm run build --project=project-c",
    ...
  }
}
```

通过设置基础命令 dev 和 build，再让其他命令根据这两个命令进行传参，达到设置不同环境变量的效果。看起来是不是优雅了很多呢😂

不过这样还是显得有些繁琐，运行命令时需要手动输入项目名，很容易输错导致运行失败。偷懒是第一生产力，我们可以写一个交互式命令，输入命令后，只需通过键盘选择需要运行的项目即可，方便又不会出错😁

## 交互式命令

我们需要用到一个库：[Inquirer.js](https://github.com/SBoudrias/Inquirer.js)

有很多交互式命令的库，相对来说 Inquirer.js 是比较简单易用又小巧的

1. 安装

```sh
npm i inquirer
```

2. 根目录创建启动文件

```js
// cli.js

import inquirer from 'inquirer';
import { execSync } from 'child_process';

const projects = [
  'project-a',
  'project-b',
  'project-c',
  'project-d',
  'project-e',
  'project-f',
];

const command = process.argv[2];

if (!command) {
  inquirer
    .prompt([
      {
        type: 'rawlist',
        message: `选择要执行的命令`,
        name: 'command',
        choices: ['run dev', 'run build'],
      },
      {
        type: 'rawlist',
        message: `选择一个项目`,
        name: 'project',
        choices: projects,
      },
    ])
    .then((answers) => {
      execSync(`npm ${answers.command} --project=${answers.project}`, { stdio: 'inherit' });
    })
    .catch((error) => {
      console.log(error);
    });
} else {
  inquirer
    .prompt([
      {
        type: 'rawlist',
        message: `选择一个项目 run ${command}`,
        name: 'project',
        choices: projects,
      },
    ])
    .then((answers) => {
      execSync(`npm run ${command} --project=${answers.project}`, { stdio: 'inherit' });
    })
    .catch((error) => {
      console.log(error);
    });
}

```

+ process.argv

[nodejs: process.argv](https://nodejs.org/api/process.html#processargv)

`process.argv` 属性返回一个数组，这个数组包含了启动 Node.js 进程时的命令行参数。第一个元素为 `process.execPath`。第二个元素为当前执行的 JavaScript 文件路径。剩余的元素为其他命令行参数。

`process.argv[2]` 为 "node [file] [arg1] [arg2]" 中的第一个参数，即 `[arg1]` 。所以在 "node cli.js dev" 这个命令中，process.argv[2] 即为 `dev`

我们根据 "node cli.js [command]" 中传入的命令参数 `command` 判断是否指定 `run dev` or `run build`，如没有指定，则让用户选择以哪个命令启动

+ inquirer.prompt

`type`: 表示提问的类型，包括：input, confirm, list(无序单选), rawlist(有序单选), expand, checkbox(多选), password, editor

`message`: 问题的描述，引导词

`name`: 定义当前问题回答的变量，存储在 answers 对象中

`choices`: 列表选项

inquirer.prompt 返回一个 `promise`，所以用 `.then`, `.catch` 进行后续的处理

+ execSync

[nodejs: child_process.execSync](https://nodejs.org/api/child_process.html#child_processexecsynccommand-options)

exec 方法用于执行 shell 命令，execSync 是 exec 的**同步执行**版本。

1. 完善 scripts

```json
// package.json

{
  "scripts": {
    "//": "手动运行命令: npm run dev --project=project-a",
    "dev": "cross-env PROJECT=$npm_config_project vite",
    "build": "vue-tsc && cross-env PROJECT=$npm_config_project vite build",
    "//cli": "交互式命令: npm start",
    "start": "node cli.js",
    "start:dev": "node cli.js dev",
    "start:build": "node cli.js build",
  }
}
```

4. 演示

```
npm start


? 选择要执行的命令
  1) run dev
  2) run build
  Answer:


? 选择要执行的命令 run dev
? 选择一个项目
  1) project-a
  2) project-b
  3) project-c
  4) project-d
(Move up and down to reveal more choices)
  Answer:
```

分析一下：

+ 当我们执行 `"npm start"` 时，匹配到脚本，继续执行 `"node cli.js"`
+ 执行 `cli.js`，`process.argv[2]` 为 `undefined`，进入 if {}
+ 用户 **选择要执行的命令**，得到第一个问题的结果，存入 `answers.command`，继续 **选择一个项目**，得到第二个问题的结果，存入 `answers.project`，问题结束
+ 将 answers 中的 command 和 project 取出，执行 `"npm run ${command} --project=${answers.project}"`，如最终执行命令为: "npm run dev --project=project-a"

若执行 `"npm run start:dev "` 则 `process.argv[2]` 为 `dev`，进入 else {}，跳过了第一步 选择要执行的命令 ，直接进入 **选择一个项目** 😌
