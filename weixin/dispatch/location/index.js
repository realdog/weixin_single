var xss = require("xss");
var config = require('../../config')[env];
var userSend = require('../../../proxy/weixin/' + config.proxy_type + '/logUserSend.js');
module.exports.do = function (message, req, res, cb) {
    var logInfo = {userkey:xss(message.FromUserName), msgtype: xss(message.MsgType)};
    logInfo.content = "纬度:" + xss(message.Location_X) + "  经度:" + xss(message.Location_Y);
    logInfo.content += "\n 放大倍数:" + xss(message.Scale);
    logInfo.content += "\n 地址:" + xss(message.Label);
    userSend.logUserSendContent(logInfo, function(err, result){
        if (!!err) {

        }
        cb(err, result);
    });
};
