var gaming = require('./gaming');
var reg = require('./reg');
var exchange = require('./exchange');
var config = require('../config')[env];
var user = require('../../proxy/weixin/' + config.proxy_type + '/user.js');
var activity = require('../../proxy/weixin/' + config.proxy_type + '/index.js');

var _getActivityType = function(data) {
    var obj = undefined;
    if (data.activity_type == "gaming") {
        obj = gaming;
    } else if (data.activity_type == "mission") {
        obj = mission;
    } else if (data.activity_type == "reg") {
        obj = reg;
    } else if (data.activity_type == "exchange") {
        obj = exchange;
    }
    return obj;
}

var _goAction = function(keyword, userId, callback) {
    activity.getActivityDataByKeyword(keyword, function(err, results) {
        if (!err) {
            if (results.length == 1) {
                try {
                    var data = JSON.parse(results[0]["data"]);
                } catch (e) {
                    return callback(new Error("解析json错误!!!!!"));
                }
                if (typeof data == 'object') {
                    var obj = _getActivityType(data);
                    if ((!!obj) && (!!data.sub_type)) {
                        return obj[data.sub_type](data, userId, results[0], callback);
                    } else {
                        return callback(new Error("obj:" + util.inspect(data, { showHidden: true, depth: null }) + " && data.sub_type为" + util.inspect(data.sub_type, { showHidden: true, depth: null })));
                    }
                } else {
                    return callback(new Error("data is not object:" + (typeof data)));
                }
            } else {
                if (!!results && results.length >1) {
                    return callback(new Error("find too many recorder"));
                } else {
                    activity.getArticleFromDBByKeyword(userId, keyword, function(error, results){
                        if (!!error) {
                            if (error.message == "no this keyword") {
                                activity.getDefaultMsg(undefined, userId, function(err, results){
                                    if (!!err) {
                                        return callback(err, undefined);
                                    } else {
                                        return callback(undefined, results);
                                    }
                                });
                            } else {
                                return callback(error, results);
                            }

                        } else {
                            if (typeof results == 'string') {
                                return callback(error, results);
                            }
                            if ((!!results) && (results.length > 0)) {
                                return callback(error, results);
                            } else {
                                activity.getDefaultMsg(undefined, userId, function(err, results){
                                    if (!!err) {
                                        return callback(err, undefined);
                                    } else {
                                        return callback(undefined, results);
                                    }
                                });
                                //return callback(undefined, "亲，木有这个关键词哦");
                            }
                        }
                    });
                }

            }
        } else {
            activity.getDefaultMsg(undefined, userId, function(err, results){
                if (!!err) {
                    return callback(err, undefined);
                } else {
                    return callback(undefined, results);
                }
            });
            //return callback(undefined, "没有这个活动的说");
        }
    });
}

module.exports.do = function(type, userkey, keyword, callback){
    if (type == 'event') {
        if (keyword.sub_type == "subscribe") {
            return reg["subscribe"](userkey, callback);
        } else if (keyword.sub_type == "unsubscribe"){
            return reg["unsubscribe"](userkey, callback);
        } else if (keyword.sub_type == "CLICK") {
            return _goAction(keyword.key, userkey, callback);
        }
    }

   resource.pool.getConnection(function(err, connection){
    //var connection = undefined
        if (!err) {
            user.checkUser(connection, userkey, function(err, result){
                if (!err) {
                    if (result.length == 0) {
                        user.createUser(connection, userkey, function(err, insertId){
                            connection.end();
                            if (!err) {
                                _goAction(keyword, insertId, callback);
                            } else {
                                return callback(new Error("createUser fail"));
                            }
                        });
                    } else if (result.length == 1){
                        connection.end();
                        var userId = result[0]["id"];
                        _goAction(keyword, userId, callback);
                    } else {
                        connection.end();
                        return callback(new Error("checkuser find too many user"));
                    }
                }
            });
        } else {
            return callback(new Error("get connection fail"));
        }
    });
};
