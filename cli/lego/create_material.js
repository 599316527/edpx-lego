/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    lego/create_material.js
 * desc:    输入JSON数组，输出物料
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/01/17 15:13:08$
 */

var req = require('../../lego/requester');
var fs = require('fs');
var path = require('path');
var util = require('../../lego/util');

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
cli.command = 'create_material';

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
cli.description = '根据输入的JSON数据输出物料代码';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'edp lego create_material <input_file> [<output_file>]';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 */
cli.main = function ( args, opts ) {
    req.prepare(function() {
        var input = args[0];
        var output = args[1] || 'materials.json';
        if (!input) {
            console.log('ERROR: missing input file in args');
        }
        else {
            var arr = JSON.parse(fs.readFileSync(input, 'utf-8'));
            createMaterial(arr, output);
        }
    });

    function createMaterial(arr, output) {
        var mats = [];
        util.poolify(
            arr,
            5,
            function(item, callback) {
                req.createMaterial(item, function(err, data) {
                    if (err) {
                        callback();
                        return;
                    }
                    var result = data.result;
                    var mat = {
                        'input': item,
                        'bcsUrl': result.bcsUrl,
                        'previewHtmlUrl': result.previewHtmlUrl,
                        'mid': result.mid
                    }
                    mats.push(mat);
                    callback();
                });
            },
            function() {
                console.log('INFO: finished.');
                fs.writeFileSync(output, JSON.stringify(mats, null, 4));
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
