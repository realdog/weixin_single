var config = require('../config')[env];
var mysql  = require('mysql');
var Logger = require('bunyan');
var activity = require('../../proxy/weixin/' + config.proxy_type + '/index.js');

module.exports.do = function(){
    this.log = new Logger({
        name: config.log_weixin.name,
        streams: [
            {
                stream: process.stdout,
                level: 'info'
            },
            {
                type:  config.log_weixin.type,
                path:  config.log_weixin.path,
                level:  config.log_weixin.level,
                period:  config.log_weixin.period,   // daily rotation
                count:  config.log_weixin.count        // keep 365 back copies
            }
        ],
        serializers: {
            req: Logger.stdSerializers.req,
            res: Logger.stdSerializers.res
        }
    });
    this.pool = mysql.createPool({
        connectionLimit: 300,
        queueLimit: 300,
        host     : config.mysql.host,
        user     : config.mysql.username,
        password : config.mysql.password,
        database  : config.mysql.db
    });
    var that = this;
    activity.getDefaultMsg(undefined, 0, function(err, results){
        console.log(arguments);
        console.log("load defaultMsg:" + ((!!err)? "fail" : "success"));
        that.defaultMsg = results.slice(0, results.length);
        if (that.defaultMsg instanceof String) {
            that.defaultMsg_type = "String";
        } else if (that.defaultMsg instanceof Array) {
            that.defaultMsg_type = "Array";
        } else {
            that.defaultMsg_type = "undefined";
        }

        that.defaultMsg_updatetime = new Date().getTime();
    });
};
