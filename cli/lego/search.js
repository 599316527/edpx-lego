/***************************************************************************
 *
 * Copyright (c) 2015 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file cli/lego/search.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2015/04/17 17:36:52$
 * @desc:    search template by impl namespace
 *
 **************************************************************************/

var req = require('../../lego/requester');
var fs = require('fs');
var util = require('../../lego/util');
var chalk = require('chalk');

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
cli.command = 'search';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '根据 impl namespace 搜索样式信息';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego search <impl namespace>';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 选项
 */
cli.main = function (args, opts) {
    req.prepare(function () {
        var commandArgs = util.parseIds(args);
        if (!commandArgs || !commandArgs.others.length) {
            console.log('ERROR: missing impl namespace of template in args');
        }
        else {
            var nss = [];
            commandArgs.others.forEach(function (item) {
                nss = nss.concat(item.split(','));
            });
            searchTemplate(nss);
        }
    });

    function searchTemplate(nss) {
        req.getTemplateList(function (err, list) {
            if (err) {
                console.log('ERROR: ' + err);
            }
            else {
                var count = list.length;
                var detailList = [];
                list.forEach(function (item) {
                    req.getTemplateDetail(item.templateId, function (err, data) {
                        if (err) {
                            console.log('ERROR: ' + err);
                        }
                        else {
                            var detail = data.result;
                            // if (detail.spec) {
                            //     try {
                            //         detail.spec = JSON.parse(detail.spec);
                            //     }
                            //     catch(e) {
                            //         try {
                            //             /* eslint-disable */
                            //             detail.spec = eval('(' + detail.spec + ')');
                            //             /* eslint-enable */
                            //             // 如果用JS去解析JSON都解析不了
                            //             // 那就回指定catch里的语句，报ERROR
                            //             // 否则指定下面的语句，报WARNING
                            //             console.log('WARN: invalid json, templateId=' + detail.templateId + ', ' + e);
                            //         }
                            //         catch(ex) {
                            //             console.log('ERROR: parse spec error, ' + e);
                            //             console.log(JSON.stringify(detail));
                            //         }
                            //     }
                            // }
                            detailList.push(detail);
                        }
                        count--;
                        if (count === 0) {
                            output(detailList, nss);
                        }
                    });
                });
            }
        });
    }

    function output(list, nss) {
        var find = {};
        nss.forEach(function (ns) {
            find[ns] = [];
            list.forEach(function (template) {
                var impls = template.impls;
                if (impls) {
                    impls.forEach(function (impl, i) {
                        if (impl.ns === ns) {
                            find[ns].push([template.templateId, template.templateName, impl.name]);
                        }
                    });
                }
            });
        });
        for (var key in find) {
            if (find.hasOwnProperty(key)) {
                if (!find[key].length) {
                    console.log('[WARN] Namespace [' + chalk.red(key) + '] not exists in any templates.');
                }
                else {
                    console.log('[INFO] Namespace [' + chalk.green(key) + '] exists in:');
                    find[key].forEach(function (item) {
                        console.log('    ' + item.join('  '));
                    });
                }
            }
        }
    }
};


/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;

























/* vim: set ts=4 sw=4 sts=4 tw=100 : */
