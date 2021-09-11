const { description } = require('../../package')
const sidebarConf = require('./nav')

// modify sidebar
// const sidebar = sidebarConf.map(s => {
//   return {
//     title: s.items[0]['text'],
//     path: s.items[0]['link'],
//   }
// });

// console.log(sidebar)

module.exports = {
  theme: 'yuu',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'Frequently Asked Questions',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: 'mlab817/faqs',
    editLinks: true,
    docsDir: 'src',
    docsBranch: 'main',
    editLinkText: 'Help us improve this page!',
    lastUpdated: false,
    nav: [],
    navbar: true,
    sidebar: sidebarConf,
    displayAllHeaders: true
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    [
      'flexsearch',
      {
        maxSuggestions: 10,
      }
    ],
    'vuepress-plugin-auto-sidebar',
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    '@vuepress/last-updated',
    [
      '@vuepress/google-analytics',
      {
        'ga': 'G-TNFTPXVML3' // UA-00000000-0
      }
    ]
  ]
}
