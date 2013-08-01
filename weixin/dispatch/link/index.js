var xss = require("xss");
var config = require('../../config')[env];
var userSend = require('../../../proxy/weixin/' + config.proxy_type + '/logUserSend.js');
module.exports.do = function (message, req, res, cb) {
    var logInfo = {userkey:xss(message.FromUserName), msgtype: xss(message.MsgType)};
    logInfo.content = "标题:" + xss(message.Title);
    logInfo.content += "\n 描述:" + xss(message.Description);
    logInfo.content += "\n 链接:" + xss(message.Url);
    userSend.logUserSendContent(logInfo, function(err, result){
        if (!!err) {

        }
        cb(err, result);
    });
};
