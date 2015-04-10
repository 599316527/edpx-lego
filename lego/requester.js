/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    requester.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/01/08 16:50:50$
 * @desc:    连接素材库请求
 *
 **************************************************************************/

/* eslint-disable dot-notation */

var config = require('../config');
var request = require('request');
var url = require('url');
var util = require('./util');
var prompt = require('prompt');

/**
 * @type {Object}
 * request不同版本使用的jar不一样，所以封装这么一个util来操作jar
 */
var jarUtil = {
    getJarType: function (jar) {
        if (jar.constructor.prototype.setCookie) {
            return 'tough-cookie';
        }
        return 'cookie-jar';
    },
    setCookie: function (jar, cookie, path) {
        var type = jarUtil.getJarType(jar);
        if (type === 'tough-cookie') {
            jar.setCookie(cookie, path, {}, function () {});
        }
        else {
            jar.add(request.cookie(cookie));
        }
    },
    getCookieString: function (jar, host, callback) {
        var type = jarUtil.getJarType(jar);
        if (type === 'tough-cookie') {
            jar.getCookieString(host, function (err, cookies) {
                callback(err, cookies);
            });
        }
        else {
            var cookies = jar.cookieString({
                url: host
            });
            var matches = cookies.match(/JSESSIONID=[^;]+/);
            if (matches && matches.length) {
                callback(null, matches[0]);
            }
            else {
                console.log('ERROR: no match for JSESSIONID in cookie');
                callback('--');
            }
        }
    }
};

function prepare(callback) {
    checkCookie(function (err) {
        if (err) {
            config.saveCookie(''); // 清空原来的cookie
            console.log('INFO: try to login');
            login(function (err) {
                if (!err) {
                    callback(null);
                }
                else {
                    callback(err);
                }
            });
        }
        else {
            callback(null);
        }
    });
}

function checkCookie(callback) {
    post(
        getUrl('/data/session/read'),
        {},
        function (err, data) {
            if (err || !data) {
                console.log('WARN: cookie already invalid, please update it in config.js');
                callback(err || '--');
            }
            else {
                callback(null);
            }
        }
    );
}

function login(callback) {
    var jar = request.jar();
    var redirectLimit = 3;
    var retryTime = 3;
    var postData = {};
    var user = {};

    startLogin();

    function startLogin() {
        retryTime--;
        redirectLimit = 3;
        if (retryTime < 0) {
            callback('login fail');
            return;
        }
        if (retryTime < 2) {
            console.log('Wrong username or password, try again:');
        }
        var env = config.getEnviroment();
        getUserAccount(function (err) {
            get(
                env.loginPath,
                {},
                function (err, data, res) {
                    addCookie(res.headers['set-cookie'], env.loginPath);

                    var html = data;
                    // <input type="hidden" name="lt" value="LT-338668-uBRHsK7kKGFvxMtr3klhMubmmPQbKf" />
                    // <input type="hidden" name="execution" value="e2s1" />
                    var matches;
                    matches = html.match(/<input [^>]*name="lt"[^>]*value="([^"]+)"[^>]*>/);
                    if (matches && matches.length > 1) {
                        postData.lt = matches[1];
                    }
                    matches = html.match(/<input [^>]*name="execution"[^>]*value="([^"]+)"[^>]*>/);
                    if (matches && matches.length > 1) {
                        postData.execution = matches[1];
                    }
                    loginToPath(env.loginPath);
                }
            );
        });
    }

    function getUserAccount(callback) {
        var schema = {
            properties: {
                username: {
                    required: true
                },
                password: {
                    hidden: true
                }
            }
        };
        prompt.start();
        prompt.get(schema, function (err, result) {
            user = result;

            callback(null);
        });
    }

    function addCookie(cookies, path) {
        if (cookies && cookies.length) {
            cookies.forEach(function (item) {
                jarUtil.setCookie(jar, item, path);
            });
        }
    }

    function loginToPath(path) {
        redirectLimit--;
        if (redirectLimit < 0) {
            console.log('ERROR: reach redirect limit!');
            startLogin();
            return;
        }

        post(
            path,
            {
                'username': user.username,
                'password': user.password,
                'rememberMe': 'true',
                '_rememberMe': 'on',
                'type': '1',
                'lt': postData.lt,
                'execution': postData.execution,
                '_eventId': 'submit',
                'submit': ''
            },
            function (err, data, res) {
                addCookie(res.headers['set-cookie'], path);
                if (res.statusCode === '200' || res.statusCode === 200) {
                    loginStage2(data);
                }
                else if (res.statusCode === '302' || res.statusCode === 302) {
                    loginToPath(res.headers['location']);
                }
                else {
                    console.log(res);
                    console.log('ERROR: login error!');
                    startLogin();
                }
            },
            {
                jar: jar,
                json: false
            }
        );
    }

    function loginStage2(html) {
        var executionStr = 'e2s2';
        var matches;
        matches = html.match(/<input [^>]*name="execution"[^>]*value="([^"]+)"[^>]*>/);
        if (matches && matches.length > 1) {
            executionStr = matches[1];
        }
        var allImg = html.replace(/\n/g, ' ').match(/<img[^>]+>/g);
        var srcs = [];
        allImg.forEach(function (one) {
            var matches = one.match(/<img[^>]*src="([^"]+)"[^>]*>/);
            if (matches && matches.length > 1) {
                var src = matches[1];
                srcs.push(src);
            }
        });
        srcs.forEach(function (src) {
            post(src, {}, function () {});
        });
        var env = config.getEnviroment();
        setTimeout(function () {
            post(
                env.loginPath,
                {
                    'execution': executionStr,
                    '_eventId': 'submit',
                    'setCookiePathFailure': 'http://setcookie2.com'
                },
                function (err, data, res) {
                    addCookie(res.headers['set-cookie'], env.loginPath);
                    if (res.statusCode === '200' || res.statusCode === 200) {
                        console.log('ERROR: login error! why 200?');
                        startLogin();
                    }
                    else if (res.statusCode === '302' || res.statusCode === 302) {
                        loginStage3(res.headers['location']);
                    }
                    else {
                        console.log('ERROR: login error!');
                        startLogin();
                    }
                },
                {
                    jar: jar,
                    json: false
                }
            );
        }, 2000);
    }

    function loginStage3(legoUrl) {
        var info = url.parse(legoUrl, true);
        var env = config.getEnviroment();
        get(
            legoUrl,
            info.query,
            function (err, data, res) {
                if (err) {
                    console.log('Error: ' + err);
                    startLogin();
                    return;
                }
                addCookie(res.headers['set-cookie'], legoUrl);
                if (res.statusCode === '200' || res.statusCode === '302'
                    || res.statusCode === 200 || res.statusCode === 302
                ) {
                    jarUtil.getCookieString(jar, env.legoHost, function (err, cookies) {
                        if (err) {
                            callback(err);
                            return;
                        }
                        config.saveCookie(cookies);
                        console.log('login successfully, cookie: ' + cookies);
                        callback(null);
                    });
                }
                else {
                    console.log('ERROR: login error in stage 3!');
                    startLogin();
                }
            },
            {
                jar: jar
            }
        );
    }
}

function getTemplateDetail(templateId, callback) {
    post(
        getUrl('/data/template/detail'),
        {
            'templateId': templateId
        },
        callback
    );
}

function getTemplateList(callback) {
    var list = [];

    requestPage(1);

    function requestPage(pageNo) {
        post(
            getUrl('/data/template/list'),
            {
                'status': '',
                'keyword': '',
                'creator': '',
                'templateId': '',
                'appId': '',
                'tags': [],
                'page.pageSize': 60,
                'page.pageNo': pageNo,
                'page.orderBy': '',
                'page.order': ''
            },
            function (err, data) {
                if (err) {
                    callback(err);
                }
                else {
                    if (data.success !== 'true') {
                        callback(JSON.stringify(data));
                        return;
                    }
                    var page = data.page;
                    var totalCount = page.totalCount;
                    var pageSize = page.pageSize;
                    var pageNo = page.pageNo;
                    list = list.concat(page.result);
                    if (totalCount / pageSize > pageNo) {
                        requestPage(pageNo + 1);
                    }
                    else {
                        callback(null, list);
                    }
                }
            }
        );
    }
}

function updateObjectVersion(detail, callback) {
    // 读详情更新objectVersion
    getTemplateDetail(detail.templateId, function (err, data) {
        if (err || !parseError(data)) {
            console.log('ERROR: read template fail, templateId = ' + detail.templateId);
            callback(err || '--', data);
            return;
        }
        var newDetail = data.result;
        detail.objectVersion = newDetail.objectVersion;
        detail.informationObjectVersion = newDetail.informationObjectVersion;
        callback(null, detail);
    });
}

function disableTemplate(detail, callback) {
    updateObjectVersion(detail, function (err, data) {
        if (err) {
            callback(err, data);
            return;
        }
        post(
            getUrl('/data/template/disable'),
            {
                'templateId': detail.templateId,
                'objectVersion': detail.objectVersion
            },
            callback
        );
    });
}

function makeTemplate(detail, callback) {
    var chance = 5;
    function giveItATry() {
        if (detail.templateType === 'JS') {
            var spec = detail.spec;
            if (typeof spec === 'object') {
                spec = JSON.stringify(spec);
            }
            post(
                getUrl('/data/template/impls/submit'),
                {
                    'templateId': detail.templateId,
                    'objectVersion': detail.objectVersion,
                    'informationObjectVersion': detail.informationObjectVersion,
                    'impls': JSON.stringify(detail.impls),
                    'spec': spec,
                    'flags': (detail.flags ? JSON.stringify(detail.flags) : 'null'),
                    'convertor': detail.convertor || ''
                },
                function (err, data) {
                    if (err || data.success !== 'true') {
                        chance--;
                        if (chance === 0) {
                            callback(err, data);
                        }
                        else {
                            giveItATry();
                        }
                    }
                    else {
                        callback(err, data);
                    }
                }
            );
        }
        else {
            detail.widgets.forEach(function (widget, i) {
                if (widget.styles) {
                    widget.cssText = util.getCssText(widget.styles, '#canvas .ad-inst-' + i);
                }
            });
            post(
                getUrl('/data/template/layouts/submit'),
                {
                    'templateId': detail.templateId,
                    'objectVersion': detail.objectVersion,
                    'informationObjectVersion': detail.informationObjectVersion,
                    'widgets': JSON.stringify(detail.widgets),
                    'layouts': JSON.stringify(detail.layouts),
                    'flags': (detail.flags ? JSON.stringify(detail.flags) : 'null'),
                    'convertor': detail.convertor || ''
                },
                function (err, data) {
                    if (err || data.success !== 'true') {
                        chance--;
                        if (chance === 0) {
                            callback(err, data);
                        }
                        else {
                            giveItATry();
                        }
                    }
                    else {
                        callback(err, data);
                    }
                }
            );
        }
    }
    updateObjectVersion(detail, function (err, data) {
        if (err) {
            callback(err, data);
            return;
        }
        giveItATry();
    });
}

function publishTemplate(detail, callback) {
    updateObjectVersion(detail, function (err, data) {
        if (err) {
            callback(err, data);
            return;
        }
        post(
            getUrl('/data/template/publish'),
            {
                'templateId': detail.templateId,
                'objectVersion': detail.objectVersion,
                'apps': JSON.stringify(detail.apps)
            },
            callback
        );
    });
}

// 兼容通过ID更新和通过JSON更新
function updateTemplate(detail, callback) {
    // 改个名字保存一下
    var theFinalCallback = callback;
    var templateId;
    if (typeof detail === 'object') {
        templateId = detail.templateId;
    }
    else {
        templateId = detail;
        detail = null;
    }
    // 先读一下最新的详情，以免状态和objectVersion已经更改
    getTemplateDetail(templateId, function (err, data) {
        if (err || !parseError(data)) {
            console.log('ERROR: read template fail, templateId = ' + templateId);
            theFinalCallback(err || '--', data);
            return;
        }
        var newDetail = data.result;
        if (!detail) {
            detail = newDetail;
        }
        else {
            detail.objectVersion = newDetail.objectVersion;
            detail.informationObjectVersion = newDetail.informationObjectVersion;
        }
        var curStatus = newDetail.status;
        var status = detail.status;
        // V3 里已经没有下面这个事情了
        /*
        if (curStatus === 'RELEASED') { // 已发布的需要先禁用，而且更新完之后需要再发布
            disableTemplate(detail, function (err, data) {
                if (err || !parseError(data)) {
                    console.log('ERROR: disable template fail, templateId = ' + detail.templateId);
                }
                else {
                    makeTemplate(detail, function (err, data) {
                        if (err || !parseError(data)) {
                            console.log('ERROR: make template fail, templateId = ' + detail.templateId);
                            // 更新失败，但试图恢复原来样式的status
                            next(function () {
                                // 不管next是否成功，这里都要返回失败
                                theFinalCallback(err || '--');
                            });
                        }
                        else {
                            next(theFinalCallback);
                        }
                    });
                }
            });
        }
        */
        if (curStatus === 'UNFINISHED') { // 未完成的直接忽略掉
            console.log('INFO: template is unfinished, skip, templateId = ' + detail.templateId);
            theFinalCallback(null);
            return;
        }
        // 模版制作：就是lego里的第二个步骤
        makeTemplate(detail, function (err, data) {
            if (err || !parseError(data)) {
                console.log('ERROR: make template fail, templateId = ' + detail.templateId);
                theFinalCallback(err || '--');
            }
            else {
                toLaunchAutoCheck();
            }
        });

        // 发起自动验证
        function toLaunchAutoCheck() {
            post(
                getUrl('/data/template/auto_check'),
                {
                    'templateId': detail.templateId,
                    'objectVersion': detail.objectVersion
                },
                function (err, data) {
                    if (err || !parseError(data)) {
                        console.log('ERROR: launch auto check fail, templateId = ' + detail.templateId);
                        theFinalCallback(err || data);
                    }
                    else {
                        toWaitAutoCheckFinish();
                    }
                }
            );
        }

        // 等待自动验证通过
        function toWaitAutoCheckFinish() {
            var count = 0;
            function checking() {
                console.log('INFO: auto check heartbeat checking - tick ' + (++count) +  ', templateId = ' + detail.templateId);
                getTemplateDetail(detail.templateId, function (err, data) {
                    if (err || !parseError(data)) {
                        console.log('ERROR: read template fail, templateId = ' + detail.templateId);
                        theFinalCallback(err || '--', data);
                        return;
                    }
                    var newDetail = data.result;
                    if (newDetail.status === 'AUTO_CHECK_PASS') {
                        detail.objectVersion = newDetail.objectVersion;
                        detail.informationObjectVersion = newDetail.informationObjectVersion;
                        toPassSelfCheck();
                    }
                    else {
                        setTimeout(function() {
                            checking();
                        }, 5000);
                    }
                });
            }
            checking();
        }

        // 通过人工验证
        function toPassSelfCheck() {
            post(
                getUrl('/data/template/manual_check'),
                {
                    'templateId': detail.templateId,
                    'objectVersion': detail.objectVersion,
                    'ifSuccess': 'true'
                },
                function (err, data) {
                    if (err || !parseError(data)) {
                        console.log('ERROR: to pass self check fail, templateId = ' + detail.templateId);
                        theFinalCallback(err || data);
                    }
                    else {
                        updateObjectVersion(detail, function (err, data) {
                            if (err) {
                                theFinalCallback(err, data);
                                return;
                            }
                            toPublish();
                        });
                    }
                }
            );
        }

        // 发布样式
        function toPublish() {
            if (curStatus === 'DISABLED') {
                console.log('INFO: successfully update template, templateId = ' + detail.templateId);
                console.log('WARN: but in disabled status, templateId = ' + detail.templateId);
                theFinalCallback(null);
            }
            else {
                publishTemplate(detail, function (err, data) {
                    if (err || !parseError(data)) {
                        console.log('ERROR: publish template fail, templateId = ' + detail.templateId);
                        theFinalCallback(err || '--');
                    }
                    else {
                        console.log('INFO: successfully update template, templateId = ' + detail.templateId);
                        theFinalCallback(null);
                    }
                });
            }
        }
    });
}

/**
 * 通过mcid获取drmc内容
 * @param {number} mcid mcid
 * @param {Function} callback 回调
 */
function getDrmcByMcid(mcid, callback) {
    getDrmcContent(mcid, '1', callback);
}

/**
 * 通过mid获取drmc内容
 * @param {number} mid 物料ID
 * @param {Function} callback 回调
 */
function getDrmcByMid(mid, callback) {
    getDrmcContent(mid, '0', callback);
}

/**
 * 获取drmc内容
 * @param {number} id ID
 * @param {string} type 是mcid还是mid
 * @param {Function} callback 回调
 */
function getDrmcContent(id, type, callback) {
    var nameMap = {
        '0': 'mid',
        '1': 'mcid'
    };
    post(
        getUrl('/data/drmc/detail'),
        {
            'id': id,
            'type': type
        },
        function (err, data) {
            if (err || !parseError(data)) {
                console.log('ERROR: get drmc content fail, ' + nameMap[type] + '= ' + id);
                callback(err || data);
            }
            else {
                callback(null, data);
            }
        }
    );
}

/**
 * 通过mcid更新drmc内容
 * @param {number} mcid mcid
 * @param {string} content 内容
 * @param {Function} callback 回调
 */
function updateDrmcByMcid(mcid, content, callback) {
    updateDrmcContent(mcid, '1', content, callback);
}

/**
 * 通过mid更新drmc内容
 * @param {number} mid 物料ID
 * @param {string} content 内容
 * @param {Function} callback 回调
 */
function updateDrmcByMid(mid, content, callback) {
    updateDrmcContent(mid, '0', content, callback);
}

/**
 * 更新drmc内容
 * @param {number} id ID
 * @param {string} type 是mcid还是mid
 * @param {string} content 内容
 * @param {Function} callback 回调
 */
function updateDrmcContent(id, type, content, callback) {
    var nameMap = {
        '0': 'mid',
        '1': 'mcid'
    };
    post(
        getUrl('/data/drmc/update'),
        {
            'id': id,
            'type': type,
            'content': content
        },
        function (err, data) {
            if (err || !parseError(data)) {
                console.log('ERROR: update drmc content fail, ' + nameMap[type] + ' = ' + id);
                callback(err || data);
            }
            else {
                console.log('INFO: successfully update drmc content, ' + nameMap[type] + ' = ' + id);
                callback(null, data);
            }
        }
    );
}

/**
 * 创建物料
 * @param {Object} materialData 物料数据
 *  {
 *      templateId: number,
 *      ?app: number,
 *      ?outputType: string,
 *      ?plugins: string,
 *      ?linkTransformType: string,
 *      ?pluginValues: Object,
 *      ?previewTemplate: string,
 *      data: Object
 *   }
 * @param {Function} callback 回调
 */
function createMaterial(materialData, callback) {
    var defaultData = {
        'app': 3,
        'outputType': 'v2',
        'plugins': 'ad.plugin.ClickMonkey,ad.plugin.PsMonitor',
        'linkTransformType': 'nil',
        'pluginValues': {
            'ad.plugin.ClickMonkey': {
                'plid': '%PLID%'
            },
            'ad.plugin.WiseClickMonkey': {
                'plid': '%PLID%'
            },
            'ad.plugin.Hmt': {
                'hmjs_id': ''
            },
            'ad.plugin.PsMonitor': {
                'fm': ''
            }
        },
        'previewTemplate': 'ad/template/ps.tpl'
    };
    var key;
    for (key in defaultData) {
        if (defaultData.hasOwnProperty(key)) {
            if (typeof materialData[key] === 'undefined') {
                materialData[key] = defaultData[key];
            }
        }
    }
    var postData = {};
    for (key in materialData) {
        if (materialData.hasOwnProperty(key)) {
            if (typeof materialData[key] === 'object') {
                postData[key] = JSON.stringify(materialData[key]);
            }
            else {
                postData[key] = materialData[key];
            }
        }
    }
    post(
        getUrl('/data/material/create'),
        postData,
        function (err, data) {
            if (err || !parseError(data)) {
                console.log('ERROR: make material fail, input = ' + JSON.stringify(materialData));
                callback(err || data);
            }
            else {
                console.log('INFO: successfully make material, templateId = ' + materialData.templateId);
                callback(null, data);
            }
        }
    );
}

/**
 * 解析错误信息
 * @param {Object} data 数据
 * @return {boolean}
 */
function parseError(data) {
    var title = null;
    var err = null;
    var errArr = null;
    if (data.success !== 'true' && data.success !== true) {
        var message = data.message;
        if (!message) {
            title = '系统提示';
            err = '请求失败(未知错误)';
        }
        else if (message.global) {
            title = '系统提示';
            err = message.global;
        }
        else if (typeof message.redirect !== 'undefined') { // 重定向
            title = '重定向';
            err = message.redirect;
        }
        else if (!message.field) {
            title = '系统提示';
            err = '请求失败(未知错误)';
        }
        else {
            title = '字段错误';
            errArr = parseMessage(message);
        }
        console.log('ERROR: ' + title + '; ' + (err || '') + (errArr ? errArr.join('\n') : ''));
        console.log(JSON.stringify(data));
        return false;
    }
    return true;

    /**
     * 将后端返回的json格式的message转化为文本
     * @param {Object} message 数据
     * @return {Array.<string>}
     */
    function parseMessage(message) {
        var errorMap = message.field;
        if (!errorMap) {
            return '';
        }
        var msgTextArr = [];
        for (var key in errorMap) {
            if (errorMap.hasOwnProperty(key)) {
                var item = errorMap[key];
                msgTextArr.push(item);
            }
        }
        return msgTextArr;
    }
}

function post(url, params, callback, options) {
    if (typeof params === 'function') {
        options = callback;
        callback = params;
        params = null;
    }
    options = options || {};
    if (typeof options.json === 'undefined') {
        options.json = true;
    }
    if (params) {
        options.form = params;
    }
    if (config.cookie) {
        var env = config.getEnviroment();
        var jar = options.jar || request.jar();
        var parts = config.cookie.split(';');
        parts.forEach(function (one) {
            if (one) {
                jarUtil.setCookie(jar, one, env.legoHost.replace(/\/$/, ''));
            }
        });
        options.jar = jar;
    }
    request.post(url, options, function (err, res, body) {
        callback(err, body, res);
    });
}

function get(url, params, callback, options) {
    if (typeof params === 'function') {
        options = callback;
        callback = params;
        params = null;
    }
    options = options || {};
    if (typeof options.json === 'undefined') {
        options.json = true;
    }
    if (params) {
        options.qs = params;
    }
    if (config.cookie) {
        var env = config.getEnviroment();
        var jar = options.jar || request.jar();
        var parts = config.cookie.split(';');
        parts.forEach(function (one) {
            if (one) {
                jarUtil.setCookie(jar, one, env.legoHost.replace(/\/$/, ''));
            }
        });
        options.jar = jar;
    }
    request.get(url, options, function (err, res, body) {
        callback(err, body, res);
    });
}

function getUrl(path) {
    var env = config.getEnviroment();
    return env.legoHost + path;
}

exports.prepare = prepare;
exports.login = login;
exports.checkCookie = checkCookie;
exports.getTemplateList = getTemplateList;
exports.getTemplateDetail = getTemplateDetail;
exports.disableTemplate = disableTemplate;
exports.updateTemplate = updateTemplate;
exports.publishTemplate = publishTemplate;
exports.getDrmcByMcid = getDrmcByMcid;
exports.getDrmcByMid = getDrmcByMid;
exports.updateDrmcByMcid = updateDrmcByMcid;
exports.updateDrmcByMid = updateDrmcByMid;
exports.createMaterial = createMaterial;
exports.get = get;
exports.post = post;
exports.parseError = parseError;














/* vim: set ts=4 sw=4 sts=4 tw=100 : */
