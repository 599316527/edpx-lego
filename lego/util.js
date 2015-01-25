/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    util.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/01/13 02:09:41$
 * @desc:    工具函数w
 *
 **************************************************************************/


function parseIds(args) {
    if (!args.length) {
        console.log('ERROR: missing id of template in args');
        return null;
    }
    var ids = [];
    var others = [];
    args.forEach(function (item) {
        if (/^[\d,]+$/.test(item)) {
            item.split(',').forEach(function (id) {
                id = id.trim();
                if (id) {
                    ids.push(id);
                }
            });
        }
        else {
            others.push(item);
        }
    });
    return {
        ids: ids,
        others: others
    };
}

function poolify(list, limit, callback, finishCallback) {
    list = list.slice(0);

    var active = 0;
    run();

    function run() {
        if (list.length <= 0) {
            if (active <= 0) {
                finishCallback && finishCallback();
            }
            return;
        }
        var item = list.pop();
        active++;
        callback(item, function () {
            active--;
            run();
        });

        if (active < limit) {
            run();
        }
    }
}

/**
 * 从styles转化为cssText
 * @param {Object} styles LegoCssEditor的输出
 * @param {string=} optPrefix css selector 前缀
 * @return {string}
 * @static
 */
function getCssText(styles, optPrefix) {
    var prefix = optPrefix || '';

    var selArr = [];
    Object.keys(styles).forEach(function (selName) {
        var rules = styles[selName];
        var ruleArr = [];
        Object.keys(rules).forEach(function (ruleName) {
            var ruleVal = rules[ruleName];
            ruleArr.push(ruleName + ':' + ruleVal);
        });
        var selNameParts = selName.split(',');
        var arr = [];
        selNameParts.forEach(function (item) {
            var name = item.trim();
            if (name) {
                arr.push(prefix + (prefix ? ' ' : '') + name);
            }
        });
        var selStr = arr.join(', ') + ' {' + ruleArr.join(';') + '}';
        selArr.push(selStr);
    });
    return selArr.join(' ');
}

exports.parseIds = parseIds;
exports.poolify = poolify;
exports.getCssText = getCssText;

















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
