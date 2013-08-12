var config = require("../../../config")[env];
var activity = require("../../../../proxy/mobileweb/" + config.proxy_type + '/index.js');
var _errResponse = require("../../../../utility/report").errResponseByHtml;
exports.name = "showArticle";
exports.run = function(req, res, next){
    var aid = req.a;
    var sid = req.w;

    var reData = {
        title   : '',
        picUrl  : '',
        content : '',
        url     : '',
        description    : ''
    };

    resource.pool.getConnection(function(err, connection){
        if(!!err){
            return  _errResponse(req, res, e, undefined);
        }
        var sql = "select * from biz_article where flag = 0 and aid = ? ";
        connection.query(sql, [aid], function(err, result){
            connection.end();
            if(!!err){
                return  _errResponse(req, res, err, undefined);
            }
            if(result.length != 1){
                return  _errResponse(req, res, new Error("article not found"), undefined);
            }
            try {
                var jsondata = JSON.parse(result[0].jsondata);
            } catch (e) {
                return  _errResponse(req, res, new Error("parse data fail:" + result[0].jsondata)  , undefined);
            }

            if(result[0].type == "s"){
                reData.title = jsondata.title;
                reData.picUrl = jsondata.coverurl;
                reData.content = jsondata.maincontent;
                reData.url = jsondata.source_url;
                reData.description = jsondata.summary;
            }else if(result[0].type == "m"){
                reData.title = jsondata[sid].title;
                reData.picUrl = jsondata[sid].cover;
                reData.content = jsondata[sid].content;
                reData.url = jsondata[sid].sourceurl;
                reData.description = null;
            }else{
                return  _errResponse(req, res, new Error("data error:" + JSON.stringify(result[0]))  , undefined);
            }
            console.log(reData);

            res.render('reply/normal/display',reData);
        });
    });
}