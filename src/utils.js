const types = require("@babel/types");
const traverse = require('@babel/traverse').default;
const parser = require('@babel/parser');
const fs = require('fs');
const generate = require('@babel/generator').default;


function prehandler (code) {
  const sourceAST = parser.parse(code, {
    allowReturnOutsideFunction: true
  })
  const contextASTBody = []
  const contextAST = types.program(contextASTBody)
  this.flattenCallChain(sourceAST);

  const decryptNames = []

  // jsjiami.com.v5.js特征: 全局超长数组, 被引用2次, 一次作为形参，一次作为变量
  if (decryptNames.length <= 0) {
    traverse(sourceAST, {
      VariableDeclarator (path) {
        const init = path.node.init
        if (types.isArrayExpression(init) && init.elements.length > 25) {
          const nodeId = path.node.id
          if (!types.isIdentifier(nodeId)) {
            console.log('path.node.id不是Identifier, 不满足jsjiami.com.v5.js特征')
            return
          }
          const binding = path.scope.getBinding(nodeId.name)
          if (!binding) {
            console.log(`path.node.id.name: ${nodeId.name}找不到引用关系, 不满足jsjiami.com.v5.js特征`)
            return
          }
          const referencePaths = binding.referencePaths
          if (referencePaths.length !== 2) {
            console.log(`path.node.id.name的引用关系为${referencePaths.length}, 不满足jsjiami.com.v5.js特征`)
            return
          }
          for (let i = 0; i < path.node.init.elements.length; i++) {
            const element = path.node.init.elements[i];
            if(types.isIdentifier(element)) {
              let binding = path.scope.getBinding(element.name);
              if (binding && types.isVariableDeclarator(binding.path.node)) {
                contextAST.body.push(binding.path.parentPath.node) // 数组依赖变量
              }
            }
          }
          // 词典
          let obfuscateDictPath = path.parentPath
          let decryptTypePath = null
          const decryptFunPaths = [];
          if (types.isStatement(obfuscateDictPath.node)) {
            contextAST.body.push(obfuscateDictPath.node)
          }

          for (let referencePath of referencePaths) {
            // 函数形参
            if (referencePath.isIdentifier() && referencePath.parentPath?.isCallExpression()) {
              // 混淆函数
              const rootPath = referencePath.findParent((p) => p.isExpressionStatement())
              if (rootPath?.isExpressionStatement()) {
                decryptTypePath = rootPath;
                contextAST.body.push(decryptTypePath.node)
              }
            }
            // 加密函数中的变量
            if (referencePath.isIdentifier() && referencePath.parentPath?.isMemberExpression()) {
              // 加密函数
              const rootPath = referencePath.findParent((p) => p.isFunctionExpression())?.findParent((p) => p.isVariableDeclaration())
              if (rootPath?.isVariableDeclaration()) {
                decryptFunPaths.push(rootPath);
                decryptNames.push(rootPath.node.declarations[0].id.name);
                contextAST.body.push(rootPath.node)
              }
            }
          }
          if (contextAST.body.length >= 3 && obfuscateDictPath && decryptTypePath
            // decryptFunPath?.isVariableDeclaration() && types.isIdentifier(decryptFunPath.node.declarations[0].id)
          ) {
            console.log('加密方式: 符合jsjiami.com.v5.js特征')
            obfuscateDictPath.remove()
            decryptTypePath.remove()
            decryptFunPaths.forEach(p => p.remove());
            path.stop()
          } else {
            console.log('加密方式: 不符合jsjiami.com.v5.js特征')
          }
        }
      }
    })
  }

  // jsjiami.com.v6.js特征: 全局超长数组, 被引用4次, 一次作为形参，一次作为变量
  if (decryptNames.length <= 0) {
    traverse(sourceAST, {
      VariableDeclarator (path) {
        const init = path.node.init
        if (types.isArrayExpression(init) && init.elements.length > 25) {
          const nodeId = path.node.id
          if (!types.isIdentifier(nodeId)) {
            console.log('path.node.id不是Identifier, 不满足jsjiami.com.v6.js特征')
            return
          }
          const binding = path.scope.getBinding(nodeId.name)
          if (!binding) {
            console.log(`path.node.id.name: ${nodeId.name}找不到引用关系, 不满足jsjiami.com.v6.js特征`)
            return
          }
          const referencePaths = binding.referencePaths
          if (referencePaths.length !== 4) {
            console.log(`path.node.id.name的引用关系为${referencePaths.length}, 不满足jsjiami.com.v6.js特征`)
            return
          }
          for (let i = 0; i < path.node.init.elements.length; i++) {
            const element = path.node.init.elements[i];
            if(types.isIdentifier(element)) {
              let binding = path.scope.getBinding(element.name);
              if (binding && types.isVariableDeclarator(binding.path.node)) {
                contextAST.body.push(binding.path.parentPath.node) // 数组依赖变量
              }
            }
          }
          // 词典
          let obfuscateDictPath = path.parentPath
          let decryptTypePath = null
          const decryptFunPaths = []
          if (types.isStatement(obfuscateDictPath.node)) {
            contextAST.body.push(obfuscateDictPath.node)
          }

          for (const referencePath of referencePaths) {
            // 函数形参
            if (referencePath.isIdentifier() && referencePath.parentPath?.isCallExpression()) {
              // 混淆函数
              const rootPath = referencePath.findParent((p) => p.isCallExpression())?.findParent((p) => p.isIfStatement())
              if (rootPath?.isIfStatement()) {
                decryptTypePath = rootPath;
                contextAST.body.push(decryptTypePath.node)
              }
            }
            // 加密函数中的变量
            if (referencePath.isIdentifier() && referencePath.parentPath?.isMemberExpression()) {
              // 加密函数
              const rootPath = referencePath.findParent((p) => p.isFunctionDeclaration())
              if (rootPath?.isFunctionDeclaration()) {
                decryptFunPaths.push(rootPath);
                decryptNames.push(rootPath.node.id.name);
                contextAST.body.push(rootPath.node)
              }
            }
          }

          if (contextAST.body.length >= 3 && obfuscateDictPath && decryptTypePath
            // decryptFunPath?.isFunctionDeclaration() && types.isIdentifier(decryptFunPath.node.id)
          ) {
            console.log('加密方式: 符合jsjiami.com.v6.js特征')
            obfuscateDictPath.remove()
            decryptTypePath.remove()
            decryptFunPaths.forEach(p => p.remove());
            path.stop()
          } else {
            console.log('加密方式: 不符合jsjiami.com.v6.js特征')
          }
        }
      }
    })
  }

  // jsjiami.com.v7.js特征: 函数包裹超长数组
  if (decryptNames.length <= 0) {
    traverse(sourceAST, {
      ArrayExpression (path) {
        // 词典
        const obfuscateDictPath = path.findParent(p => p.isFunctionDeclaration());
        if(obfuscateDictPath && path.node.elements.length > 25) {
          if(!obfuscateDictPath?.isFunctionDeclaration()) {
            console.log('超长数组不在函数的包裹下, 不满足jsjiami.com.v7.js特征')
            return;
          }
          for (let i = 0; i < path.node.elements.length; i++) {
            const element = path.node.elements[i];
            if(types.isIdentifier(element)) {
              let binding = path.scope.getBinding(element.name);
              if (binding && types.isVariableDeclarator(binding.path.node)) {
                contextAST.body.push(binding.path.parentPath.node) // 数组依赖变量
              }
            }
          }
          let decryptTypePath = null
          const decryptFunPaths = []
          if (types.isStatement(obfuscateDictPath.node)) {
            contextAST.body.push(obfuscateDictPath.node)
          }
          if(!types.isIdentifier(obfuscateDictPath.node.id)) {
            return;
          }
          const obfuscateDictName = obfuscateDictPath.node.id.name;
          const referencePaths = obfuscateDictPath.scope.getBinding(obfuscateDictName)?.referencePaths || [];
          for (const referencePath of referencePaths) {
            // 函数形参
            if (referencePath.isIdentifier() && referencePath.parentPath?.isCallExpression()) {
              // 混淆函数 (function(){})()
              const rootPath = referencePath.findParent((p) => p.isCallExpression())?.findParent((p) => p.isExpressionStatement())
              if (rootPath?.isExpressionStatement()) {
                decryptTypePath = rootPath;
                contextAST.body.push(decryptTypePath.node)
              }
              // 加密函数 if (function () {}(), Iii11l) {}
              const rootPath2 = referencePath.findParent((p) => p.isCallExpression())?.findParent((p) => p.isIfStatement());
              if (rootPath2?.isIfStatement()) {
                decryptTypePath = rootPath2;
                contextAST.body.push(decryptTypePath.node)
              }
            }
            // 加密函数中的变量
            if (referencePath.isIdentifier() && referencePath.parentPath?.isCallExpression()) {
              // 加密函数
              const rootPath = referencePath.findParent((p) => p.isVariableDeclaration())?.findParent((p) => p.isFunctionDeclaration())
              if (rootPath?.isFunctionDeclaration()) {
                decryptFunPaths.push(rootPath);
                decryptNames.push(rootPath.node.id.name);
                contextAST.body.push(rootPath.node)
              }
            }
          }
          if (contextAST.body.length >= 3 && obfuscateDictPath && decryptTypePath
            // decryptFunPath?.isFunctionDeclaration() && types.isIdentifier(decryptFunPath.node.id)
          ) {
            console.log('加密方式: 符合jsjiami.com.v7.js特征')
            contextAST.body.unshift(types.variableDeclaration("var", [types.variableDeclarator(types.identifier("version_"), types.stringLiteral("jsjiami.com.v7"))]));
            obfuscateDictPath.remove()
            decryptTypePath.remove()
            decryptFunPaths.forEach(p => p.remove());
            path.stop()
          } else {
            console.log('加密方式: 不符合jsjiami.com.v7.js特征')
          }
        }
      }
    })
  }

  if (decryptNames.length <= 0) {
    throw 'decryptName 解析失败, 可能是未识别的加密方式'
  }
  contextAST.body.push(...parser.parse(`
    const _decrypt = {${decryptNames.map(i => `${i}:${i}`).join(',')}};
    exports.decrypt=_decrypt;
`).program.body)

  if (decryptNames) {
    fs.writeFileSync(`./dist/context.js`, generate(contextAST, {
      minified: true,
      jsescOption: { 'minimal': true }
    }).code)
    fs.writeFileSync(`./dist/source.js`, generate(sourceAST, { minified: true }).code)
  } else {
    throw '不支持的全局加密函数'
  }
}

const utils = {
  prehandler: prehandler,
  traverse: function (ast, config) {
    traverse(ast, config)
    this.simple1(ast)
  },
  simple1: function (ast) {
    ast = this.mergeObject(ast)
    this.simple2(ast)

    ast = this.flattenCallChain(ast)
    this.simple2(ast)

    ast = this.inlineFunction(ast)
    this.simple2(ast)

    ast = this.simpleCall(ast)
    this.simple2(ast)

    ast = this.simpleClassMethod(ast)
    this.simple2(ast)

    ast = this.evaluateFunction(ast)
    this.simple2(ast)
  },
  simple2: function (ast) {
    ast = this.splitCommaToMultiline(ast)
    ast = this.evaluateExpression(ast)

    ast = this.removeDoubleBlock(ast)
    ast = this.removeEmptyStatement(ast)
    ast = this.removeUnusedIf(ast)
    ast = this.removeUnusedVar(ast)

    traverse.cache.clear()
  },

  evaluateExpression: (ast) => {
    // 表达式还原
    traverse(ast, {
      'NumericLiteral|StringLiteral' (path) {
        if (path?.node?.extra?.raw) {
          delete path.node.extra.raw
        }
      },
      'UnaryExpression|BinaryExpression|CallExpression|ConditionalExpression' (path) {
        try {
          const {
            confident,
            value
          } = path.evaluate()
          if (!confident) {
            return
          }

          if (value === null) {
            path.replaceInline(types.nullLiteral())
          } else {
            if (value === undefined || value.toString() !== path.toString()) {
              path.replaceInline(types.valueToNode(value))
            }
          }
        } catch (e) {
          debugger
        }
      }
    })
    return ast
  },
  evaluateFunction: function (ast) {
    traverse(ast, {
      ObjectProperty (path) {
        const objectDeclarator = path.findParent(p => p.isVariableDeclarator())
        if (!objectDeclarator?.isVariableDeclarator()) {
          return
        }
        if (!types.isIdentifier(objectDeclarator.node.id)) {
          return
        }
        // 获取对象名
        const objectName = objectDeclarator.node.id.name
        // 获取属性名, 支持变量类型和字符串类型
        const variableKey = types.isIdentifier(path.node.key) ? path.node.key.name : (types.isStringLiteral(path.node.key) ? path.node.key.value : '')
        // 获取属性值
        const variableValue = path.node.value

        // 先保证没有此变量只有引用, 没有修改
        const referencePaths = path.scope.getBinding(objectName)?.referencePaths || []
        for (const referencePath of referencePaths) {
          const memberExpression = referencePath.findParent(p => p.isMemberExpression())
          if (memberExpression && memberExpression.isMemberExpression()) {
            if (types.isIdentifier(memberExpression.node.object) && memberExpression.node.object.name === objectName) {
              const memberExpressionProperty = types.isIdentifier(memberExpression.node.property) ? memberExpression.node.property.name :
                  (types.isStringLiteral(memberExpression.node.property) ? memberExpression.node.property.value : '')
              if (memberExpressionProperty === variableKey) {
                const updateExpression = memberExpression.findParent(p => p.isUpdateExpression())
                if (updateExpression) {
                  return // 不处理i++的情况
                }
                const assignmentExpression = memberExpression.findParent(p => p.isAssignmentExpression())
                if (types.isAssignmentExpression(assignmentExpression?.node) && assignmentExpression?.node.left == memberExpression.node) {
                  return // 不处理a['b'] = 'xxx'的情况
                }
              }
            }
          }
        }

        // 再进行替换
        for (const referencePath of referencePaths) {
          const memberExpression = referencePath.findParent(p => p.isMemberExpression())
          if (memberExpression && memberExpression.isMemberExpression()) {
            if (types.isIdentifier(memberExpression.node.object) && memberExpression.node.object.name === objectName) {
              const memberExpressionProperty = types.isIdentifier(memberExpression.node.property) ? memberExpression.node.property.name :
                  (types.isStringLiteral(memberExpression.node.property) ? memberExpression.node.property.value : '')
              if (memberExpressionProperty === variableKey) {
                if (types.isLiteral(variableValue)) {
                  memberExpression.replaceInline(variableValue)
                  memberExpression.scope.crawl()
                } else if (types.isFunction(variableValue) && referencePath.parentPath?.parentPath?.isCallExpression()) {
                  const callPath = referencePath.findParent(p => p.isCallExpression())
                  if (callPath && callPath.isCallExpression() &&
                      types.isBlockStatement(variableValue.body) && variableValue.body.body.length === 1 && types.isReturnStatement(variableValue.body.body[0])) {
                    // 函数里的表达式只有一个return, 直接替换
                    const returnStatement = variableValue.body.body[0].argument
                    const nodeArguments = callPath.node.arguments
                    if (types.isBinaryExpression(returnStatement) && nodeArguments.length === 2 &&
                        types.isExpression(nodeArguments[0]) && types.isExpression(nodeArguments[1])) {
                      // 二元计算表达式
                      callPath.replaceInline(types.binaryExpression(returnStatement.operator, nodeArguments[0], nodeArguments[1]))
                      callPath.scope.crawl()
                    } else if (types.isLogicalExpression(returnStatement) && nodeArguments.length === 2 &&
                        types.isExpression(nodeArguments[0]) && types.isExpression(nodeArguments[1])) {
                      // 逻辑计算表达式
                      callPath.replaceInline(types.logicalExpression(returnStatement.operator, nodeArguments[0], nodeArguments[1]))
                      callPath.scope.crawl()
                    } else if (types.isCallExpression(returnStatement) && types.isIdentifier(returnStatement.callee) &&
                        types.isExpression(nodeArguments[0])) {
                      // 函数调用
                      callPath.replaceInline(types.callExpression(nodeArguments[0], nodeArguments.slice(1)))
                      callPath.scope.crawl()
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
    return ast
  },
  flattenCallChain: function (ast) {
    // 减少调用链路长度
    traverse(ast, {
      CallExpression (path) {
        const callPath = path.node
        if (types.isIdentifier(callPath.callee)) {
          const binding = path.scope.getBinding(callPath.callee.name)
          if (binding && types.isVariableDeclarator(binding.path.node) && types.isIdentifier(binding.path.node.id) && types.isIdentifier(binding.path.node.init)) {
            path.replaceWith(types.callExpression(binding.path.node.init, callPath.arguments))
          }
        }
      },
      VariableDeclarator (path) {
        const node = path.node
        if (types.isIdentifier(node.id) && types.isIdentifier(node.init)) {
          if(path.scope.getBinding(node.init.name)?.references > 1) {
            // 除了自身还有其他的引用就不处理
            return;
          }
          const sourceVar = path.scope.getBinding(node.init.name)?.path?.node
          if (sourceVar && types.isVariableDeclarator(sourceVar) && types.isObjectExpression(sourceVar.init)) {
            path.replaceWith(types.variableDeclarator(node.id, sourceVar.init))
          }
        }
      }
    })
    return ast
  },
  inlineFunction: function (ast) {
    const inline = function (path, functionName, functionBody) {
      if (functionBody.body.body.length !== 1) {
        return // 方法体只有一个return
      }
      const returnStatement = functionBody.body.body[0]
      if (!types.isReturnStatement(returnStatement)) {
        return // 方法体只有一个return
      }
      // 查找函数引用
      const binding = path.scope.getBinding(functionName)
      if (!binding) {
        return
      }
      for (const referencePath of binding.referencePaths) {
        if (referencePath.parentPath && types.isCallExpression(referencePath.parentPath.node)) {
          // 修改BinaryExpression
          if (types.isBinaryExpression(returnStatement.argument) && types.isIdentifier(returnStatement.argument.left) && types.isIdentifier(returnStatement.argument.right)) {
            if (types.isIdentifier(functionBody.params[0])) {
              const leftIndex = (functionBody.params[0].name === returnStatement.argument.left.name) ? 0 : 1
              const rightIndex = (leftIndex === 0) ? 1 : 0

              const left = referencePath.parentPath.node.arguments[leftIndex]
              const right = referencePath.parentPath.node.arguments[rightIndex]
              if (types.isExpression(left) && types.isExpression(right)) {
                const newNode = types.binaryExpression(returnStatement.argument.operator, left, right)
                referencePath.parentPath.replaceWith(newNode)
                referencePath.parentPath.scope.crawl()
              }
            }
          }
        }
      }
    }

    traverse(ast, {
      VariableDeclarator: function (path) {
        if (types.isIdentifier(path.node.id)) {
          const functionName = path.node.id.name
          const functionExpression = path.node.init
          if (!types.isFunctionExpression(functionExpression)) {
            return // 查找var inline1 = function () {}
          }
          inline(path, functionName, functionExpression)
        }
      },
      FunctionDeclaration: function (path) {
        if (types.isIdentifier(path.node.id)) {
          const functionName = path.node.id.name
          const functionDeclaration = path.node
          if (!types.isFunctionDeclaration(functionDeclaration)) {
            return // 查找var inline1 = function () {}
          }
          inline(path, functionName, functionDeclaration)
        }
      },
      AssignmentExpression: function (path) {
        if (!types.isIdentifier(path.node.left)) {
          return // 只查找 inline1 = function() {}
        }
        const functionName = path.node.left.name
        const functionExpression = path.node.right
        if (!types.isFunctionExpression(functionExpression)) {
          return // 查找var inline1 = function () {}
        }
        inline(path, functionName, functionExpression)
      }
    })
    return ast
  },
  mergeObject: function (ast) {
    // 对象合并
    traverse(ast, {
      VariableDeclarator (path) {
        if (types.isObjectExpression(path.node.init)) {
          // path.getAllNextSiblings().filter(s => types.isExpressionStatement(s));
          for (let expressionStatementPath of path.parentPath.getAllNextSiblings().filter(s => types.isExpressionStatement(s))) {
            let expression = expressionStatementPath.node.expression
            if (types.isAssignmentExpression(expression) && expression.operator === '=') {
              const expressionLeft = expression.left
              if (types.isMemberExpression(expression.left) && expressionLeft.object.name === path.node.id.name && types.isIdentifier(expression.left.property)) {
                try {
                  path.node.init.properties.push(types.objectProperty(expressionLeft.property.name, expression.right))
                } catch (e) {
                  path.node.init.properties.push(types.objectProperty(types.stringLiteral(expression.left.property.name), expression.right))
                }
                expressionStatementPath.remove()
              }
            }
          }
        }
      }
    })
    return ast
  },
  removeDoubleBlock: (ast) => {
    traverse(ast, {
      BlockStatement (path) {
        if (path.node.body.length === 1 && types.isBlockStatement(path.node.body[0])) {
          const innerBlock = path.node.body[0];
          try {
            path.replaceWith(types.blockStatement(innerBlock.body));
          } catch (e) {
            path.node.body = innerBlock.body;
          }
          path.scope.crawl();
        }
      }
    })
    return ast
  },
  removeEmptyStatement: (ast) => {
    // 去除空语句
    traverse(ast, {
      EmptyStatement (path) {
        path.remove()
      }
    })
    return ast
  },
  removeUnusedIf: (ast) => {
    // 去除无用判断
    traverse(ast, {
      Conditional (path) {
        if (types.isBooleanLiteral(path.node.test) || types.isNumericLiteral(path.node.test)) {
          if (path.node.test.value) {
            path.replaceInline(path.node.consequent)
          } else {
            if (path.node.alternate) {
              path.replaceInline(path.node.alternate)
            } else {
              path.remove()
            }
          }
          path.scope.crawl()
        }
      }
    })
    return ast
  },
  removeUnusedVar: (ast) => {
    let flag = true
    while (flag) {
      flag = false
      // 去除无用变量
      traverse(ast, {
        VariableDeclarator (path) {
          if (types.isIdentifier(path.node.id)) {
            const binding = path.scope.getBinding(path.node.id.name)

            // 如标识符被修改过，则不能进行删除动作。
            if (!binding || binding.constantViolations.length > 0) {
              return
            }
            const pp = path.parentPath.parentPath
            if (pp) {
              const ppNode = pp.node
              if (types.isForOfStatement(ppNode) || types.isForInStatement(ppNode) || types.isForStatement(ppNode)) {
                return
              }
            }

            // 未被引用
            if (!binding.referenced) {
              flag = true
              path.remove()
            }

            // 被引用次数为0
            // if (binding.references === 0) {
            //     path.remove();
            // }

            // 长度为0，变量没有被引用过
            // if (binding.referencePaths.length === 0) {
            //     path.remove();
            // }
          }
        }
      })
      traverse.cache.clear()
    }
    return ast
  },
  simpleCall: (ast) => {
    traverse(ast, {
      'MemberExpression|OptionalMemberExpression' (path) {
        const node = path.node
        if (node.computed && types.isStringLiteral(node.property)) {
          const value = node.property?.extra?.rawValue || node.property.value
          if (value.indexOf('-') < 0) {
            node.property = types.identifier(value)
            node.computed = false
          }
        }
      }
    })
    return ast
  },
  simpleClassMethod: function (ast) {
    traverse(ast, {
      ClassMethod (path) {
        path.node.computed = false
        if (types.isStringLiteral(path.node.key)) {
          const newKey = types.identifier(path.node.key.value)
          path.get('key').replaceWith(newKey)
        }
      },
      ObjectProperty (path) {
        const node = path.node
        path.node.computed = false
        if (types.isIdentifier(path.node.key)) {
          node.key = types.stringLiteral(path.node.key.name)
        }
      },
    })
    return ast
  },
  splitCommaToMultiline: (ast) => {
    // 逗号表达式拆成多行
    traverse(ast, {
      SequenceExpression (path) {
        if (types.isExpressionStatement(path.parentPath.node)) {
          const expressions = []
          for (const expression of path.node.expressions) {
            expressions.push(expression)
          }
          path.replaceInline(expressions)
        } else if (types.isReturnStatement(path.parentPath.node)) {
          const expressions = path.node.expressions
          for (let i = 0; i < expressions.length - 1; i++) {
            path.parentPath.insertBefore(expressions[i])
          }
          path.replaceInline(expressions[expressions.length - 1])
        }
      },
      'VariableDeclaration' (path) {
        if (!path.parentPath.isBlock()) {
          return // 避免 for(var i = 0, j = 0;;) 被处理
        }
        if (path.node.declarations.length === 1) {
          return // 跳过只有一个变量的
        }
        const newVars = path.node.declarations.map(v => types.variableDeclaration(path.node.kind, [v]))
        path.replaceInline(newVars)
      }
    })
    return ast
  },
  whileSwitch: (ast) => {
    traverse(ast, {
      WhileStatement (path) {
        if(!types.isBlockStatement(path.node.body)) {
          return
        }
        // 获取下面的switch节点
        let switchStatement = path.node.body.body[0]
        // 获取Switch判断条件上的 控制的数组名 和 自增变量名
        if(!types.isSwitchStatement(switchStatement) || !types.isMemberExpression(switchStatement.discriminant) ||
          !types.isIdentifier(switchStatement.discriminant.object) ||
          !types.isUpdateExpression(switchStatement.discriminant.property) || !types.isIdentifier(switchStatement.discriminant.property.argument)) {
          return // 必须满足 switch(arr[idx]++) 的情况
        }
        let arrayName = switchStatement.discriminant.object.name
        let increName = switchStatement.discriminant.property.argument.name
        // 获取控制流数组和自增变量的绑定对象
        let bindingArray = path.scope.getBinding(arrayName)
        if(!bindingArray) {
          return;
        }
        let bindingAutoIncrement = path.scope.getBinding(increName)
        if(!bindingAutoIncrement) {
          return;
        }
        // 计算出对应的顺序数组
        let array = eval(bindingArray.path.get('init').toString())
        let replace = array.flatMap(i => {
          let consequent = switchStatement.cases[i].consequent
          // 删除末尾的continue节点
          if (types.isContinueStatement(consequent[consequent.length - 1])) consequent.pop()
          return consequent
        })
        path.replaceWithMultiple(replace)
        // 删除控制数组和对应的自增变量
        bindingArray.path.remove()
        bindingAutoIncrement.path.remove()
      }
    })
    return ast
  }
}

module.exports = utils;
