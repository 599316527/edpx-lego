/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    lego/update_drmc.js
 * desc:    更新drmc内容
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/01/14 00:42:08$
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
cli.command = 'update_drmc';

/**
 * 选项
 * @type {Array}
 */
cli.options = ['by:'];

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '更新dmrc内容';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego update_drmc [--by=(mcid|mid)] <dir|json_file>';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    req.prepare(function() {
        var input = args[0] || '.';
        var by = opts['by'] || 'mcid';
        updateDrmc(input, by);
    });

    function updateDrmc(input, by) {
        var reqFunc = (by == 'mcid' ? req.updateDrmcByMcid : req.updateDrmcByMid);
        var map = collectList(input);
        var ids = Object.keys(map).sort();
        var failedList = [];
        util.poolify(
            ids,
            5,
            function(id, callback) {
                reqFunc(id, map[id], function(err, data) {
                    if (err) {
                        console.log('ERROR: ' + err);
                        failedList.push(id);
                    }
                    callback();
                });
            },
            function() {
                if (failedList.length) {
                    console.log('ERROR: failed id are:');
                    console.log(failedList.join(','));
                }
            }
        );
    }

    function collectList(input) {
        var stats = fs.statSync(input);
        var baseName = path.basename(input);
        var map = {};
        if (stats.isFile()) {
            var content = fs.readFileSync(input, 'utf-8');
            try {
                var json = JSON.parse(content);
                Object.keys(json).forEach(function(id) {
                    var item = json[id];
                    map[id] = item.rawData;
                });
            }
            catch(e) {
                // 输入就是一个drmc文件的情形
                if (/^\d+$/.test(baseName)) {
                    map[baseName] = content;
                }
            }


        }
        else if (stats.isDirectory()) {
            scanDir(input, map);
        }
        return map;
    }

    /**
     * 扫描目录，搜索drmc内容文件
     *
     * @param {string} dir 目录路径名
     */
    function scanDir(dir, map) {
        fs.readdirSync(dir)
            .sort(
                function(file) {
                    var fullPath = path.resolve(dir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        return 1;
                    }

                    return -1;
                }
            )
            .forEach(
                function (file) {
                    var fullPath = path.resolve(dir, file);
                    var stat = fs.statSync(fullPath);
                    var name = path.basename(file);

                    if (stat.isFile() && /^\d+$/.test(name)) {
                        map[name] = fs.readFileSync(fullPath, 'utf-8');
                    }
                    else if (stat.isDirectory()) {
                        scanDir(fullPath, map);
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
