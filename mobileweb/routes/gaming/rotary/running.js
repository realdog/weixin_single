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
                            connection.end();
                            return _errResponse(req, res, e, connection);
                        }

                        var str = req.u.toString() + req.a.toString() + results[0]["salt"].toString();
                        var hash =crypto.createHash("md5");
                        hash.update(str);
                        var hashmsg = hash.digest('hex');
                        var code = hashmsg.toString();
                        if (code != req.c) {
                            return _errResponse(req, res, new Error("code is " + code + " And req.c is" + req.c), connection);
                        }


                        if (data.endTimer <= new Date().getTime) {
                            connection.end();
                            return  res.render("gaming/rotary/after",{
                                resourceDomain: req.resource_domain,
                                desc: "活动已经结束",
                                provider: provider
                            });
                        } else if (data.beginTime > new Date().getTime()) {
                            connection.end();
                            return res.render("gaming/rotary/before",{
                                resourceDomain: req.resource_domain,
                                desc: data.running.summary,
                                provider: provider
                            });
                        }
                        activity.getSN(connection, req.u, req.a, function(err, result){
                            connection.end();
                            if (!err) {
                                try {
                                    var _other = JSON.parse(result.other);
                                } catch (e) {
                                    return _errResponse(req, res, e, undefined);
                                }

                                return res.render("gaming/rotary/win",{
                                    resourceDomain: req.resource_domain,
                                    sn: result.sn,
                                    prizetype: _other.prizetype,
                                    prizename: _other.prizename,
                                    desc: data.running.summary,
                                    provider: provider
                                });
                            } else {
                                return  res.render("gaming/rotary/running",{
                                    resourceDomain: req.resource_domain,
                                    desc: data.running.summary,
                                    prize: data.prize,
                                    u: req.u,
                                    code: req.c,
                                    a: req.a,
                                    provider: provider
                                });
                            }
                        });
                    } else {
                        if (results.length > 1) {
                            return _errResponse(req, res, new Error("getDataFromActivityByBaid results length > 1"), connection);
                        } else {
                            return _errResponse(req, res, new Error("getDataFromActivityByBaid results length < 1"), connection);
                        }

                    }
                }
            });
        } else {
            return  _errResponse(req, res, err, connection);
        }
    });
};