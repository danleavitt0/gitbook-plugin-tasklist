var marked = require('marked')

var renderer = new marked.Renderer()
renderer.listitem = function (text) {
  if (/^\s*\[[x ]\]\s*/.test(text)) {
    text = text
    .replace(/^\s*\[ \]\s*/, '<i class="empty checkbox icon"></i> ')
    .replace(/^\s*\[x\]\s*/, '<i class="checked checkbox icon"></i> ')
    return '<li style="list-style: none">' + text + '</li>'
  } else {
    return '<li>' + text + '</li>'
  }
}

module.exports = {
  website: {
    assets: './assets',
    css: [
      'github-markdown.css'
    ]
  },
  blocks: {
    tlist: {
      process: function (block) {
        marked.setOptions({
          renderer: renderer,
          gfm: true,
          tables: true,
          breaks: false,
          pedantic: false,
          sanitize: true,
          smartLists: true,
          smartypants: false
        })
        return marked(block.body)
      }
    }
  }
}
