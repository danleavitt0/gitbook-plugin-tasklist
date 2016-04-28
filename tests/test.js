var tester = require('gitbook-tester')
var test = require('tape')

test('it should build', function (t) {
  tester.builder()
    .withContent('# Test Me \n\n {% tlist %} - [ ] stuff\n - morethings{% endtlist %}')
    .withLocalPlugin(require('path').join(__dirname, '..'))
    .create()
    .then(function (result) {
      var index = result.get('index.html').content
      console.log(index)
      t.ok(index)
      t.end()
    })
})
