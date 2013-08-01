var crypto = require('crypto');

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
            }
        });
    }
};
exports.query = _query;


var _getActivityDataByKeyword = function(keyword, callback){
    var sql = "SELECT baid as id, salt, config as data FROM biz_activity where  keyword = ? AND status = 0";
    var obj =  [keyword];
    _query(undefined, sql, obj, function(err, results){
        callback(err, results);
    });
};
exports.getActivityDataByKeyword = _getActivityDataByKeyword;

var _getWelcomMsg = function(connection, userid, cb) {
    var sql = "select welcome from biz_user";
    var obj = [];
    _query(connection, sql, obj, function(err, results){
        if (!!err) {
            return cb(err, undefined);
        } else {
            if (!!results && (results.length == 1)) {

                try {
                    var welcome = JSON.parse(results[0].welcome);
                } catch (e) {
                    cb(e, undefined);
                }
                if (welcome.type == "0") {
                    return cb(undefined, welcome.text);
                } else if (welcome.type == "1") {
                    var articleid = welcome.pic >>> 0;
                    _getArticleById(connection, userid, articleid, function(err, results){
                        if (!!err) {
                            return cb(err, undefined);
                        } else {
                            return cb(undefined, results);
                        }
                    });
                } else {

                }


            } else {
                return cb(new Error("get biz user welcome msg fail"), undefined);
            }
        }
    });
};
exports.getWelcomMsg = _getWelcomMsg;



var _getDefaultMsg = function(connection, userid, cb) {
    var now = new Date().getTime();
    if (resource.hasOwnProperty("defaultMsg") && resource.hasOwnProperty("defaultMsg_updatetime")) {
        if ((now - resource.defaultMsg_updatetime) < 36000000) {
            var results = resource.defaultMsg;
            var type = resource.defaultMsg_type;
            if (type == "String") {
                return cb(undefined, results);
            } else if (type == "Array") {
                var __temp = [];
                //__temp = results.slice(0, results.length >>> 0);
                for (var _temp in results) {
                    __temp[_temp] = {};
                    __temp[_temp].title = results[_temp].title;
                    __temp[_temp].picUrl = results[_temp].picUrl;
                    __temp[_temp].content = results[_temp].content;
                    __temp[_temp].url = results[_temp].url.replace("u=0", "u=" + userid);
                    __temp[_temp].desc = results[_temp].desc;
                }
                return cb(undefined, __temp);
            } else {
                return cb(new Error("cached msg wrong"));
            }
        }

    }
    var sql = "select defaultmsg from biz_user";
    var obj = [];
    _query(connection, sql, obj, function(err, results){
        if (!!err) {
            return cb(err, undefined);
        } else {
            if (!!results && (results.length == 1)) {

                try {
                    var defaultmsg = JSON.parse(results[0].defaultmsg);
                } catch (e) {
                    cb(e, undefined);
                }
                if (defaultmsg.type == "0") {
                    resource.defaultMsg_type = "String";
                    resource.defaultMsg = defaultmsg.text;
                    resource.defaultMsg_updatetime = new Date().getTime();
                    return cb(undefined, defaultmsg.text);
                } else if (defaultmsg.type == "1") {
                    var articleid = defaultmsg.pic >>> 0;
                    _getArticleById(connection, userid, articleid, function(err, results){
                        if (!!err) {
                            return cb(err, undefined);
                        } else {
                            resource.defaultMsg_type = "Array";
                            resource.defaultMsg = results.slice(0, results.length >>> 0);
                            resource.defaultMsg_updatetime = new Date().getTime();
                            return cb(undefined, results);
                        }
                    });
                } else {

                }


            } else {
                return cb(new Error("get biz user welcome msg fail"), undefined);
            }
        }
    });
};
exports.getDefaultMsg = _getDefaultMsg;



var _getArticleById = function(connection, userid, articleid, cb) {
    var sql = "select  biz_article.aid, biz_article.type, biz_article.jsondata  from biz_article where aid = ?"
    var obj = [articleid];
    _query(connection, sql  , obj, function(err, results){
        if (!!err) {
            return cb(err, undefined);
        } else {
            if (results.length == 1) {
                var _random = (Math.random() * 10000 + 1) >>> 0;
                var article = [];
                try {
                    var data =  JSON.parse(results[0].jsondata);
                } catch (e) {
                    return callback(e, undefined);
                }
                if (results[0].type == "s") {
                    article[0] = {};
                    article[0].title = data.title;
                    article[0].picUrl = data.coverurl;
                    article[0].content = data.maincontent;
                    article[0].url = data.source_url || "/reply/normal/showArticle?c=" + _random + "&a=" + results[0].aid + "&u=0";
                    article[0].desc = data.summary;
                } else if (results[0].type == "m") {
                    var ___temp;
                    for (___temp in data) {
                        article[___temp] = {};
                        article[___temp].title = data[___temp].title;
                        article[___temp].picUrl = data[___temp].cover;
                        article[___temp].content = data[___temp].content;
                        article[___temp].url = data[___temp].sourceurl || "/reply/normal/showArticle?c=" + _random + "&a=" + results[0].aid + "&u=" + userid;
                        article[___temp].desc = "";
                    }
                }
                return cb(err, article);
            } else if (results.length == 0) {
                return cb(new Error("Canot find recorder"), undefined);
            } else {
                return cb(new Error("Canot too many recorder"), undefined);
            }
        }
    });


};
exports.getArticleById = _getArticleById;

//weixin
var _getArticleFromDBByKeyword = function(userid, keyword, callback) {
    var accurateSql = '';
    accurateSql += ' SELECT biz_reply.qid, biz_reply.key_type, biz_reply.keyword, biz_reply.answer_type, biz_reply.answer, ';
    accurateSql += ' biz_article.aid, biz_article.type, biz_article.jsondata ';
    accurateSql += ' FROM biz_reply left join biz_article on biz_reply.answer = biz_article.aid and biz_article.flag = 0 ';
    accurateSql += ' where biz_reply.flag = 0 and biz_reply.key_type =  1';
    accurateSql += ' and biz_reply.keyword = ? ';

    var fuzzySql = '';
    fuzzySql += ' SELECT biz_reply.qid, biz_reply.key_type, biz_reply.keyword, biz_reply.answer_type, biz_reply.answer, ';
    fuzzySql += ' biz_article.aid, biz_article.type, biz_article.jsondata ';
    fuzzySql += ' FROM biz_reply left join biz_article on biz_reply.answer = biz_article.aid and biz_article.flag = 0 ';
    fuzzySql += ' where biz_reply.flag = 0 and biz_reply.key_type =  0';
    fuzzySql += ' and biz_reply.keyword REGEXP ? order by qid desc';

    var obj = [keyword];
    var _random = (Math.random() * 10000 + 1) >>> 0;
    resource.pool.getConnection(function(err, connection){
        if (!err) {
            _query(connection, accurateSql  , obj, function(err, results){
                if (!err) {
                    if ((!!results) && (results.length > 0)) {
                        connection.end();
                        if (results[0].answer_type == 0) {
                            return callback(undefined, results[0].answer);
                        }
                        var returnData;
                        try {
                            var data =  JSON.parse(results[0].jsondata);
                        } catch (e) {
                            return callback(e, undefined);
                        }
                        if (results[0].type == "s") {
                            returnData = [];
                            returnData[0].title = data.title;
                            returnData[0].picUrl = data.coverurl;
                            returnData[0].content = data.maincontent;
                            returnData[0].url = data.source_url || "/reply/normal/showArticle?c=" + _random + "&a=" + results[0].aid + "&u=0";
                            returnData[0].desc = data.summary;
                        } else if (results[0].type == "m") {
                            var ___temp;
                            returnData = [];
                            for (___temp in data) {
                                returnData[___temp] = {};
                                returnData[___temp].title = data[___temp].title;
                                returnData[___temp].picUrl = data[___temp].cover;
                                returnData[___temp].content = data[___temp].content;
                                returnData[___temp].url = data[___temp].sourceurl || "/reply/normal/showArticle?c=" + _random + "&a=" + results[0].aid + "&u=" + userid;
                                returnData[___temp].desc = "";
                            }
                        }
                        return callback(err, returnData);
                    } else {
                        _query(connection, fuzzySql  , obj, function(err, results){
                            connection.end();
                            var returnData;
                            if (!!err) {
                                return callback(err, results);
                            }
                            if ((!!results) && (results.length > 0)) {
                                if (results[0].answer_type == 0) {
                                    return callback(undefined, results[0].answer);
                                }

                                try {
                                    var data =  JSON.parse(results[0].jsondata);
                                } catch (e) {
                                    return callback(e, undefined);
                                }
                                if (results[0].type == "s") {
                                    returnData = [];
                                    returnData[0].title = data.title;
                                    returnData[0].picUrl = data.coverurl;
                                    returnData[0].content = data.maincontent;
                                    returnData[0].url = data.source_url || "/reply/normal/showArticle?c=" + _random + "&a=" + results[0].aid + "&u=0";
                                    returnData[0].desc = data.summary;
                                } else if (results[0].type == "m") {
                                    var ___temp;
                                    returnData = [];
                                    for (___temp in data) {
                                        returnData[___temp] = {};
                                        returnData[___temp].title = data[___temp].title;
                                        returnData[___temp].picUrl = data[___temp].cover;
                                        returnData[___temp].content = data[___temp].content;
                                        returnData[___temp].url = data[___temp].sourceurl || "/reply/normal/showArticle?c=" + _random + "&a=" + results[0].aid + "&u=" + userid;
                                        returnData[___temp].desc = "";
                                    }
                                }
                                callback(err, returnData);
                            } else {
                                callback(new Error("no this keyword"));
                            }



                        });
                    }
                } else {
                    connection.end();
                    callback(err, results);
                }
            });
        } else {
            callback(new Error("proxy index _getArticleFromDBByKeyword fail bye get connection error"));
        }
    });

}

exports.getArticleFromDBByKeyword = _getArticleFromDBByKeyword;
//weixin
exports.genUserCode = function (userId, activityData, callback) {
    var str = userId.toString() + activityData["id"].toString() + activityData["salt"].toString();
    var hash =crypto.createHash("md5");
    hash.update(str);
    var hashmsg = hash.digest('hex');
    var code = hashmsg.toString();
    return callback(undefined, code);

};




exports.getBizUserByApi = function(connection, api, cb){
    var sql = "select * from biz_user where api = ?";
    var obj = [api];
    _query(connection, sql, obj, function(err ,result){
        return cb(err, result);
    });

};

exports.getBizUserByToken = function(connection, token, cb){
    var sql = "select * from biz_user where token = ?";
    var obj = [token];
    _query(connection, sql, obj, function(err ,result){
        return cb(err, result);
    });

};

exports.getBizUserByWuid = function(connection, wuid, cb){
    var sql = "select * from biz_user where wuid = ?";
    var obj = [wuid];
    _query(connection, sql, obj, function(err ,result){
        return cb(err, result);
    });

};