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
        var fileName = require('./base').getFilename(klsName);
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

    var tokens = require('./base').getTokens(fs.readFileSync(args[0], 'utf-8'));
    generateSpecs(tokens);
}

exports.cli = cli;





















/* vim: set ts=4 sw=4 sts=4 tw=100: */
