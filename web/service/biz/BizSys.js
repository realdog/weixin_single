/**
 * Created with JetBrains WebStorm.
 * User: tjrb
 * Date: 13-7-29
 * Time: 上午9:19
 * To change this template use File | Settings | File Templates.
 */



module.exports.setwel = function(req, res){

    var returnData = {
        cf : null,
        ai : null,
        ac : null
    };

    pool.getConnection(function(err, connection){
        if(!!err){
            res.render('business/admin/err',{err:err.message});
            return;
        }
        var query = connection.query("SELECT welcome FROM biz_user where wuid = ? and flag > -1", [req.session.loginInfo.wuid], function(err, result){
            connection.end();
            if(!!err){
                res.render('business/admin/err',{err:err.message});
                return;
            }
            returnData.cf = JSON.parse(result[0].welcome);
            var query = connection.query("select aid, type, jsondata from biz_article where wuid = ? and flag > -1", [req.session.loginInfo.wuid], function(err, result){
                connection.end();
                if(!!err){
                    res.render('business/admin/err',{err:err.message});
                    return;
                }
                var returnAI = [];
                for(var i=0;i<result.length;i++){
                    var tmp = {};
                    tmp.aid = result[i].aid;
                    tmp.type = result[i].type;
                    tmp.jsondata = JSON.parse(result[i].jsondata);
                    returnAI.push(tmp);
                }
                returnData.ai = returnAI;
                var query = connection.query("select '"+req.session.loginInfo.wx_username+"' as wx_username, a.baid, a.aid, a.keyword, a.activity_name, DATE_FORMAT(a.start_date,'%Y-%m-%d %H:%i:%s') as start_date , DATE_FORMAT(a.end_date,'%Y-%m-%d %H:%i:%s') as end_date, UNIX_TIMESTAMP(a.start_date)*1000 as start_stamp, UNIX_TIMESTAMP(a.end_date)*1000 as end_stamp, a.status, a.is_stop, b.activity_name as activity_type from biz_activity a, activity b where a.wuid = ? and a.status > -1 and a.aid = b.aid ", [req.session.loginInfo.wuid], function(err, result){
                    connection.end();
                    if(!!err){
                        res.render('business/admin/err',{err:err.message});
                        return;
                    }
                    returnData.ac = result;
                    //console.log(returnData);
                    res.render('business/admin/sys/setwel', returnData);
                });
            });
        });
    });
};


module.exports.savewel = function(req, res){

    console.log(req.body);

    var dto = {
        welcome : ""
    };
    var welcome = {
        type    : xss(req.body.answertype||0),
        text    : xss(req.body.content||0),
        pic     : xss(req.body.resourceid||0),
        activity: xss(req.body.rightactivity||0)
    }
    if(welcome.type == 2){
        var tmp = welcome.activity.split(',');
        tmp.pop();
        welcome.activity = tmp;
    };

    dto.welcome = JSON.stringify(welcome);

    var returnDate = {
        success : false,
        err     : null
    };

    pool.getConnection(function(err, connection){
        if(!!err){
            returnDate.err = err.message;
            res.json(returnDate);
            return;
        }
        var query = connection.query("update biz_user set ? where wuid = ? and flag > -1", [dto, req.session.loginInfo.wuid], function(err, result){
            connection.end();
            if(!!err){
                returnDate.err = err.message;
                res.json(returnDate);
                return;
            }
            returnDate.success = true;
            res.json(returnDate);
            return;
        });
        console.log(query.sql);
    });
};


module.exports.setmsg = function(req, res){

    var returnData = {
        cf : null,
        ai : null,
        ac : null
    };

    pool.getConnection(function(err, connection){
        if(!!err){
            res.render('business/admin/err',{err:err.message});
            return;
        }
        var query = connection.query("SELECT defaultmsg FROM biz_user where wuid = ? and flag > -1", [req.session.loginInfo.wuid], function(err, result){
            connection.end();
            if(!!err){
                res.render('business/admin/err',{err:err.message});
                return;
            }
            returnData.cf = JSON.parse(result[0].defaultmsg);
            var query = connection.query("select aid, type, jsondata from biz_article where wuid = ? and flag > -1", [req.session.loginInfo.wuid], function(err, result){
                connection.end();
                if(!!err){
                    res.render('business/admin/err',{err:err.message});
                    return;
                }
                var returnAI = [];
                for(var i=0;i<result.length;i++){
                    var tmp = {};
                    tmp.aid = result[i].aid;
                    tmp.type = result[i].type;
                    tmp.jsondata = JSON.parse(result[i].jsondata);
                    returnAI.push(tmp);
                }
                returnData.ai = returnAI;
                var query = connection.query("select '"+req.session.loginInfo.wx_username+"' as wx_username, a.baid, a.aid, a.keyword, a.activity_name, DATE_FORMAT(a.start_date,'%Y-%m-%d %H:%i:%s') as start_date , DATE_FORMAT(a.end_date,'%Y-%m-%d %H:%i:%s') as end_date, UNIX_TIMESTAMP(a.start_date)*1000 as start_stamp, UNIX_TIMESTAMP(a.end_date)*1000 as end_stamp, a.status, a.is_stop, b.activity_name as activity_type from biz_activity a, activity b where a.wuid = ? and a.status > -1 and a.aid = b.aid ", [req.session.loginInfo.wuid], function(err, result){
                    connection.end();
                    if(!!err){
                        res.render('business/admin/err',{err:err.message});
                        return;
                    }
                    returnData.ac = result;
                    //console.log(returnData);
                    res.render('business/admin/sys/setmsg', returnData);
                });
            });
        });
    });
};


module.exports.savemsg = function(req, res){

    console.log(req.body);

    var dto = {
        defaultmsg : ""
    };
    var defaultmsg = {
        type    : xss(req.body.answertype||0),
        text    : xss(req.body.content||0),
        pic     : xss(req.body.resourceid||0),
        activity: xss(req.body.rightactivity||0)
    }
    if(defaultmsg.type == 2){
        var tmp = defaultmsg.activity.split(',');
        tmp.pop();
        defaultmsg.activity = tmp;
    };

    dto.defaultmsg = JSON.stringify(defaultmsg);

    var returnDate = {
        success : false,
        err     : null
    };

    pool.getConnection(function(err, connection){
        if(!!err){
            returnDate.err = err.message;
            res.json(returnDate);
            return;
        }
        var query = connection.query("update biz_user set ? where wuid = ? and flag > -1", [dto, req.session.loginInfo.wuid], function(err, result){
            connection.end();
            if(!!err){
                returnDate.err = err.message;
                res.json(returnDate);
                return;
            }
            returnDate.success = true;
            res.json(returnDate);
            return;
        });
        console.log(query.sql);
    });
};


//
module.exports.usermsglist = function(req, res){

    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            res.render('business/admin/err',{err:err.message});
            return;
        };
        var sql = "select user.id as userid, user.username, user.address, user.phone, user.area, user_send_log.id as logid, user_send_log.msgtype, user_send_log.msg, DATE_FORMAT(user_send_log.logdate,'%Y-%m-%d %H:%i:%s') as logdate        from user        left join user_send_log        on user.id = user_send_log.userid        order by user.id , user_send_log.logdate";
        var query = connection.query(sql, [], function(err, result){
            connection.end();
            if(!!err){
                res.render('business/admin/err',{err:err.message});
                return;
            }
            //console.log(result);
            res.render('business/admin/sys/mlist',ZYF.autoPage(result, req.query.page, req.query.pagesize, req.originalUrl));
        });
    });
};


