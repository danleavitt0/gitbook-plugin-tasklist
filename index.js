var marked = require('marked')

var renderer = new marked.Renderer()
renderer.listitem = function (text) {
  if (/^\s*\[[x ]\]\s*/.test(text)) {
    text = text
      .replace(/^\s*\[ \]\s*/, '<input type="checkbox" class="task-list-item-checkbox"> ')
      .replace(/^\s*\[x\]\s*/, '<input type="checkbox" class="task-list-item-checkbox" checked> ')
    return '<li style="list-style: none">' + text + '</li>'
  } else {
    return '<li>' + text + '</li>'
  }
}

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

function getGroups (str) {
  var obj = {}
  var re = new RegExp('(\\d+)\\)\\s+([\\s\\S]*?)(?=(?:\\d+\\)|$))', 'g')
  var match = []
  while (match != null) {
    match = re.exec(str)
    if (match != null) {
      obj[match[1]] = match[2]
    }
  }
  return obj
}

function getRows (firstC, secondC) {
  var rows = []
  for (var row in firstC) {
    var second = ''
    if (secondC[row]) {
      second = '<div class="number">' + row + '</div>' + '<div class="content">' + marked(secondC[row]) + '</div>'
    }
    rows.push('<tr><td><div class="number">' + row + '</div><div class="content">' + marked(firstC[row]) + '</div></td><td class="second">' + second + '</td></tr>')
  }
  return rows.join('')
}

var palette = [
  '#b8674e',
  '#2baca5',
  '#f5aaa3',
  '#5b506d',
  '#e8f3ed'
]

module.exports = {
  website: {
    assets: './assets',
    css: [
      'github-markdown.css',
      'main.css'
    ]
  },
  blocks: {
    tlist: {
      process: function (block) {
        return marked(block.body)
      }
    },
    title: {
      process: function (block) {
        var title = block.kwargs.title
        var subtitle = block.kwargs.subtitle
        var color = block.kwargs.color
        return '<div style="background-color: ' +
        color +
        ';" class="page-title"><h2 class="page-title-text">' +
        title +
        '</h2><h4 class="page-subtitle-text">' +
        subtitle +
        '</h4></div><div class="space"></div>'
      }
    },
    table: {
      process: function (block) {
        var parts = block.body.split(',,,').map((parts, i) => getGroups(parts.replace(/\\/g, '')))
        var header1 = block.args[0] || 'Teacher Actions'
        var header2 = block.args[1] || 'Student Actions'
        return '<table class="action-table"><thead><tr><th>' +
        header1 +
        '</th><th class="second">' +
        header2 +
        '</th></thead><tbody>' +
        getRows(parts[0], parts[1]) +
        '</tbody></table>'
      }
    },
    header: {
      process: function (block) {
        var title = block.kwargs.title
        var icon = block.kwargs.icon
        return '<div class="section-header"><div class="icon ' +
        icon +
        '"></div><div class="title">' +
        title +
        '</div></div></div>'
      }
    },
    overviewSection: {
      process: function (block) {
        var title = block.kwargs.title
        var icon = block.kwargs.icon
        var hideHR = typeof (block.kwargs.hideHR) === 'undefined' ? false : block.kwargs.hideHR
        var color = palette[Math.floor(Math.random() * palette.length)]
        var display = hideHR ? 'none' : 'block'
        return '<div class="overview-section"><div class="icon ' +
        icon +
        '"></div><div class="title">' +
        title +
        '</div></div><hr style="margin-top: 1em; border: 1px solid ' +
        color +
        '; height:1px; display: ' +
        display +
        '"></hr>'
      }
    },
    length: {
      process: function (block) {
        var length = block.args[0]
        return '<div class="length-wrapper"><div class="icon agenda"></div><div class="text"><strong>Length: </strong>' +
        length +
        '</div></div>'
      }
    },
    activity: {
      process: function (block) {
        var length = block.kwargs.length
        var activityName = block.kwargs.activityName
        return '<div class="activity-header"><div class="activity-icon"></div><div class="activity"><div class="activity-number">' +
          activityName +
          '</div><div></div>' +
          marked(block.body) +
          '</div><div class="activity-length"><div class="length-icon"></div><span class="activity-length-header">length: </div>' +
          length +
          ' minutes</div></div>'
      }
    }
  }
}
