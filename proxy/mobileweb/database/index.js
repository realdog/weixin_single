var crypto = require('crypto');

var _getSN = function(connection, data, baid,  callback) {
    var fieldList = [];
    var valueList = []
    if (!connection) {
        return callback(new Error("get connection fail"));
    }

    if (typeof data == "string" || typeof data == "number") {
        var sql = "select sid as id, sn, other from biz_sn where baid = ? and userid = ?";
        var obj = [baid, data];
        _query(connection, sql, obj, function(err, results){
            if (!!err) {
                return callback(new Error("select error when u type is " + typeof data), undefined);
            } else {
                if (results.length == 1) {
                    return callback(undefined, {sn:results[0]["sn"], id: results[0]["id"], other: results[0]["other"]});
                } else if (results.length > 1) {
                    return callback(new Error("find too many recorder"), results.length);
                } else {
                    return callback(new Error("find zero recorder"), 0);
                }
            }
        });
    } else {
        for (var _temp in data) {
            fieldList.push(_temp + " = ?");
            valueList.push(data[_temp]);
        }

        if (fieldList.length == 0 || valueList.length == 0) {
            return callback(new Error("NULL data"));
        }
        valueList.push(baid);
        var sql = "update biz_sn set " + fieldList.join(",")  + " , sid = LAST_INSERT_ID(sid)  where flag = 0 AND baid = ? AND userid is null limit 1";

        _query(connection, sql, valueList, function(err, result){
            if (!!err) {
                return callback(new Error("update fail"));
            } else {
                if (result.affectedRows == 1) {
                    var id = result.insertId;
                    var sql = "select sid as id, sn, other from biz_sn where sid = ?";
                    var obj = [id];
                    _query(connection, sql, obj, function(err, results){
                        if (!!err) {
                            return callback(new Error("select error"));
                        } else {
                            if (results.length == 1) {
                                return callback(undefined, {sn:results[0]["sn"], id: results[0]["id"], other: results[0]["other"]});
                            } else if (results.length > 1) {
                                return callback(new Error("select too many recorder"), results.length);
                            } else {
                                return callback(undefined, 0);
                            }
                        }
                    });
                } else if (result.affectedRows > 1) {
                    return callback(new Error("update too many recorder"), result);
                } else {
                    return callback(new Error("update zero recorder"), result);
                }
            }
        });
    }
};

exports.getSN = _getSN;

var _checkHeader = function(str, allow) {
    return true;
}

exports.checkHeader = _checkHeader;

var _query = function(connection, sql, obj, callback){

    if (!!connection) {
        connection.query(sql, obj, function(err, results){
            callback(err, results);
        });
    }   else {
        resource.pool.getConnection(function(err, connection) {
            if (!!err) {
                return callback(err);
            } else {
                var query = connection.query(sql, obj, function(err, results){
                    connection.end();
                    callback(err, results);
                });
                console.log(query.sql);
            }
        });
    }
};
exports.query = _query;


exports.userJoinActivity = function(connection, u, a, cb){
    if (!!connection) {
        if (!u  || !a || !cb) {
            return cb(new Error("invalid params"));
        } else {
            var sql = "insert into user_join_times set userid = ?,  baid = ?, cdate = CURRENT_DATE";
            var obj = [u, a];
            _query(connection, sql, obj, function(err, result){
                if (!!err) {
                    return cb(err);
                } else {
                    cb(undefined, result);
                }
            });
        }
    } else {
        return cb(new Error("get connection fail"));
    }
};

exports.getActivityJoinTimes = function (connection, a, cb){
    if (!!connection) {
        if (!a || !cb) {
            return cb(new Error("invalid params"));
        } else {
            var sql = "select count(*) as times from user_join_times where  baid = ?";
            var obj = [a];
            _query(connection, sql, obj, function(err, results){
                if (!!err) {
                    cb(err);
                } else {
                    cb(undefined, results);
                }
            });
        }
    } else {
        return cb(new Error("get connection fail"));
    }
};
exports.getUserJoinTimes = function(connection, u, a, cb) {
    if (!!connection) {
        if (!u  || !a || !cb) {
            return cb(new Error("invalid params"));
        } else {
            var sql = "select count(*) as times from user_join_times where userid = ?  and baid = ?";
            var obj = [u, a];
            _query(connection, sql, obj, function(err, results){
                if (!!err) {
                    cb(err);
                } else {
                    cb(undefined, results);
                }
            });
        }
    } else {
        return cb(new Error("get connection fail"));
    }
};


exports.getUserTodayJoinTimes = function(connection, u, a, cb) {
    if (!!connection) {
        if (!u  || !a || !cb) {
            return cb(new Error("invalid params"));
        } else {
            var sql = "select count(*) as times from user_join_times where userid = ? and baid = ? and cdate = CURRENT_DATE ";
            var obj = [u, a];
            console.log(obj);
            _query(connection, sql, obj, function(err, results){
                if (!!err) {
                    cb(err);
                } else {
                    cb(undefined, results);
                }
            });
        }
    } else {
        return cb(new Error("get connection fail"));
    }


};


exports.getDataFromActivityByBaid = function(connection, baid, cb){
    if (!baid || !cb) {
        return cb(new Error("invalid params"));
    }
    var sql = "SELECT  salt, config as data FROM biz_activity WHERE baid = ?";
    var obj = [baid];
    _query(connection, sql, obj, function(err, results){
        if (!!err) {
            cb(err);
        } else {
            cb(undefined, results);
        }
    });

};


exports.setSNTableData = function(connection, data, userid, sn, baid, cb){
    if (!!connection) {
        var fieldList = [];
        var valueList = [];

        for (var _temp in data) {
            fieldList.push(_temp + " = ?");
            valueList.push(data[_temp]);
        }

        if (fieldList.length == 0 || valueList.length == 0) {
            return cb(new Error("NULL data"));
        }
        valueList.push(userid)
        valueList.push(sn);
        valueList.push(baid);
        var sql = "update biz_sn set " + fieldList.join(",")  + " , sid = LAST_INSERT_ID(sid)  where userid = ? AND sn = ? AND baid = ?  limit 1";
        _query(connection, sql, valueList, function(err, result){
            if (!!err) {
                return cb(new Error("update fail"));
            } else {
                if (result.affectedRows == 1) {
                    cb(undefined, result.insertId);
                } else if (result.affectedRows > 1) {
                    return cb(new Error("update too many recorder"), result);
                } else {
                    return cb(new Error("update zero recorder"), result);
                }
            }
        });
    } else {
        return cb(new Error("get connection fail"));
    }
};
