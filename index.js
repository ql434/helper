/**
 * @author qiankun <kunqian434@gmail.com>
 * @date 24/02/17
 *
 * 帮助类
 *
 * @add chuck.ql 增加数组根据特定的字段转对象的方法、增加树形转矩阵
 *
 */
'use strict';

const URL = require('url');
const escapeHTML = require('bloody-escapehtml');

exports.URL = URL;

exports.unescapeHTML = escapeHTML.unescapeHTML;

/**
 * 数组转对象
 * @param arr 被转化的数组
 * @param key 数组中作为key的字段
 * @returns {{}}
 */
exports.array2Object = function (arr, key) {
    const obj = {};
    if (Object.prototype.toString.call(arr) === '[object Array]') {
        arr.forEach((val) => {
            const prizeName = val[key];
        if (prizeName) {
            const value = val;
            delete value[key];
            obj[prizeName] = value;
        }
    });
    } else {
        throw '传参有误,请确保为第一个参数为数组类型';
    }
    return obj;
};

/**
 * 驼峰化
 * @param key
 * @returns {XML|*|string|void}
 */
exports.hump = function (key) {
    return key.replace(/\_([a-z]{1})/gi, ($1, $2) => {
            if ($2) {
                return $2.toUpperCase();
            }
            return $1;
});
};

/**
 * 合并对象
 * @param target
 * @param data
 * @returns {*|{}}
 */
exports.assign = function (target, data) {
    let key;

    target = target || {};
    data = data || {};

    for (key in data) {
        if (data.hasOwnProperty(key)) {
            target[key] = data[key];
        }
    }

    return target;
};

/**
 * 整数千位符格式化
 * @param num 需要格式化的数字
 * @returns {string}
 */
exports.formatIntToThousands = function (num) {
    let result = '';
    let effect;

    num = (num || '0').toString();

    const numSplit = num.split('.');
    effect = numSplit[0];

    while (effect.length > 3) {
        result = `,${effect.slice(-3)}${result}`;
        effect = effect.slice(0, effect.length - 3);
    }

    if (effect) {
        result = effect + result;
    }

    return result;
};


/**
 * 数字千位符格式化
 * @param num 需要格式化的数字
 * @returns {string}
 */
exports.formatNumToThousands = function (num) {
    let result = '';
    let effect,
        cent;

    num = (num || '0.00').toString();

    const numSplit = num.split('.');
    effect = numSplit[0];
    cent = numSplit[1] || '00';

    while (effect.length > 3) {
        result = `,${effect.slice(-3)}${result}`;
        effect = effect.slice(0, effect.length - 3);
    }

    if (effect) {
        result = effect + result;
    }

    return (`${result}.${cent}`);
};

/**
 * 左边补一个零
 * @param num 需要补零的数字
 * @returns {*}
 */
exports.zeroPad = function (num) {
    if (Number(num) < 10) {
        return `0${num}`;
    }
    return num;
};

/**
 * 拆分日期字符串
 * @param pattern 格式
 * @param str 日期字符串
 * @returns {void|string|XML|*}
 */
exports.splitDate = function (pattern, str) {
    if (arguments.length < 2) {
        str = pattern;
        pattern = 'YYYY-MM-DD hh:mm:ss';
    }

    switch (pattern) {
        case 'YYYY-MM-DD hh:mm:ss':
            return str.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, ($1, $2, $3, $4, $5, $6, $7) => `${$2}-${$3}-${$4} ${$5}:${$6}:${$7}`);
            break;
        case 'YYYY/MM/DD':
            return str.replace(/^(\d{4})(\d{2})(\d{2})/, ($1, $2, $3, $4) => `${$2}/${$3}/${$4}`);
            break;
        case 'YYYY-MM-DD':
            return str.replace(/^(\d{4})(\d{2})(\d{2})/, ($1, $2, $3, $4) => `${$2}-${$3}-${$4}`);
            break;
    }
};

/**
 * 遍历数组
 * @param arr 需要遍历的数组
 * @param callback 需要执行的回调函数(单个元素,下标)
 */
exports.eachArray = function (arr, callback) {
    const len = arr.length;

    for (let i = 0; i < len; i++) {
        const element = arr[i];

        if (callback(element, i) === false) {
            break;
        }
    }
};

/**
 * 校验是否为手机号码
 * @param num
 * @returns {boolean}
 */
exports.isPhone = function (num) {
    return /^1(3|4|5|7|8)[0-9]{1}\d{4}\d{4}$/.test(num);
};

/**
 * 是否为空对象
 * @param obj
 * @returns {boolean}
 */
exports.isEmptyObject = function (obj) {
    for (const key in obj) {
        return false;
    }
    return true;
};

/**
 * 跳转URL合法性校验
 *  http://gitlab.alibaba-inc.com/yiming.chk/stc-wiki/wikis/URLJump?spm=0.0.0.0.SM0ju9
 * @param url
 * @returns {boolean}
 */
exports.parseURL = function (url) {
    const allowDomains = ['alidayu.com', 'tmall.com', 'taobao.com', 'daily.tmall.net'];
    let domainStr = '',
        i = 0,
        result = [];

    for (; i < allowDomains.length; i++) {
        allowDomains[i] = `(${allowDomains[i].replace('.', '\\.')})`;
    }

    domainStr = `(${allowDomains.join('|')})`;
    const regStr = new RegExp(`^((http://)|(https://)|(//))?([0-9a-zA-Z\\._:\\-]*[\\.@])?${domainStr}(:[0-9]+)?(\/.*)?$`);
    // ^((http:\/\/)|(https:\/\/)|(\/\/))?([0-9a-zA-Z\._:\-]*[\.@])?((taobao\.com)|(alibaba\.com)(:[0-9]+)?(\/.*)?$/
    result = url.match(regStr);

    return !!(result && result[0]);
};

exports.getLeaf = function (treeArr, leafKey, callback) {
    function getLastLeaf(treeArr, leafKey, callback) {
        if (!(treeArr && treeArr.length > 0)) {
            return;
        }
        treeArr.forEach(function (item) {
            if (item && item[leafKey] && item[leafKey].length) {
                getLastLeaf(item[leafKey], leafKey, callback)
            } else {
                callback(item);
            }

        })
    }

    getLastLeaf(...arguments);
}


/**
 * 得到最近N个月,不算当月
 * @param m
 * @returns {Array}
 */
exports.getLastMonth = function (m) {
    let n = m || 1;
    let date = new Date;
    let thisYear = date.getFullYear();
    let thisMonth = date.getMonth() + 1;
    let arr = [];
    for (var i = 0; i < n; i++) {
        thisMonth--;
        if (thisMonth === 0) {
            thisYear = thisYear - 1;
            thisMonth = 12;
        } else {
            thisYear = thisYear;
            thisMonth = thisMonth < 10 ? '0' + thisMonth : thisMonth;

        }
        arr.push(thisYear + '' + thisMonth);
    }
    return arr;
}
