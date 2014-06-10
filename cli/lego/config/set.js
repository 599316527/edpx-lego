/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    cli/lego/config/set.js
 * desc:    设置配置项
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/06/10 11:52:30$
 */

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
cli.command = 'set';

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
cli.description = '设置配置项';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego config set <key> <value>';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    if (!args.length || args.length < 2) {
        console.log('Usage:');
        console.log(cli.usage);
        return;
    }
    else {
        var key = args[0];
        var value = args[1];
        var config = require('../../../config');
        config.set(key, value);
    }
};


/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;





















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
