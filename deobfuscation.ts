// 预处理
import fs from 'fs'
import astUtils from './src/utils'
import generate from '@babel/generator'
import * as parser from '@babel/parser'
import { types } from '@babel/core'

const sourceCode = fs.readFileSync('./dist/source.js').toString()
astUtils.prehandler(sourceCode)
console.log('获取加密算法完毕')
const { decrypt } = require('./dist/context')

// AST语法树解析 https://astexplorer.net/

// 逆向进阶，利用 AST 技术还原 JavaScript 混淆代码 https://mp.weixin.qq.com/s/fIbPuNMs5FRADJE5MOZXgA
// 来自高纬度的对抗：AST解密JS代码实战（下） https://www.jianshu.com/p/c705aec39418
// babel官方文档 https://babeljs.io/docs/en/babel-types
// 深入浅出 Babel 上篇：架构和原理 + 实战 https://juejin.cn/post/6844903956905197576

console.log('加载source.js')
const code = fs.readFileSync('./dist/source.js').toString()
const ast = parser.parse(code, {
  allowReturnOutsideFunction: true
})
astUtils.simple1(ast)
astUtils.simple2(ast)

// 全局加密函数
console.log('使用context.js中的解密函数进行解密')
astUtils.traverse(ast, {
  CallExpression (path) {
    const callee = path.node.callee
    if (types.isIdentifier(callee) && callee.name === decrypt.name) {
      const args = path.node.arguments
      if (args.length === 1) {
        const arg0 = args[0]

        if (types.isStringLiteral(arg0) || types.isNumericLiteral(arg0)) {
          const arg0Value = arg0.value
          const decryptedValue = decrypt(arg0Value)
          path.replaceWith(types.stringLiteral(unescape(decryptedValue)))
        }
      } else if (args.length === 2) {
        const arg0 = args[0]
        const arg1 = args[1]
        if ((types.isStringLiteral(arg0) || types.isNumericLiteral(arg0)) && (types.isStringLiteral(arg1) || types.isNumericLiteral(arg1))) {
          const arg0Value = arg0.value
          const arg1Value = arg1.value
          const decryptedValue = decrypt(arg0Value, arg1Value)
          path.replaceWith(types.stringLiteral(unescape(decryptedValue)))
        }
      }
    }
  },
  MemberExpression (path) {
    const object = path.node.object
    if (types.isIdentifier(object) && object.name === decrypt.name) {
      const property = path.node.property
      if (types.isStringLiteral(property) || types.isNumericLiteral(property) || types.isBooleanLiteral(property)) {
        const value = property.value
        if (value || value === 0) {
          const decryptedValue = decrypt(value)
          path.replaceWith(types.stringLiteral(unescape(decryptedValue)))
        }
      }
    }
  }
})
fs.writeFileSync(`./target1.js`, generate(ast, { jsescOption: { 'minimal': true } }).code)

// 控制流平坦化
astUtils.whileSwitch(ast)

astUtils.simple1(ast)
astUtils.simple2(ast)
console.log('处理完毕')
fs.writeFileSync(`./target1.js`, generate(ast, { jsescOption: { 'minimal': true } }).code)
