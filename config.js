/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    config.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/01/08 21:14:25$
 * @desc:    一些配置
 *
 **************************************************************************/


var fs = require('fs');
var u = require('underscore');

// 素材库配置 (可以按需要自行增加)
var defaultEnvs = {
    'online': { // 线上 lego.baidu.com
        legoHost: 'http://lego.baidu.com/',
        loginPath: 'http://uuap.baidu.com/login?service=http%3A%2F%2Flego.baidu.com%2F'
    },
    'offline': { // 线下 lego-off.baidu.com
        legoHost: 'http://lego-off.baidu.com/',
        loginPath: 'http://itebeta.baidu.com:8100/login?service=http%3A%2F%2Flego-off.baidu.com%2F'
    },
    'dev00': { // ??
        legoHost: 'http://tc-sdcrd-dev00.tc.baidu.com:8020/',
        loginPath: 'http://itebeta.baidu.com:8100/login?service=http%3A%2F%2Ftc-sdcrd-dev00.tc.baidu.com%3A8020%2F'
    }
};
var configFile = __dirname + '/.config.json';
var configCache = null;
function getConfig() {
    if (configCache) {
        return configCache;
    }
    var configJson = {};
    if (fs.existsSync(configFile)) {
        configJson = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    }

    configJson.envs = configJson.envs || {};
    u.defaults(configJson.envs, defaultEnvs);

    return configJson;
}
function saveConfig(config) {
    if (typeof config === 'undefined') {
        return;
    }
    var configJson = getConfig();
    u.extend(configJson, config);

    configCache = configJson;

    fs.writeFileSync(configFile, JSON.stringify(configJson, null, 4));
}
function getEnviroment() {
    var config = getConfig();
    var env = config.envs[config.env || 'offline'];

    return env;
}

// 登录cookie相关
var cookieCache = __dirname + '/.cookie_cache.json';
function getCookie() {
    if (fs.existsSync(cookieCache)) {
        var cookieJson = JSON.parse(fs.readFileSync(cookieCache, 'utf-8'));
        var env = getEnviroment();
        return cookieJson[env.legoHost] || '';
    }
    return '';
}
function saveCookie(cookie) {
    if (typeof cookie === 'undefined') {
        return;
    }
    var cookieJson = {};
    if (fs.existsSync(cookieCache)) {
        cookieJson = JSON.parse(fs.readFileSync(cookieCache, 'utf-8'));
    }
    var env = getEnviroment();
    cookieJson[env.legoHost] = cookie;
    exports.cookie = cookie;

    fs.writeFileSync(cookieCache, JSON.stringify(cookieJson, null, 4));
}
exports.cookie = getCookie();
exports.saveCookie = saveCookie;
exports.get = function (key) {
    var configJson = getConfig();
    if (key) {
        return configJson[key];
    }
    return configJson;
};
exports.set = function (key, value) {
    if (typeof key !== 'string') {
        saveConfig(key);
    }
    else {
        var obj = {};
        obj[key] = value;
        saveConfig(obj);
    }
};
exports.getEnviroment = getEnviroment;



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
