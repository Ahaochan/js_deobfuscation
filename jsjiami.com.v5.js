// https://www.jianshu.com/p/c705aec39418
// https://babeljs.io/docs/en/babel-types
// https://astexplorer.net/
// https://mp.weixin.qq.com/s/fIbPuNMs5FRADJE5MOZXgA
const parser = require("@babel/parser");
const generate = require("@babel/generator").default
const traverse = require("@babel/traverse").default
const types = require("@babel/types");
const {decrypt} = require('./context')
const astUtils = require('./utils');

const fs = require("fs");
const {re} = require("@babel/core/lib/vendor/import-meta-resolve");
const {functionCommon} = require("@babel/types/lib/definitions/core");
const code = fs.readFileSync("./source.js").toString();

const ast = parser.parse(code);
astUtils.simple1(ast);
fs.writeFileSync(`./target8.js`, generate(ast, {jsescOption: {"minimal": true}}).code);

// 降低加密函数层级
const stack = [];
const dfs = function (path) {
    const functionName = path.node.id.name;
    if (stack.length > 0 && stack[stack.length - 1] !== functionName) {
        return;
    }
    // 只有一个return语句的
    if (path.node.body.body.length === 1) {
        const returnStatement = path.node.body.body[0];
        if (types.isReturnStatement(returnStatement) && types.isCallExpression(returnStatement.argument)) {
            // return的代码块调用者
            const callExpressionCallee = returnStatement.argument.callee.name;
            // 外层混淆函数的入参
            const params = path.node.params.map(p => p.name);
            stack.push(callExpressionCallee);

            // 如果return代码里的callee是加密函数, 说明可以将所有调用这个functionName的函数替换成最底层的加密函数了
            if (returnStatement.argument.callee.name !== decrypt.name) {
                traverse(ast, {FunctionDeclaration: dfs});
            }
            traverse(ast, {
                CallExpression: function (callPath) {
                    if (callPath.node.callee.name !== functionName) {
                        return;
                    }
                    // 加密函数的实际入参
                    const callArguments = callPath.node.arguments;
                    const args = []
                    // 遍历return代码块的加密函数入参，用外部调用函数替换
                    for (let i = 0; i < returnStatement.argument.arguments.length; i++) {
                        const arg = returnStatement.argument.arguments[i];

                        const getArg = function (n) {
                            if (types.isIdentifier(n)) {
                                return callArguments[params.indexOf(n.name)];
                            } else if (types.isBinaryExpression(n)) {
                                return types.binaryExpression(n.operator, getArg(n.left), getArg(n.right));
                            } else {
                                return n;
                            }
                        }
                        args.push(getArg(arg));
                    }
                    callPath.replaceWith(types.callExpression(returnStatement.argument.callee, args));
                }
            });

            stack.pop();
            path.remove()
        }
    }
}
astUtils.traverse(ast, {
    FunctionDeclaration: dfs
});
fs.writeFileSync(`./target0.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
console.log("降低加密函数层级，处理完毕")

// 全局加密函数
astUtils.traverse(ast, {
    CallExpression(path) {
        if (path.node.callee.name === decrypt.name) {
            const args = path.node.arguments;
            if (args.length === 2) {
                const arg0 = isNaN(parseInt(args[0].value)) ? args[0].value : parseInt(args[0].value);
                const arg1 = args[1].value;
                const decryptedValue = decrypt(arg0, arg1);
                path.replaceWith(types.stringLiteral(unescape(decryptedValue)));
            }
        }
    },
    MemberExpression(path) {
        if (path.node.object.name === decrypt.name) {
            const value = path.node.property.value;
            if (value || value === 0) {
                const decryptedValue = decrypt(value);
                path.replaceWith(types.stringLiteral(unescape(decryptedValue)));
            }
        }
    }
})
fs.writeFileSync(`./target1.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
console.log("全局加密函数，处理完毕")

// 去除死代码
if (true) {
    // 去除自执行函数的无用参数
    // traverse(ast, {
    //     ExpressionStatement: function (path) {
    //         var node = path.node;
    //         if (types.isCallExpression(node.expression) && types.isFunctionExpression(node.expression.callee)) {
    //             if (node.expression.arguments && node.expression.arguments.length != 0) {
    //                 var args = node.expression.arguments
    //                 var params = node.expression.arguments
    //                 for (var i = 0; i < args.length; i++) {
    //                     var arg = args[i].name;
    //                     var param = params[i].name;
    //                     // 遍历MemberExpression节点，如果arg=param，则替换名称
    //                     path.traverse({
    //                         MemberExpression: function (m_path) {
    //                             if (!types.isIdentifier(m_path.object))
    //                                 return;
    //                             if (m_path.object.name != param)
    //                                 return;
    //                             m_node.object.name = arg
    //                         }
    //                     })
    //                 }
    //                 node.expression.arguments = [];
    //                 node.expression.callee.params = [];
    //             }
    //         }
    //     }
    // })
    // fs.writeFileSync(`./target3.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
    traverse(ast, {
        ExpressionStatement: function (path) {
            var node = path.node;
            if (!types.isCallExpression(node.expression) || !types.isFunctionExpression(node.expression.callee))
                return
            if (!node.expression.callee.body || !types.isBlockStatement(node.expression.callee.body))
                return
            if (node.expression.arguments && node.expression.arguments.length > 0)
                return;
            path.replaceWith(node.expression.callee.body);
        }
    })
    fs.writeFileSync(`./target2.js`, generate(ast, {jsescOption: {"minimal": true}}).code);

    // 去除while代码
    astUtils.traverse(ast, {
        WhileStatement: function (path) {
            const node = path.node;
            let case_fun_list = []

            // 判断是否是需要处理的while节点
            if (node.test.value && types.isBlockStatement(node.body)) {
                const switchStatements = node.body.body;
                const switchStatement = switchStatements[0];
                const breakStatement = switchStatements[1];
                if (types.isSwitchStatement(switchStatement) && types.isMemberExpression(switchStatement.discriminant) && types.isBreakStatement(breakStatement)) {
                    const sortedNumberVariableName = switchStatement.discriminant.object.name;
                    const sortedNumberVariableValue = path.getAllPrevSiblings()
                        .map(s => s.node.declarations)
                        .flat()
                        .filter(s => s.id.name === sortedNumberVariableName)[0];


                    const caseSortedList = types.isCallExpression(sortedNumberVariableValue.init) ? sortedNumberVariableValue.init.callee.object.value.split("|") :
                        (types.isArrayExpression(sortedNumberVariableValue.init) ? sortedNumberVariableValue.init.elements.map(e => e.value) : null);
                    if(!!caseSortedList) {
                        const caseList = switchStatement.cases
                        for (const caseIndex of caseSortedList) {
                            const caseBody = caseList[caseIndex].consequent;
                            for (const s of caseBody) {
                                if (types.isContinueStatement(s)) {
                                    break;
                                }
                                case_fun_list.push(s);
                            }
                        }
                        path.replaceWithMultiple(case_fun_list);
                        path.getAllPrevSiblings().forEach(p => p.remove());
                    }
                }
            }
        }
    })
    fs.writeFileSync(`./target3.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
    console.log("去除while代码，处理完毕")
}

// 调用方式由a['b']改为a.b
if (true) {
    astUtils.traverse(ast, {
        MemberExpression: function (path) {
            var node = path.node;
            if (!types.isStringLiteral(node.property))
                return;
            if (!node.computed || !node.computed === true)
                return;

            // 将Literal类型节点转为Identifier节点
            node.computed = false;
            node.property = types.identifier(node.property.value);
        }
    })
    fs.writeFileSync(`./target4.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
    console.log("调用方式由a['b']改为a.b，处理完毕")
}
console.log('解密完毕');