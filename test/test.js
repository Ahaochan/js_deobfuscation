const utils = require('../src/utils-old');
const fs = require("fs");
const parser = require("@babel/parser");
const { ParserOptions } = require("@babel/parser");
const generate = require('@babel/generator').default;

(function main() {
    const astConfig = {
        allowReturnOutsideFunction: true
    }

    // const ast = testEvaluate(astConfig);
    // const ast = testFlattenCallChain(astConfig);
    // const ast = testInlineFunction(astConfig);
    // const ast = testRemoveEmptyStatement(astConfig);
    // const ast = testRemoveUnusedIf(astConfig);
    // const ast = testRemoveUnusedVar(astConfig);
    // const ast = testSimpleCall(astConfig);
    const ast = testSimpleClassMethod(astConfig);
    // const ast = testSplitCommaToMultiline(astConfig);



    fs.writeFileSync(`./output.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
    console.log("处理完毕");
})();

function testEvaluate(astConfig) {
    const code = fs.readFileSync("../example/evaluate.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.evaluateExpression(ast);
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

function testRemoveEmptyStatement(astConfig) {
    const code = fs.readFileSync("../example/removeEmptyStatement.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.removeEmptyStatement(ast);
}

function testRemoveUnusedVar(astConfig) {
    const code = fs.readFileSync("../example/removeUnusedVar.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.removeUnusedVar(ast);
}

function testRemoveUnusedIf(astConfig) {
    const code = fs.readFileSync("../example/removeUnusedIf.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.removeUnusedIf(ast);
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