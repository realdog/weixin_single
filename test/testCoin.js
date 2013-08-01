var should = require('should');
var fs = require('fs');
var mysql = require('mysql');
var user = require('../proxy/weixin/database/user.js');
pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'zerotest',
    database  : 'wx'
});

var crypto = require('crypto');
var utility  = require("../utility");
var exchange = require('../weixin/rule/exchange/coin');


describe("测试coin", function(){
    var _genUserCode;
    describe('第一项：测试传递对象类型的data((data.beginTime <= now) && (data.endTime > now))', function(){
        before(function(){
            _genUserCode = utility.genUserCode;
            utility.genUserCode = function(mydata,userKey, wuid, activityId, callback){
                callback(new Error("error"));
            };
        });
                                                                                                0
        it("应当失败并且返回错误",function(done){
            var data = {
                beginTime : new Date().getTime() - 999999
                ,endTime : new Date().getTime() + 99999999
                ,before : {
                    summary: 'before'
                    ,url: 'h1'
                    ,cover: 'picb'
                    ,title: 'titleb'
                }
                ,running: {
                    summary: 'running'
                    ,url: 'h2'
                    ,cover: 'picr'
                    ,title: 'titler'

                }
                ,after: {
                    summary: 'after'
                    ,url: 'h3'
                    ,cover: 'pica'
                    ,title: 'titlea'

                }
            };

            exchange(data, 1, "userkey", 1, function(err, result){
                should.exist(err);
                err.message.should.equal("error");
                done();
            });
        });

        after(function(){
            utility.genUserCode = _genUserCode;
        })
    });


    describe('第二项：测试传递非对象类型的data((data.beginTime <= now) && (data.endTime > now))', function(){
        before(function(){
            _genUserCode = utility.genUserCode;
            utility.genUserCode = function(mydata,userKey, wuid, activityId, callback){
                callback(new Error("error"));
            };
        });

        it("应当失败并且返回错误",function(done){
            var data = {
                beginTime : new Date().getTime() - 999999
                ,endTime : new Date().getTime() + 99999999
                ,before : {
                    msg: 'before'
                    ,url: 'h1'
                }
                ,running: {
                    msg: 'running'
                    ,url: 'h2'
                }
                ,after: {
                    msg: 'after'
                    ,url: 'h3'
                }
            };
            data.running  =1;

            exchange(data, 1, "userkey", 1, function(err, result){
                should.exist(err);
                err.message.should.equal("cant find url");
                done();
            });
        });

        after(function(){
            utility.genUserCode = _genUserCode;
        })
    });



    describe('第三项：测试传递对象类型的data((data.beginTime <= now) && (data.endTime > now))', function(){
        before(function(){
            _genUserCode = utility.genUserCode;
            utility.genUserCode = function(mydata,userKey, wuid, activityId, callback){
                callback(undefined,"123");
            };
        });

        it("应当成功并且返回错误",function(done){
            var data = {
                beginTime : new Date().getTime() - 999999
                ,endTime : new Date().getTime() + 99999999
                ,before : {
                    summary: 'before'
                    ,url: 'h1'
                    ,cover: 'picb'
                    ,title: 'titleb'
                }
                ,running: {
                    summary: 'running'
                    ,url: 'h2'
                    ,cover: 'picr'
                    ,title: 'titler'

                }
                ,after: {
                    summary: 'after'
                    ,url: 'h3'
                    ,cover: 'pica'
                    ,title: 'titlea'

                }
            };


            exchange(data, 1, "userkey", 1, function(err, result){
                should.not.exist(err);
                result[0].description.should.equal("running");
                result[0].url.should.equal("h2?c=123")
                result[0].picUrl.should.equal("picr")
                result[0].title.should.equal("titler")
                done();
            });
        });

        after(function(){
            utility.genUserCode = _genUserCode;
        })
    });

    describe('第四项：测试传递对象类型的data(data.endTime <= now)', function(){
        before(function(){
            _genUserCode = utility.genUserCode;
            utility.genUserCode = function(mydata,userKey, wuid, activityId, callback){
                callback(undefined,"123");
            };
        });

        it("应当成功并且返回错误",function(done){
            var data = {
                beginTime : new Date().getTime() - 999999
                ,endTime : new Date().getTime() - 99999999
                ,before : {
                    summary: 'before'
                    ,url: 'h1'
                    ,cover: 'picb'
                    ,title: 'titleb'
                }
                ,running: {
                    summary: 'running'
                    ,url: 'h2'
                    ,cover: 'picr'
                    ,title: 'titler'

                }
                ,after: {
                    summary: 'after'
                    ,url: 'h3'
                    ,cover: 'pica'
                    ,title: 'titlea'

                }
            };


            exchange(data, 1, "userkey", 1, function(err, result){
                should.not.exist(err);
                result[0].description.should.equal("after");
                result[0].url.should.equal("h3")
                result[0].picUrl.should.equal("pica")
                result[0].title.should.equal("titlea")
                done();
            });
        });

        after(function(){
            utility.genUserCode = _genUserCode;
        })
    });


    describe('第五项：测试传递对象类型的data(data.beginTime >= now)', function(){
        before(function(){
            _genUserCode = utility.genUserCode;
            utility.genUserCode = function(mydata,userKey, wuid, activityId, callback){
                callback(undefined,"123");
            };
        });

        it("应当成功并且返回错误",function(done){
            var data = {
                beginTime : new Date().getTime() + 999999
                ,endTime : new Date().getTime() + 99999999
                ,before : {
                    summary: 'before'
                    ,url: 'h1'
                    ,cover: 'picb'
                    ,title: 'titleb'
                }
                ,running: {
                    summary: 'running'
                    ,url: 'h2'
                    ,cover: 'picr'
                    ,title: 'titler'

                }
                ,after: {
                    summary: 'after'
                    ,url: 'h3'
                    ,cover: 'pica'
                    ,title: 'titlea'

                }
            };


            exchange(data, 1, "userkey", 1, function(err, result){
                should.not.exist(err);
                result[0].description.should.equal("before");
                result[0].url.should.equal("h1")
                result[0].picUrl.should.equal("picb")
                result[0].title.should.equal("titleb")
                done();
            });
        });

        after(function(){
            utility.genUserCode = _genUserCode;
        })
    });


    describe('第六项：测试传递对象类型的data(data.beginTime >= now)', function(){
        before(function(){
            _genUserCode = utility.genUserCode;
            utility.genUserCode = function(mydata,userKey, wuid, activityId, callback){
                callback(undefined,"123");
            };
        });

        it("应当错误并且返回",function(done){
            var data = {
                beginTime : new Date().getTime() + 999999
                ,endTime : new Date().getTime() + 99999999
                ,before : {
                    summary: 'before'
                    ,cover: 'picb'
                    ,title: 'titleb'
                }
                ,running: {
                    summary: 'running'
                    ,url: 'h2'
                    ,cover: 'picr'
                    ,title: 'titler'

                }
                ,after: {
                    summary: 'after'
                    ,url: 'h3'
                    ,cover: 'pica'
                    ,title: 'titlea'

                }
            };


            exchange(data, 1, "userkey", 1, function(err, result){
                should.exist(err);
                done();
            });
        });

        after(function(){
            utility.genUserCode = _genUserCode;
        })
    });
});