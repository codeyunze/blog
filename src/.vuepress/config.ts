import {defineUserConfig} from "vuepress";
import {getDirname, path} from "vuepress/utils";


import theme from "./theme.js";
// import {searchProPlugin} from "vuepress-plugin-search-pro";
import {commentPlugin} from "@vuepress/plugin-comment";



const __dirname = getDirname(import.meta.url);

export default defineUserConfig({
    base: "/blog/",

    lang: "zh-CN",
    title: "云泽的博客",
    description: "未来的变数太多，而我所能做的，就是走好当下这一步。",

    head: [
        ['link', { rel: 'icon', href: '/assets/images/logo.png' }],
        [
            'script',
            {},
            `
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?2fd99d976725726aa14c048b48dd2338";
              var s = document.getElementsByTagName("script")[0]; 
              s.parentNode.insertBefore(hm, s);
            })();
            `
        ]
    ],

    theme,

    alias: {
        "@theme-hope/modules/blog/components/BlogHero": path.resolve(
            __dirname,
            "./components/BlogHero.vue",
        ),
    },

    plugins: [
        /*comment({
            provider: 'Giscus',
            repo: "yunze-gh/blog",
            repoId: "R_kgDOMo44_A",
            category: "General",
            categoryId: "DIC_kwDOMo44_M4CiKOl",
            mapping: "title",
            strict: false,
            reactionsEnabled: true,
            inputPosition: "top"
        }),*/
       /* searchProPlugin({
          indexContent: true,
        //   hotReload: true
        }),*/
        commentPlugin({
            provider: 'Giscus',
            repo: "yunze-gh/blog",
            repoId: "R_kgDOMo44_A",
            category: "General",
            categoryId: "DIC_kwDOMo44_M4CiKOl",
            mapping: "title",
            strict: false,
            reactionsEnabled: true,
            inputPosition: "top"
        })
    ],


    // 和 PWA 一起启用
    // shouldPrefetch: false,
});
