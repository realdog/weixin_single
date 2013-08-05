var fs = require('fs');

module.exports.get = function(req, res){
    res.send('get name:'+req.query.name+' get pwd:'+req.query.pwd);
};


module.exports.path = function(req, res){
    res.send('path name:'+req.params.name+' path pwd:'+req.params.pwd);
};


module.exports.post = function(req, res){
    res.send('post name:'+req.body.name+' post pwd:'+req.body.pwd);
};


module.exports.mysqltest = function(req, res){

    console.log('pool=======' + req.connectionPool + pool);

    pool.getConnection(function(err, connection) {



        if (err){
            //console.log(err);
            res.send('bbb');}
        if (!err) {


            //console.log(connection);
            res.send('aaa');

            var query = connection.query("INSERT INTO test1 SET ?", {firstname:'f', lastname:'l', message:'m'}, function(err, result) {

                console.log(result.insertId);
                console.log(result.affectedRows);
                console.log(result.length);


                if (!!err) {
                    connection.end();
                    throw err;
                } else {


                    if (!!result.insertId) {
                        //connection.end();
                    }
                }
            });

            console.log(query.sql);

            query = connection.query("UPDATE test1 set message = '1fff' where id = ? ", [2] , function(err, result){
                if (!err) {

                    console.log(result.insertId);
                    console.log(result.affectedRows);
                    console.log(result.length);


                    //connection.end();
                }
                else{
                    throw err;
                }
            });
            console.log(query.sql);

            query = connection.query("SELECT * from test1 where id >= ? " , [5], function(err, result){
                if (!err) {

                    console.log(result.insertId);
                    console.log(result.affectedRows);
                    console.log(result.length);


                    connection.end();
                }
                else{
                    throw err;
                }
            });
            console.log(query.sql);

            res.send('222222');
        }

    });


};

//测试
var selsql = function (tname, fname, fvalue, callback){
    pool.getConnection(function(err, connection){
        if(!!err){
            console.log(err.message);
            callback(false);
        }else{
            var query = connection.query("select "+fname+" from "+tname+" where "+fname+" = ? " , [fvalue], function(err, result){
                if(!!err){
                    console.log(err.message);
                    callback(false);
                }else{
                    console.log(result);
                    callback(result);
                }
            });
            console.log(query.sql);
        }
    });
}
//测试
module.exports.testsql = function(req, res){
    selsql('biz_invite', 'invite_id', '1', function(result){ res.json(result)});
}

module.exports.sessionTest = function(req, res){
    //req.session.name = 'ss';
    res.send(ZYF.randomUniqueArray(100,50));
    //    res.render('zzz', { title: 'Express' });
}

module.exports.memvo = function(req,res){
    ZYO.createMemKeywords(function(result){
        res.json(result);
    });
};

var a= function cloneAll(fromObj){
    var toObj = {};
    for(var i in fromObj){
        if(typeof fromObj[i] == "object"){
            toObj[i]=cloneAll(fromObj[i]);
            continue;
        }
        toObj[i] = fromObj[i];
    }
    return toObj;
}

var _imp = function(req,res){

    pool.getConnection(function(err, connection){
        if(!!err){
            res.json(err.message);
            return;
        }

        for(var i =0 ; i<100000; i++){
            var dto = {
                userid  : 1,
                userkey : 'key1',
                msgtype : 1,
                msg     : '1message' + i
            }
            var query = connection.query("insert into user_send_log set ?  ", [dto], function(err, result){
                connection.end();
                if(!!err){
                    res.json(err.message);
                    return;
                }
            });
        }
    });
    res.send("vv");
}

module.exports.update = function(req,ress){
    var http = require('http') ;

    var options = {
        host:'www.tianjinwe.comd',
        port:890,
        path:'/index.html'
    }

    http.get(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);

        res.on('data', function(d) {
            console.log("================" + d);
            ress.send('a');
        });

    }).on('error', function(e) {
            console.error("err:"+e);
        });

}


var _get = function (req,res){

    //var $ = require('jquery');
    var http = require('http');

    var options = {
        host : 'www.tianjinwe.com',
        port : 80,
        path : '/index.html'
    }

    var html = '';
    http.get(options, function(res) {

        res.on('data', function(data) {
            // collect the data chunks to the variable named "html"
            html += data;
        }).on('end', function() {
                // the whole of webpage data has been collected. parsing time!

                /*var title = $(html).find('div h3 span').each(function($this){
                    var a = $(this).children('a').attr('href');
                    var b = $(this).children('a').text();
                    console.log(b + ":" + options.host + a);
                });*/
                console.log(html);
            });

        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);
        console.log("=====================");
    });
}
module.exports.root = _get;


var _query = function(connection, sql, obj, callback){

    if (!!connection) {
        connection.query(sql, obj, function(err, results){
            callback(err, results);
        });
    }else {
        pool.getConnection(function(err, connection) {
            if (!!err) {
                return callback(err);
            } else {
                var query = connection.query(sql, obj, function(err, results){
                    connection.end();
                    callback(err, results);
                });
            }
        });
    }
};