import {defineUserConfig} from "vuepress";
// import { searchProPlugin } from "vuepress-plugin-search-pro";
import { docsearchPlugin } from '@vuepress/plugin-docsearch'

import {commentPlugin} from "@vuepress/plugin-comment";

import theme from "./theme.js";
import {sitemapPlugin} from "@vuepress/plugin-sitemap";

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
        ['meta', {name: 'msvalidate.01', content: '0508C8F9658C27122ABCB4C8941A68F7'}],
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
        sitemapPlugin({hostname: "https://blog.3xj.club", sitemapFilename: "sitemap.xml"}
        ),
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
        docsearchPlugin({
            injectStyles: true,
            appId: "P1T06COSTD",
            apiKey: "7b3426f4f4464d6470219c00a07a5ac0",
            indexName: "3xj"
        })
        /*searchProPlugin({
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
        }),*/
    ]
});
