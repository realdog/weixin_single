var config = require("../../../config")[env];
var crypto = require('crypto');
var activity = require("../../../../proxy/mobileweb/" + config.proxy_type + '/index.js');
var _errResponse = require("../../../../utility/report").errResponseByJSON;
exports.name = "check";

exports.run = function(req, res, next){
    resource.pool.getConnection(function(err, connection){
        if (!err) {
            activity.getDataFromActivityByBaid(connection,  req.a, function(err, results){
                if (!!err) {
                    return _errResponse(req, res, err, connection);
                } else {
                    if (results.length == 1) {
                        try {
                            var data = JSON.parse(results[0]["data"]);
                        } catch (e) {
                            connection.end();
                            return _errResponse(req, res, e, connection);
                        }

                        if (data.endTimer <= new Date().getTime) {
                            connection.end();
                            return  res.json({
                                message: "您好，活动已经结束了哦"
                            });
                        } else if (data.beginTime > new Date().getTime()) {
                            connection.end();
                            return  res.json({
                                message: data.before.summary
                            });

                        }
                        var str = req.u.toString() + req.a.toString() + results[0]["salt"].toString();
                        var hash =crypto.createHash("md5");
                        hash.update(str);
                        var hashmsg = hash.digest('hex');
                        var code = hashmsg.toString();
                        if (code != req.c) {
                            return res.json(200,{
                            });
                        } else {
                            activity.getSN(connection, req.u, req.a, function(err, result){
                                if (!err) {
                                    connection.end();
                                    return res.json(200,{
                                        err : {
                                            message: "您不是已经获奖了么@@,您的sn码为" + result.sn
                                        }
                                    });
                                } else {
                                    if (result == undefined) {
                                        connection.end();
                                        return _errResponse(req, res, err);
                                    }
                                    var percent = data.percent;
                                    var _random = Math.floor(Math.random()*10000+1);
                                    console.log(percent + ":" + _random);
                                    if (percent >= _random) {
                                        activity.getSN(connection, {userid:req.u, flag: 1}, req.a, function(err, result){
                                            connection.end();
                                            if (!!err){
                                                if (result == 0) {
                                                    return res.json(200,{
                                                    });
                                                } else {
                                                    return _errResponse(req, res, err, undefined);
                                                }
                                            } else {
                                                if (result == 0) {
                                                    return res.json(200,{
                                                    });
                                                } else {
                                                    try {
                                                        var _other = JSON.parse(result.other);
                                                    } catch (e) {
                                                        return _errResponse(req, res, e, undefined);
                                                    }
                                                    return res.json(200,{
                                                        "sn": result.sn,
                                                        "prizetype": _other.prizetype,
                                                        "success":true
                                                    });
                                                }

                                            }
                                        });
                                    } else {
                                        connection.end();
                                        return res.json(200,{
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            });
        } else {
            return _errResponse(req, res, err, undefined);
        }
    })



};