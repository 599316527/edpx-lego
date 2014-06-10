/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    cli/lego/config.js
 * desc:    配置
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/06/10 08:20:52$
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
cli.command = 'config';

/**
 * 选项
 * @type {Array}
 */
cli.options = [];

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    console.log( 'See `edp lego config --help`' );
};

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '读取或写入配置';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego config';

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;






















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
