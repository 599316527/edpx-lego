/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    update_template.js
 * desc:    更新指定ID的一个或多个样式
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/01/13 11:29:03$
 */

var req = require('../../lego/requester');
var fs = require('fs');
var util = require('../../lego/util');

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
cli.command = 'update_template';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '更新指定ID的一个或多个样式';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego update_template <ID>[,<ID>]';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    req.prepare(function() {
        var commandArgs = util.parseIds(args);
        if (!commandArgs || !commandArgs.ids.length) {
            console.log('ERROR: missing id of template in args');
        }
        else {
            updateTemplateById(commandArgs.ids);
        }
    });

    function updateTemplateById(ids) {
        var failedList = [];
        util.poolify(
            ids,
            2,
            function(templateId, callback) {
                req.updateTemplate(templateId, function(err) {
                    if (err) {
                        console.log('ERROR: update template fail: ' + err + ', templateId = ' + templateId);
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
