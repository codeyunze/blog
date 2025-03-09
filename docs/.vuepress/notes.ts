import { defineNoteConfig, defineNotesConfig } from 'vuepress-theme-plume'

const demoNote = defineNoteConfig({
  dir: 'demo',
  link: '/demo',
  sidebar: ['', 'foo', 'bar'],
})

const makeMoneyNote = defineNoteConfig({
  dir: 'makemoney',
  link: '/makemoney',
  sidebar: ['', '黄金交易'],
})

export const notes = defineNotesConfig({
  dir: 'notes',
  link: '/',
  notes: [demoNote, makeMoneyNote],
})
