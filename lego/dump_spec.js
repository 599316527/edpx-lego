/***************************************************************************
 * 
 * Copyright (c) 2013 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * dump_spec.js ~ 2013/12/05 21:14:12
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 * 分析自定义js的样式，提取widget和spec的对应关系
 * 一个widget可能会有多个spec，主要的方式是分析
 *
 * 自定义样式
 *   -> NameSpace
 *      -> src/ad/impl/foobar.js
 *         -> 代码中AD_CONFIG['spec_name']
 *            -> 从配置里面去读spec_name
 **/
var mysql      = require('mysql');

var cli = {};

cli.command = 'dump_spec';

cli.description = '导出数据库中样式相关的数据';

/**
 * {
 *   "ad.widget.H1": [
 *     {
 *       "spec": {},
 *       "template": {
 *         "name": "样式名",
 *         "id": "样式Id"
 *       }
 *     }
 *   ]
 * }
 */
var WidgetSpecCache = {};

/**
 * 分析template的信息，提取样式中用到的widget，以及对应的spec信息.
 */
function parseTemplate(template) {
    var fs = require('fs');

    var base = require('./base');
    var filename = base.getFilename(template.namespace);
    var tokens = base.getTokens(fs.readFileSync('src/' + filename, 'utf-8'), filename);

    // FIXME(leeight) 貌似JSON.parse有时候会挂掉
    var originSpec = eval('(' + template.original_spec + ')');

    function findByKey(specs, key) {
        for (var i = 0; i < specs.length; i ++) {
            if (specs[i].name === key) {
                return specs[i];
            }
        }
    }

    var map = {};
    tokens.forEach(function(item){
        var namespace = item[0];
        var key = item[1];
        if (!map[namespace]) {
            // 如果一个impl里面重复了，只取第一个
            map[namespace] = {
                spec: findByKey(originSpec, key),
                template: {
                    name: template.name,
                    id: template.id
                }
            };
        }
    });

    for(var key in map) {
        if (!WidgetSpecCache[key]) {
            WidgetSpecCache[key] = [];
        }
        WidgetSpecCache[key].push(map[key]);
    }
}

function dumpSpecs() {
    console.log(JSON.stringify(WidgetSpecCache, null, 2));
}

cli.main = function() {
    var connection = mysql.createConnection({
        host     : 'yx-testing-qapool81.yx01.baidu.com',
        port     : 8031,
        database : 'lego',
        user     : 'work',
        password : '123456',
        charset  : 'utf-8',
        dateStrings : true
    });
    connection.connect(function(err){
        if (err) throw err;
    });

    var sql = 'SELECT `template`.*, `template_content`.data AS `namespace` ' +
        'FROM `template` LEFT JOIN `template_content` ON `template`.id = `template_content`.tid ' +
        'WHERE `template`.type = "JS" AND `template`.status = "RELEASED"';

    connection.query(sql, function(err, rows, fields){
        if (err) throw err;

        rows.forEach(parseTemplate);
        dumpSpecs();
    });

    connection.end();
}

exports.cli = cli;



















/* vim: set ts=4 sw=4 sts=4 tw=100: */
