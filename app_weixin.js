/*require('nodetime').profile({
    accountKey: '5ebd5c3503f182c6718012f921354224c51ca361',
    appName: 'wxtest1'
});*/
env = process.env.NODE_ENV || 'development';
/**
 * Module dependencies.
 */



var util = require('util');
var graceful = require('graceful');
var express = require('express')
  , config = require('./weixin/config')[env]
  , http = require('http')
  , wechat = require('wechat')
  , dispatch = require('./weixin/dispatch')
  , report = require("./utility/report");
resource = require('./weixin/init');
var app = express();
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
resource.do();
var heapdump = require('heapdump');
app.use('/weixin',function(req, res, next){
    req.local_domain = config.local_domain;
    req.resource_domain = config.resource_domain;
    req.wechat_token = config.token;

    var d = require('domain').create();
    d.on('error', (function(req, res){
        return function(er){
            report.errResponseByXml(req, res, {message:er.stack});
            d.dispose();
        };
    })(req, res));
    d.add(req);
    d.add(res);
    d.run(next);
});



app.use('/weixin', wechat("fakeToken").text(function(message, req, res, next){
    dispatch.text.do(message, req, res, function(err, msg){
        if (!!err) {
            return report.errResponseByXml(req, res, err);
        } else {
            if (typeof msg != "string") {
                for (var __temp in msg) {
                    msg[__temp].url = req.local_domain + '/mobileweb'  + msg[__temp].url;
                    // need change
                    msg[__temp].picUrl = req.resource_domain + '/business_web' + msg[__temp].picUrl.replace('./','');
                }
            }
            res.reply(msg);
            //console.log(util.inspect(diff, { showHidden: true, depth: null }));
        }

    });
    /*
    dispatch.text.do(message, req, res, function(err, msg){
        if (!!err) {
            return report.errResponseByXml(req, res, err);
        } else {
            if (typeof msg != "string") {
                for (var __temp in msg) {
                    msg[__temp].url = req.local_domain + '/mobileweb'  + msg[__temp].url;
                    msg[__temp].picUrl = req.resource_domain + '/business_web' + msg[__temp].picUrl.replace('./','');
                }
            }
            res.reply(msg);
        }

    });     */
                /*
    var d = require('domain').create();
    d.on('error', (function(req, res){
        return function(er){
            report.errResponseByXml(req, res, {message:er.stack});
            d.dispose();
        };
    })(req, res));
    d.add(req);
    d.add(res);
    d.run((function(req, res, message){
        return function() {
            dispatch.text.do(message, req, res, function(err, msg){
                if (!!err) {
                    return report.errResponseByXml(req, res, err);
                } else {
                    if (typeof msg != "string") {
                        for (var __temp in msg) {
                            msg[__temp].url = req.local_domain + '/mobileweb'  + msg[__temp].url;
                            msg[__temp].picUrl = req.resource_domain + '/business_web' + msg[__temp].picUrl.replace('./','');
                        }
                    }
                    res.reply(msg);
                }

            });
        }
    })(req, res, message));
    */
 }).image(function(message, req, res, next){
        dispatch.image.do(message, req, res, function(err, msg){
            res.reply("目前无法处理图片哦。。。");
        });
}).location(function(message, req, res, next){
        //dispatch.location.do(message, req, res);
        dispatch.location.do(message, req, res, function(err, msg){
            res.reply("目前无法处理地理位置哦。。。");
        });
}).voice(function(message, req, res, next){
        res.reply("目前无法处理声音哦。。。");
}).link(function(message, req, res, next){
        dispatch.link.do(message, req, res, function(err, msg){
            res.reply("目前无法处理链接哦。。。");
        });

}).event(function(message, req, res, next){
        dispatch.event.do(message, req, res, function(err, msg){
            if (!!err) {
                return report.errResponseByXml(req, res, err);
            } else {
                if (typeof msg != 'string') {
                    for (var __temp in msg) {
                        msg[__temp].url = req.local_domain + '/mobileweb' + msg[__temp].url;
                        msg[__temp].picUrl = req.resource_domain + '/business_web' + msg[__temp].picUrl.replace('./','');
                    }
                }
                res.reply(msg);
            }

        });
}).middlewarify());


//    // development only
//    if ('development' == app.get('env')) {
//      app.use(express.errorHandler());
//    }


var server = http.createServer(app);
/*
 http.createServer(app).listen(65001, function(){
 console.log('Express server listening on port 65001');
 });
*/

server.close = function () {};
var worker = require( 'pm').createWorker();
graceful({
    server: server,
    worker: worker,
    error: function (err) {
        return report.errResponseByXml({body:undefined},undefined,{message:err.stack});
    },
    killTimeout: 1000
});
worker.ready(function(socket, which) {
    server.emit('connection', socket);
});

