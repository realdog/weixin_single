
/**
 * Module dependencies.
 */

var env = process.env.NODE_ENV || 'production';

//zy+++++
require('./web/core/constant')(env);
var graceful = require('graceful');
var express = require('express')
    , http = require('http')
    , path = require('path')
    , routes = require('./web/core/routes');

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/web/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({keepExtensions: true, uploadDir:__dirname+'/web/tmp'}));
app.use(express.methodOverride());
app.use(express.cookieParser('ztdsb'));
app.use(express.session('ztdsb'));
app.use('/business/admin/',express.static(path.join(__dirname, 'web/public')));
app.use('/business/admin/', function(req, res, next){
    var d = require('domain').create();
    d.on('error', (function(req, res){
        return function(er){
            d.dispose();
        };
    })(req, res));
    d.add(req);
    d.add(res);
    d.run((function(req, res, next){
        return function(){
            ZYO.filterLogin(req, res, next)
        }
    })(req, res, next));
});
routes(app);
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//zy+++++


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
        log.error({req: undefined, res: undefined}, err.message + ":::stack:::" + err.stack);
    },
    killTimeout: 1000
});
worker.ready(function(socket, which) {
    server.emit('connection', socket);
});
/*
 http.createServer(app).listen(app.get('port'), function(){
 console.log('Express server listening on port ' + app.get('port'));
 });

 */


