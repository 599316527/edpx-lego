/***************************************************************************
 * 
 * Copyright (c) 2013 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * base.js ~ 2013/12/05 22:06:20
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/

/**
 * @param {string} code 代码实现.
 * @param {string} filename 文件名.
 */
exports.getTokens = function getTokens(code, filename) {
    var esprima = require('esprima');
    var estraverse = require('estraverse');
    var ast = esprima.parse(code);
    var tokens = [];
    estraverse.traverse(ast, {
        enter: function(node, parent) {
            if (node.type == 'CallExpression') {
                // console.log(node.id.name);
            }
        },
        leave: function(node, parent) {
            if (node.type == 'NewExpression') {
                var token = parseNewExpression(node, parent, filename);
                if (token) {
                    tokens.push(token);
                }
            }
        }
    });

    return tokens;
}

/**
 * Namespace -> Filename的映射关系
 */
var Indexer = {};

function buildIndex() {
    var goog = {
        addDependency: function(filename, provides, requires) {
            provides.forEach(function(provide){
                Indexer[provide] = filename;
            });
        }
    };

    var fs = require('fs');
    var lines = fs.readFileSync('src/deps.js', 'utf-8').split(/\r?\n/g);
    lines.forEach(function(line){
        if (/^goog\.addDependency/.test(line)) {
            eval(line);
        }
    });
}

/**
 * @param {string} namespace 从namespace计算文件名.
 */
exports.getFilename = function getFilename(namespace) {
    if (!Object.keys(Indexer).length) {
        buildIndex();
    }
    return Indexer[namespace];
}

function parseNewExpression(node, parent, filename) {
    var klsName = getClassName(node.callee);
    if (/^ad\.widget\./.test(klsName)) {
        var args = node.arguments;
        if (args.length != 1) {
            console.error("%s: Invalid arguments count for [%s]", filename, klsName);
            return;
        }

        var cfg = args[0];

        if (cfg.type === 'ObjectExpression') {
            // 可能是硬编码的配置信息，不需要从AD_CONFIG中读取
            return;
        }

        if (cfg.type !== 'MemberExpression') {
            console.error("%s: Invalid arguments format for [%s]", filename, klsName);
            return;
        }

        if (cfg.object.type !== 'Identifier' ||
            cfg.object.name !== 'AD_CONFIG') {
            console.error("%s: The [%s] arguments should begin with AD_CONFIG.", filename, klsName);
            return;
        }

        if (!cfg.property || cfg.property.type !== 'Literal') {
            console.error("%s: The [%s] AD_CONFIG's key should be const string.", filename, klsName);
            return;
        }

        return [klsName, cfg.property.value];
    }
};

/**
 * 获取NewExpression的ClassName
 * @return {string}
 */
function getClassName(callee) {
    // {"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"ad"},"property":{"type":"Identifier","name":"widget"}},"property":{"type":"Identifier","name":"SmallHead"}}
    if (!callee.property) {
        return callee.name;
    }
    return getClassName(callee.object) + '.' + callee.property.name;
};




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
