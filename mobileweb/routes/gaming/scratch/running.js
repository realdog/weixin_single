var config = require("../../../config")[env];
var crypto = require('crypto');
var activity = require("../../../../proxy/mobileweb/" + config.proxy_type + '/index.js');
var _errResponse = require("../../../../utility/report").errResponseByHtml;
exports.name = "running";
exports.run = function(req, res, next){
    resource.pool.getConnection(function(err, connection){
        if (!err) {
            activity.getDataFromActivityByBaid(connection, req.a, function(err, results){
                if (!!err) {
                    return _errResponse(req, res, err, connection);
                } else {
                    if (results.length == 1) {
                        try {
                            var data = JSON.parse(results[0]["data"]);
                        } catch (e) {
                            return _errResponse(req, res, e, connection);
                        }
                        var str = req.u.toString() + req.a.toString() + results[0]["salt"].toString();
                        var hash =crypto.createHash("md5");
                        hash.update(str);
                        var hashmsg = hash.digest('hex');
                        var code = hashmsg.toString();
                        if (code != req.c) {
							return _errResponse(req, res, new Error("code is " + code + " And req.c is" + req.c), connection);
                        } else {
                            if (data.endTimer <= new Date().getTime) {
                                connection.end();
                                return  res.render("gaming/scratch/after",{
                                    resourceDomain: req.resource_domain,
                                    desc: "您好，活动已经结束了哦",
                                    provider: provider
                                });
                            } else if (data.beginTime > new Date().getTime()) {
                                connection.end();
                                return res.render("gaming/scratch/before",{
                                    resourceDomain: req.resource_domain,
                                    desc: data.before.summary,
                                    provider: provider
                                });
                            }
                            activity.getSN(connection, req.u, req.a, function(err, result){
                                if (!err) {
                                    connection.end();
                                    try {
                                        var _other = JSON.parse(result.other);
                                    } catch (e) {
                                        return _errResponse(req, res, e, undefined);
                                    }
                                    return res.render("gaming/scratch/hadwin",{
                                        resourceDomain: req.resource_domain,
                                        sn: result.sn,
                                        prizetype: _other.prizetype,
                                        prizename: _other.prizename,
                                        desc: data.running.summary,
                                        provider: provider
                                    });
                                } else {
                                    activity.getUserTodayJoinTimes(connection, req.u, req.a, function(err, results){
                                        if (!!err) {
                                            return _errResponse(req, res, err, connection);
                                        } else {
                                            if (results.length > 0) {
                                                var times = results[0]["times"];
                                                if (times >= data.prize.playperday) {
                                                    connection.end();
                                                    return res.render("gaming/scratch/error",{
                                                        resourceDomain: req.resource_domain,
                                                        desc: "亲，您今日的参与次数已经用完了，请明日再来吧！",
                                                        provider: provider
                                                    });
                                                }  else {
                                                    activity.getUserJoinTimes(connection, req.u, req.a, function(err, results){
                                                        if (!!err) {
                                                            return _errResponse(req, res, err, connection);
                                                        } else {
                                                            if (results.length > 0) {
                                                                var times = parseInt(results[0]["times"]);
                                                                if (times >= data.prize.playtotal)  {
                                                                    connection.end();
                                                                    return res.render("gaming/scratch/error",{
                                                                        resourceDomain: req.resource_domain,
                                                                        desc: "亲，您的参与次数已经用完了，请期待下次活动！",
                                                                        provider: provider
                                                                    });
                                                                } else {
                                                                    activity.userJoinActivity(connection, req.u, req.a, function(err, result){
                                                                        if (!!err){
                                                                            return _errResponse(req, res, err, connection);
                                                                        } else {
                                                                            var percent = data.percent;
                                                                            var _random = Math.floor(Math.random()*10000+1);
                                                                            console.log(percent + ":" + _random);
                                                                            if (percent >= _random) {
                                                                                activity.getSN(connection, {userid:req.u, flag: 1}, req.a, function(err, result){
                                                                                    connection.end();
                                                                                    if (!!err){
                                                                                        return _errResponse(req, res, err);
                                                                                    } else {
                                                                                        if (result == 0) {
                                                                                            res.render("gaming/scratch/lose",{
                                                                                                resourceDomain: req.resource_domain,
                                                                                                prize: data.prize,
                                                                                                provider: provider
                                                                                            });
                                                                                        } else {
                                                                                            try {
                                                                                                var _other = JSON.parse(result.other);
                                                                                            } catch (e) {
                                                                                                return _errResponse(req, res, e);
                                                                                            }
                                                                                            res.render("gaming/scratch/win",{
                                                                                                resourceDomain: req.resource_domain,
                                                                                                desc: data.running.summary,
                                                                                                prize: data.prize,
                                                                                                prizetype: _other.prizetype,
                                                                                                sn: result.sn,
                                                                                                code: req.c,
                                                                                                a: req.a,
                                                                                                u: req.u,
                                                                                                provider: provider
                                                                                            });


                                                                                        }

                                                                                    }
                                                                                });
                                                                            } else {
                                                                                res.render("gaming/scratch/lose",{
                                                                                    resourceDomain: req.resource_domain,
                                                                                    prize: data.prize,
                                                                                    provider: provider
                                                                                });
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });
                                }
                            });
                        }

                    } else {
                        if (results.length > 1) {
                            return _errResponse(req, res, new Error(" getDataFromActivityByBaid results length > 1"), connection);
                        } else {
                            return _errResponse(req, res, new Error(" getDataFromActivityByBaid results length < 1"), connection);
                        }

                    }

                }
            });
        } else {
            return  _errResponse(req, res, err, connection);
        }
    });
};