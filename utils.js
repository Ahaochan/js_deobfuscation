const types = require("@babel/types");
const {re} = require("@babel/core/lib/vendor/import-meta-resolve");
const fs = require("fs");
const {default: generate} = require("@babel/generator");
const traverse = require("@babel/traverse").default

const _utils = {
    traverse: function (ast, config) {
        traverse(ast, config);
        this.simple1(ast);
    },
    simple1: function (ast) {
        // 对象合并
        traverse(ast, {
                VariableDeclarator(path) {
                    if (types.isObjectExpression(path.node.init)) {
                        // path.getAllNextSiblings().filter(s => types.isExpressionStatement(s));
                        for (let expressionStatementPath of path.parentPath.getAllNextSiblings().filter(s => types.isExpressionStatement(s))) {
                            let expression = expressionStatementPath.node.expression;
                            if (types.isAssignmentExpression(expression) && expression.operator === '=') {
                                if (types.isMemberExpression(expression.left) && expression.left.object.name === path.node.id.name && types.isIdentifier(expression.left.property)) {
                                    if(expression.left.property.name.indexOf("-") > -1) {
                                        path.node.init.properties.push(types.objectProperty(types.stringLiteral(expression.left.property.name), expression.right));
                                    } else {
                                        path.node.init.properties.push(types.objectProperty(expression.left.property.name, expression.right));
                                    }
                                    expressionStatementPath.remove();
                                }
                            }
                        }
                    }
                }
            })
        this.simple2(ast);

        // 减少调用链路长度
        traverse(ast, {
            VariableDeclarator(path) {
                const variable = path.node;
                if (types.isObjectExpression(variable.init)) {
                    const binding = path.scope.getBinding(variable.id.name);
                    if (binding.referencePaths.length === 1) {
                        let referencePath = binding.referencePaths[0].parentPath;
                        if (types.isVariableDeclarator(referencePath)) {
                            referencePath.replaceWith(types.variableDeclarator(referencePath.node.id, variable.init));
                            path.remove();
                        }
                    }
                }
            }
        })
        this.simple2(ast);

        // 标量替换
        fs.writeFileSync(`./target8.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
        traverse(ast, {
            ObjectProperty(path) {
                const objectDeclarator = path.parentPath.parentPath;
                const variableKey = path.node.key.name || path.node.key.value;
                const variableValue = path.node.value;
                if (types.isVariableDeclarator(objectDeclarator)) {
                    const objectName = objectDeclarator.node.id.name;
                    const bindings = path.scope.getAllBindings();
                    for (const key in bindings) {
                        const binding = bindings[key];
                        const referencePaths = binding.referencePaths.map(p => p.parentPath);
                        for (const referencePath of referencePaths) {
                            if (types.isMemberExpression(referencePath.node) && referencePath.node.object.name === objectName &&
                                (referencePath.node.property.name === variableKey || referencePath.node.property.value === variableKey)) {
                                if (types.isLiteral(variableValue)) {
                                    referencePath.replaceInline(variableValue);
                                    referencePath.scope.crawl();
                                } else if (types.isFunction(variableValue) && types.isCallExpression(referencePath.parentPath)) {
                                    // 函数里的表达式只有一个return, 直接替换
                                    const callPath = referencePath.parentPath;
                                    const returnStatement = variableValue.body.body[0].argument;
                                    const nodeArguments = callPath.node.arguments;
                                    if (types.isBinaryExpression(returnStatement) && nodeArguments.length === 2) {
                                        // 二元计算表达式
                                        fs.writeFileSync(`./target8.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
                                        callPath.replaceInline(types.binaryExpression(returnStatement.operator, nodeArguments[0], nodeArguments[1]));
                                        callPath.scope.crawl();
                                    } else if (types.isLogicalExpression(returnStatement) && nodeArguments.length === 2) {
                                        // 逻辑计算表达式
                                        callPath.replaceInline(types.logicalExpression(returnStatement.operator, nodeArguments[0], nodeArguments[1]));
                                        callPath.scope.crawl();
                                    } else if (types.isCallExpression(returnStatement) && types.isIdentifier(returnStatement.callee)) {
                                        // 函数调用
                                        // if (nodeArguments.length == 1) {
                                        //     referencePath.replaceWith(nodeArguments[0])
                                        // } else {
                                        callPath.replaceInline(types.callExpression(nodeArguments[0], nodeArguments.slice(1)))
                                        callPath.scope.crawl();
                                        // }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        this.simple2(ast);
    },
    simple2: function (ast) {
        traverse.cache.clear()

        // 去除空语句
        traverse(ast, {
            EmptyStatement(path) {
                path.remove();
            }
        })
        // 逗号表达式拆成多行
        traverse(ast, {
            SequenceExpression(path) {
                if (types.isExpressionStatement(path.parentPath)) {
                    const expressions = [];
                    for (const expression of path.node.expressions) {
                        expressions.push(expression);
                    }
                    path.replaceInline(expressions);
                }
            }
        })
        // 表达式还原
        traverse(ast, {
            "NumericLiteral|StringLiteral"(path) {
                if (path?.node?.extra?.raw) {
                    delete path.node.extra.raw
                }
            },
            "UnaryExpression|BinaryExpression|CallExpression|ConditionalExpression"(path) {
                const {confident, value} = path.evaluate()
               try{
                   if(path.node?.left?.value === 0 && path.node?.right?.value === 0) {
                       fs.writeFileSync(`./target8.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
                   }
                   if (confident && (value === undefined || value.toString() !== path.toString())) {
                       path.replaceInline(types.valueToNode(value))
                   }
               } catch (e) {
                    debugger
               }
            }
        });
        // 去除无用判断
        traverse(ast, {
            enter(path) {
                if (path.node.type === 'SwitchCase' || path.node.type === 'WhileStatement') {
                    return;
                }
                if (types.isBooleanLiteral(path.node.test) || types.isNumericLiteral(path.node.test)) {
                    if (path.node.test.value) {
                        path.replaceInline(path.node.consequent);
                    } else {
                        if (path.node.alternate) {
                            path.replaceInline(path.node.alternate);
                        } else {
                            path.remove()
                        }
                    }
                    path.scope.crawl();
                }
            }
        })
        // 去除无用变量
        traverse(ast, {
            VariableDeclarator(path) {
                const binding = path.scope.getBinding(path.node.id.name);

                // 如标识符被修改过，则不能进行删除动作。
                if (!binding || binding.constantViolations.length > 0) {
                    return;
                }
                if (types.isForOfStatement(path.parentPath.parentPath) || types.isForInStatement(path.parentPath.parentPath) || types.isForStatement(path.parentPath.parentPath)) {
                    return;
                }

                // 未被引用
                if (!binding.referenced) {
                    path.remove();
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
        })

        traverse.cache.clear()
    }
}

module.exports = _utils;