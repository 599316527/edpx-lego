/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    get_drmc.js
 * desc:    根据mcid或者mid获取drmc内容
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/01/13 23:46:51$
 */

var req = require('./requester');
var fs = require('fs');
var path = require('path');
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
cli.command = 'get_drmc';

/**
 * 选项
 * @type {Array}
 */
cli.options = ['by:', 'format:', 'output_dir:'];

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
cli.usage = 'edp lego get_drmc [--by=(mcid|mid)] [--format=(json|file)] [--output_dir=<dir>] [<id_in_file>] [<ID>[,<ID>]]';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    req.prepare(function() {
        var commandArgs = util.parseIds(args);
        var idFile = commandArgs.others[0];
        if (!commandArgs || (!commandArgs.ids.length && !idFile)) {
            console.log('ERROR: missing id or id_file in args');
        }
        else {
            var saveToDir = opts['output_dir'] || '.';
            var format = opts['format'] || 'file';
            var by = opts['by'] || 'mcid';
            var ids = getIds(idFile, commandArgs.ids);
            getDrmc(ids, saveToDir, by, format);
        }
    });

    function getIds(idFile, ids) {
        ids = ids || [];
        if (idFile) {
            if (fs.existsSync(idFile)) {
                idStr = fs.readFileSync(idFile, 'utf-8');
                try {
                    // 先尝试JSON解析
                    idsInFile = JSON.parse(idStr);
                    ids = ids.concat(idsInFile);
                }
                catch(e) {
                    // 再把它当成空白字符(空格、回车等)分隔的id
                    var arr = idStr.split(/\s+/);
                    var wrong = [];
                    arr.forEach(function(item) {
                        if (item) {
                            if (/^\d+$/.test(item)) {
                                ids.push(item);
                            }
                            else {
                                wrong.push(item);
                            }
                        }
                    });
                    if (wrong.length) {
                        console.log('ERROR: invalid id, ' + JSON.stringify(wrong));
                    }
                }
            }
            else {
                console.log('ERROR: file not exist, ' + idFile);
            }
        }
        return ids;
    }

    function getDrmc(ids, saveToDir, by, format) {
        var reqFunc = (by == 'mcid' ? req.getDrmcByMcid : req.getDrmcByMid);
        var list = [];
        util.poolify(
            ids,
            50,
            function(id, callback) {
                reqFunc(id, function(err, data) {
                    if (err) {
                        console.log('ERROR: ' + err);
                        callback();
                    }
                    var result = data.result;
                    if (format == 'file') {
                        var file = path.join(saveToDir, id);
                        fs.writeFileSync(file, result.rawData);
                    }
                    else {
                        list.push(result);
                    }
                    callback();
                });
            },
            function() {
                if (format == 'file') {
                    var dirName = saveToDir == '.' ? 'current directory' : saveToDir;
                    console.log('They are all saved in ' + dirName + '!');
                }
                else {
                    var jsonFile = path.join(saveToDir, 'downloaded_drmc.json');
                    console.log('It\'s saved in ' + jsonFile + '!');
                    fs.writeFileSync(jsonFile, JSON.stringify(list, null, 4));
                }
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
