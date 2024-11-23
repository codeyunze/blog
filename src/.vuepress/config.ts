import {defineUserConfig} from "vuepress";
import { searchProPlugin } from "vuepress-plugin-search-pro";

import {commentPlugin} from "@vuepress/plugin-comment";

import theme from "./theme.js";

export default defineUserConfig({
    base: "/",

    lang: "zh-CN",
    title: "云泽知识库",
    description: "未来的变数太多，而我所能做的，就是走好当下这一步。",

    theme,

    // 和 PWA 一起启用
    // shouldPrefetch: false,

    head: [
        ['link', {rel: 'icon', href: '/assets/images/logo.png'}],
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
    plugins: [
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
        }),
        searchProPlugin({
            customFields: [
                {
                    indexContent: true,
                    indexOptions: {
                        // 使用 nodejs-jieba 进行分词
                        tokenize: (text, fieldName) =>
                            fieldName === "id" ? [text] : cut(text, true),
                    },
                    name: "author",
                    getter: (page) => page.frontmatter.author,
                    formatter: "作者：$content",
                },
            ],
        }),
    ]
});
