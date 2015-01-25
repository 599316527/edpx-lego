/***************************************************************************
 *
 * Copyright (c) 2013 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file   cli/lego/cdn_delete.js ~ 2013/10/29 21:09:17
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$
 * @description  cdn 删除缓存
 *
 **************************************************************************/


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
cli.command = 'cdn_delete';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '清除cdn的缓存';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego cdn_delete <url>';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 选项
 */
cli.main = function (args, opts) {
    var url = args[0];
    if (url) {
        var request = require('request');
        url = 'http://mailer.bae.baidu.com/service/cdn/delete_file?s=' + encodeURIComponent(url);
        request(url, function (error, response, body) {
            if (error) {
                throw error;
            }
            console.log(body);
        });
    }
};


/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;






















/* vim: set ts=4 sw=4 sts=4 tw=100: */
