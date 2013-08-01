/**
 * Created with JetBrains WebStorm.
 * User: tjrb
 * Date: 13-6-13
 * Time: 下午6:09
 * To change this template use File | Settings | File Templates.
 */


module.exports.questionList = function(req, res){

    pool.getConnection(function(err, connection){
        if(!!err){
            res.render('business/admin/err',{err:err.message});
            connection.end();
            return;
        }
        if(req.query.keyword){
            var query = connection.query("select qid, key_type, keyword, answer_type, answer, DATE_FORMAT(update_time,'%Y-%m-%d %H:%i:%s') as update_time from biz_reply where wuid = ? and flag > -1 and keyword = ? ", [req.session.loginInfo.wuid, xss(req.query.keyword)], function(err, result){
                connection.end();
                if(!!err){
                    res.render('business/admin/err',{err:err.message});
                    return;
                }
                res.render('business/admin/ai/question',{data:result, account:req.session.loginInfo.wx_username});
            });
        }else{
            var query = connection.query("select qid, key_type, keyword, answer_type, answer, DATE_FORMAT(update_time,'%Y-%m-%d %H:%i:%s') as update_time from biz_reply where wuid = ? and flag > -1", [req.session.loginInfo.wuid], function(err, result){
                connection.end();
                if(!!err){
                    res.render('business/admin/err',{err:err.message});
                    return;
                }
                res.render('business/admin/ai/question',{data:result, account:req.session.loginInfo.wx_username});
            });
        }
    });
};


module.exports.questionManager = function(req, res){

    console.log(req.body);
    var reData = {
        success     : false,
        qid         : null,
        errMsg      : null
    };
    var dto = {
        wuid         :req.session.loginInfo.wuid,
        key_type     :xss(req.body.keytype||0),
        keyword      :xss(req.body.keyword||0)
    };

    if(xss(req.body.type||0) == 'add'){
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
                ZYO.chkKeyword(req.session.loginInfo.wuid, dto.keyword, function(RO){
                    if(!RO.success || RO.exist){
                        connection.end();
                        reData.error = 'keyword';
                        res.json(reData);
                        return;
                    }
                    var query = connection.query("insert into biz_reply set ? ", [dto], function(err, result){
                        connection.end();
                        if(!!err){
                            reData.errMsg = err.message;
                            res.json(reData);
                            return;
                        }
                        reData.success = true;
                        reData.qid = result.insertId;
                        res.json(reData);
                    });
                });
        });
    };
    if(xss(req.body.type||0) == 'modify'){
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            var query = connection.query("select keyword from biz_reply where qid <> ? and wuid = ? and keyword = ? and flag > -1 ", [xss(req.body.qid||0), req.session.loginInfo.wuid, dto.keyword], function(err, result){
                if(!!err){
                    connection.end();
                    reData.errMsg = err.message;
                    res.json(reData);
                    console.log(reData);
                    return;
                }
                if(result.length > 0){
                    connection.end();
                    reData.error = 'keyword';
                    res.json(reData);
                    console.log(reData);
                    return;
                }
                var query = connection.query("update biz_reply set ? where qid = ? and wuid = ? and flag > -1 ", [dto, xss(req.body.qid||0), req.session.loginInfo.wuid], function(err, result){
                    connection.end();
                    if(!!err){
                        reData.errMsg = err.message;
                        res.json(reData);
                        console.log(reData);
                        return;
                    }
                    reData.success = true;
                    reData.qid = xss(req.body.qid);
                    res.json(reData);
                    console.log(reData);
                });
                console.log(query.sql);
            });
            console.log(query.sql);
        });
    };
    if(xss(req.query.type||0) == 'del'){
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
                var query = connection.query("update biz_reply set flag = -1 where qid = ? and wuid = ? and flag > -1 ", [xss(req.query.ids||0), req.session.loginInfo.wuid], function(err, result){
                    connection.end();
                    if(!!err){
                        reData.errMsg = err.message;
                        res.json(reData);
                        console.log(reData);
                        return;
                    }
                    reData.success = true;
                    res.json(reData);
                });
            console.log(query.sql);
        });
    };
};


module.exports.answerList = function(req, res){

    pool.getConnection(function(err, connection){
        if(!!err){
            res.render('business/admin/err',{err:err.message});
            connection.end();
            return;
        }
        var query = connection.query("select qid, key_type, keyword, answer_type, answer, DATE_FORMAT(update_time,'%Y-%m-%d %H:%i:%s') as update_time from biz_reply where wuid = ? and flag > -1 and qid = ? ", [req.session.loginInfo.wuid, xss(req.query.qid||0)], function(err, represult){
            if(!!err){
                connection.end();
                res.render('business/admin/err',{err:err.message});
                return;
            }
            if(represult.length == 0){
                connection.end();
                res.render('business/admin/err',{err:'不是你的别瞎搞'});
                return;
            }
            var query = connection.query("select aid, type, jsondata from biz_article where wuid = ? and flag > -1", [req.session.loginInfo.wuid], function(err, result){
                connection.end();
                if(!!err){
                    res.render('business/admin/err',{err:err.message});
                    return;
                }
                var resArr = [];
                for(var i=0;i<result.length;i++){
                    var tmp = {};
                    tmp.aid = result[i].aid;
                    tmp.type = result[i].type;
                    tmp.jsondata = JSON.parse(result[i].jsondata);
                    resArr.push(tmp);
                }
                res.render('business/admin/ai/answer',{data:represult,resource:resArr});
            });
        });
    });
};


module.exports.answerManager = function(req, res){

    if(xss(req.body.type||0) == 'add'){
        console.log(req.body);
        var reData = {
            success     : false,
            errMsg      : null
        };
        var dto = {
            answer_type     :xss(req.body.answertype),
            answer          :'0'
        };
        if(dto.answer_type == '0'){
            dto.answer = xss(req.body.content||0);
        }else{
            dto.answer = xss(req.body.resourceid||0);
        }

        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
                var query = connection.query("update biz_reply set ? where wuid = ? and qid = ? ", [dto, req.session.loginInfo.wuid, xss(req.body.qid||0)], function(err, result){
                    connection.end();
                    if(!!err){
                        reData.errMsg = err.message;
                        res.json(reData);
                        return;
                    }
                    if(result.affectedRows == 0){
                        reData.errMsg = 'affectRows=0';
                        res.json(reData);
                        return;
                    }
                    reData.success = true;
                    res.json(reData);
                });
                console.log(query.sql);
        });
    };
};

