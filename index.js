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
  sanitize: false,
  smartLists: true,
  smartypants: false
})

function wrapStudentActions (str) {
  var re = new RegExp('(?:```student)([\\s\\S]*?)(```)', 'g')
  var match = []
  var newStr = str
  while (match != null) {
    match = re.exec(str)
    if (match != null) {
      newStr = newStr.replace(/(?:```student)([\s\S]*?)(```)/, '<div class="student-actions">' + marked(match[1]) + '</div>')
    }
  }
  return newStr
}

function getGroups (str) {
  var arr = []
  var re = new RegExp('(\\d+)\\)\\s+([\\s\\S]*?)(?=(?:[^\\w]\\d+\\)|$))', 'g')
  var match = []
  while (match != null) {
    match = re.exec(str)
    if (match != null) {
      arr.push('<div class="instruction"><div class="number">' +
        match[1] +
        '</div><div class="content">' +
        marked(match[2]) +
        '</div></div>'
      )
    }
  }
  return arr
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
  hooks: {
    'page': function (page) {
      page.content = page.content.replace(/(<a)(.*?)(?=.pdf)/g, '$1 target="_blank"$2')
      return page
    }
  },
  blocks: {
    tlist: {
      process: function (block) {
        return marked(block.body)
      }
    },
    studentActions: {
      process: function (block) {
        return '<div class="student-actions">' + marked(block.body) + '</div>'
      }
    },
    activityBody: {
      process: function (block) {
        var body = wrapStudentActions(block.body)
        var numberGroups = getGroups(body.replace(/\\/g, ''))
        return '<div class="activity-body">' + numberGroups.join('') + '</div>'
      }
    },
    link: {
      process: function (block) {
        var text = block.kwargs.text
        var link = block.kwargs.link

        return '<a href="' + link + '" target="_blank">' + text + '</a>'
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
    title: {
      process: function (block) {
        var title = block.kwargs.title
        var subtitle = block.kwargs.subtitle
          ? '<h4 class="page-subtitle-text">' + block.kwargs.subtitle + '</h4>'
          : ''
        var color = block.kwargs.color
        return '<div style="background-color: ' +
        color +
        ';" class="page-title"><h2 class="page-title-text">' +
        title +
        '</h2>' +
        subtitle +
        '</div><div class="space"></div>'
      }
    },
    table: {
      process: function (block) {
        var parts = block.body.split(',,,').map(function (parts, i) {
          return getGroups(parts.replace(/\\/g, ''))
        })
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
    header: activityHeader,
    activityHeader: activityHeader,
    overviewSection: overviewHeader,
    overviewHeader: overviewHeader
  }
}

var activityHeader = {
  process: function (block) {
    var title = block.kwargs.title
    var icon = block.kwargs.icon
    return '<div class="section-header"><div class="icon ' +
    icon +
    '"></div><div class="title">' +
    title +
    '</div></div></div>'
  }
}

var overviewHeader = {
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
}
