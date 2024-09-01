import { defineUserConfig } from "vuepress";
import { getDirname, path } from "vuepress/utils";
// import { searchProPlugin } from "vuepress-plugin-search-pro";


import theme from "./theme.js";
const __dirname = getDirname(import.meta.url);

export default defineUserConfig({
  base: "/blog/",

  lang: "zh-CN",
  title: "云泽的博客",
  description: "未来的变数太多，而我所能做的，就是走好当下这一步。",

  theme,

  alias: {
    "@theme-hope/modules/blog/components/BlogHero": path.resolve(
        __dirname,
        "./components/BlogHero.vue",
    ),
  },

  plugins: [
    // searchProPlugin({
    //   indexContent: true,
    //   hotReload: true
    // }),
  ],


  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
