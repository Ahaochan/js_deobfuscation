const utils = require('../src/utils-old');
const fs = require("fs");
const parser = require("@babel/parser");
const { ParserOptions } = require("@babel/parser");
const generate = require('@babel/generator').default;

(function main() {
    const astConfig = {
        allowReturnOutsideFunction: true
    }

    // const ast = testRemoveUnusedIf(astConfig);
    // const ast = testSplitCommaToMultiline(astConfig);
    // const ast = testRemoveEmptyStatement(astConfig);
    // const ast = testEvaluate(astConfig);
    const ast = testFlattenCallChain(astConfig);


    fs.writeFileSync(`./output.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
    console.log("处理完毕");
})();


function testRemoveUnusedIf(astConfig) {
    const code = fs.readFileSync("../example/removeUnusedIf.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.removeUnusedIf(ast);
}

function testSplitCommaToMultiline(astConfig) {
    const code = fs.readFileSync("../example/splitCommaToMultiline.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.splitCommaToMultiline(ast);
}

function testRemoveEmptyStatement(astConfig) {
    const code = fs.readFileSync("../example/removeEmptyStatement.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.removeEmptyStatement(ast);
}

function testEvaluate(astConfig) {
    const code = fs.readFileSync("../example/evaluate.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.evaluate(ast);
}

function testFlattenCallChain(astConfig) {
    const code = fs.readFileSync("../example/flattenCallChain.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.flattenCallChain(ast);
}