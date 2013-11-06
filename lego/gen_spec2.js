/***************************************************************************
 *
 * Copyright (c) 2013 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 **************************************************************************/



/**
 * gen_spec2.js ~ 2013/11/01 16:44:39
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$
 * @description
 *
 **/

/**
 * 命令行配置项
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * 命令名称
 *
 * @type {string}
 */
cli.command = 'gen_spec2';

cli.options = ['from:', 'to:'];

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '分析impl.js，生成初版的spec.json';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego gen_spec2 <ad.js>';

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

function parseNewExpression(node, parent) {
    var klsName = getClassName(node.callee);
    if (/^ad\.widget\./.test(klsName)) {
        var args = node.arguments;
        if (args.length != 1) {
            console.error("Invalid arguments count for [%s]", klsName);
            return;
        }

        var cfg = args[0];

        if (cfg.type === 'ObjectExpression') {
            // 可能是硬编码的配置信息，不需要从AD_CONFIG中读取
            return;
        }

        if (cfg.type !== 'MemberExpression') {
            console.error("Invalid arguments format for [%s]", klsName);
            return;
        }

        if (cfg.object.type !== 'Identifier' ||
            cfg.object.name !== 'AD_CONFIG') {
            console.error("The [%s] arguments should begin with AD_CONFIG.", klsName);
            return;
        }

        if (!cfg.property || cfg.property.type !== 'Literal') {
            console.error("The [%s] AD_CONFIG's key should be const string.", klsName);
            return;
        }

        return [klsName, cfg.property.value];
    }
};

/**
 * 根据分析出来的tokens，生成对应的spec文件
 * @param {Array.<*>} tokens
 */
function generateSpecs(tokens) {
    var fs = require('fs');
    var path = require('path');

    var spec = [];
    tokens.forEach(function(token){
        var klsName = token[0];
        var key = token[1];
        var fileName = Indexer[klsName];
        if (!fileName) {
            console.error("No such file %s", fileName);
            return;
        }

        var widgetSpecFileName = path.join('src',
            fileName.replace('.js', '.spec.json'));
        if (!fs.existsSync(widgetSpecFileName)) {
            console.error("No such file %s", widgetSpecFileName);
            return;
        }

        var widgetSpec = JSON.parse(
            fs.readFileSync(widgetSpecFileName, 'utf-8'));
        if (!widgetSpec) {
            console.error("Invalid widget spec format %s", widgetSpecFileName);
            return;
        }

        spec.push({
            name: key,
            displayName: key,
            datatype: 'OBJECT',
            display: 'toggle-block',
            items: widgetSpec.userPrefs
        });
    });

    console.log(JSON.stringify(spec, null, 2));
};

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    var fs = require('fs');
    if (!args[0] || !fs.existsSync(args[0])) {
        console.log(cli.usage);
        process.exit(0);
    }

    if (!fs.existsSync('src/deps.js')) {
        console.error("Can't find src/deps.js");
        process.exit(0);
    }

    buildIndex();

    var esprima = require('esprima');
    var estraverse = require('estraverse');
    var ast = esprima.parse(fs.readFileSync(args[0], 'utf-8'));
    var tokens = [];
    estraverse.traverse(ast, {
        enter: function(node, parent) {
            if (node.type == 'CallExpression') {
                // console.log(node.id.name);
            }
        },
        leave: function(node, parent) {
            if (node.type == 'NewExpression') {
                var token = parseNewExpression(node, parent);
                if (token) {
                    tokens.push(token);
                }
            }
        }
    });

    generateSpecs(tokens);
}

exports.cli = cli;





















/* vim: set ts=4 sw=4 sts=4 tw=100: */
