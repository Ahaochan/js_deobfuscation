import * as types from "@babel/types";
import {Node, Program, returnStatement, Statement} from "@babel/types";
// const {re} = require("@babel/core/lib/vendor/import-meta-resolve");
import * as fs from "fs";
// const {default: generate} = require("@babel/generator");
import * as parser from "@babel/parser";
import traverse, {NodePath, TraverseOptions} from "@babel/traverse";
import generate from "@babel/generator";

function prehandler() {
    const code = fs.readFileSync("./source.js").toString();
    const sourceAST = parser.parse(code, {
        allowReturnOutsideFunction: true
    });
    // const contextAST: Program = {
    //     type: "Program",
    //     body: [] as Node[],
    //     directives: [],
    //     sourceType: "module",
    //     sourceFile: "",
    // }
    const contextAST = types.program([]);
    let decryptName = "";

    if (decryptName === "") {
        traverse(sourceAST, {
            VariableDeclarator(path) {
                if (types.isStringLiteral(path.node.init)) {
                    if (path.node.init.value === 'jsjiami.com') {
                        // console.log('加密方式: jsjiami.com');
                        // const path1 = path.parentPath;
                        // contextAST.body.push(path1.node);
                        //
                        //
                        // const var2 = path.getNextSibling();
                        // const path2 = var2.scope.getBinding(var2.node.id.name).referencePaths.map(s => s.parentPath.parentPath)[0];
                        // contextAST.body.push(path2.node);
                        //
                        // const path3 = path1.getNextSibling().getNextSibling();
                        // contextAST.body.push(path3.node);
                        //
                        // decryptName = path3.node.declarations[0].id.name;
                        //
                        // path1.remove();
                        // path2.remove();
                        // path3.remove();
                    } else if (path.node.init.value === 'jsjiami.com.v5') {
                        // console.log('加密方式: jsjiami.com.v5');
                        // const decryptTypePath = path.parentPath;
                        // contextAST.body.push(decryptTypePath.node);
                        //
                        // const var2 = path.getNextSibling().getNextSibling();
                        // const path2 = var2.scope.getBinding(var2.node.id.name).referencePaths.map(s => s.parentPath.parentPath)[0];
                        // contextAST.body.push(path2.node);
                        //
                        // const path3 = decryptTypePath.getNextSibling().getNextSibling();
                        // contextAST.body.push(path3.node);
                        //
                        // decryptName = path3.node.declarations[0].id.name;
                        //
                        // decryptTypePath.remove();
                        // path2.remove();
                        // path3.remove();
                    } else if (path.node.init.value === 'jsjiami.com.v6') {
                        console.log('加密方式: jsjiami.com.v6');
                        // const decryptTypePath = path.parentPath;
                        // contextAST.body.push(decryptTypePath.node);
                        //
                        // const var2 = path.getNextSibling().getNextSibling();
                        // const bindings = path.scope.getBinding(var2.node.id.name).referencePaths.filter(p => types.isMemberExpression(p.parentPath));
                        // for (const binding of bindings) {
                        //     const ifStatement = binding.findParent(p => p.isIfStatement());
                        //     if (ifStatement && ifStatement.node) {
                        //         contextAST.body.push(ifStatement.node);
                        //     }
                        //     const functionDeclaration = binding.findParent(p => p.isFunctionDeclaration());
                        //     if (functionDeclaration && functionDeclaration.node) {
                        //         contextAST.body.push(functionDeclaration.node);
                        //
                        //         decryptName = functionDeclaration.node.id.name;
                        //     }
                        // }
                        //
                        // decryptTypePath.remove();
                        // for (const binding of bindings) {
                        //     const ifStatement = binding.findParent(p => p.isIfStatement());
                        //     if (ifStatement && ifStatement.node) {
                        //         ifStatement.remove();
                        //     }
                        //     const functionDeclaration = binding.findParent(p => p.isFunctionDeclaration());
                        //     if (functionDeclaration && functionDeclaration.node) {
                        //         functionDeclaration.remove();
                        //     }
                        // }
                    } else if (path.node.init.value === 'jsjiami.com.v7') {
                        // const decryptTypePath = path.parentPath;
                        // contextAST.body.push(decryptTypePath.node);
                        //
                        // const var2 = path.getNextSibling();
                        // if (!var2.node) {
                        //     // 跳过无用声明
                        //     return;
                        // }
                        // const bindings = path.scope.getBinding(var2.node.id.name).referencePaths;
                        // for (const binding of bindings) {
                        //     if (types.isCallExpression(binding.parentPath)) {
                        //         const obfuscateDictPath = binding.parentPath.parentPath.parentPath;
                        //         contextAST.body.push(obfuscateDictPath.node);
                        //         contextAST.body.push(types.emptyStatement()); // 加分号避免语法错误
                        //         obfuscateDictPath.remove();
                        //     } else if (types.isVariableDeclarator(binding.parentPath)) {
                        //         const decryptFunPath = binding.parentPath.parentPath.parentPath.parentPath;
                        //         contextAST.body.push(decryptFunPath.node);
                        //         decryptName = decryptFunPath.node.id.name;
                        //         decryptFunPath.remove();
                        //     }
                        // }
                        // decryptTypePath.remove();
                        // console.log('加密方式: jsjiami.com.v7');
                    }
                }
            }
        })
    }
    // if (!decryptName) {
    //     traverse(sourceAST, {
    //         FunctionDeclaration(path) {
    //             const checkFunction = function (p) {
    //                 const name = p.node.id.name;
    //                 const body = p.node.body.body;
    //                 return body.length === 3 &&
    //                     types.isVariableDeclaration(body[0]) && body[0].declarations.length === 1 && (types.isArrayExpression(body[0].declarations[0].init) || types.isCallExpression(body[0].declarations[0].init)) &&
    //                     types.isExpressionStatement(body[1]) && types.isAssignmentExpression(body[1].expression) && body[1].expression.left.name === name &&
    //                     types.isReturnStatement(body[2]);
    //             }
    //             if (!checkFunction(path)) {
    //                 return;
    //             }
    //             console.log('加密方式: unknown 1');
    //             // 词典
    //             const obfuscateDictPath = path;
    //             contextAST.body.push(obfuscateDictPath.node);
    //
    //             // 混淆函数
    //             const decryptTypePath = path.scope.getBinding(path.node.id.name).referencePaths
    //                 .filter(p => p.listKey === "arguments" && (p.key === 0 || p.key === 2))
    //                 [0].parentPath.parentPath;
    //             contextAST.body.push(decryptTypePath.node);
    //             contextAST.body.push(types.emptyStatement()); // 加分号避免语法错误
    //
    //             // 加密函数
    //             const decryptFunPath = path.scope.getBinding(path.node.id.name).referencePaths
    //                 .map(p => p.parentPath.parentPath)
    //                 .filter(p => types.isVariableDeclarator(p))[0]
    //                 .parentPath.parentPath.parentPath
    //             contextAST.body.push(decryptFunPath.node);
    //
    //             decryptName = decryptFunPath.node.id.name;
    //
    //             decryptTypePath.remove();
    //             decryptFunPath.remove();
    //             obfuscateDictPath.remove();
    //         }
    //     })
    // }
    // if (!decryptName) {
    //     traverse(sourceAST, {
    //         FunctionDeclaration(path) {
    //             const checkFunction = function (p) {
    //                 const name = p.node.id.name;
    //                 const body = p.node.body.body;
    //                 return body.length === 2 &&
    //                     types.isVariableDeclaration(body[0]) && body[0].declarations.length === 1 && (types.isIdentifier(body[0].declarations[0].init)) &&
    //                     types.isReturnStatement(body[1]) && body[1].argument.expressions.length === 2 &&
    //                     types.isAssignmentExpression(body[1].argument.expressions[0]) && types.isIdentifier(body[1].argument.expressions[0].left) && name === body[1].argument.expressions[0].left.name &&
    //                     types.isCallExpression(body[1].argument.expressions[1]) && types.isIdentifier(body[1].argument.expressions[1].callee) && name === body[1].argument.expressions[1].callee.name;
    //             }
    //             if (!checkFunction(path)) {
    //                 return;
    //             }
    //             console.log('加密方式: unknown 2');
    //             // 加密函数
    //             const decryptFunPath = path;
    //             contextAST.body.push(decryptFunPath.node);
    //
    //             // 词典
    //             const obfuscateDictName = path.node.body.body[0].declarations[0].init.name;
    //             let obfuscateDictPath;
    //             traverse(sourceAST, {
    //                 AssignmentExpression(path) {
    //                     if (path.node.left.name === obfuscateDictName) {
    //                         obfuscateDictPath = path;
    //                         contextAST.body.push(obfuscateDictPath.node);
    //                         contextAST.body.push(types.emptyStatement()); // 加分号避免语法错误
    //                     }
    //                 }
    //             })
    //
    //
    //             // 混淆函数
    //             path.find
    //             const decryptTypePath = path.scope.getBinding(path.node.id.name).referencePaths
    //                 .filter(p => p.listKey === "arguments" && (p.key === 0 || p.key === 2))
    //                 [0].parentPath.parentPath;
    //             contextAST.body.push(decryptTypePath.node);
    //             contextAST.body.push(types.emptyStatement()); // 加分号避免语法错误
    //
    //             decryptName = decryptFunPath.node.id.name;
    //
    //             decryptTypePath.remove();
    //             decryptFunPath.remove();
    //             obfuscateDictPath.remove();
    //         }
    //     })
    // }


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
        fs.writeFileSync(`./context.js`, generate(contextAST, {minified: true, jsescOption: {"minimal": true}}).code);
        fs.writeFileSync(`./source.js`, generate(sourceAST, {minified: true}).code);
        console.log("预处理完毕")
    } else {
        throw "不支持的全局加密函数";
    }
}


const _utils = {
    prehandler: prehandler,
    traverse: function (ast: Node, config: TraverseOptions) {
        traverse(ast, config);
        this.simple1(ast);
    },
    mergeObject: function (ast: Node) {
    },
    replaceInit: function (ast: Node) {
        // // 减少调用链路长度
        // traverse(ast, {
        //     VariableDeclarator(path) {
        //         const variableDeclarator = path.node;
        //         if (types.isObjectExpression(variableDeclarator.init)) {
        //             const binding = path.scope.getBinding(variableDeclarator.id.name);
        //             if (binding.referencePaths.length === 1) {
        //                 let referencePath = binding.referencePaths[0].parentPath;
        //                 if (types.isVariableDeclarator(referencePath)) {
        //                     referencePath.replaceWith(types.variableDeclarator(referencePath.node.id, variableDeclarator.init));
        //                     path.remove();
        //                 }
        //             }
        //         }
        //     }
        // })
        // return ast;
    },
    replaceIndenti: function (ast: Node) {
    },
    removeEmptyStatement: function (ast: Node) {
        // 去除空语句
        traverse(ast, {
            EmptyStatement(path) {
                path.remove();
            }
        })
        return ast;
    },
    removeUnusedVar: (ast: Node) => {
    },
    removeUnusedIf: (ast: Node) => {
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
    splitCommaToMultiline: (ast: Node) => {
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
    evaluate: (ast: Node) => {
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

    simple1: function (ast: Node) {
        this.mergeObject(ast);
        this.simple2(ast);

        this.replaceInit(ast);
        this.simple2(ast);

        this.replaceIndenti(ast);
        this.simple2(ast);
    },
    simple2: function (ast: Node) {
        traverse.cache.clear()

        this.removeEmptyStatement(ast);
        this.splitCommaToMultiline(ast);
        this.evaluate(ast);
        this.removeUnusedIf(ast);
        this.removeUnusedVar(ast);

        traverse.cache.clear()
    }
}

export default _utils;
