/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    get_template.js
 * desc:    获取指定ID的一个或多个样式
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/01/12 20:48:56$
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
cli.command = 'get_template';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '获取指定ID的样式数据';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego get_template <saveto.json> <ID>[,<ID>]';

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
            var saveTo = commandArgs.others[0] || 'downloaded_template.json';
            getTemplate(commandArgs.ids, saveTo);
        }
    });

    function getTemplate(ids, file) {
        var list = [];
        util.poolify(
            ids,
            20,
            function(templateId, callback) {
                req.getTemplateDetail(templateId, function(err, data) {
                    if (err) {
                        console.log('ERROR: read template fail: ' + err);
                    }
                    else {
                        var detail = data.result;
                        if (detail.spec) {
                            try {
                                detail.spec = JSON.parse(detail.spec);
                            }
                            catch(e) {
                                try {
                                    detail.spec = eval('(' + detail.spec + ')');
                                    // 如果用JS去解析JSON都解析不了
                                    // 那就回指定catch里的语句，报ERROR
                                    // 否则指定下面的语句，报WARNING
                                    console.log('WARN: invalid json, templateId=' + detail.templateId + ', ' + e);
                                }
                                catch(ex) {
                                    console.log('ERROR: parse spec error, ' + e);
                                    console.log(JSON.stringify(detail));
                                }
                            }
                        }
                        list.push(data.result);
                    }
                    callback();
                });
            },
            function() {
                console.log('It\'s saved in ' + file + '!');
                fs.writeFileSync(file, JSON.stringify(list, null, 4));
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
