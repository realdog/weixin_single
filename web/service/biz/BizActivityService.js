/**
 * Created with JetBrains WebStorm.
 * User: tjrb
 * Date: 13-5-28
 * Time: 上午10:59
 * To change this template use File | Settings | File Templates.
 */

//SN码相关操作
var inputSN = function(baid, type, prize, callback){

    var prizeArr = [];
    if(type == 3){
        var snArr = ZYF.randomUniqueArray(10,parseInt(prize));
        for(var i=0;i<snArr.length;i++){
            var pz = {prize_lv:0,prize_name:0,sn:snArr[i]};
            prizeArr.push(pz);
        }
    }else if(type == 4 || type == 5){
        var snArr = ZYF.randomUniqueArray(10,parseInt(prize.amount1) + parseInt(prize.amount2) + parseInt(prize.amount3));
        for(var i=0;i<parseInt(prize.amount1);i++){
            var pz = {prize_lv:1,prize_name:prize.prize1,sn:snArr[i]};
            prizeArr.push(pz);
        }
        for(var j=0;j<parseInt(prize.amount2);j++){
            var pz = {prize_lv:2,prize_name:prize.prize2,sn:snArr[i+j]};
            prizeArr.push(pz);
        }
        for(var k=0;k<parseInt(prize.amount3);k++){
            var pz = {prize_lv:3,prize_name:prize.prize3,sn:snArr[i+j+k]};
            prizeArr.push(pz);
        }
    }
    delSN(baid, function(RO){
        if(RO.success){
            insertSN(baid,prizeArr,function(RO){
                if(RO.success){
                    callback('SN码生成成功');
                }else{
                    callback('SN码生成失败');
                }
            });
        }else{
            callback('SN码生成失败');
        }
    });
};
var delSN = function(baid, callback){
    var reData = {
        success : false,
        errMsg  : null
    }
    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            callback(reData);
            return;
        }
        var query = connection.query("delete from biz_sn where baid = ? ", [baid], function(err, result){
            connection.end();
            if(!!err){
                reData.errMsg = err.message;
                callback(reData);
                return;
            }
            reData.success = true;
            callback(reData);
        });
        //console.log(query.sql);
    });
};
var insertSN = function(baid, data, callback){
    var reData = {
        success : false,
        errMsg  : null
    }
    if(data.length>0){
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                callback(reData);
                return;
            }
            var tmp = data.pop();
            var dto = {
                baid        : baid,
                sn          : tmp.sn,
                other       : '{"prizetype":'+tmp.prize_lv+',"prizename":"'+tmp.prize_name+'","prizenum":1}'
            }
            console.log(util.inspect(dto));
            var query = connection.query("insert into biz_sn set ? ", [dto], function(err, result){
                connection.end();
                if(!!err){
                    reData.errMsg = err.message;
                    callback(reData);
                    return;
                }
                setImmediate(function(){
                    insertSN(baid, data, callback);
                });
            });
            //console.log(query.sql);
        });
    }else{
        reData.success = true;
        callback(reData);
    }
};


//营销推广模块-添加活动页面
module.exports.addActivityPage = function(req, res){
    res.render('business/admin/shoper/add-activity',req.session.loginInfo);
};


//营销推广模块-我的推广活动页面
module.exports.activityListPage = function(req, res){

        var sql = "select '"+req.session.loginInfo.wx_username+"' as wx_username, a.baid, a.aid, a.keyword, a.activity_name, DATE_FORMAT(a.start_date,'%Y-%m-%d %H:%i:%s') as start_date , DATE_FORMAT(a.end_date,'%Y-%m-%d %H:%i:%s') as end_date, UNIX_TIMESTAMP(a.start_date)*1000 as start_stamp, UNIX_TIMESTAMP(a.end_date)*1000 as end_stamp, a.status, a.is_stop, b.activity_name as activity_type from biz_activity a, activity b where a.wuid = ? and a.status > -1 and a.aid = b.aid order by a.baid desc ";
        var maxsql = "select count(*) as count from biz_activity a, activity b where a.wuid = ? and a.status > -1 and a.aid = b.aid ";

        ZYF.autoPage(maxsql, sql, [req.session.loginInfo.wuid], req.query.page, req.query.pagesize, req.originalUrl, function(returnData){
            if(returnData.success){
                res.render('business/admin/shoper/activitylist', returnData);
            }else{
                res.render('business/admin/err',returnData.err);
            }
        });
};


//营销推广模块-商户添加停止删除活动处理
module.exports.activityManager = function(req, res){

    var reData = {
        success     : false,
        aid         : null,
        baid         : null,
        error       : false,
        errMsg      : null
    };
    if(xss(req.body.action||0) == 'add'){

        if(!req.body.type || !req.body.keyword || !req.body.activityname || !req.body.startDate || !req.body.endDate){
            reData.errMsg = 'value not be null';
            res.json(reData);
            return;
        }
        var dto = {
            wuid            :req.session.loginInfo.wuid,
            aid             :xss(req.body.type),
            keyword         :xss(req.body.keyword),
            activity_name   :xss(req.body.activityname),
            start_date      :xss(req.body.startDate),
            end_date        :xss(req.body.endDate),
            config          :null
        };
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            var query = connection.query("select default_config, NOW() as currenttime from activity where aid = ? and flag > -1 ", [dto.aid], function(err, result){
                if(!!err){
                    connection.end();
                    reData.errMsg = err.message;
                    res.json(reData);
                    return;
                }
                if(result.length == 0){
                    connection.end();
                    reData.errMsg = '活动id错误';
                    res.json(reData);
                    return;
                }
                if(new Date(dto.start_date) < result[0].currenttime){
                    connection.end();
                    reData.error = 'time err';
                    //console.log(RO);
                    res.json(reData);
                    return;
                }
                dto.config = result[0].default_config;

                //query = connection.query("select keyword from biz_activity where wuid = ? and keyword = ? and status > -1 ", [dto.wuid, dto.keyword], function(err, result){
                ZYO.chkKeyword(req.session.loginInfo.wuid, dto.keyword, function(RO){
                    if(!RO.success || RO.exist){
                        connection.end();
                        reData.error = 'keyword';
                        console.log(RO);
                        res.json(reData);
                        return;
                    }
                    dto.salt = ZYF.randomString(15);
                    var query = connection.query("insert into biz_activity set ? ", [dto], function(err, result){
                        connection.end();
                        if(!!err){
                            reData.errMsg = err.message;
                            res.json(reData);
                            return;
                        }
                        reData.success = true;
                        reData.baid = result.insertId;
                        reData.aid = dto.aid;
                        res.json(reData);
                    });
                });
            });
        });
    };
    if(xss(req.query.action||0) == 'stop'){
        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                res.render('business/admin/err',{err:err.message});
                return;
            };
            var query = connection.query("update biz_activity set is_stop = 1 where wuid = ? and baid = ? and status > -1 ", [req.session.loginInfo.wuid, xss(req.query.baid||0)], function(err, result){
                connection.end();
                if(!!err){
                    res.render('business/admin/err',{err:err.message});
                    return;
                }
                if(result.affectedRows != 1){
                    res.render('business/admin/err',{err:'非法操作，result.affectedRows != 1'});
                    return;
                }
                reData.success = true;
                res.redirect('/business/admin/shoper/activitylist');
            });
            console.log(query.sql);
        });
    };
    if(xss(req.query.action||0) == 'del'){

        pool.getConnection(function(err, connection){
            if(!!err){
                connection.end();
                res.render('business/admin/err',{err:err.message});
                return;
            };
            var query = connection.query("update biz_activity set status = -1 where wuid = ? and baid = ? and status > -1 ", [req.session.loginInfo.wuid, xss(req.query.baid||0)], function(err, result){
                connection.end();
                if(!!err){
                    res.render('business/admin/err',{err:err.message});
                    return;
                }
                if(result.affectedRows != 1){
                    res.render('business/admin/err',{err:'非法操作，result.affectedRows != 1'});
                    return;
                }
                reData.success = true;
                res.redirect('/business/admin/shoper/activitylist');
            });
            console.log(query.sql);
        });
    };
};


//营销推广模块-sn列表
module.exports.snList = function(req, res){

    var baid = xss(req.query.baid||0);

    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            res.render('business/admin/err',{err:err.message});
            return;
        }
        var query = connection.query("select baid from biz_activity where wuid = ? and baid = ? and status > -1", [req.session.loginInfo.wuid, baid], function(err, result){
            if(!!err){
                connection.end();
                res.render('business/admin/err',{err:err.message});
                return;
            }
            if(result.length == 0){
                connection.end();
                res.render('business/admin/err',{err:'不是你的别瞎搞'});
                return;
            }

            var query = connection.query("SELECT flag,count(*) as sum FROM biz_sn where baid = ? group by flag order by flag", [baid], function(err, result){
                connection.end();
                if(!!err){
                    res.render('business/admin/err',{err:err.message});
                    return;
                }
                var posted = 0, getted = 0, nouse = 0;
                for(var i = 0;i<result.length;i++){
                    if(result[i].flag== 0){
                        nouse = result[i].sum;
                    }
                    if(result[i].flag== 1){
                        posted = result[i].sum;
                    }
                    if(result[i].flag== 2){
                        getted = result[i].sum;
                    }
                }

                if(req.query.sncode){
                    var sql = "select * from biz_sn where baid = ?  and sn = '" + xss(req.query.sncode) + "' order by sid";
                    var maxsql = "select count(*) as count from biz_sn where baid = ?  and sn = '" + xss(req.query.sncode) + "' order by sid";
                }else{
                    var sql = "select * from biz_sn where baid = ? order by sid";
                    var maxsql = "select count(*) as count from biz_sn where baid = ? order by sid";
                }

                ZYF.autoPage(maxsql, sql, baid, req.query.page, req.query.pagesize, req.originalUrl, function(returnData){
                    if(returnData.success){
                        returnData.posted = posted;
                        returnData.getted = getted;
                        returnData.sum = nouse + getted + posted;
                        res.render('business/admin/shoper/sncode-manage', returnData);
                        console.log(returnData);
                    }else{
                        res.render('business/admin/err',returnData.err);
                    }
                });

                /*var query = connection.query(strSql, [baid], function(err, result){
                    connection.end();
                    if(!!err){
                        res.render('business/admin/err',{err:err.message});
                        return;
                    }
                    var returnData = ZYF._autoPage(result, req.query.page, req.query.pagesize, req.originalUrl);
                    returnData.posted = posted;
                    returnData.getted = getted;
                    returnData.sum = nouse + getted + posted;

                    res.render('business/admin/shoper/sncode-manage', returnData);
                });*/

            });
        });
    });
};


//营销推广模块-优惠卷coupon活动页面
module.exports.couponPage = function(req, res){

    var baid = xss(req.query.baid||0)
        , wuid = req.session.loginInfo.wuid;
    var ejsVO = {
        baid             : baid,
        wuid            : wuid,
        type            : 0,
        keyword         : null,
        activityName    : null,
        startDate       : null,
        endDate         : null,
        config          : null,
        isRead          : (req.query.isRead)?true:false
    };
    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            res.render('business/admin/err',{err:err.message});
            return;
        };
        var query = connection.query("select aid, keyword, activity_name, DATE_FORMAT(start_date,'%Y-%m-%d %H:%i:%s') as start_date , DATE_FORMAT(end_date,'%Y-%m-%d %H:%i:%s') as end_date, config from biz_activity where wuid = ? and baid = ? and status > -1", [wuid, baid], function(err, result){
            connection.end();
            if(!!err){
                res.render('business/admin/err',{err:err.message});
                return;
            }
            if(result.length != 1){
                res.render('business/admin/err',{err:'未找到此活动'});
                return;
            }
            if(result[0].aid != 3){
                res.render('business/admin/err',{err:'活动类型错误，此页面无法配置非type=3活动'});
                return;
            }
            ejsVO.type = result[0].aid;
            ejsVO.keyword = result[0].keyword;
            ejsVO.activityName = result[0].activity_name;
            ejsVO.startDate = result[0].start_date;
            ejsVO.endDate = result[0].end_date;
            ejsVO.config = result[0].config.replace(/\"/g,'\'');
            res.render('business/admin/shoper/coupon-setting',ejsVO);
        });
    });
};


//营销推广模块-优惠卷coupon活动配置
module.exports.couponConfig = function(req, res){

    var reData = {
        success : false,
        sn      : null,
        errMsg  : null
    };
    var couponConfigVO = {
        activity_type : "exchange",
        sub_type   : "free",
        beginTime   : 0,
        endTime     : 0,
        amount      : xss(req.body.amount),
        before      : {
            title     :xss(req.body.title1)
            , cover     :xss(req.body.cover1)
            , summary   :xss(req.body.summary1)
            , url       :''
            , tips      :xss(req.body.nostartTips)
        },
        running     : {
            title     :xss(req.body.title2)
            , cover     :xss(req.body.cover2)
            , summary   :xss(req.body.summary2)
            , url       :''
            , tips      :xss(req.body.repeatTips)
        },
        after       : {
            title     :xss(req.body.title3)
            , cover     :xss(req.body.cover3)
            , summary   :xss(req.body.summary3)
            , url       :''
            , tips      :''
        }
    };

    var dto  = {
        keyword         : xss(req.body.keyword),
        activity_name    : xss(req.body.activityname),
        start_date       : xss(req.body.startDate),
        end_date         : xss(req.body.endDate),
        config          : null
    };

    var baid = xss(req.body.baid)
        , aid = xss(req.body.type)
        , wuid = req.session.loginInfo.wuid;

    if(aid != 3){
        reData.errMsg = '活动类型错误，此页面无法配置非type=3活动';
        res.json(reData);
        return;
    }
    couponConfigVO.beginTime = new Date(dto.start_date).getTime();
    couponConfigVO.endTime = new Date(dto.end_date).getTime();
    //dto.config =  JSON.stringify(couponConfigVO).replace(/\"/g,'\'');
    dto.config =  JSON.stringify(couponConfigVO);

    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            res.json(reData);
            return;
        }
        var query = connection.query("select keyword from biz_activity where wuid = ? and baid <> ? and keyword = ? and status > -1 ", [wuid, baid, dto.keyword], function(err, result){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            if(result.length > 0){
                connection.end();
                reData.errMsg = "keywork";
                res.json(reData);
                return;
            }
            var query = connection.query("update biz_activity set ? where wuid = ? and baid = ? and aid = ? and start_date > NOW()", [dto, wuid, baid, aid], function(err, result){
                connection.end();
                if(!!err){
                    reData.errMsg = err.message;
                    res.json(reData);
                    return;
                }
                if(result.affectedRows != 1){
                    reData.errMsg = 'invalid';
                    res.json(reData);
                    return;
                }
                inputSN(baid, 3, couponConfigVO.amount, function(RO){
                    reData.success = true;
                    reData.sn = RO;
                    res.json(reData);
                    console.log(reData);
                });
            });
        });
    });
};


//营销推广模块-刮刮卡lottery活动页面
module.exports.lotteryPage = function(req, res){

    var baid = xss(req.query.baid||0)
        , wuid = req.session.loginInfo.wuid;

    var ejsVO = {
        baid             : baid,
        wuid            : wuid,
        type            : 0,
        keyword         : null,
        activityName    : null,
        startDate       : null,
        endDate         : null,
        config          : null,
        isRead          : (req.query.isRead)?true:false
    };

    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            res.render('business/admin/err',{err:err.message});
            return;
        };
        var query = connection.query("select aid, keyword, activity_name, DATE_FORMAT(start_date,'%Y-%m-%d %H:%i:%s') as start_date , DATE_FORMAT(end_date,'%Y-%m-%d %H:%i:%s') as end_date, config from biz_activity where wuid = ? and baid = ? and status > -1", [wuid, baid], function(err, result){
            connection.end();
            if(!!err){
                res.render('business/admin/err',{err:err.message});
                return;
            }
            if(result.length != 1){
                res.render('business/admin/err',{err:'未找到此活动'});
                return;
            }
            if(result[0].aid != 4){
                res.render('business/admin/err',{err:'活动类型错误，此页面无法配置非type=4活动'});
                return;
            }
            ejsVO.type = result[0].aid;
            ejsVO.keyword = result[0].keyword;
            ejsVO.activityName = result[0].activity_name;
            ejsVO.startDate = result[0].start_date;
            ejsVO.endDate = result[0].end_date;
            ejsVO.config = result[0].config.replace(/\"/g,'\'');;
            res.render('business/admin/shoper/lottery-setting',ejsVO);
        });
    });
};


//营销推广模块-刮刮卡lottery活动配置
module.exports.lotteryConfig = function(req, res){

    var reData = {
        success : false,
        sn      : null,
        errMsg  : null
    };
    var couponConfigVO = {
        activity_type : "gaming",
        sub_type   : "scratch",
        beginTime   : 0,
        endTime     : 0,
        before      : {
            title     :xss(req.body.title1)
            , cover     :xss(req.body.cover1)
            , summary   :xss(req.body.summary1)
            , url       :''
            , tips      :''
        },
        running     : {
            title     :xss(req.body.title2)
            , cover     :xss(req.body.cover2)
            , summary   :xss(req.body.summary2)
            , url       :''
            , tips      :xss(req.body.repeatTips)
        },
        prize       : {
            prize1        :xss(req.body.prize1)
            , amount1       :xss(req.body.amount1)
            , prize2        :xss(req.body.prize2)
            , amount2       :xss(req.body.amount2)
            , prize3        :xss(req.body.prize3)
            , amount3       :xss(req.body.amount3)
            , totalPeople   :xss(req.body.totalPeople)
            , playtotal     :xss(req.body.playtotal)
            , playperday    :xss(req.body.playperday)
        },
        percent     : 0
    };

    var dto  = {
        keyword         : xss(req.body.keyword),
        activity_name    : xss(req.body.activityname),
        start_date       : xss(req.body.startDate),
        end_date         : xss(req.body.endDate),
        config          : null
    };

    var baid = xss(req.body.baid)
        , aid = xss(req.body.type)
        , wuid = req.session.loginInfo.wuid;

    if(aid != 4){
        reData.errMsg = '活动类型错误，此页面无法配置非type=4活动';
        res.json(reData);
        return;
    }
    couponConfigVO.beginTime = new Date(dto.start_date).getTime();
    couponConfigVO.endTime = new Date(dto.end_date).getTime();
    couponConfigVO.percent = parseInt(10000*(parseInt(couponConfigVO.prize.amount1) + parseInt(couponConfigVO.prize.amount2) + parseInt(couponConfigVO.prize.amount3))/(parseInt(couponConfigVO.prize.totalPeople)));
    console.log(couponConfigVO.percent);
    //dto.config =  JSON.stringify(couponConfigVO).replace(/\"/g,'\'');
    dto.config =  JSON.stringify(couponConfigVO);

    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            res.json(reData);
            return;
        }
        var query = connection.query("select keyword from biz_activity where wuid = ? and baid <> ? and keyword = ? and status > -1 ", [wuid, baid, dto.keyword], function(err, result){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            if(result.length > 0){
                connection.end();
                reData.errMsg = "keyword";
                res.json(reData);
                return;
            }
            var query = connection.query("update biz_activity set ? where wuid = ? and baid = ? and aid = ? and start_date > NOW() ", [dto, wuid, baid, aid], function(err, result){
                connection.end();
                if(!!err){
                    reData.errMsg = err.message;
                    res.json(reData);
                    return;
                }
                if(result.affectedRows != 1){
                    reData.errMsg = 'invalid';
                    res.json(reData);
                    return;
                }
                inputSN(baid, 4, couponConfigVO.prize, function(RO){
                    reData.success = true;
                    reData.sn = RO;
                    res.json(reData);
                    console.log(reData);
                });
            });
        });
    });
};


//营销推广模块-大转盘pan活动页面
module.exports.panPage = function(req, res){

    var baid = xss(req.query.baid||0)
        , wuid = req.session.loginInfo.wuid;

    var ejsVO = {
        baid             : baid,
        wuid            : wuid,
        type            : 0,
        keyword         : null,
        activityName    : null,
        startDate       : null,
        endDate         : null,
        config          : null,
        isRead          : (req.query.isRead)?true:false
    };

    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            res.render('business/admin/err',{err:err.message});
            return;
        };
        var query = connection.query("select aid, keyword, activity_name, DATE_FORMAT(start_date,'%Y-%m-%d %H:%i:%s') as start_date , DATE_FORMAT(end_date,'%Y-%m-%d %H:%i:%s') as end_date, config from biz_activity where wuid = ? and baid = ? and status > -1", [wuid, baid], function(err, result){
            connection.end();
            if(!!err){
                res.render('business/admin/err',{err:err.message});
                return;
            }
            if(result.length != 1){
                res.render('business/admin/err',{err:'未找到此活动'});
                return;
            }
            if(result[0].aid != 5){
                res.render('business/admin/err',{err:'活动类型错误，此页面无法配置非type=5活动'});
                return;
            }
            ejsVO.type = result[0].aid;
            ejsVO.keyword = result[0].keyword;
            ejsVO.activityName = result[0].activity_name;
            ejsVO.startDate = result[0].start_date;
            ejsVO.endDate = result[0].end_date;
            ejsVO.config = result[0].config.replace(/\"/g,'\'');;
            res.render('business/admin/shoper/pan-setting',ejsVO);
        });
    });
};


//营销推广模块-大转盘pan活动配置
module.exports.panConfig = function(req, res){

    var reData = {
        success : false,
        sn      : null,
        errMsg  : null
    };
    var couponConfigVO = {
        activity_type : "gaming",
        sub_type   : "rotary",
        beginTime   : 0,
        endTime     : 0,
        before      : {
            title     :xss(req.body.title1)
            , cover     :xss(req.body.cover1)
            , summary   :xss(req.body.summary1)
            , url       :''
            , tips      :''
        },
        running     : {
            title     :xss(req.body.title2)
            , cover     :xss(req.body.cover2)
            , summary   :xss(req.body.summary2)
            , url       :''
            , tips      :xss(req.body.repeatTips)
        },
        prize       : {
            prize1        :xss(req.body.prize1)
            , amount1       :xss(req.body.amount1)
            , prize2        :xss(req.body.prize2)
            , amount2       :xss(req.body.amount2)
            , prize3        :xss(req.body.prize3)
            , amount3       :xss(req.body.amount3)
            , totalPeople   :xss(req.body.totalPeople)
        },
        percent             : 0
    };
    var dto  = {
        keyword         : xss(req.body.keyword),
        activity_name    : xss(req.body.activityname),
        start_date       : xss(req.body.startDate),
        end_date         : xss(req.body.endDate),
        config          : null
    };

    var baid = xss(req.body.baid)
        , aid = xss(req.body.type)
        , wuid = req.session.loginInfo.wuid;

    if(aid != 5){
        reData.errMsg = '活动类型错误，此页面无法配置非type=5活动';
        res.json(reData);
        return;
    }
    couponConfigVO.beginTime = new Date(dto.start_date).getTime();
    couponConfigVO.endTime = new Date(dto.end_date).getTime();
    couponConfigVO.percent = parseInt(10000*(parseInt(couponConfigVO.prize.amount1) + parseInt(couponConfigVO.prize.amount2) + parseInt(couponConfigVO.prize.amount3))/(parseInt(couponConfigVO.prize.totalPeople)));
    console.log(couponConfigVO.percent);
    //dto.config =  JSON.stringify(couponConfigVO).replace(/\"/g,'\'');
    dto.config =  JSON.stringify(couponConfigVO);

    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            res.json(reData);
            return;
        }
        var query = connection.query("select keyword from biz_activity where wuid = ? and baid <> ? and keyword = ? and status > -1 ", [wuid, baid, dto.keyword], function(err, result){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            if(result.length > 0){
                connection.end();
                reData.errMsg = "keyword";
                res.json(reData);
                return;
            }
            var query = connection.query("update biz_activity set ? where wuid = ? and baid = ? and aid = ? and start_date > NOW() ", [dto, wuid, baid, aid], function(err, result){
                connection.end();
                if(!!err){
                    reData.errMsg = err.message;
                    res.json(reData);
                    return;
                }
                if(result.affectedRows != 1){
                    reData.errMsg = 'invalid';
                    res.json(reData);
                    return;
                }
                inputSN(baid, 5, couponConfigVO.prize, function(RO){
                    reData.success = true;
                    reData.sn = RO;
                    res.json(reData);
                    console.log(reData);
                });
            });
        });
    });
};




