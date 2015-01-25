/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    cli/lego/config/list.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/06/10 11:52:14$
 * @desc:    列出配置项
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
cli.command = 'list';

/**
 * 选项
 * @type {Array}
 */
cli.options = [];

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '列出配置项';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego config list';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 选项
 */
cli.main = function (args, opts) {
    var config = require('../../../config');
    var confData = config.get();
    Object.keys(confData).forEach(function (key) {
        var value = confData[key];
        if (typeof value === 'object') {
            value = JSON.stringify(value, null, 4);
        }

        console.log(key + ':');
        console.log(value);
        console.log();
    });
};


/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;





















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
