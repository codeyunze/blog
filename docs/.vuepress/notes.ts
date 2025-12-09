import { defineNoteConfig, defineNotesConfig } from 'vuepress-theme-plume'


const postgraduateNote = defineNoteConfig({
  // 声明笔记的目录，相对于 `postgraduate.dir`，这里表示 `notes/postgraduate` 目录
  dir: 'postgraduate',
  // 声明笔记的链接前缀，与 `notes.link` 拼接，这里表示 `/postgraduate/`
  // 笔记内的所有文章会以 `/postgraduate/` 作为访问链接前缀。
  link: '/postgraduate',
  // 配置 笔记侧边导航栏，用于导航向笔记内的所有文档
  // 声明为 `auto` 的，将根据目录结构自动生成侧边栏导航
  sidebar: 'auto'
})

const interviewNote = defineNoteConfig({
  dir: 'interview',
  link: '/interview',
  sidebar: 'auto'
})

export const notes = defineNotesConfig({
  dir: 'notes',
  link: '/',
  notes: [postgraduateNote, interviewNote],
})
