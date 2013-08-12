
//设置session
module.exports.setLogin = function (req, wuid, username, wx_username, wx_account, api, token){

    var loginInfo = {
        wuid        : null,
        username    : null,
        loginCode   : null,
        wx_username : null,
        wx_account  : null
    };

    loginInfo.wuid = wuid;
    loginInfo.username = username;
    loginInfo.loginCode = 'ztsb';
    loginInfo.wx_username = wx_username;
    loginInfo.wx_account = wx_account;
    loginInfo.api = api;
    loginInfo.token = token;
    req.session.loginInfo = loginInfo;
}


//登陆session检查
module.exports.filterLogin = function(req, res, next){
    console.log('/////enter://///' + req.originalUrl);
    var noSessionPage = '/business/admin/login|/business/admin/invite|/business/admin/chkcode|/business/admin/reg|';
    if(noSessionPage.indexOf(req.originalUrl + '|') > -1){
        next();
        return;
    }
    if(!!req.session.loginInfo){
        if(req.session.loginInfo.loginCode == 'ztsb'){
            next();
            return;
        }
    }
    res.redirect('/');
    //自动登陆
    //ZYO.setLogin(req, 1, 'linshi', '111111', '22222', 'sdfsdf', 're');
    //next();
};


module.exports.errResponseByHtml = function(req, res, err, connection){
    log.error({req: req, res: res}, err);
    if (!!connection) {
        connection.end();
    }
    res.render('business/admin/err',{err:err.message});
};


//用户keyword检查
module.exports.chkKeyword = function(wuid, keyword, callback){
    var reData = {
        success : false,
        exist   : false,
        type    : null,
        data    : null,
        errMsg  : null
    }
    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            callback(reData);
            return;
        }
        //活动
        var query = connection.query("select keyword,baid from biz_activity where wuid = ? and keyword = ? and status > -1 ", [wuid, keyword], function(err, result){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                callback(reData);
                return;
            }
            if(result.length > 0){
                connection.end();
                reData.success = true;
                reData.exist = true;
                reData.type = 'activity';
                reData.data = result[0].baid;
                callback(reData);
                return;
            }
            //服务
            var query = connection.query("select service_keyword from biz_netservice where wuid = ? ", [wuid], function(err, result){
                if(!!err){
                    connection.end();
                    reData.errMsg = err.message;
                    callback(reData);
                    return;
                }
                if(result.length > 0){
                    if(result[0].service_keyword.indexOf(keyword)>-1){
                        connection.end();
                        reData.success = true;
                        reData.exist = true;
                        reData.type = 'service';
                        callback(reData);
                        return;
                    }
                }
                //自定义回复
                var query = connection.query("select keyword, qid from biz_reply where wuid = ? and keyword = ? and flag > -1 ", [wuid, keyword], function(err, result){
                    if(!!err){
                        connection.end();
                        reData.errMsg = err.message;
                        callback(reData);
                        return;
                    }
                    if(result.length > 0){
                        connection.end();
                        reData.success = true;
                        reData.exist = true;
                        reData.type = 'reply';
                        reData.data = result[0].qid;
                        callback(reData);
                        return;
                    }
                    //没查到
                    connection.end();
                    reData.success = true;
                    callback(reData);
                });
            });
        });
    });
};

/**
 * 通过mem检索key
 */
//生产keyword集合
var _createMemkeywords = function(callback){

    var reData = {
        success     : false,
        key_keyword : null,
        errMsg      : null
    };
    var keywords = {} ;
    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            callback(reData);
            return;
        };
        //写用户
        var query = connection.query("select wuid,wx_account from biz_user", function(err,result){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                callback(reData);
                return;
            }
            for(var i=0;i<result.length;i++){
                keywords[result[i].wx_account] = {};
                keywords[result[i].wx_account].wuid = result[i].wuid;
            }
            //console.log(util.inspect(keywords));
            //写活动
            var strsql = "SELECT biz_user.wuid, biz_user.wx_account, biz_activity.baid, biz_activity.keyword FROM biz_user left join biz_activity on biz_user.wuid = biz_activity.wuid where biz_user.flag > -1 and biz_activity.status > -1 and biz_activity.is_stop = 0 ";
            var query = connection.query(strsql, function(err,result){
                if(!!err){
                    connection.end();
                    reData.errMsg = err.message;
                    callback(reData);
                    return;
                }
                for(var i=0;i<result.length;i++){
                    if(!keywords[result[i].wx_account]){
                        keywords[result[i].wx_account] = {};
                        keywords[result[i].wx_account].wuid = result[i].wuid;
                    }
                    if(!keywords[result[i].wx_account].activity){
                        keywords[result[i].wx_account].activity = [];
                    }
                    var tmp = {};
                    tmp.keyword = result[i].keyword;
                    tmp.baid = result[i].baid;
                    keywords[result[i].wx_account].activity.push(tmp);
                }
                //console.log(util.inspect(keywords));
                //写服务
                var strsql = "SELECT biz_user.wuid, biz_user.wx_account, biz_netservice.service_keyword FROM biz_user left join biz_netservice on biz_user.wuid = biz_netservice.wuid where biz_user.flag > -1 and length(service_id) > 0";
                var query = connection.query(strsql, function(err,result){
                    if(!!err){
                        connection.end();
                        reData.errMsg = err.message;
                        callback(reData);
                        return;
                    }
                    for(var i=0;i<result.length;i++){
                        if(!keywords[result[i].wx_account]){
                            keywords[result[i].wx_account] = {};
                            keywords[result[i].wx_account].wuid = result[i].wuid;
                        }
                        keywords[result[i].wx_account].service = result[i].service_keyword + ',';
                    }
                    //console.log(util.inspect(keywords));
                    //写自定义回复
                    var strsql = "SELECT biz_user.wuid, biz_user.wx_account, biz_reply.qid, biz_reply.key_type, biz_reply.keyword FROM biz_user left join biz_reply on biz_user.wuid = biz_reply.wuid where biz_user.flag > -1 and biz_reply.flag > -1 ";
                    var query = connection.query(strsql, function(err,result){
                        if(!!err){
                            connection.end();
                            reData.errMsg = err.message;
                            callback(reData);
                            return;
                        }
                        for(var i=0;i<result.length;i++){
                            if(!keywords[result[i].wx_account]){
                                keywords[result[i].wx_account] = {};
                                keywords[result[i].wx_account].wuid = result[i].wuid;
                            }
                            if(!keywords[result[i].wx_account].reply){
                                keywords[result[i].wx_account].reply = [];
                            }
                            var tmp = {};
                            tmp.keyword = result[i].keyword;
                            tmp.qid = result[i].qid;
                            tmp.key_type = result[i].key_type;
                            keywords[result[i].wx_account].reply.push(tmp);
                        }
                        //结束
                        connection.end();
                        reData.success = true;
                        reData.key_keyword = keywords;
                        callback(reData);
                        return;
                    });
                });
            });
        });
    });
};
module.exports.createMemkeywords = function(callback){
    _createMemkeywords(function(RO){
        if(RO.success){
            MEMKW = RO.key_keyword;
            if(typeof(callback) == 'function')
                callback(true);
        }else{
            MEMKW = null;
            if(typeof(callback) == 'function')
                callback(false);
        }
        console.log(util.inspect(MEMKW));
    });
};


//
var _chkKeywordByMem = function (wx, key){

    var reData = {
        success     : false,
        exist       : false,
        type        : null,
        recordid    : null,
        datajson    : null,
        errMsg      : null
    }
    if(!MEMKW[wx]){
        reData.errMsg = 'no user';
        return reData;
    }
    if(MEMKW[wx].activity){
        for(var i=0;i<MEMKW[wx].activity.length;i++){
            if(MEMKW[wx].activity[i].keyword == key){
                reData.success = true;
                reData.exist = true;
                reData.type = 'activity';
                reData.recordid =  MEMKW[wx].activity[i].baid;
                return reData;
            }
        }
    }
    if(MEMKW[wx].service){
            if(MEMKW[wx].service.indexOf(key + ',') > -1 ){
                reData.success = true;
                reData.exist = true;
                reData.type = 'service';
                return reData;
            }
    }
    if(MEMKW[wx].reply){
        for(var i=0;i<MEMKW[wx].reply.length;i++){
            if(MEMKW[wx].reply[i].keyword == key){
                reData.success = true;
                reData.exist = true;
                reData.type = 'reply';
                reData.recordid =  MEMKW[wx].reply[i].qid;
                return reData;
            }
            if((MEMKW[wx].reply[i].keyword.indexOf(key) > -1) && (MEMKW[wx].reply[i].key_type == CONSTANT.key_type_mohu)){
                reData.success = true;
                reData.exist = true;
                reData.type = 'reply';
                reData.recordid =  MEMKW[wx].reply[i].qid;
                return reData;
            }
        }
    }
    //没找到
    reData.success = true;
    return reData;
};
module.exports.chkKeywordByMem = function(wx, key, callback){

    var RO = _chkKeywordByMem(wx, key);
    console.log(RO);

    if(RO.success && RO.exist){
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                RO.success = false;
                RO.errMsg = 'db err: ' + err.message;
                callback(RO);
                return;
            }
            switch (RO.type){
                case 'activity':
                    var query = connection.query("select config from biz_activity where baid = ? and status > -1 and is_stop = 0 ", [RO.recordid], function(err, result){
                        connection.end();
                        if(!!err){
                            RO.success = false;
                            RO.errMsg = 'db err: ' + err.message;
                            callback(RO);
                            return;
                        }
                        if(result.length != 1){
                            RO.success = false;
                            RO.errMsg = 'db err: biz_activity no record, baid = ' + RO.recordid;
                            callback(RO);
                            return;
                        }
                        RO.datajson = result[0].config;
                        callback(RO);
                    });
                    console.log(query.sql);
                    break;
                case 'service':
                    callback(RO);
                    break;
                case 'reply':
                    var strsql = "SELECT biz_reply.qid, biz_reply.key_type, biz_reply.keyword, biz_reply.answer_type, biz_reply.answer, biz_article.aid, biz_article.type, biz_article.jsondata, biz_article.flag  FROM biz_reply left join biz_article on biz_reply.answer = biz_article.aid where biz_reply.qid = ? and  biz_reply.flag > -1 ";
                    var query = connection.query(strsql, [RO.recordid], function(err, result){
                        connection.end();
                        if(!!err){
                            RO.success = false;
                            RO.errMsg = 'db err: ' + err.message;
                            callback(RO);
                            return;
                        }
                        if(result.length != 1){
                            connection.end();
                            RO.success = false;
                            RO.errMsg = 'db err: biz_reply no record, qid = ' + RO.recordid;
                            callback(RO);
                            return;
                        }
                        if(result[0].answer_type == CONSTANT.answer_type_text){
                            RO.datajson = {key_type:result[0].key_type, answer_type:CONSTANT.answer_type_text, answer:result[0].answer};
                            callback(RO);
                        }else{
                            if(!result[0].aid){
                                RO.success = false;
                                RO.errMsg = 'db err: biz_article no record,  qid = ' + RO.recordid + ' aid = ' + result[0].aid;
                                callback(RO);
                                return;
                            }
                            if(result[0].flag == -1){
                                RO.success = false;
                                RO.errMsg = 'db err: biz_article has del record,  qid = ' + RO.recordid + ' aid = ' + result[0].aid;
                                callback(RO);
                                return;
                            }
                            RO.datajson = {key_type:result[0].key_type, answer_type:CONSTANT.answer_type_pic, article_type:result[0].type, jsondata:result[0].jsondata};
                            callback(RO);
                        }
                    });
                    console.log(query.sql);
                    break;
                default :
                    RO.success = false;
                    RO.errMsg = '逻辑错误，不可能出现: no type';
                    callback(RO);
                    break;
            };
        });
    }else{
        callback(RO);
    }

};

/**
 * 通过数据库检索key
 */

//chk微信公共账号
var _findUser = function (wx_account, callback){
    var reData = {
        success     : false,
        exist       : false,
        type        : 'user',
        recordid    : null,
        datajson    : null,
        errMsg      : null
    };
    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            callback(reData);
            return;
        }
        var query = connection.query("select wuid from biz_user where wx_account = ? and flag = 0 ", [wx_account], function(err, result){
            connection.end();
            if(!!err){
                reData.errMsg = err.message;
                callback(reData);
                return;
            }
            if(result.length != 1){
                reData.success = true;
                reData.errMsg = '此微信帐号不存在！';
                callback(reData);
                return;
            }
            reData.success = true;
            reData.exist = true;
            reData.recordid = result[0].wuid;
            reData.datajson = result[0].wuid;
            callback(reData);
        });
    });
};

var _findActivity = function(wuid, key, callback){
    var reData = {
        success     : false,
        exist       : false,
        type        : 'activity',
        recordid    : null,
        datajson    : null,
        errMsg      : null
    };
    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            callback(reData);
            return;
        }
        var query = connection.query("select baid, config from biz_activity where wuid = ? and keyword = ? and status = 0 and is_stop = 0 ", [wuid, key], function(err, result){
            connection.end();
            if(!!err){
                reData.errMsg = err.message;
                callback(reData);
                return;
            }
            if(result.length == 1){
                reData.success = true;
                reData.exist = true;
                reData.recordid = result[0].baid;
                reData.datajson = result[0].config;
                callback(reData);
            }else{
                reData.success = true;
                reData.errMsg = '活动中没有此关键词！';
                callback(reData);
            }
        });
    });
}

var _findService = function(wuid, key, callback){
    var reData = {
        success     : false,
        exist       : false,
        type        : 'netservice',
        recordid    : null,
        datajson    : null,
        errMsg      : null
    };
    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            callback(reData);
            return;
        }
        var query = connection.query("select service_keyword from biz_netservice where wuid = ? ", [wuid], function(err, result){
            connection.end();
            if(!!err){
                reData.errMsg = err.message;
                callback(reData);
                return;
            }
            if(result.length != 1){
                reData.success = true;
                reData.errMsg = '服务中没有此关键词！';
                callback(reData);
                return;
            }
            if((result[0].service_keyword + ',').indexOf((key + ',')) > -1){
                reData.success = true;
                reData.exist = true;
                callback(reData);
            }else{
                reData.success = true;
                reData.errMsg = '服务中没有此关键词！';
                callback(reData);
            }
        });
    });
}

var _findReply = function(wuid, key, callback){
    var reData = {
        success     : false,
        exist       : false,
        type        : 'replay',
        recordid    : null,
        datajson    : {},
        errMsg      : null
    };
    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            callback(reData);
            return;
        }
        var jqsql = '';
        jqsql += ' SELECT biz_reply.qid, biz_reply.key_type, biz_reply.keyword, biz_reply.answer_type, biz_reply.answer, ';
        jqsql += ' biz_article.aid, biz_article.type, biz_article.jsondata ';
        jqsql += ' FROM biz_reply left join biz_article on biz_reply.answer = biz_article.aid and biz_article.flag = 0 ';
        jqsql += ' where biz_reply.flag = 0 and biz_reply.key_type = ' + CONSTANT.key_type_jingque;
        jqsql += ' and biz_reply.wuid = ? and biz_reply.keyword = ? ';

        var mhsql = '';
        mhsql += ' SELECT biz_reply.qid, biz_reply.key_type, biz_reply.keyword, biz_reply.answer_type, biz_reply.answer, ';
        mhsql += ' biz_article.aid, biz_article.type, biz_article.jsondata ';
        mhsql += ' FROM biz_reply left join biz_article on biz_reply.answer = biz_article.aid and biz_article.flag = 0 ';
        mhsql += ' where biz_reply.flag = 0 and biz_reply.key_type = ' + CONSTANT.key_type_mohu;
        mhsql += ' and biz_reply.wuid = ? and biz_reply.keyword REGEXP ? order by qid desc';

        var query = connection.query(jqsql, [wuid, key], function(err, result){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                callback(reData);
                return;
            }
            if(result.length == 1){
                connection.end();
                reData.success = true;
                reData.exist = true;
                reData.recordid = result[0].qid;
                reData.datajson.key_type = result[0].key_type;
                reData.datajson.answer_type = result[0].answer_type;
                reData.datajson.answer = result[0].answer;
                reData.datajson.article_type = result[0].type;
                reData.datajson.article = result[0].jsondata;
                callback(reData);
                return;
            }
            var query = connection.query(mhsql, [wuid, key], function(err, result){
                connection.end();
                if(!!err){
                    reData.errMsg = err.message;
                    callback(reData);
                    return;
                }
                if(result.length > 0){
                    connection.end();
                    reData.success = true;
                    reData.exist = true;
                    reData.recordid = result[0].qid;
                    reData.datajson.key_type = result[0].key_type;
                    reData.datajson.answer_type = result[0].answer_type;
                    reData.datajson.answer = result[0].answer;
                    reData.datajson.article_type = result[0].type;
                    reData.datajson.article = result[0].jsondata;
                    callback(reData);
                }else{
                    reData.success = true;
                    reData.errMsg = '没有此关键词！';
                    callback(reData);
                }
            });
            //console.log(query.sql);
        });
        //console.log(query.sql);
    });
}


module.exports.chkKeyByDB = function (wx_account, key, callback){
    _findUser(wx_account, function(RO){
        if(!RO.success || !RO.exist){
            callback(RO);
            return;
        }
        var wuid = RO.datajson;
        _findActivity(wuid, key, function(ROA){
            if(!ROA.success || ROA.exist){
                callback(ROA);
                return;
            }
            _findService(wuid, key, function(ROS){
                if(!ROS.success || ROS.exist){
                    callback(ROS);
                    return;
                }
                _findReply(wuid, key, function(ROR){
                    callback(ROR);
                });
            });
        });
    });
}



