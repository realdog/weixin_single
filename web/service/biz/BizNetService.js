/**
 * Created with JetBrains WebStorm.
 * User: tjrb
 * Date: 13-6-6
 * Time: 上午10:52
 * To change this template use File | Settings | File Templates.
 */

module.exports.setNetService = function(req, res){

    var reData = {
        success : false,
        errMsg  : null
    }

    var servicename = '';
    for(var post in req.body){
        if(req.body[post] == 1)
            servicename +=  ("'" + xss(post) + "',");
    }
    servicename = servicename.substr(0,servicename.length-1);
    pool.getConnection(function(err, connection){
        if(!!err){
            connection.end();
            reData.errMsg = err.message;
            res.json(reData);
            return;
        }
        if(servicename.length == 0){
            servicename = "''";
        }
        var query = connection.query("select aid, activity_name, default_keyword from activity where activity_name in ( "+servicename+" ) ", function(err, result){
            if(!!err){
                connection.end();
                reData.errMsg = err.message;
                res.json(reData);
                return;
            }
            var service_id = ''
              , service_name = ''
              , service_keyword = '';
            if(result.length > 0){
                for(var i=0;i<result.length;i++){
                    service_id +=  (result[i].aid + ",");
                    service_name +=  (result[i].activity_name + ",");
                    service_keyword +=  (result[i].default_keyword + ",");
                }
                service_id = service_id.substr(0,service_id.length-1);
                service_name = service_name.substr(0,service_name.length-1);
                service_keyword = service_keyword.substr(0,service_keyword.length-1);
            }else{
                service_id = '0';
                service_name = '0';
                service_keyword = '0';
            }
            var dto = {
                wuid            : req.session.loginInfo.wuid,
                service_id      : service_id,
                service_name    :service_name,
                service_keyword :service_keyword
            }
            var query = connection.query("update biz_netservice set ? where wuid = ? ", [dto, req.session.loginInfo.wuid], function(err, result){
                if(!!err){
                    connection.end();
                    reData.errMsg = err.message;
                    res.json(reData);
                    return;
                }
                if(result.affectedRows == 0){
                    var query = connection.query("insert into biz_netservice set ? ", [dto], function(err, result){
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
                }else{
                    connection.end();
                    reData.success = true;
                    res.json(reData);
                }
            });
            console.log(query.sql);
        });
        console.log(query.sql);
    });
};

module.exports.getNetService = function(req, res){

    pool.getConnection(function(err, connection){
        if(!!err){
            res.render('business/admin/err',{err:err.message});
            connection.end();
            return;
        }
        var query = connection.query("select service_name from biz_netservice where wuid = ? ", [req.session.loginInfo.wuid], function(err, result){
            if(!!err){
                res.render('business/admin/err',{err:err.message});
                connection.end();
                return;
            }
            if(result.length == 0){
                res.render('business/admin/netservice-setting',{service:''});
            }else{
                res.render('business/admin/netservice-setting',{service:result[0].service_name});
            }
        });
        console.log(query.sql);
    });
};