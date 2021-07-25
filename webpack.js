const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');

/**
 * 单独解析一个模块
 * @param {*} file
 * @returns
 */
function getModuleInfo(file) {
  console.log('%c file = %s', 'color: #e50000', file);
  // 读取文件
  const body = fs.readFileSync(file, 'utf-8');

  // 转化AST语法树
  const ast = parser.parse(body, {
    sourceType: 'module', //表示我们要解析的是ES模块
  });

  const deps = {};

  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(file);
      const abspath = './' + path.join(dirname, node.source.value);
      deps[node.source.value] = abspath;
    },
  });

  // es6 => es5
  const { code } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env'],
  });

  const moduleInfo = { file, deps, code };
  return moduleInfo;
}

// const info = getModuleInfo('./src/index.js');
// console.log('info:', info);

/**
 * 从入口文件开始解析
 * @param {*} file
 * @returns
 */
function parseModules(file) {
  const entry = getModuleInfo(file);
  console.log('%c entry: ⧭', 'color: #1d5673', entry);

  const temp = [entry];
  const depsGraph = {};

  getDeps(temp, entry);
  console.log('%c temp = ⧭', 'color: #f200e2', temp);

  temp.forEach((moduleInfo) => {
    depsGraph[moduleInfo.file] = {
      deps: moduleInfo.deps,
      code: moduleInfo.code,
    };
  });

  console.log('%c depsGraph = ⧭', 'color: #00b300', depsGraph);
  return depsGraph;
}

/**
 * 获取依赖
 * @param {*} temp
 * @param {*} param1
 */
function getDeps(temp, { deps }) {
  Object.keys(deps).forEach((key) => {
    const child = getModuleInfo(deps[key]);
    temp.push(child);
    getDeps(temp, child);
  });
}

// const content = parseModules('./src/index.js');
// console.log('content', content);

function bundle(file) {
  const depsGraph = JSON.stringify(parseModules(file));
  return `(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath])
            }
            var exports = {};
            (function (require,exports,code) {
                eval(code)
            })(absRequire,exports,graph[file].code)
            return exports
}
        require('${file}')
    })(${depsGraph})`;
}

const content = bundle('./src/index.js');

!fs.existsSync('./dist') && fs.mkdirSync('./dist');
fs.writeFileSync('./dist/bundle.js', content);
