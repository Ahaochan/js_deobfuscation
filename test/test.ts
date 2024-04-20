import utils from '../src/utils'
import fs from 'fs'
import generate from '@babel/generator'
import * as parser from '@babel/parser'

(function main() {
  const astConfig = {
    allowReturnOutsideFunction: true
  }

  // const ast = testEvaluateExpression(astConfig);
  // const ast = testEvaluateFunction(astConfig);
  // const ast = testFlattenCallChain(astConfig);
  // const ast = testInlineFunction(astConfig);
  // const ast = testRemoveEmptyStatement(astConfig);
  // const ast = testRemoveUnusedIf(astConfig);
  // const ast = testRemoveUnusedVar(astConfig);
  // const ast = testSimpleCall(astConfig);
  // const ast = testSimpleClassMethod(astConfig);
  // const ast = testSplitCommaToMultiline(astConfig);
  const ast = testWhileSwitch(astConfig);

  fs.writeFileSync(`./output.js`, generate(ast, {jsescOption: {minimal: true}}).code);
  console.log("处理完毕");
})();

function testEvaluateExpression(astConfig: parser.ParserOptions) {
  const code = fs.readFileSync("../example/evaluateExpression.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.evaluateExpression(ast);
}

function testEvaluateFunction(astConfig: parser.ParserOptions) {
  const code = fs.readFileSync("../example/evaluateFunction.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.evaluateFunction(ast);
}

function testFlattenCallChain(astConfig: parser.ParserOptions) {
  const code = fs.readFileSync("../example/flattenCallChain.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.flattenCallChain(ast);
}

function testInlineFunction(astConfig: parser.ParserOptions) {
  const code = fs.readFileSync("../example/inlineFunction.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.inlineFunction(ast);
}

function testRemoveEmptyStatement(astConfig: parser.ParserOptions) {
  const code = fs.readFileSync("../example/removeEmptyStatement.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.removeEmptyStatement(ast);
}

function testRemoveUnusedIf(astConfig: parser.ParserOptions) {
  const code = fs.readFileSync("../example/removeUnusedIf.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.removeUnusedIf(ast);
}

function testRemoveUnusedVar(astConfig: parser.ParserOptions) {
  const code = fs.readFileSync("../example/removeUnusedVar.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.removeUnusedVar(ast);
}

function testSimpleCall(astConfig: parser.ParserOptions) {
  const code = fs.readFileSync("../example/simpleCall.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.simpleCall(ast);
}

function testSimpleClassMethod(astConfig: parser.ParserOptions) {
  const code = fs.readFileSync("../example/simpleClassMethod.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.simpleClassMethod(ast);
}

function testSplitCommaToMultiline(astConfig: parser.ParserOptions) {
  const code = fs.readFileSync("../example/splitCommaToMultiline.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.splitCommaToMultiline(ast);
}

function testWhileSwitch(astConfig: parser.ParserOptions) {
  const code = fs.readFileSync("../example/whileSwitch.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.whileSwitch(ast);
}
