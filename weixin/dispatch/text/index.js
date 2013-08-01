var config = require('../../config')[env];
var userSend = require('../../../proxy/weixin/' + config.proxy_type + '/logUserSend.js');
var xss = require("xss");
var rule = require('../../rule');
module.exports.do = function (message, req, res, callback) {
    var content = xss(message.Content);
    var userkey = xss(message.FromUserName);
    var logInfo = {userkey:xss(message.FromUserName), msgtype: xss(message.MsgType)};
    logInfo.content = "文本:" + content;
    userSend.logUserSendContent(logInfo, function(err, result){
        if (!!err) {
        }
        rule.do('text', userkey, content, function(err, msg){
            callback(err, msg);
        });
    });

};
