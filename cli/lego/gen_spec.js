/***************************************************************************
 *
 * Copyright (c) 2013 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 **************************************************************************/



/**
 * lib/gen_spec.js ~ 2013/10/11 13:54:59
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$
 * @description
 * 生成一个定制样式的spec.
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
cli.command = 'gen_spec';

cli.options = ['from:', 'to:'];

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '添加扩展目录';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego gen_spec --from=spec.json[ --to=spec.final.json]';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    // 读取from的输入，解析如下格式的内容
    // "Var(ad.widget.H1)"
    // "Var(ad.widget.H1@32)"
    // 然后根据http://lego-api-sandbox.baidu.com/v1/widgets/list?ns=ad.widget.siva.Img_with_sitelinks这个接口
    // 获取对应的spec信息，替换并输出到--to或者标准输出
    var fs = require('fs');
    if (!opts.from || !fs.existsSync(opts.from)) {
        console.error(cli.usage);
        process.exit(1);
    }

    var input = JSON.parse(fs.readFileSync(opts.from));
    if (!input) {
        console.error("Invalid json input `%s'", opts.from);
        process.exit(1);
    }

    if (typeof input === 'object') {
        // 输入的格式是：
        // {'image': 'ad.widget.ImageGrid'}
        // 转化为:
        // [
        //   {'name':'image','displayName':'image',
        //    'datatype':'OBJECT','display':'toggle-block',
        //    'rules':{},'items':'Var(ad.widget.ImageGrid)'}
        // ]
        var transformed = [];
        for(var key in input) {
            if (typeof input[key] === 'string' &&
                /^ad\.widget\./.test(input[key])) {
                transformed.push({
                    'name': key,
                    'displayName': key,
                    'datatype': 'OBJECT',
                    'display': 'toggle-block',
                    'rules': {},
                    'items': 'Var(' + input[key] + ')'
                });
            }
        }
        input = transformed;
    }

    // 获取所有的ns列表
    var list = [];
    function walk(root, callback) {
        if (typeof root === 'array') {
            for (var i = 0; i < root.length; i ++) {
                walk(root[i], callback);
            }
        } else if (typeof root === 'object') {
            for(var key in root) {
                var value = root[key];
                if (typeof value === 'array' || typeof value === 'object') {
                    walk(value, callback);
                }
                else if (typeof value === 'string') {
                    var pattern = /^Var\(([\w\d\._]+)(@(\d+))?\)$/;
                    var match = pattern.exec(value)
                    if (match) {
                        callback(root, key, value, match);
                    }
                }
            }
        }
    }
    walk(input, function(node, key, value, match){
        list.push(match[1]);
    });

    if (list.length <= 0) {
        console.error("Nothing can be replaced.");
        process.exit(0);
    }

    // 递归的发请求，一个结束了请求下一个
    var rsp = {};
    var index = 0;
    var count = list.length;
    function getWidgetInfo(callback) {
        if (index >= count) {
            callback();
            return;
        }

        var request = require('request');
        var ns = list[index];
        if (rsp[ns]) {
            index ++;
            getWidgetInfo(callback);
            return;
        }

        var url = 'http://lego-api-sandbox.baidu.com/v1/widgets/list?ns=' + encodeURIComponent(ns);
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                rsp[ns] = JSON.parse(body);
            }
            index ++;
            getWidgetInfo(callback);
        });
    }

    getWidgetInfo(function(){
        walk(input, function(node, key, value, match){
            var ns = match[1];
            var id = parseInt(match[3] || 0, 10);
            var array = rsp[ns];
            if (!array) {
                return;
            }

            var item = array[0];
            if (id !== 0) {
                for (var i = 0; i < array.length; i ++) {
                    if (array[i].id === id) {
                        item = array[i];
                        break;
                    }
                }
            }

            node[key] = item.spec.userPrefs;
        });
        console.log(JSON.stringify(input, null, 2));
    });

};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;






















/* vim: set ts=4 sw=4 sts=4 tw=100: */
