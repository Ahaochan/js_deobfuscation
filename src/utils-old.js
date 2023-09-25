const types = require("@babel/types");
const {re} = require("@babel/core/lib/vendor/import-meta-resolve");
const fs = require("fs");
const {default: generate} = require("@babel/generator");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default

function prehandler(code) {
    const sourceAST = parser.parse(code, {
        allowReturnOutsideFunction: true
    });
    const contextAST = {
        type: "Program",
        body: [],
    }
    let decryptName = "";

    if (decryptName === "") {
        traverse(sourceAST, {
            VariableDeclarator(path) {
                if (types.isStringLiteral(path.node.init)) {
                    if (path.node.init.value === 'jsjiami.com') {
                        const path1 = path.parentPath;
                        contextAST.body.push(path1.node);

                        const var2 = path.getNextSibling();
                        const path2 = var2.scope.getBinding(var2.node.id.name).referencePaths.map(s => s.parentPath.parentPath)[0];
                        contextAST.body.push(path2.node);

                        const path3 = path1.getNextSibling().getNextSibling();
                        contextAST.body.push(path3.node);

                        decryptName = path3.node.declarations[0].id.name;

                        path1.remove();
                        path2.remove();
                        path3.remove();
                    } else if (path.node.init.value === 'jsjiami.com.v5') {
                        const decryptTypePath = path.parentPath;
                        contextAST.body.push(decryptTypePath.node);

                        const var2 = path.getNextSibling().getNextSibling();
                        const path2 = var2.scope.getBinding(var2.node.id.name).referencePaths.map(s => s.parentPath.parentPath)[0];
                        contextAST.body.push(path2.node);

                        const path3 = decryptTypePath.getNextSibling().getNextSibling();
                        contextAST.body.push(path3.node);

                        decryptName = path3.node.declarations[0].id.name;

                        decryptTypePath.remove();
                        path2.remove();
                        path3.remove();
                    } else if (path.node.init.value === 'jsjiami.com.v6') {
                        const decryptTypePath = path.parentPath;
                        contextAST.body.push(decryptTypePath.node);

                        const var2 = path.getNextSibling().getNextSibling();
                        const bindings = path.scope.getBinding(var2.node.id.name).referencePaths.filter(p => types.isMemberExpression(p.parentPath));
                        for (const binding of bindings) {
                            const ifStatement = binding.findParent(p => p.isIfStatement());
                            if (ifStatement && ifStatement.node) {
                                contextAST.body.push(ifStatement.node);
                            }
                            const functionDeclaration = binding.findParent(p => p.isFunctionDeclaration());
                            if (functionDeclaration && functionDeclaration.node) {
                                contextAST.body.push(functionDeclaration.node);

                                decryptName = functionDeclaration.node.id.name;
                            }
                        }

                        decryptTypePath.remove();
                        for (const binding of bindings) {
                            const ifStatement = binding.findParent(p => p.isIfStatement());
                            if (ifStatement && ifStatement.node) {
                                ifStatement.remove();
                            }
                            const functionDeclaration = binding.findParent(p => p.isFunctionDeclaration());
                            if (functionDeclaration && functionDeclaration.node) {
                                functionDeclaration.remove();
                            }
                        }
                    } else if (path.node.init.value === 'jsjiami.com.v7') {
                        const decryptTypePath = path.parentPath;
                        contextAST.body.push(decryptTypePath.node);

                        const var2 = path.getNextSibling();
                        if (!var2.node) {
                            // 跳过无用声明
                            return;
                        }
                        const bindings = path.scope.getBinding(var2.node.id.name).referencePaths;
                        for (const binding of bindings) {
                            if (types.isCallExpression(binding.parentPath)) {
                                const obfuscateDictPath = binding.parentPath.parentPath.parentPath;
                                contextAST.body.push(obfuscateDictPath.node);
                                contextAST.body.push(types.emptyStatement()); // 加分号避免语法错误
                                obfuscateDictPath.remove();
                            } else if (types.isVariableDeclarator(binding.parentPath)) {
                                const decryptFunPath = binding.parentPath.parentPath.parentPath.parentPath;
                                contextAST.body.push(decryptFunPath.node);
                                decryptName = decryptFunPath.node.id.name;
                                decryptFunPath.remove();
                            }
                        }
                        decryptTypePath.remove();
                    }
                }
            }
        })
    }
    if (!decryptName) {
        traverse(sourceAST, {
            FunctionDeclaration(path) {
                const checkFunction = function (p) {
                    const name = p.node.id.name;
                    const body = p.node.body.body;
                    return body.length === 3 &&
                        types.isVariableDeclaration(body[0]) && body[0].declarations.length === 1 && (types.isArrayExpression(body[0].declarations[0].init) || types.isCallExpression(body[0].declarations[0].init)) &&
                        types.isExpressionStatement(body[1]) && types.isAssignmentExpression(body[1].expression) && body[1].expression.left.name === name &&
                        types.isReturnStatement(body[2]);
                }
                if (!checkFunction(path)) {
                    return;
                }
                // 词典
                const obfuscateDictPath = path;
                contextAST.body.push(obfuscateDictPath.node);

                // 混淆函数
                const decryptTypePath = path.scope.getBinding(path.node.id.name).referencePaths
                    .filter(p => p.listKey === "arguments" && (p.key === 0 || p.key === 2))
                    [0]?.parentPath?.parentPath;
                if(decryptTypePath) {
                    contextAST.body.push(decryptTypePath.node);
                    contextAST.body.push(types.emptyStatement()); // 加分号避免语法错误
                }

                // 加密函数
                const decryptFunPath = path.scope.getBinding(path.node.id.name).referencePaths
                    .map(p => p.parentPath.parentPath)
                    .filter(p => types.isVariableDeclarator(p))
                    .map(p => p.parentPath.parentPath.parentPath)
                    .filter(p => types.isFunctionDeclaration(p)).pop(); // 取最后一个元素
                contextAST.body.push(decryptFunPath.node);

                decryptName = decryptFunPath.node.id.name;

                if(decryptTypePath) {
                    decryptTypePath.remove();
                }
                decryptFunPath.remove();
                obfuscateDictPath.remove();
            }
        })
    }

    if (!decryptName) {
        traverse(sourceAST, {
            FunctionDeclaration(path) {
                const checkFunction = function (p) {
                    const name = p.node.id.name;
                    const body = p.node.body.body;
                    return body.length === 2 &&
                        types.isVariableDeclaration(body[0]) && body[0].declarations.length === 1 && (types.isIdentifier(body[0].declarations[0].init)) &&
                        types.isReturnStatement(body[1]) && body[1].argument.expressions.length === 2 &&
                        types.isAssignmentExpression(body[1].argument.expressions[0]) && types.isIdentifier(body[1].argument.expressions[0].left) && name === body[1].argument.expressions[0].left.name &&
                        types.isCallExpression(body[1].argument.expressions[1]) && types.isIdentifier(body[1].argument.expressions[1].callee) && name === body[1].argument.expressions[1].callee.name;
                }
                if (!checkFunction(path)) {
                    return;
                }
                console.log('加密方式: unknown 2');
                // 加密函数
                const decryptFunPath = path;
                contextAST.body.push(decryptFunPath.node);
                // 词典
                const obfuscateDictName = path.node.body.body[0].declarations[0].init.name;
                let obfuscateDictPath;
                traverse(sourceAST, {
                    AssignmentExpression(path) {
                        if (path.node.left.name === obfuscateDictName) {
                            obfuscateDictPath = path;
                            contextAST.body.push(obfuscateDictPath.node);
                            contextAST.body.push(types.emptyStatement()); // 加分号避免语法错误
                            path.stop();
                        }
                    }
                })
                // 混淆函数
                let decryptTypePath;
                traverse(sourceAST, {
                    CallExpression(path) {
                        const args = path.node.arguments;
                        for (let i = 0; i < args.length; i++) {
                            const arg = args[i];
                            if(types.isIdentifier(arg) && arg.name === obfuscateDictName) {
                                decryptTypePath = path.findParent(p => types.isExpressionStatement(p));
                                path.stop();
                                return;
                            }
                        }
                    }
                });
                contextAST.body.push(decryptTypePath.node);
                contextAST.body.push(types.emptyStatement()); // 加分号避免语法错误
                decryptName = decryptFunPath.node.id.name;
                decryptTypePath.remove();
                decryptFunPath.remove();
                obfuscateDictPath.remove();
            }
        })
    }


    if (!decryptName) {
        throw "decryptName 解析失败, 可能是未识别的加密方式";
    }
    contextAST.body.push(...parser.parse(`
    const name = "${decryptName}";
    const _decrypt = ${decryptName};

    Object.defineProperty((arg) => _decrypt[arg], "name", { value: name });
    switch (_decrypt.constructor.name) {
        case "Array" : exports.decrypt=Object.defineProperty((arg) => _decrypt[arg], "name", { value: name }); break;
        case "Function": exports.decrypt=_decrypt; break;
        default: throw "不支持的全局加密函数";
    }
`).program.body);

    if (decryptName) {
        fs.writeFileSync(`./dist/context.js`, generate(contextAST, {minified: true, jsescOption: {"minimal": true}}).code);
        fs.writeFileSync(`./dist/source.js`, generate(sourceAST, {minified: true}).code);
        console.log("预处理完毕")
    } else {
        throw "不支持的全局加密函数";
    }
}


const _utils = {
    prehandler: prehandler,
    traverse: function (ast, config) {
        traverse(ast, config);
        this.simple1(ast);
    },
    mergeObject: function (ast) {
        // 对象合并
        traverse(ast, {
            VariableDeclarator(path) {
                if (types.isObjectExpression(path.node.init)) {
                    // path.getAllNextSiblings().filter(s => types.isExpressionStatement(s));
                    for (let expressionStatementPath of path.parentPath.getAllNextSiblings().filter(s => types.isExpressionStatement(s))) {
                        let expression = expressionStatementPath.node.expression;
                        if (types.isAssignmentExpression(expression) && expression.operator === '=') {
                            if (types.isMemberExpression(expression.left) && expression.left.object.name === path.node.id.name && types.isIdentifier(expression.left.property)) {
                                try {
                                    path.node.init.properties.push(types.objectProperty(expression.left.property.name, expression.right));
                                } catch (e) {
                                    path.node.init.properties.push(types.objectProperty(types.stringLiteral(expression.left.property.name), expression.right));
                                }
                                expressionStatementPath.remove();
                            }
                        }
                    }
                }
            }
        });
        return ast;
    },
    flattenCallChain: function (ast) {
        // 减少调用链路长度
        traverse(ast, {
            CallExpression(path) {
                const callPath = path.node;
                const binding = path.scope.getBinding(callPath.callee.name);
                if(binding && types.isVariableDeclarator(binding.path) && types.isIdentifier(binding.path.node.id) && types.isIdentifier(binding.path.node.init)) {
                    path.replaceWith(types.callExpression(binding.path.node.init, callPath.arguments));
                }
            }
        });
        return ast;
    },
    evaluateFunction: function (ast) {
        // 标量替换
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
                                if (referencePath.parentPath.isAssignmentExpression() && types.shallowEqual(referencePath.parent.left, referencePath.node)) {
                                    // 排除a['b'] = 'xxx'的情况
                                    continue;
                                }
                                if (types.isLiteral(variableValue)) {
                                    try {
                                        referencePath.replaceInline(variableValue);
                                    } catch (e) {
                                        debugger
                                    }
                                    referencePath.scope.crawl();
                                } else if (types.isFunction(variableValue) && types.isCallExpression(referencePath.parentPath)) {
                                    // 函数里的表达式只有一个return, 直接替换
                                    const callPath = referencePath.parentPath;
                                    const returnStatement = variableValue.body.body[0].argument;
                                    const nodeArguments = callPath.node.arguments;
                                    if (types.isBinaryExpression(returnStatement) && nodeArguments.length === 2) {
                                        // 二元计算表达式
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
        });
        return ast;
    },
    removeEmptyStatement: function (ast) {
        // 去除空语句
        traverse(ast, {
            EmptyStatement(path) {
                path.remove();
            }
        })
        return ast;
    },
    removeUnusedVar: (ast) => {
        let flag = true;
        while(flag) {
            flag = false;
            console.log("测试");
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
                        flag = true;
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
            });
            traverse.cache.clear();
        }
        return ast;
    },
    removeUnusedIf: (ast) => {
        // 去除无用判断
        traverse(ast, {
            Conditional(path) {
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
        return ast;
    },
    splitCommaToMultiline: (ast) => {
        // 逗号表达式拆成多行
        traverse(ast, {
            SequenceExpression(path) {
                if (types.isExpressionStatement(path.parentPath.node)) {
                    const expressions = [];
                    for (const expression of path.node.expressions) {
                        expressions.push(expression);
                    }
                    path.replaceInline(expressions);
                } else if(types.isReturnStatement(path.parentPath.node)) {
                    const expressions = path.node.expressions;
                    for (let i = 0; i < expressions.length - 1; i++) {
                        path.parentPath.insertBefore(expressions[i]);
                    }
                    path.replaceInline(expressions[expressions.length - 1]);
                }
            }
        })
        return ast;
    },
    evaluate: (ast) => {
        // 表达式还原
        traverse(ast, {
            "NumericLiteral|StringLiteral"(path) {
                if (path?.node?.extra?.raw) {
                    delete path.node.extra.raw
                }
            },
            "UnaryExpression|BinaryExpression|CallExpression|ConditionalExpression"(path) {
                const {confident, value} = path.evaluate()
                try {
                    if (!confident) {
                        return;
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
        });
        return ast;
    },
    simple1: function (ast) {
        ast = this.mergeObject(ast);
        this.simple2(ast);

        ast = this.flattenCallChain(ast);
        this.simple2(ast);

        ast = this.evaluateFunction(ast);
        this.simple2(ast);
    },
    simple2: function (ast) {
        traverse.cache.clear()

        ast = this.removeEmptyStatement(ast);
        ast = this.splitCommaToMultiline(ast);
        ast = this.evaluate(ast);

        ast = this.removeUnusedIf(ast);
        ast = this.removeUnusedVar(ast);

        traverse.cache.clear()
    }
}

module.exports = _utils;