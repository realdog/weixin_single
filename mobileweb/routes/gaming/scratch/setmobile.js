var xss = require("xss");
var config = require("../../../config")[env];
var activity = require("../../../../proxy/mobileweb/" + config.proxy_type + '/index.js');
var _errResponse = require("../../../../utility/report").errResponseByJSON;
exports.name = "setmobile";

exports.run = function(req, res, next){
    resource.pool.getConnection(function(err, connection){
        if (!!err) {
            return _errResponse(req, res, err);
        } else {
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
                        if((!!req.body.sncode) && (!!req.body.tel)) {
                            var tel = xss(req.body.tel);
                            var sncode = xss(req.body.sncode);

                            activity.setSNTableData(connection, {user_mobile:tel}, req.u, sncode, req.a, function(err, result){
                                connection.end();
                                if (!!err) {
                                    return _errResponse(req, res, err);
                                } else {
                                    res.json(200,{
                                        success: true
                                    })
                                }
                            });
                        } else {
                            connection.end();
                            return _errResponse(req,res , new Error("setMobile fail for wrong params"), undefined);
                        }


                    } else {
                        connection.end();
                        if (results.length > 1) {
                            return _errResponse(req, res, new Error("getDataFromActivityByBaid results length > 1"));
                        } else {
                            return _errResponse(req, res, new Error(" getDataFromActivityByBaid results length < 1"));
                        }
                    }
                }
            })
        }
    });

};