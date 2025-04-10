import { defineNoteConfig, defineNotesConfig } from 'vuepress-theme-plume'

const demoNote = defineNoteConfig({
  dir: 'demo',
  link: '/demo',
  sidebar: ['', 'foo', 'bar'],
})

const postgraduateNote = defineNoteConfig({
  dir: 'postgraduate',
  link: '/postgraduate',
  sidebar: 'auto'
})


const makeMoneyNote = defineNoteConfig({
  dir: 'random',
  link: '/random',
  sidebar: ['', '黄金交易'],
})

export const notes = defineNotesConfig({
  dir: 'notes',
  link: '/',
  notes: [postgraduateNote, demoNote, makeMoneyNote],
})
