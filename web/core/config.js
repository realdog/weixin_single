//key_type:    0模糊 1全匹配
//answer_type: 0文本 1图文

module.exports = {
    development: {
        root: require('path').normalize(__dirname + '/..'),
        app: {
            name: 'wx',
            logLevel: 'INFO',
            logFile: 'logs/wx.log'
        },
        mysql_host: 'localhost',
        mysql_username: 'zy',
        mysql_password: 'zytest',
        mysql_db: 'wx',
        db: 'mongodb://localhost/wx1',
        key_type_mohu    : 0,
        key_type_jingque : 1,
        answer_type_text : 0,
        answer_type_pic  : 1,
        pic_upload_path  : '/Users/tjrb/wwwroot/wx/resource/upload/',
        pic_return_url   : '/resource/upload/'
    }
    , test: {
        root: require('path').normalize(__dirname + '/..'),
        app: {
            name: 'wx',
            logLevel: 'INFO',
            logFile: 'logs/wx.log'
        },
        mysql_host: 'localhost',
        mysql_username: 'root',
        mysql_password: 'zerotest',
        mysql_db: 'wx',
        db: 'mongodb://localhost/wx',
        key_type_mohu    : 0,
        key_type_jingque : 1,
        answer_type_text : 0,
        answer_type_pic  : 1,
        pic_upload_path  : '/Users/tjrb/wwwroot/wx/resource/upload/',
        pic_return_url   : '/resource/upload/'
    }
    , production: {
        root: require('path').normalize(__dirname + '/..'),
        app: {
            name: 'wx',
            logLevel: 'INFO',
            logFile: 'logs/wx.log'
        },
        mysql_host: '172.16.130.172',
        mysql_username: 'root',
        mysql_password: 'zerotest',
        mysql_db: 'wx_business',
        db: 'mongodb://localhost/wx',
        key_type_mohu    : 0,
        key_type_jingque : 1,
        answer_type_text : 0,
        answer_type_pic  : 1,
        pic_upload_path  : '/Users/tjrb/wwwroot/wx/resource/upload/',
        pic_return_url   : '/resource/upload/'
    }
}
