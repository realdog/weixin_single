var config = require("../../../config")[env];
var crypto = require('crypto');
var activity = require("../../../../proxy/mobileweb/" + config.proxy_type + '/index.js');
var report = require("../../../../utility/report");
exports.name = "running";

exports.run = function(req, res, next){
    resource.pool.getConnection(function(err, connection){
        if (!err) {
            activity.getDataFromActivityByBaid(connection,  req.a, function(err, results){
                if (!!err) {
                    connection.end();
                    return report.errResponseByHtml(req, res, err, undefined);
                } else {
                    if (results.length != 1) {
                        connection.end();
                        return report.errResponseByHtml(req, res, new Error("exchange free getDataFromActivityByBaid find too many recorders"), undefined);
                    }else if (results.length == 1) {
                        try {
                            var data = JSON.parse(results[0]["data"]);
                        } catch (e) {
                           connection.end();
                           return  report.errResponseByHtml(req, res, e, undefined);
                        }
                        if (data.endTime <= new Date().getTime()) {
                            connection.end();
                            return res.render("exchange/free/after",{
                                resourceDomain: req.resource_domain,
                                desc: data.after.summary,
                                cover: data.after.cover,
                                provider: provider
                            });
                        } else if (data.beginTime > new Date().getTime()) {
                            connection.end();
                            return res.render("exchange/free/before",{
                                resourceDomain: req.resource_domain,
                                desc: data.before.summary,
                                cover: data.before.cover,
                                provider: provider
                            });
                        }
                        var str = req.u.toString() + req.a.toString() + results[0]["salt"].toString();
                        var hash =crypto.createHash("md5");
                        hash.update(str);
                        var hashmsg = hash.digest('hex');
                        var code = hashmsg.toString();
                        if (code != req.c) {
			                return report.errResponseByHtml(req, res, new Error("code is " + code + " And req.c is" + req.c), connection);
                        } else {
                            activity.getSN(connection, req.u, req.a, function(err, result){
                                if (!err) {
                                    connection.end();
                                    return res.render("exchange/free/running",{
                                        resourceDomain: req.resource_domain,
                                        code: result.sn,
                                        cover: data.running.cover,
                                        desc: data.running.summary,
                                        provider: provider
                                    });
                                } else {
                                    if ((err.message == 'find zero recorder') && (typeof result == "number") && (result == 0)) {
                                        activity.getSN(connection, {userid:req.u, flag: 1}, req.a, function(err, result){
                                            connection.end();
                                            if (!!err){
                                                return report.errResponseByHtml(req, res, err);
                                            } else {
                                                if (result == 0) {
                                                    res.render("exchange/free/error",{
                                                        resourceDomain: req.resource_domain,
                                                        cover: data.after.cover,
                                                        desc: "优惠券发光了哦",
                                                        provider: provider
                                                    });
                                                } else {
                                                    res.render("exchange/free/running",{
                                                        resourceDomain: req.resource_domain,
                                                        code: result.sn,
                                        		        cover: data.running.cover,
                                                        desc: data.running.summary,
                                                        provider: provider
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        connection.end();
                                        return report.errResponseByHtml(req, res, err, undefined);
                                    }

                                }
                            });
                        }

                    }
                }
            });
        } else {
            connection.end();
            return report.errResponseByHtml(req, res, err, undefined);
        }
    });
};
