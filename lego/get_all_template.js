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
cli.command = 'get_all_template';

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
cli.usage = 'edp lego get_all_template <saveto.json>';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    req.prepare(function() {
        var file = args[0] || 'all_template.json';
        getAllTemplate(file);
    });

    function getAllTemplate(file, opt_callback) {
        req.getTemplateList(function(err, list) {
            if (err) {
                console.log('ERROR: ' + err);
            }
            else {
                var count = list.length;
                console.log('Total template count: ' + count);
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
                                    console.log('ERROR: parse spec error, ' + e);
                                    console.log(JSON.stringify(detail));
                                }
                            }
                            detailList.push(detail);
                        }
                        count--;
                        if (count == 0) {
                            if (opt_callback) {
                                opt_callback(null, detailList);
                            }
                            else if (file) {
                                console.log('It\'s saved in ' + file + '!');
                                fs.writeFileSync(file, JSON.stringify(detailList, null, 4));
                            }
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
