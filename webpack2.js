(function (list) {
  function require(file) {
    console.log('%c%s', 'color: #00a3cc', file);
    var exports = {};
    (function (exports, code) {
      console.log('%c%s', 'color: #00e600', code);
      eval(code);

      console.log(exports);
    })(exports, list[file]);

    return exports;
  }

  var index = require('index.js');
  console.log('%c index = ⧭', 'color: #aa00ff', index);
})({
  'index.js': `var add = require('add.js').default;console.log(add(1, 4))`,
  'add.js': 'var a = 123; exports.default = function(a, b) { return a + b}',
});
