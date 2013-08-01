
env = process.env.NODE_ENV || 'development';
/**
 * Module dependencies.
 */
var util = require('util');
var graceful = require('graceful');
var express = require('express')
    , xss = require("xss")
    , fs = require('fs')
    , url = require('url')
    , config = require('./weixin/config')[env]
    , http = require('http')
    , wechat = require('wechat')
    , weixin = require('./weixin/dispatch')
    , report = require("./utility/report");
resource = require('./mobileweb/init');
var app = express();
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

resource.do();
var app = express();
var checkHeader = require("./utility").checkHeader;
var processRoutes_path = __dirname + "/mobileweb/routes";
var _process = {};
fs.readdirSync(processRoutes_path).forEach(function (dir) {
    var _tempPath = processRoutes_path + '/' + dir;
    var _type = dir;
    _process[_type] = {};
    fs.readdirSync(_tempPath).forEach(function(dir){
        var __tempPath = _tempPath + '/' + dir;
        var __type = dir;
        _process[_type][__type] = {};
        fs.readdirSync(__tempPath).forEach(function(file){
            var ___tempPath = __tempPath + '/' + file;
            var ___temp = require(___tempPath);
            if (!!___temp.name) {
                console.log("loading:" + _type + "/" + __type + "/" + ___temp.name);
                _process[_type][__type][___temp.name] = ___temp.run;
            }
        });
    });
});

provider = {
    name: "微信通",
    url: 'http://gfy.com'
};

app.set('views', __dirname + '/mobileweb/views');
app.set('view engine', 'ejs');
app.set('view cache', false);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('e7ax1976'));
app.use(express.session());
app.use(app.router);

app.use('/mobileweb',function(req, res, next){

    if (!checkHeader(req.header("user-agent"))) {
         return res.send("gfy");
    }
	console.log(req.url);
    var visitor = url.parse(req.url, true, true);

    var pathname = visitor.pathname;

    var directorList = pathname.split('/');
    if (directorList[0] != '') {
        return res.send("孙长老收了神通吧");
    }
    directorList.shift();
    try {

        if (typeof _process[directorList[0]][directorList[1]][directorList[2]] == 'function') {
            if ((!!visitor.query.c)  && (!!visitor.query.a) && (!!visitor.query.u)) {
                //code
                req.c = xss(visitor.query.c);
                //activity_id
                req.a = (xss(visitor.query.a)) >>> 0;
                req.u = (xss(visitor.query.u)) >>> 0;
                req.local_domain = config.local_domain;
                req.resource_domain = config.resource_domain;


                return _process[directorList[0]][directorList[1]][directorList[2]](req, res, next);
            } else {
                return report.errResponseByHtml(req, res, new Error("paramer error"));
            }
        } else {
            return report.errResponseByHtml(req, res, new Error("route is not a function"));
        }
    } catch (e) {
        return report.errResponseByHtml(req, res, e);
        return res.send("孙长老收了神通吧!");
    }
});

var server = http.createServer(app);
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

//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
