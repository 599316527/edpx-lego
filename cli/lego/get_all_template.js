/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    get_all_template.js
 * desc:    获取所有素材库样式
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/01/13 10:46:47$
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
cli.command = 'get_all_template';

/**
 * 选项
 * @type {Array}
 */
cli.options = ['filter:'];

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '获取所有样式数据';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego get_all_template [--filter=<your.filter>] <saveto.json>\n\nfilter example:\n\n    function(item) {\n        if (/无线品专/.test(item.templateName)) {\n            return item;\n        }\n    }';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    req.prepare(function() {
        var file = args[0] || 'all_template.json';
        var filter = opts['filter'];
        getAllTemplate(file, filter || null);
    });

    function getAllTemplate(file, opt_filter) {
        var filter = null;
        if (opt_filter && fs.existsSync(opt_filter)) {
            var filterStr = fs.readFileSync(opt_filter, 'utf-8');
            filter = eval('(function() {return (' + filterStr + ');})();');
        }
        req.getTemplateList(function(err, list) {
            if (err) {
                console.log('ERROR: ' + err);
            }
            else {
                var count = list.length;
                var detailList = [];
                list.forEach(function(item) {
                    req.getTemplateDetail(item.templateId, function(err, data) {
                        if (err) {
                            console.log('ERROR: ' + err);
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
                            if (filter) {
                                detail = filter(detail);
                                if (detail) {
                                    detailList.push(detail);
                                }
                            }
                            else {
                                detailList.push(detail);
                            }
                        }
                        count--;
                        if (count == 0) {
                            console.log('Total template count: ' + detailList.length);
                            console.log('It\'s saved in ' + file + '!');
                            fs.writeFileSync(file, JSON.stringify(detailList, null, 4));
                        }
                    });
                });
            }
        });
    }
};


/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
