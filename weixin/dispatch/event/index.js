var config = require('../../config')[env];
var xss = require("xss");
var rule = require('../../rule');
var userSend = require('../../../proxy/weixin/' + config.proxy_type + '/logUserSend.js');


module.exports.do = function (message, req, res, callback) {


    for (var key in message) {
        message[key] = xss(message[key]);
    }
    var event = message.Event;
    var key = message.EventKey;
    var userkey = message.FromUserName;
    var logInfo = {userkey:message.FromUserName, msgtype:message.MsgType};
    logInfo.content = "消息类型:" + event;
    logInfo.content += "\n 键值:" + key;
    userSend.logUserSendContent(logInfo, function(err, result){
        if (!!err) {

        }
        rule.do('event', userkey, { sub_type: event, key: key}, function(err, msg){
            callback(err, msg);
        });
    });

};
