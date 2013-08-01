var Logger = require('bunyan');
modules.exports.do = function() {
	this.xss = require('xss');
	this.logger = new Logger({
        name: 'weixin_client',
        streams: [
            {
                stream: process.stdout,
                level: 'info'
            },
            {
                type: 'rotating-file',
                path: config.logPath,
                level: 'error',
                period: '1d',   // daily rotation
                count: 365        // keep 365 back copies
            }
        ],
        serializers: {
            req: Logger.stdSerializers.req,
            res: Logger.stdSerializers.res
        }
    });
	this.pool = mysql.createPool({
        host     : config.mysql_host,
        user     : config.mysql_username,
        password : config.mysql_password,
        database  : config.mysql_db
    });
};
}