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
 * @const
 * @type {string}
 */
cli.description = '素材库中样式开发常用的一些工具';

/**
 * @param {Array.<string>} args 命令行参数.
 * @param {Object.<string, string>} opts 命令的可选参数.
 */
/*cli.main = function(args, opts) {
    console.log(args);
    console.log(opts);

    if (args.length <= 0) {
        console.error(cli.usage);
        process.exit(0);
    }

    var fs = require('fs');
    var path = require('path');
    if (fs.existsSync("./lib/" + args[0] + '.js')) {
        var cmd = require("./lib/" + args[0]);
        console.log(cmd);
        cmd.main && cmd.main(opts);
    }
}*/

exports.cli = cli;






















/* vim: set ts=4 sw=4 sts=4 tw=100: */
