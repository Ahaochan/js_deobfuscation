// 预处理
const fs = require('fs');
const astUtils = require('./src/utils')
const sourceCode = fs.readFileSync("./dist/source.js").toString();
astUtils.prehandler(sourceCode);

// AST语法树解析 https://astexplorer.net/

// 逆向进阶，利用 AST 技术还原 JavaScript 混淆代码 https://mp.weixin.qq.com/s/fIbPuNMs5FRADJE5MOZXgA
// 来自高纬度的对抗：AST解密JS代码实战（下） https://www.jianshu.com/p/c705aec39418
// babel官方文档 https://babeljs.io/docs/en/babel-types
// 深入浅出 Babel 上篇：架构和原理 + 实战 https://juejin.cn/post/6844903956905197576
const parser = require("@babel/parser");
const generate = require("@babel/generator").default
const traverse = require("@babel/traverse").default
const types = require("@babel/types");
const {decrypt} = require('./dist/context')

const code = fs.readFileSync("./dist/source.js").toString();
const ast = parser.parse(code, {
    allowReturnOutsideFunction: true
});
fs.writeFileSync(`./target8.js`, generate(ast, {jsescOption: {"minimal": true}}).code);

// 降低加密函数层级
traverse(ast, {
    VariableDeclarator(path) {
        try {
            if(types.isIdentifier(path.node.init) && path.node.init.name === decrypt.name ) {
                for (const referencePath of path.scope.getBinding(path.node.id.name).referencePaths) {
                    referencePath.replaceWith(types.identifier(decrypt.name));
                }
            }
        } catch (e) {
            debugger
        }
    }
})
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
traverse(ast, {
    FunctionDeclaration: dfs
});
fs.writeFileSync(`./target0.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
console.log("降低加密函数层级，处理完毕")

// 全局加密函数
traverse(ast, {
    CallExpression(path) {
        for (const decryptKey in decrypt) {
            if (path.node.callee.name === decryptKey) {
                const args = path.node.arguments;
                if (args.length === 1) {
                    const arg0 = args[0].value;
                    const decryptedValue = decrypt[decryptKey](arg0);
                    path.replaceWith(types.stringLiteral(unescape(decryptedValue)));
                } else if (args.length === 2) {
                    const arg0 = isNaN(parseInt(args[0].value)) ? args[0].value : parseInt(args[0].value);
                    const arg1 = args[1].value;
                    const decryptedValue = decrypt[decryptKey](arg0, arg1);
                    path.replaceWith(types.stringLiteral(unescape(decryptedValue)));
                }
            }
        }
    },
    MemberExpression(path) {
        for (const decryptKey in decrypt) {
            if (path.node.object.name === decryptKey) {
                const value = path.node.property.value;
                if (value || value === 0) {
                    const decryptedValue = decrypt[decryptKey](value);
                    path.replaceWith(types.stringLiteral(unescape(decryptedValue)));
                }
            }
        }
    }
})
fs.writeFileSync(`./target1.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
console.log("全局加密函数，处理完毕")

// 去除死代码
if (true) {
    astUtils.traverse(ast, {
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
    astUtils.simple1(ast);
    astUtils.simple2(ast);
    fs.writeFileSync(`./target2.js`, generate(ast, {jsescOption: {"minimal": true}}).code);

    // 去除while代码
    astUtils.whileSwitch(ast);
    fs.writeFileSync(`./target3.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
    console.log("去除while代码，处理完毕")
}

// 调用方式由a['b']改为a.b
if (true) {
    astUtils.simple1(ast);
    astUtils.simple2(ast);

    fs.writeFileSync(`./target4.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
    console.log("调用方式由a['b']改为a.b，处理完毕")
}
console.log('解密完毕');
