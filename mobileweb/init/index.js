var config = require('../config')[env];
var mysql  = require('mysql');
var Logger = require('bunyan');
module.exports.do = function(){
    this.xss = require('xss');
    this.log = new Logger({
        name: config.log_mobileweb.name,
        streams: [
            {
                stream: process.stdout,
                level: 'info'
            },
            {
                type:  config.log_mobileweb.type,
                path:  config.log_mobileweb.path,
                level:  config.log_mobileweb.level,
                period:  config.log_mobileweb.period,   // daily rotation
                count:  config.log_mobileweb.count        // keep 365 back copies
            }
        ],
        serializers: {
            req: Logger.stdSerializers.req,
            res: Logger.stdSerializers.res
        }
    });
    this.pool = mysql.createPool({
        host     : config.mysql.host,
        user     : config.mysql.username,
        password : config.mysql.password,
        database  : config.mysql.db
    });
};
