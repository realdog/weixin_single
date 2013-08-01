/**
 * Created with JetBrains WebStorm.
 * User: tjrb
 * Date: 13-5-21
 * Time: 下午9:43
 * To change this template use File | Settings | File Templates.
 */


/*
//邀请码验证函数
var chkCodeP = function(code, callback){

    var reData = {
        success : false,
        result  : null,
        errMsg  : null
    };

    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            callback(reData);
            return;
        }

        var query = connection.query("select DATE_ADD(invite_time, INTERVAL 1 DAY) as valid_time, wx_username, wx_account from biz_invite where invite_code = ? and flag = 0 ", [code], function(err, result){
            connection.end();
            if(!!err){
                reData.errMsg = err.message;
                callback(reData);
                return;
            }
            if(result.length == 0){
                reData.errMsg = '未找到此邀请码';
                callback(reData);
                return;
            }
            if(((new Date()) - (result[0]['valid_time'])) > 0){
                reData.errMsg = '邀请码过期';
                callback(reData);
                return;
            }
            reData.success = true;
            reData.result = result;
            callback(reData);
        });
        console.log(query.sql);
    });
};


//update邀请码状态
var updateCodeStatus = function(code){
    pool.getConnection(function(err, connection){
        var query = connection.query("update biz_invite set flag = 1 where invite_code = ? ", [code], function(err, result){});
        console.log(query.sql);
    });
};


//邀请码注册 ?????验证wx_account有问题
module.exports.inviteReg = function(req, res){

    console.log(req.body);

    var reData = {
        success : false,
        exists  : false,
        errMsg  : null
    };

    var dto = {
        username        : xss(req.body.username),
        wx_username     : xss(req.body.wx_username),
        wx_account      : xss(req.body.wx_account),
        phone           : xss(req.body.phone),
        qq              : xss(req.body.qq),
        email           : xss(req.body.email),
        reason          : xss(req.body.reason),
        knowby          : xss(req.body.knowby),
        invite_time     : new Date(),
        flag   : 0,
        invite_code     : ZYF.randomString(20)
    };

    pool.getConnection(function(err, connection){

            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
            } else {
                var query = connection.query("select invite_id from biz_invite where wx_account = ? ", [dto.wx_account], function(err, result){
                    if(!!err){
                        connection.end();
                        reData.errMsg = err.message;
                        res.json(reData);
                    }else{
                        if(result.length > 0){
                            connection.end();
                            reData.exists = true;
                            res.json(reData);
                        }else{
                            query = connection.query("insert into biz_invite set ?", dto, function(err, result){
                                connection.end();
                                if(!!err){
                                    reData.errMsg = err.message;
                                    res.json(reData);
                                    console.log(reData);
                                }else{
                                    reData.success = true;
                                    res.json(reData);
                                    console.log(reData);
                                }
                            });
                            console.log(query.sql);
                        }
                    }

                });
                console.log(query.sql);
            }
    });
};


//邀请码验证
module.exports.chkCode = function(req, res){
    console.log(req.body);

    var reData = {
        success : false,
        valid   : false,
        errMsg  : null
    };

    var inviteCode = xss(req.body.inviteCode);
    chkCodeP(inviteCode, function(result){
        console.log(result);
        if(result.success){
            reData.success = true;
            reData.valid = true;
            res.cookie('inviteCode', inviteCode, { expires: new Date(Date.now() + 900000), httpOnly: false });
            req.session.inviteCode = inviteCode;
            res.json(reData);
            return;
        }
        if(result.errMsg == '邀请码过期'){
            reData.success = true;
            res.json(reData);
            return;
        }
        reData.errMsg = result.errMsg;
        res.json(reData);
    });
};
*/


//商户注册
module.exports.userReg = function(req, res){


    var reData = {
        success : false,
        errMsg  : null,
        wuid    : null
    };
/*

    if(!req.session.inviteCode){
        reData.errMsg = 'nocode';
        res.json(reData);
        console.log(reData);
        return;
    };
*/

    var dto = {
        username        : xss(req.body.username),
        password        : xss(req.body.password),
        phone           : xss(req.body.phone),
        qq              : xss(req.body.qq),
        email           : xss(req.body.email),
        //invite_code     : xss(req.session.inviteCode||0),
        reg_time        : new Date(),
        wx_username     : xss(req.body.wx_username),
        wx_account      : xss(req.body.wx_account),
        mask            : null
    };

        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }

            var query = connection.query("select username from biz_user where username = ? and  flag > -1", [dto.username], function(err, result){
                if(!!err){
                    connection.end();
                    reData.errMsg = err.message;
                    res.json(reData);
                    return;
                }
                if(result.length > 0){
                    connection.end();
                    reData.errMsg = 'name';
                    res.json(reData);
                    return;
                }

                    dto.mask = ZYF.randomString();
                    dto.password = ZYF.md5(dto.password + dto.mask);
                    query = connection.query("insert into biz_user set ?", dto, function(err, result){
                        connection.end();
                        if(!!err){
                            reData.errMsg = 'name';
                            res.json(reData);
                            return;
                        }
                        if(result.affectedRows != 1){
                            reData.errMsg = 'name';
                            res.json(reData);
                            return;
                        }
                        reData.success = true;
                        reData.wuid = result.insertId;
                        ZYO.setLogin(req, parseInt(reData.wuid), dto.username, dto.wx_username, dto.wx_account, 'zy', 'zy');
                        res.json(reData);
                        console.log(reData);
                });
                console.log(query.sql);
            });
        });
};


//帐号绑定1
module.exports.bind1 = function(req, res){


    var reData = {
        success : false,
        forbit  : false,
        api     : null,
        token   : null,
        welcome : null,
        botname : null,
        errMsg  : null
    };

    var dto = {
        api     : null,
        token   : null,
        botname : null,
        welcome : null
    };

    var reqData = {
        wuid        : req.session.loginInfo.wuid,
        wx_username : xss(req.body.wx_user_name||0)
    };

    //这里改用session判断wx_username
    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            res.json(reData);
            return;
        };

            if (req.session.loginInfo.wx_username != reqData.wx_username){
                connection.end();
                reData.errMsg = '与注册时信息不一致';
                res.json(reData);
                console.log(reData);
                return;
            }

            dto.api = ZYF.randomString(6) + req.session.loginInfo.wuid + ZYF.randomString(6);
            dto.token = ZYF.randomString(4) + req.session.loginInfo.wuid + ZYF.randomString(4);
            dto.botname = req.session.loginInfo.wx_username;
            dto.welcome = '欢迎关注' + req.session.loginInfo.wx_username;
            query = connection.query("update biz_user set ? where wuid = ? ", [dto, req.session.loginInfo.wuid], function(err, result){
                connection.end();
                if(!!err){
                    reData.errMsg = err.message;
                    res.json(reData);
                    return;
                }
                if(result.affectedRows != 1){
                    reData.errMsg = '纪录更新失败，影响行数不为1';
                    res.json(reData);
                    return;
                }
                reData.success = true;
                reData.api = dto.api;
                reData.token = dto.token;
                req.session.loginInfo.api = dto.api;
                req.session.loginInfo.token = dto.token;
                reData.botname = dto.botname;
                reData.welcome = dto.welcome;
                res.json(reData);
            });
        console.log(query.sql);
    });
};


//帐号绑定2
module.exports.bind2 = function(req, res){
    console.log(req.body);

    var reData = {
        success : false,
        forbit  : false,
        errMsg  : null
    };

    var dto = {
        botname  : xss(req.body.wx_botname),
        welcome  : '{"type":"0","text":"'+xss(req.body.wx_welcome||0)+'","pic":"","activity":""}',
        defaultmsg : '{"type":"0","text":"welcome","pic":"","activity":""}'
    };

    var wuid = req.session.loginInfo.wuid;

    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            res.json(reData);
            return;
        }

        var query = connection.query("update biz_user set ? where wuid = ?  ", [dto, wuid], function(err, result){
            connection.end();
            if(!!err){
                reData.errMsg = err.message;
                res.json(reData);
                console.log(reData);
                return;
            }
            if(result.affectedRows != 1){
                reData.errMsg = '纪录更新失败，影响行数不为1';
                res.json(reData);
                return;
            }
            reData.success = true;
            res.json(reData);
        });
        console.log(query.sql);
    });
};


//商户登陆
module.exports.login = function(req, res){
    console.log(req.body);
    var reData = {
        success : false,
        binded  : false,
        errMsg  : null
    };

    var dto = {
        username  : xss(req.body.username||0),
        password  : xss(req.body.password||0)
    };

    pool.getConnection(function(err, connection){
        if(!!err){
            reData.errMsg = err.message;
            res.json(reData);
            return;
        };
        var query = connection.query("select * from biz_user where username = ? and flag = 0 ", [dto.username], function(err, result){
            connection.end();
            if(!!err){
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            if(result.length == 0){
                reData.errMsg = '用户不存在';
                res.json(reData);
                return;
            }
            if(result[0].password != ZYF.md5(dto.password + result[0].mask)){
                reData.errMsg = '密码不正确';
                res.json(reData);
                return;
            }
            ZYO.setLogin(req, result[0].wuid, result[0].username, result[0].wx_username, result[0].wx_account, result[0].api, result[0].token);
            if(result[0].api == null || result[0].api ==''){
                reData.success = true;
                res.json(reData);
                return;
            }
            reData.success = true;
            reData.binded = true;
            console.log(reData);
            res.json(reData);
        });
        console.log(query.sql);
    });
};


//商户登出
module.exports.logout = function(req, res){
    req.session = null;
    res.redirect('/');
};


module.exports.changepwd = function(req, res){
    res.render('business/admin/account/changepwd', {username:req.session.loginInfo.username});
};


module.exports.changepwdpost = function(req, res){

    console.log('zy');
    var reData = {
        success : false,
        errMsg  : null
    };

    var dto = {
        oldpwd    : xss(req.body.oldpwd||0),
        newpwd    : xss(req.body.newpwd||0),
        renewpwd  : xss(req.body.renewpwd||0)
    };

    var wuid = req.session.loginInfo.wuid;
    pool.getConnection(function(err, connection){
        connection.end();
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            res.json(reData);
            return;
        };
        if(dto.renewpwd != dto.newpwd){
            reData.errMsg = '两次密码输入不一致';
            res.json(reData);
            return;
        }
        var query = connection.query("select password,mask from biz_user where wuid = ? and flag = 0 ",[wuid], function(err, result){
            //connection.end();
            //connection.destroy();
            if(!!err){
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            if(result.length == 0){
                reData.errMsg = '用户不存在';
                res.json(reData);
                return;
            }
            if(ZYF.md5(dto.oldpwd + result[0].mask) != result[0].password){
                reData.errMsg = '原始密码错误！';
                res.json(reData);
                return;
            }
            dto.newpwd = ZYF.md5(dto.newpwd + result[0].mask);
            for(var i=0;i<15;i++){
            var query = connection.query("update biz_user set password = ? where wuid = ?  ", [dto.newpwd, wuid], function(err, result){
                //connection.end();
                if(!!err){
                    reData.errMsg = err.message;
                    res.json(reData);
                    console.log(reData);
                    return;
                }
                if(result.affectedRows != 1){
                    reData.errMsg = '纪录更新失败，影响行数不为1';
                    res.json(reData);
                    return;
                }
                reData.success = true;
                res.json(reData);
                console.log(reData);
            });
            console.log(query.sql);
            }
        });
        console.log(query.sql);
    });
};

