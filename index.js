var types = require('babel-types');
var template = require('babel-template');

function findOptionFromSource(source, state) {
  const rules = state.opts.rules
  // @param source - the module being imported
  if (rules[source]) return rules[source]

  for (let rule of rules) {
    if (rule.match) {
      if (RegExp(rule.match).test(source)) return rule
    }
  }
  return null
}

module.exports = function() {
  return {
    visitor: {
      ImportDeclaration: function (path, state) {
        const source = path.node.source.value;
        const optionObject = findOptionFromSource(source, state);
        if (! optionObject) return
        
        const optname = optionObject.match
        const opt = optionObject
        
        if (opt) {
          var transforms = [];
          // could also use e.g. types.isImportDefaultSpecifier(s)
          var defaultImports = path.node.specifiers.filter(s => s.type === 'ImportDefaultSpecifier')
          var memberImports = path.node.specifiers.filter(s => s.type === 'ImportSpecifier')
          var starImports = path.node.specifiers.filter(s => s.type === 'ImportNamespaceSpecifier')
          if (opt.replace) {
            // option to replace a regexp match
            path.node.source.extra.raw = path.node.source.extra.raw.replace( RegExp(optname), (_,b) => opt.replace )
          }
          
          if (opt.fromGlobal) {
            for (let imp of starImports) {
              const fromModule = path.node.source.value // e.g. from 'react-redux'
              const importAs = imp.local.name // e.g. * as ReactRedux

              if (opt.fromGlobal === importAs) {
                // already have it defined as a global so do nothing
              } else {
                let str = `const ${importAs} = ${opt.fromGlobal};`
                let ast = template(str)({})
                transforms.push( ast )
              }
            }
            for (let imp of memberImports) {
              let str = `const {${imp.local.name}} = ${opt.fromGlobal};`
              let ast = template(str)({})
              transforms.push( ast )
            }

            for (let imp of defaultImports) {
              if (imp.local.name === opt.fromGlobal) {
                // already have it defined as a global so do nothing
              } else {
                let t
                if (opt.propertyImport) {
                  // if you are using a global UMD module that publishes a single
                  // object that you now have to import properties from
                  t = template(`const {${imp.local.name}} = ${opt.fromGlobal};`)
                } else {
                  t = template(`const ${imp.local.name} = ${opt.fromGlobal}.default;` )
                }

                let ast = t({})
                transforms.push( ast )
              }
            }
            path.replaceWithMultiple(transforms);
          }
        }
      }
    }
  }
}
