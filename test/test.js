const utils = require('../src/utils')
const fs = require('fs');
const generate = require('@babel/generator').default;
const parser = require('@babel/parser');

(function main() {
  const astConfig = {
    allowReturnOutsideFunction: true
  }

  const ast = testApply(astConfig);
  // const ast = testEvaluateExpression(astConfig);
  // const ast = testEvaluateFunction(astConfig);
  // const ast = testFlattenCallChain(astConfig);
  // const ast = testInlineFunction(astConfig);
  // const ast = testMergeObject(astConfig);
  // const ast = testRemoveDoubleBlock(astConfig);
  // const ast = testRemoveEmptyStatement(astConfig);
  // const ast = testRemoveUnusedIf(astConfig);
  // const ast = testRemoveUnusedVar(astConfig);
  // const ast = testSimpleCall(astConfig);
  // const ast = testSimpleClassMethod(astConfig);
  // const ast = testSplitCommaToMultiline(astConfig);
  // const ast = testWhileSwitch(astConfig);

  fs.writeFileSync(`./output.js`, generate(ast, {jsescOption: {minimal: true}}).code);
  console.log("处理完毕");
})();

function testApply(astConfig) {
  const code = fs.readFileSync("../example/apply.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.apply(ast);
}

function testEvaluateExpression(astConfig) {
  const code = fs.readFileSync("../example/evaluateExpression.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.evaluateExpression(ast);
}

function testEvaluateFunction(astConfig) {
  const code = fs.readFileSync("../example/evaluateFunction.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.evaluateFunction(ast);
}

function testFlattenCallChain(astConfig) {
  const code = fs.readFileSync("../example/flattenCallChain.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.flattenCallChain(ast);
}

function testInlineFunction(astConfig) {
  const code = fs.readFileSync("../example/inlineFunction.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.inlineFunction(ast);
}

function testMergeObject(astConfig) {
  const code = fs.readFileSync("../example/mergeObject.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.mergeObject(ast);
}

function testRemoveDoubleBlock(astConfig) {
  const code = fs.readFileSync("../example/removeDoubleBlock.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.removeDoubleBlock(ast);
}

function testRemoveEmptyStatement(astConfig) {
  const code = fs.readFileSync("../example/removeEmptyStatement.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.removeEmptyStatement(ast);
}

function testRemoveUnusedIf(astConfig) {
  const code = fs.readFileSync("../example/removeUnusedIf.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.removeUnusedIf(ast);
}

function testRemoveUnusedVar(astConfig) {
  const code = fs.readFileSync("../example/removeUnusedVar.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.removeUnusedVar(ast);
}

function testSimpleCall(astConfig) {
  const code = fs.readFileSync("../example/simpleCall.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.simpleCall(ast);
}

function testSimpleClassMethod(astConfig) {
  const code = fs.readFileSync("../example/simpleClassMethod.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.simpleClassMethod(ast);
}

function testSplitCommaToMultiline(astConfig) {
  const code = fs.readFileSync("../example/splitCommaToMultiline.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.splitCommaToMultiline(ast);
}

function testWhileSwitch(astConfig) {
  const code = fs.readFileSync("../example/whileSwitch.js").toString();
  const ast = parser.parse(code, astConfig);
  return utils.whileSwitch(ast);
}
