var exports = {};

(function (exports, code) {
  eval(code);
})(exports, 'var a = 123; exports.default = function(a, b) { return a + b};');

console.log(exports.default(2, 4));

console.log('a ', a);
