import { defineNavbarConfig } from 'vuepress-theme-plume'

export const navbar = defineNavbarConfig([
  { text: '首页', link: '/' },
  { text: '博客', link: '/blog/' },
  { text: '标签', link: '/blog/tags/' },
  { text: '归档', link: '/blog/archives/' },
  {
    text: '笔记',
    items: [
      { text: '考研', link: '/notes/postgraduate/README.md' }
      , { text: '赚钱', link: '/notes/random/README.md' }
      , { text: '友情链接', link: '/other/friends.md' }
    ]
  },
])
