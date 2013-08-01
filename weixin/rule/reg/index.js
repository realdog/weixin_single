var config = require('../../config')[env];
var activity = require('../../../proxy/weixin/' + config.proxy_type + '/index.js');
var user = require('../../../proxy/weixin/' + config.proxy_type + '/user.js');


var _subscribe = function (userKey, callback) {
    resource.pool.getConnection(function(err, connection) {
        if (!err) {
            user.checkUser(connection, userKey, function(err, results) {
                if (!err) {
                    if ((results.length == 1)) {
                        var userid = results[0]["id"];
                        user.updateUserStatus(connection, 1, userid, function(err, results) {
                            if (!err) {
                                if (results.affectedRows != 1) {
                                    connection.end();
                                    callback(new Error("update too may recorders"));
                                } else {
                                    activity.getWelcomMsg(connection, userid, function(err, results){
                                        connection.end();
                                        if (!!err) {
                                            return callback(err, undefined);
                                        } else {
                                            return callback(undefined, results);
                                        }
                                    });

                                }
                            } else {
                                connection.end();
                                callback(new Error("update fail"));
                            }
                        });
                    } else if (results.length == 0) {
                        user.createUser(connection, userKey, function(err, insertId) {
                            if (!!err) {
                                connection.end();
                                callback(new Error("insert fail"));
                            } else {
                                if (!!insertId) {
                                    activity.getWelcomMsg(connection, insertId, function(err, results){
                                        connection.end();
                                        if (!!err) {
                                            return callback(err, undefined);
                                        } else {
                                            return callback(undefined, results);
                                        }
                                    });
                                } else {
                                    connection.end();
                                    return callback(new Error("get insert id fail"));
                                }
                            }
                        });
                    } else {
                        connection.end();
                        callback(new Error("too many user had same name"));
                    }
                } else {
                    connection.end();
                    callback(new Error('checkUser fail'));
                }
            });
        } else {
            connection.end();
            callback(new Error("get connection fail"));
        }
    });
};

var _unsubscribe = function(userKey, callback) {
    resource.pool.getConnection(function(err, connection) {
        if (!err) {
            user.checkUser(connection, userKey, function(err, results) {
                if (!err) {
                    if ((results.length == 1)) {
                        var id = results[0]["id"];
                        user.updateUserStatus(connection, 0, id, function(err, results) {
                            connection.end();
                            if (!err) {
                                if (results.affectedRows == 1) {
                                    callback(undefined);
                                } else {
                                    callback(new Error("update too may user"));
                                }
                            }
                        });
                    }
                } else {
                    connection.end();
                    callback(new Error("checkUser fail"));
                }
            });
        } else {
            connection.end();
            callback(new Error("get connection fail"));
        }
    });
};
module.exports.subscribe = _subscribe;
module.exports.unsubscribe = _unsubscribe;