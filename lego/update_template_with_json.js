/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    update_template_with_json.js
 * desc:    更新指定JSON中的多个样式
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/01/13 13:18:02$
 */

var req = require('./requester');
var fs = require('fs');
var util = require('./util');

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
cli.command = 'update_template_with_json';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '更新JSON文件中指定的多个样式';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego update_template_with_json <template.json>';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    req.prepare(function() {
        var file = args[0];
        if (!file) {
            console.log('ERROR: missing json file in args');
        }
        else {
            var json = JSON.parse(fs.readFileSync(file, 'utf-8'));
            updateTemplateWithJson(json);
        }
    });

    function updateTemplateWithJson(list) {
        // 倒序，保证更新之后仍大约按list里模板的顺序(因为先更新的模板会放到后面去...)
        list.reverse();

        var failedList = [];
        util.poolify(
            list,
            2,
            function(detail, callback) {
                req.updateTemplate(detail, function(err) {
                    if (err) {
                        console.log('ERROR: update template fail: ' + err + ', templateId = ' + detail.templateId);
                        failedList.push(detail.templateId);
                    }
                    callback();
                });
            },
            function() {
                if (failedList.length) {
                    console.log('ERROR: failed templates are:');
                    console.log(failedList.join(','));
                }
            }
        );
    }
};


/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;






















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
