var _query = function(connection, sql, obj, callback){

    if (!!connection) {
        connection.query(sql, obj, function(err, results){
            callback(err, results);
        });
    }   else {
        //console.log(resource.pool._freeConnections.length);
        //console.log(resource.pool._connectionQueue.length);
        //console.log(resource.pool._allConnections.length);
        resource.pool.getConnection(function(err, connection) {
            if (!!err) {
                return callback(err);
            } else {
                var query = connection.query(sql, obj, function(err, results){
                    connection.end();
                    callback(err, results);
                });
            }
        });
    }
};


var _logUserSendContent = function (message, cb) {
    var sql = "insert into user_send_log set ?";
    var obj = {userkey: message.userkey, msgtype: message.msgtype, msg: message.content};
    _query(undefined, sql, obj, function(err ,result){
        if (!!err) {
            cb(new Error("insert fail"));
        } else {
            if (!!result.insertId) {
                cb(undefined, result.insertId);
            } else {
                cb(new Error("get insert id fail"));
            }
        }
    });
}
exports.logUserSendContent = _logUserSendContent;



