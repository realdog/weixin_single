var should = require('should');
var fs = require('fs');
var muk = require('muk');
var report = require("../utility/report");
var rewire = require('rewire');
var mysql = require('mysql');
var Logger = require('bunyan');
var myData = '{"beginTime":1369976400000,"endTime":1369994400000,"amount":10000,"timesPreUser":10,"before":{"title":"活动即将开始","cover":"./upload/25/13699701440512.jpg","summary":"活动说明","url":"","tips":"亲，活动还没有开始"},"running":{"title":"中奖公告","cover":"shoper/coupon/d-02.jpg","summary":"你获得优惠说明，使用权限说明","url":"","tips":"亲，抢券活动每人只能抽一次哦。"},"after":{"title":"活动已经结束","cover":"shoper/coupon/d-03.jpg","summary":"亲，下次早点哦~请继续关注我们的后续活动","url":"","tips":""}}';


log = new Logger({
    name: 'weixin',
    streams: [
        {
            stream: process.stdout,
            level: 'info'
        },
        {
            type: 'rotating-file',
            path: '../logs/foo.log',
            level: 'error',
            period: '1d',   // daily rotation
            count: 365        // keep 365 back copies
        }
    ],
    serializers: {
        req: Logger.stdSerializers.req,
        res: Logger.stdSerializers.res
    }
});
pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'zerotest',
    database  : 'wx'
});
var crypto = require('crypto');
var _util = require('../utility');
var running = require('../mobileweb/routes/exchange/free/running.js')
provider = {
    name: '老狗',
    url: 'http://www.baidu.com'
};

describe('路由mobile_routes_exchange_free_running测试',function(){

    describe('第一项：测试getConnection错误',function(){
        var _pool;
        var _temp;
        var _report;
        before(function(){
            _pool = pool;
            _report = report.errResponse;

            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(new Error("fail"), {
                            query: function( sql, obj, callback){
                            },
                            end: function(){
                                _temp = true;
                                return;
                            }
                        });
                    });

                }
            };
            report.errResponse =  function(req, res, err){
                should.exist(err);
                err.message.should.equal("fail");
            };

        });

        it('测试run方法：会因为获取连接错误而失败', function(){
            running.run({
                resource_domain: "testdomain"
            },  {
                render: function(path, data){
                }
            }, {});
        });

        after(function(){
            pool = _pool;
            report.errResponse = _report;
        });
    });


    describe('第二项：测试getDataFromIdentifierByCWA错误',function(){
        var _temp;
        var _report;
        var _getDataFromIdentifierByCWA;
        before(function(){
            _report = report.errResponse;
            _getDataFromIdentifierByCWA = _util.getDataFromIdentifierByCWA;
            _util.getDataFromIdentifierByCWA = function(connection, c, w, a, cb){
                cb(new Error("get fail"));
            };
            report.errResponse =  function(req, res, err){
                should.exist(err);
                err.message.should.equal("get fail");
            };
        });

        it('测试run方法：会因为getDataFromIdentifierByCWA错误而失败', function(){
            running.run({
                resource_domain: "testdomain",
                c: 1,
                w: 2,
                a: 3
            },  {
                render: function(path, data){

                }
            }, {});
        });

        after(function(){
            _util.getDataFromIdentifierByCWA = _getDataFromIdentifierByCWA;
            report.errResponse = _report;
        });
    });


    describe('第三项：测试getDataFromIdentifierByCWA返回data解析错误',function(){
        var _temp;
        var _report;
        var _getDataFromIdentifierByCWA;
        before(function(){
            _report = report.errResponse;
            _getDataFromIdentifierByCWA = _util.getDataFromIdentifierByCWA;
            _util.getDataFromIdentifierByCWA = function(connection, c, w, a, cb){
                cb(undefined,[
                    {data:"'", userkey:"key"}]
                );
            };
            report.errResponse =  function(req, res, err){
                should.exist(err);
                err.message.should.equal("Unexpected token '");

            };
        });

        it('测试run方法：会因为getDataFromIdentifierByCWA返回的data解析错误而失败', function(){
            running.run({
                resource_domain: "testdomain",
                c: 1,
                w: 2,
                a: 3
            },  {
                render: function(path, data){
                }
            }, {});
        });

        after(function(){
            _util.getDataFromIdentifierByCWA = _getDataFromIdentifierByCWA;
            report.errResponse = _report;
        });
    });

    describe('第四项：测试活动过期',function(){
        var _getSN;
        var _report;
        var _getDataFromIdentifierByCWA;

        before(function(){
            _getSN = _util.getSN;
            _report = report.errResponse;
            _getDataFromIdentifierByCWA = _util.getDataFromIdentifierByCWA;
            var _now = new Date().getTime();
            var _data = JSON.parse(myData);
            _data.beginTime = _now + 1000000;
            _data.endTime = _now - 1000000;
            var __data = JSON.stringify(_data);
            _util.getDataFromIdentifierByCWA = function(connection, c, w, a, cb){

                cb(undefined,[
                    {data:__data, userkey:"userkey"}]
                );
            };
            report.errResponse =  function(req, res, err){
            };
            _util.getSN = function(connection, userkey, a, cb){
                cb(new Error("update too many recorder"), 2);
            };
        });

        it('模拟getDataFromIdentifierByCWA方法获得一条记录', function(done){
            running.run({
                resource_domain: "testdomain",
                c: 1,
                w: 2,
                a: 3
            },  {
                render: function(path, data){
                    path.should.equal("exchange/free/after");
                    data.desc.should.equal(JSON.parse(myData)["after"].summary);
                    data.provider.should.equal(provider);
                    done();
                }
            }, {});
        });

        after(function(){
            _util.getDataFromIdentifierByCWA = _getDataFromIdentifierByCWA;
            report.errResponse = _report;
            _util.getSN = _getSN;
        });
    });


    describe('第五项：测试活动尚未开始',function(){
        var _getSN;
        var _report;
        var _getDataFromIdentifierByCWA;

        before(function(){
            _getSN = _util.getSN;
            _report = report.errResponse;
            _getDataFromIdentifierByCWA = _util.getDataFromIdentifierByCWA;
            var _now = new Date().getTime();
            var _data = JSON.parse(myData);
            _data.beginTime = _now + 1000000;
            _data.endTime = _now + 1000000;
            var __data = JSON.stringify(_data);
            _util.getDataFromIdentifierByCWA = function(connection, c, w, a, cb){

                cb(undefined,[
                    {data:__data, userkey:"userkey"}]
                );
            };
            report.errResponse =  function(req, res, err){
            };
            _util.getSN = function(connection, userkey, a, cb){
                cb(new Error("update too many recorder"), 2);
            };
        });

        it('模拟getDataFromIdentifierByCWA方法成功返回一条记录', function(done){
            running.run({
                resource_domain: "testdomain",
                c: 1,
                w: 2,
                a: 3
            },  {
                render: function(path, data){
                    path.should.equal("exchange/free/before");
                    data.desc.should.equal(JSON.parse(myData)["before"].summary);
                    data.provider.should.equal(provider);
                    done();
                }
            }, {});
        });

        after(function(){
            _util.getDataFromIdentifierByCWA = _getDataFromIdentifierByCWA;
            report.errResponse = _report;
            _util.getSN = _getSN;
        });
    });


    describe('第六项：测试getSN',function(){
        var _getSN;
        var _report;
        var _getDataFromIdentifierByCWA;
        before(function(){
            _getSN = _util.getSN;
            _report = report.errResponse;
            _getDataFromIdentifierByCWA = _util.getDataFromIdentifierByCWA;
            var _data = JSON.parse(myData);
            var _now = new Date().getTime();
            _data.beginTime = _now - 1000000;
            _data.endTime = _now + 1000000;
            var __data = JSON.stringify(_data);
            _util.getDataFromIdentifierByCWA = function(connection, c, w, a, cb){
                cb(undefined,[
                    {data:__data, userkey:"userkey"}]
                );
            };

            _util.getSN = function(connection, userkey, a, cb){
                cb(undefined, {sn:"123"});
            };
        });

        it('模拟getSN方法成功返回一条记录', function(done){
            running.run({
                resource_domain: "testdomain",
                c: 1,
                w: 2,
                a: 3
            },  {
                render: function(path, data){
                    path.should.equal("exchange/free/running");
                    data.code.should.equal("123")
                    data.desc.should.equal("你获得优惠说明，使用权限说明");
                    data.provider.should.equal(provider);
                    done()
                }
            }, {});
        });

        after(function(){
            _util.getDataFromIdentifierByCWA = _getDataFromIdentifierByCWA;
            report.errResponse = _report;
            _util.getSN = _getSN;
        });
    });








    describe('第七项：测试getSN',function(){
        var _getSN;
        var _report;
        var _getDataFromIdentifierByCWA;

        before(function(){
            _getSN = _util.getSN;
            _report = report.errResponse;
            _getDataFromIdentifierByCWA = _util.getDataFromIdentifierByCWA;
            var _now = new Date().getTime();
            var _data = JSON.parse(myData);
            _data.beginTime = _now - 1000000;
            _data.endTime = _now + 1000000;
            var __data = JSON.stringify(_data);
            _util.getDataFromIdentifierByCWA = function(connection, c, w, a, cb){
                cb(undefined,[
                    {data:__data, userkey:"userkey"}]
                );
            };
            report.errResponse =  function(req, res, err){
                should.exist(err);
                err.message.should.equal("update too many recorder");
            };
            _util.getSN = function(connection, userkey, a, cb){
                cb(new Error("update too many recorder"), 2);
            };
        });

        it('模拟getSN方法返回错误：update too many recorder', function(){
            running.run({
                resource_domain: "testdomain",
                c: 1,
                w: 2,
                a: 3
            },  {
                render: function(path, data){

                }
            }, {});
        });

        after(function(){
            _util.getDataFromIdentifierByCWA = _getDataFromIdentifierByCWA;
            report.errResponse = _report;
            _util.getSN = _getSN;
        });
    });



    describe('第八项：测试getSN',function(){
        var _getSN;
        var _report;
        var _getDataFromIdentifierByCWA;

        before(function(){
            _getSN = _util.getSN;
            _report = report.errResponse;
            _getDataFromIdentifierByCWA = _util.getDataFromIdentifierByCWA;
            var _now = new Date().getTime();
            var _data = JSON.parse(myData);
            _data.beginTime = _now - 1000000;
            _data.endTime = _now + 1000000;
            var __data = JSON.stringify(_data);
            _util.getDataFromIdentifierByCWA = function(connection, c, w, a, cb){
                cb(undefined,[
                    {data:__data, userkey:"userkey"}]
                );
            };




            report.errResponse =  function(req, res, err){
                should.exist(err);
                err.message.should.equal("some error");
            };
            _util.getSN = function(connection, data, a, cb){
                if (typeof data == 'string') {
                    cb(new Error("update zero recorder"), 0);
                } else {
                    cb(new Error("some error"));
                }

            };
        });

        it('模拟getSN先后用字符串、对象作为参数并且在用对象调用后返回错误', function(){
            running.run({
                resource_domain: "testdomain",
                c: 1,
                w: 2,
                a: 3
            },  {
                render: function(path, data){
                }
            }, {});
        });

        after(function(){
            _util.getDataFromIdentifierByCWA = _getDataFromIdentifierByCWA;
            report.errResponse = _report;
            _util.getSN = _getSN;
        });
    });



    describe('第九项：测试活动正在进行',function(){
        var _getSN;
        var _report;
        var _getDataFromIdentifierByCWA;

        before(function(){
            _getSN = _util.getSN;
            _report = report.errResponse;
            _getDataFromIdentifierByCWA = _util.getDataFromIdentifierByCWA;
            var _now = new Date().getTime();
            var _data = JSON.parse(myData);
            _data.beginTime = _now - 1000000;
            _data.endTime = _now + 1000000;
            var __data = JSON.stringify(_data);
            _util.getDataFromIdentifierByCWA = function(connection, c, w, a, cb){

                cb(undefined,[
                    {data:__data, userkey:"userkey"}]
                );
            };
            report.errResponse =  function(req, res, err){

            };
            _util.getSN = function(connection, data, a, cb){
                if (typeof data == 'string') {
                    cb(new Error("update zero recorder"), 0);
                } else {
                    cb(undefined, 0);
                }

            };

        });

        it('模拟getSN使用对象作为参数调用无错误,result==0', function(done){
            running.run({
                resource_domain: "testdomain",
                c: 1,
                w: 2,
                a: 3
            },  {
                render: function(path, data){
                    data.desc.should.equal("优惠券发光了哦");
                    done();
                }
            }, {});
        });

        after(function(){
            _util.getDataFromIdentifierByCWA = _getDataFromIdentifierByCWA;
            report.errResponse = _report;
            _util.getSN = _getSN;

        });
    });


    describe('第十项：测试活动正在进行',function(){
        var _getSN;
        var _report;
        var _getDataFromIdentifierByCWA;

        before(function(){
            _getSN = _util.getSN;
            _report = report.errResponse;
            _getDataFromIdentifierByCWA = _util.getDataFromIdentifierByCWA;
            var _now = new Date().getTime();
            var _data = JSON.parse(myData);
            _data.beginTime = _now - 1000000;
            _data.endTime = _now + 1000000;
            var __data = JSON.stringify(_data);
            _util.getDataFromIdentifierByCWA = function(connection, c, w, a, cb){

                cb(undefined,[
                    {data:__data, userkey:"userkey"}]
                );
            };
            report.errResponse =  function(req, res, err){
                console.log(arguments);
                err.message.should.equal("some error");
            };
            _util.getSN = function(connection, data, a, cb){
                if (typeof data == 'string') {
                    cb(new Error("update zero recorder"), 0);
                } else {
                    cb(undefined, {sn:'123'});
                }

            };
        });

        it('模拟getSN使用对象作为参数调用无错误,result!=0.sn有内容', function(done){
            running.run({
                resource_domain: "testdomain",
                c: 1,
                w: 2,
                a: 3
            },  {
                render: function(path, data){
                    path.should.equal("exchange/free/running");
                    data.code.should.equal("123");
                    data.desc.should.equal(JSON.parse(myData)["running"].summary);
                    done();
                }
            }, {});
        });

        after(function(){
            _util.getDataFromIdentifierByCWA = _getDataFromIdentifierByCWA;
            report.errResponse = _report;
            _util.getSN = _getSN;
        });
    });
});