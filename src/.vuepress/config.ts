import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/blog/",

  lang: "zh-CN",
  title: "云泽的博客",
  description: "菜鸡的挣扎历程",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
