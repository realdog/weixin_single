/**
 * Created with JetBrains WebStorm.
 * User: tjrb
 * Date: 13-6-18
 * Time: 下午2:48
 * To change this template use File | Settings | File Templates.
 */


module.exports = function(env){

    var config = require('./config')[env]
        , mysql  = require('mysql');
    xss = require('xss');
    util = require('util');
    pool = mysql.createPool({
        host     : config.mysql_host,
        user     : config.mysql_username,
        password : config.mysql_password,
        database : config.mysql_db
    });
    CONSTANT = {
        key_type_mohu    : config.key_type_mohu,
        key_type_jingque : config.key_type_jingque,
        answer_type_text : config.answer_type_text,
        answer_type_pic  : config.answer_type_pic,
        pic_upload_path  : config.pic_upload_path,
        pic_return_url   : config.pic_return_url
    };

    ZYF = require('./zyf');
    ZYO = require('./zyo');

    //MEMKW = {};
    //ZYO.createMemkeywords();



    var Logger = require('bunyan');
    log = new Logger({
        name: 'business_client',
        streams: [
            {
                stream: process.stdout,
                level: 'info'
            },
            {
                type: 'rotating-file',
                path: './web/logs/business_client.log',
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
};
