/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    config.js
 * desc:    一些配置
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/01/08 21:14:25$
 */

var fs = require('fs');

// 素材库环境
var WHICH_LEGO = 'offline'; // or online

// 素材库配置 (可以按需要自行增加)
switch(WHICH_LEGO) {
    case 'online': // 线上 lego.baidu.com
        exports.legoHost = 'http://lego.baidu.com/';
        exports.loginPath = 'http://uuap.baidu.com/login?service=http%3A%2F%2Flego.baidu.com%2F';
        break;
    case 'offline': // 线下 lego-off.baidu.com
        exports.legoHost = 'http://lego-off.baidu.com/';
        exports.loginPath = 'http://itebeta.baidu.com:8100/login?service=http%3A%2F%2Flego-off.baidu.com%2F';
        break;
    default:break;
}

// 登录cookie相关
var cookieCache = __dirname + '/.cookie_cache.json';
function getCookie() {
    if (fs.existsSync(cookieCache)) {
        var cookieJson = JSON.parse(fs.readFileSync(cookieCache, 'utf-8'));
        return cookieJson[exports.legoHost] || '';
    }
    else {
        return '';
    }
}
function saveCookie(cookie) {
    if (typeof cookie == 'undefined') {
        return;
    }
    var cookieJson = {};
    if (fs.existsSync(cookieCache)) {
        cookieJson = JSON.parse(fs.readFileSync(cookieCache, 'utf-8'));
    }
    cookieJson[exports.legoHost] = cookie;
    exports.cookie = cookie;

    fs.writeFileSync(cookieCache, JSON.stringify(cookieJson, null, 4));
}
exports.cookie = getCookie();
exports.saveCookie = saveCookie;



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
