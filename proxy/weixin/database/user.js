var _util = require('./index');
var _createUser = function(connection, userKey,  callback){
    var sql = "INSERT INTO user SET ?";
    var obj = {userkey: userKey, status: 1, gold: 100, silver: 100};
    _util.query(connection, sql, obj, function(err, result){
        if (!!err) {
            callback(new Error("insert fail"));
        } else {
            if (!!result.insertId) {
                callback(undefined, result.insertId);
            } else {
                callback(new Error("get insert id fail"));
            }
        }
    });

};
exports.createUser = _createUser;

var _checkUser = function(connection, userKey, callback) {
    var sql = "SELECT id from user where userkey= ?";
    var obj = [userKey];
    _util.query(connection, sql, obj, function(err, result){
        if (!!err) {
            callback(new Error("check fail"));
        } else {
            callback(undefined, result);
        }
    });
};

exports.checkUser = _checkUser;


//weixin
var _updateUserStatus = function(connection, status, id, callback) {
    var sql = "UPDATE user set status = ? where id = ? ";
    var obj = [status, id];
    _util.query(connection, sql, obj, function(err, result){
        if (!err) {
            if (result.affectedRows != 1) {
                callback(new Error("update too may recorders"));
            } else {
                callback(undefined, result);
            }
        } else {
            callback(new Error("update fail"));
        }
    });
};
exports.updateUserStatus = _updateUserStatus;

var _updateUserMoneyById = function(connection, id, price, cb) {
    if (!connection) {
        return cb(new Error("get connection fail"));
    }
    var sql = "UPDATE user set  gold = gold - ? where id = ? AND gold >= ?";
    var obj = [price, id, price];
    _util.query(connection, sql, obj, function(err, result){
        if (!err) {
            if (result.affectedRows == 0) {
                cb(new Error("have no enough money"));
            } else {
                cb(undefined, result);
            }
        } else {
            cb(new Error("update fail"));
        }
    });

};

var _updateUserMoneyByUserkeyAndWuid = function(connection, userKey, price, cb) {
    if (!connection) {
        return cb(new Error("get connection fail!"));
    }
    var sql = "UPDATE user set  gold = gold - ? where userkey = ? AND  gold >= ?";
    var obj = [price, userKey, price];
    _util.query(connection, sql, obj, function(err, result){
        if (!err) {
            if (result.affectedRows == 0) {
                cb(new Error("have no enough money"));
            } else {
                cb(undefined, result);
            }
        } else {
            cb(new Error("update fail"));
        }
    });

};

exports.updateUserMoney = function(connection, data, cb){
    if (data.hasOwnProperty("id") && data.hasOwnProperty("price")) {
        _updateUserMoneyById(connection, data.id, data.price, cb);
    } else if (data.hasOwnProperty("userKey") && data.hasOwnProperty("price")) {
        _updateUserMoneyByUserkeyAndWuid(connection, data.userKey, data.price, cb);
    } else {
        cb(new Error("params error"));
    }
};