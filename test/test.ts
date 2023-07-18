import utils from "../src/utils";
import * as fs from "fs";
import * as parser from "@babel/parser";
import {ParserOptions} from "@babel/parser";
import generate from "@babel/generator";

(function main() {
    const astConfig = {
        allowReturnOutsideFunction: true
    }

    // const ast = testRemoveUnusedIf(astConfig);
    // const ast = testSplitCommaToMultiline(astConfig);
    // const ast = testRemoveEmptyStatement(astConfig);
    const ast = testEvaluate(astConfig);


    fs.writeFileSync(`./test.js`, generate(ast, {jsescOption: {"minimal": true}}).code);
    console.log("处理完毕");
})();


function testRemoveUnusedIf(astConfig: ParserOptions) {
    const code = fs.readFileSync("../example/removeUnusedIf.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.removeUnusedIf(ast);
}

function testSplitCommaToMultiline(astConfig: ParserOptions) {
    const code = fs.readFileSync("../example/splitCommaToMultiline.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.splitCommaToMultiline(ast);
}

function testRemoveEmptyStatement(astConfig: ParserOptions) {
    const code = fs.readFileSync("../example/removeEmptyStatement.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.removeEmptyStatement(ast);
}

function testEvaluate(astConfig: ParserOptions) {
    const code = fs.readFileSync("../example/evaluate.js").toString();
    const ast = parser.parse(code, astConfig);
    return utils.evaluate(ast);
}