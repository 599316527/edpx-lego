/***************************************************************************
 *
 * Copyright (c) 2013 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 **************************************************************************/



/**
 * lib/lego.js ~ 2013/10/11 13:38:53
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$
 * @description
 * lego.baidu.com相关的功能.
 **/

/**
 * 命令行配置项
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * @const
 * @type {string}
 */
cli.command = 'lego';

/**
 * @const
 * @type {Array.<string>}
 */
cli.options = [];

/**
 * @const
 * @type {string}
 */
cli.usage = 'edp lego <sub_cmd> ...';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    console.log( 'See `edp lego --help`' );
};

/**
 * @const
 * @type {string}
 */
cli.description = '素材库中样式开发常用的一些工具';

exports.cli = cli;






















/* vim: set ts=4 sw=4 sts=4 tw=100: */
