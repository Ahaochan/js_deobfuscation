const types = require("@babel/types");
const {re} = require("@babel/core/lib/vendor/import-meta-resolve");
const fs = require("fs");
const {default: generate} = require("@babel/generator");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default

function prehandler() {
    const code = fs.readFileSync("./source.js").toString();
    const sourceAST = parser.parse(code);
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
                    } else if(path.node.init.value === 'jsjiami.com.v5') {
                        const path1 = path.parentPath;
                        contextAST.body.push(path1.node);

                        const var2 = path.getNextSibling().getNextSibling();
                        const path2 = var2.scope.getBinding(var2.node.id.name).referencePaths.map(s => s.parentPath.parentPath)[0];
                        contextAST.body.push(path2.node);

                        const path3 = path1.getNextSibling().getNextSibling();
                        contextAST.body.push(path3.node);

                        decryptName = path3.node.declarations[0].id.name;

                        path1.remove();
                        path2.remove();
                        path3.remove();
                    } else if (path.node.init.value === 'jsjiami.com.v6') {
                        const path1 = path.parentPath;
                        contextAST.body.push(path1.node);

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

                        path1.remove();
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
                    }
                }
            }
        })
    }
    if (decryptName === "") {
        traverse(sourceAST, {
            FunctionDeclaration(path) {
                const checkFunction = function (p) {
                    const name = p.node.id.name;
                    const body = p.node.body.body;
                    return body.length === 3 &&
                        types.isVariableDeclaration(body[0]) && body[0].declarations.length === 1 && types.isArrayExpression(body[0].declarations[0].init) &&
                        types.isExpressionStatement(body[1]) && types.isAssignmentExpression(body[1].expression) && body[1].expression.left.name === name &&
                        types.isReturnStatement(body[2]);
                }
                if (!checkFunction(path)) {
                    return;
                }
                // ??????
                const path3 = path;
                contextAST.body.push(path3.node);

                // ????????????
                const path1 = path.scope.getBinding(path.node.id.name).referencePaths
                    .filter(p => p.listKey === "arguments" && p.key === 0)
                    [0].parentPath.parentPath;
                contextAST.body.push(path1.node);

                // ????????????
                const path2 = path.scope.getBinding(path.node.id.name).referencePaths
                    .map(p => p.parentPath.parentPath)
                    .filter(p => types.isVariableDeclarator(p))[0]
                    .parentPath.parentPath.parentPath
                contextAST.body.push(path2.node);

                decryptName = path2.node.id.name;

                path1.remove();
                path2.remove();
                path3.remove();
            }
        })
    }

    contextAST.body.push(...parser.parse(`
    const name = "${decryptName}";
    const _decrypt = ${decryptName};

    Object.defineProperty((arg) => _decrypt[arg], "name", { value: name });
    switch (_decrypt.constructor.name) {
        case "Array" : exports.decrypt=Object.defineProperty((arg) => _decrypt[arg], "name", { value: name }); break;
        case "Function": exports.decrypt=_decrypt; break;
        default: throw "??????????????????????????????";
    }
`).program.body);

    if (decryptName) {
        fs.writeFileSync(`./context.js`, generate(contextAST, {minified: true, jsescOption: {"minimal": true}}).code);
        fs.writeFileSync(`./source.js`, generate(sourceAST, {minified: true}).code);
        console.log("???????????????")
    } else {
        throw "??????????????????????????????";
    }
}


const _utils = {
    prehandler: prehandler,
    traverse: function (ast, config) {
        traverse(ast, config);
        this.simple1(ast);
    },
    simple1: function (ast) {
        // ????????????
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
        })
        this.simple2(ast);

        // ????????????????????????
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

        // ????????????
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
                                if (referencePath.parentPath.isAssignmentExpression() && types.shallowEqual(referencePath.parent.left, referencePath.node)) {
                                    // ??????a['b'] = 'xxx'?????????
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
                                    // ?????????????????????????????????return, ????????????
                                    const callPath = referencePath.parentPath;
                                    const returnStatement = variableValue.body.body[0].argument;
                                    const nodeArguments = callPath.node.arguments;
                                    if (types.isBinaryExpression(returnStatement) && nodeArguments.length === 2) {
                                        // ?????????????????????
                                        fs.writeFileSync(`./target8.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
                                        callPath.replaceInline(types.binaryExpression(returnStatement.operator, nodeArguments[0], nodeArguments[1]));
                                        callPath.scope.crawl();
                                    } else if (types.isLogicalExpression(returnStatement) && nodeArguments.length === 2) {
                                        // ?????????????????????
                                        callPath.replaceInline(types.logicalExpression(returnStatement.operator, nodeArguments[0], nodeArguments[1]));
                                        callPath.scope.crawl();
                                    } else if (types.isCallExpression(returnStatement) && types.isIdentifier(returnStatement.callee)) {
                                        // ????????????
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

        // ???????????????
        traverse(ast, {
            EmptyStatement(path) {
                path.remove();
            }
        })
        // ???????????????????????????
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
        // ???????????????
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
        // ??????????????????
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
        // ??????????????????
        traverse(ast, {
            VariableDeclarator(path) {
                const binding = path.scope.getBinding(path.node.id.name);

                // ?????????????????????????????????????????????????????????
                if (!binding || binding.constantViolations.length > 0) {
                    return;
                }
                if (types.isForOfStatement(path.parentPath.parentPath) || types.isForInStatement(path.parentPath.parentPath) || types.isForStatement(path.parentPath.parentPath)) {
                    return;
                }

                // ????????????
                if (!binding.referenced) {
                    path.remove();
                }

                // ??????????????????0
                // if (binding.references === 0) {
                //     path.remove();
                // }

                // ?????????0???????????????????????????
                // if (binding.referencePaths.length === 0) {
                //     path.remove();
                // }
            }
        })

        traverse.cache.clear()
    }
}

module.exports = _utils;