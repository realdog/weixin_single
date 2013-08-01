/**
 * Created with JetBrains WebStorm.
 * User: tjrb
 * Date: 13-6-8
 * Time: 下午3:41
 * To change this template use File | Settings | File Templates.
 */


//素材管理-图文列表
module.exports.articleList = function(req, res){

    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            res.render('business/admin/err',{err:err.message});
            return;
        }
        var query = connection.query("select count(*) as c from biz_article where wuid = ? and flag > -1", [req.session.loginInfo.wuid], function(err, result){
            if(!!err){
                connection.end();
                res.render('business/admin/err',{err:err.message});
                return;
            }
            var recordCount = result[0].c
            var query = connection.query("select aid, type, jsondata, DATE_FORMAT(update_time,'%Y-%m-%d %H:%i:%s') as update_time from biz_article where wuid = ? and flag > -1", [req.session.loginInfo.wuid], function(err, result){
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
                    //tmp.jsondata = JSON.parse(result[i].jsondata.replace(/\'/g,'\"'));
                    tmp.jsondata = JSON.parse(result[i].jsondata);
                    tmp.update_time = result[i].update_time;
                    resArr.push(tmp);
                }
                res.render('business/admin/content/articlelist',{data:resArr, recordCount:recordCount});
            });
        });
    });
};


//素材管理-单图文消息
module.exports.articleDetail = function(req, res){
    console.log(req.body);
    if(xss(req.query.action||0) == 'edit'){
        var aid = xss(req.query.rid||0);
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                res.render('business/admin/err',{err:err.message});
                return;
            }
            var query = connection.query("select aid, wuid, type, jsondata, DATE_FORMAT(update_time,'%Y-%m-%d %H:%i:%s') as update_time from biz_article where wuid = ? and aid = ? and flag > -1", [req.session.loginInfo.wuid, aid], function(err, result){
                connection.end();
                if(!!err){
                    res.render('business/admin/err',{err:err.message});
                    return;
                }
                if(result.length == 0){
                    res.render('business/admin/err',{err:'非法操作'});
                    return;
                }
                var tmp = {};
                tmp.aid = result[0].aid;
                tmp.type = result[0].type;
                tmp.jsondata = JSON.parse(result[0].jsondata);
                tmp.update_time = result[0].update_time;
                res.render('business/admin/content/article-detail',{data:tmp, action:'edit'});
            });
        });
    }else{
        res.render('business/admin/content/article-detail',{action:'add', currentTime:ZYF.formatDate()});
    }
};


//素材管理-多图文消息
module.exports.articleMuDetail = function(req, res){
    console.log(req.body);
    if(xss(req.query.action||0) == 'edit'){
        var aid = xss(req.query.rid||0);
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                res.render('business/admin/err',{err:err.message});
                return;
            }
            var query = connection.query("select aid, wuid, type, jsondata, DATE_FORMAT(update_time,'%Y-%m-%d %H:%i:%s') as update_time from biz_article where wuid = ? and aid = ? and flag > -1", [req.session.loginInfo.wuid, aid], function(err, result){
                connection.end();
                if(!!err){
                    res.render('business/admin/err',{err:err.message});
                    return;
                }
                if(result.length == 0){
                    res.render('business/admin/err',{err:'非法操作'});
                    return;
                }
                var tmp = {};
                tmp.aid = result[0].aid;
                tmp.type = result[0].type;
                tmp.jsondata = JSON.parse(result[0].jsondata);
                tmp.update_time = result[0].update_time;
                res.render('business/admin/content/article-mul-detail',{data:tmp, action:'mul_edit'});
            });
        });
    }else{
        res.render('business/admin/content/article-mul-detail',{action:'mul_add', currentTime:ZYF.formatDate()});
    }
};


//素材管理-单图文消息保存
module.exports.articleSave = function(req, res){
    console.log(req.body);

    var reData = {
        success : false,
        errMsg  : null
    };

    var sv = {
        title       : xss(req.body.title||0),
        summary     : xss(req.body.summary||0),
        coverurl    : xss(req.body.coverurl||0),
        source_url  : xss(req.body.source_url||0),
        maincontent : xss(req.body.maincontent||0)
    };

    var dto = {
        wuid        : req.session.loginInfo.wuid,
        type        : 's',
        jsondata    : null
    };

    //dto.jsondata =  JSON.stringify(sv).replace(/\"/g,'\'');
    dto.jsondata =  JSON.stringify(sv);
    if(xss(req.body.action||0) == 'add'){

        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            var query = connection.query("select count(*) as l from biz_article where wuid = ? and flag > -1", [req.session.loginInfo.wuid], function(err, result){
                if(!!err){
                    connection.end();
                    reData.errMsg = err.message;
                    res.json(reData);
                    return;
                }
                if(result[0].l >= 100){
                    connection.end();
                    reData.errMsg = 'l';
                    res.json(reData);
                    return;
                }
                var query = connection.query("insert into biz_article set ? ", [dto], function(err, result){
                    connection.end();
                    if(!!err){
                        reData.errMsg = err.message;
                        res.json(reData);
                        return;
                    }
                    reData.success = true;
                    res.json(reData);
                });
            });
        });
    };
    if(xss(req.body.action||0) == 'edit'){
        var aid = xss(req.body.rid||0);
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            var query = connection.query("update biz_article set ? where aid = ? and wuid = ? and flag > -1 ", [dto, aid, req.session.loginInfo.wuid], function(err, result){
                connection.end();
                if(!!err){
                    reData.errMsg = err.message;
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


//素材管理-多图文消息保存
module.exports.articleMulSave = function(req, res){
    console.log(req.body);
    console.log(req.query);

    var reData = {
        success : false,
        errMsg  : null
    };



    var _data = JSON.parse(req.body.jsonData);
    for(var __tmp in _data){
        _data[__tmp].content = xss(_data[__tmp].content||0);

        _data[__tmp].title = xss(_data[__tmp].title||0);
        _data[__tmp].cover = xss(_data[__tmp].cover||0);
        _data[__tmp].sourceurl = xss(_data[__tmp].sourceurl||0);
    }
    var dto = {
        wuid        : req.session.loginInfo.wuid,
        type        : 'm',
        jsondata    : JSON.stringify(_data)
    };

    if(xss(req.body.action||0) == 'mul_add'){

        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            var query = connection.query("select count(*) as l from biz_article where wuid = ? and flag > -1 ", [req.session.loginInfo.wuid], function(err, result){
                if(!!err){
                    connection.end();
                    reData.errMsg = err.message;
                    res.json(reData);
                    return;
                }
                if(result[0].l >= 100){
                    connection.end();
                    reData.errMsg = 'l';
                    res.json(reData);
                    return;
                }
                var query = connection.query("insert into biz_article set ? ", [dto], function(err, result){
                    connection.end();
                    if(!!err){
                        reData.errMsg = err.message;
                        res.json(reData);
                        return;
                    }
                    reData.success = true;
                    res.json(reData);
                });
            });
        });
    };
    if(xss(req.body.action||0) == 'mul_edit'){
        var aid = xss(req.body.rid||0);
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            var query = connection.query("update biz_article set ? where aid = ? and wuid = ? and flag > -1 ", [dto, aid, req.session.loginInfo.wuid], function(err, result){
                connection.end();
                if(!!err){
                    reData.errMsg = err.message;
                    res.json(reData);
                    console.log(reData);
                    return;
                }
                reData.success = true;
                res.json(reData);
                console.log(reData);
            });
            console.log(query.sql);
        });
    };
};


module.exports.articleManager = function(req, res){

    var reData = {
        success     : false,
        errMsg      : null
    };

    if(xss(req.query.action||0) == 'del'){
        var aid = req.body.rid;
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            var query = connection.query("update biz_article set flag = -1 where aid = ? and wuid = ? and flag > -1 ", [aid, req.session.loginInfo.wuid], function(err, result){
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

