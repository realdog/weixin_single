var _errResponseByHtml = function(req, res, err, connection){
    if (err.hasOwnProperty("stack")) {
        resource.log.error({req: req, res: res}, err.message + ":::stack:::" + err.stack);
    } else {
        resource.log.error({req: req, res: res}, err.message);
    }

    if (!!connection) {
        connection.end();
    }
    return  res.render("default/error",{
        resourceDomain: req.resource_domain,
        desc: "参与的人太多了，你没能挤进去哦",
        provider: provider
    });
};

module.exports.errResponseByHtml  = _errResponseByHtml;

var _errResponseByJSON = function(req, res, err, connection){
    if (err.hasOwnProperty("stack")) {
        resource.log.error({req: req, res: res}, err.message + ":::stack:::" + err.stack);
    } else {
        resource.log.error({req: req, res: res}, err.message);
    }
    if (!!connection) {
        connection.end();
    }
    return res.json(200,{
        err : {
            message: "可惜可惜，木有中奖~~~"
        }
    });
};

module.exports.errResponseByJSON  = _errResponseByJSON;





var _errResponseByXml = function(req, res, err, connection){
    if (err.hasOwnProperty("stack")) {
        resource.log.error({req: req, res: res, body: req.weixin}, err.message + ":::stack:::" + err.stack);
    } else {
        resource.log.error({req: req, res: res, body: req.weixin}, err.message);
    }
    if (!!connection) {
        connection.end();
    }
    if (!!res)
        res.reply("还木有这个活动哦");
};


module.exports.errResponseByXml  = _errResponseByXml;
