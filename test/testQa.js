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
var qa = require('../weixin/rule/mission/qa');

describe("测试qa", function(){
    describe('第一项：测试传递对象类型的data((data.beginTime <= now) && (data.endTime > now))', function(){
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
            data.before = 1;
            data.running = 2;
            data.after = 3;
            qa(data, 1, "userkey", 1, function(err, result){
                should.exist(err);
                err.message.should.equal("msg is not object");
                result.should.equal(data.running);
                done();
            });
        });
    });


    describe('第二项：测试传递对象类型的data(data.beginTime >= now)', function(){
        it("应当失败并且返回错误",function(done){
            var data = {
                beginTime : new Date().getTime() + 999999
                ,endTime : new Date().getTime() - 99999999
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
            data.before = 1;
            data.running = 2;
            data.after = 3;
            qa(data, 1, "userkey", 1, function(err, result){
                should.exist(err);
                err.message.should.equal("msg is not object");
                result.should.equal(data.before);
                done();
            });
        });
    });


    describe('第三项：测试传递对象类型的data(data.endTime <= now)', function(){
        it("应当失败并且返回错误",function(done){
            var data = {
                beginTime : new Date().getTime() - 999999
                ,endTime : new Date().getTime() - 99
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
            data.before = 1;
            data.running = 2;
            data.after = 3;
            qa(data, 1, "userkey", 1, function(err, result){
                should.exist(err);
                err.message.should.equal("msg is not object");
                result.should.equal(data.after);
                done();
            });
        });
    });

    describe('第四项：测试传递对象类型的data((data.beginTime <= now) && (data.endTime > now))，不传递url', function(){
        it("应当失败并且返回错误",function(done){
            var data = {
                beginTime : new Date().getTime() - 999999
                ,endTime : new Date().getTime() + 99999999
                ,before : {
                    msg: 'before'

                }
                ,running: {
                    msg: 'running'

                }
                ,after: {
                    msg: 'after'

                }
            };

            qa(data, 1, "userkey", 1, function(err, result){
                should.exist(err);
                err.message.should.equal("cant find url");
                result.should.equal(data.running);
                done();
            });
        });
    });

    describe('第五项：测试传递对象类型的data(data.beginTime >= now)', function(){
        it("应当失败并且返回错误",function(done){
            var data = {
                beginTime : new Date().getTime() + 999999
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

            qa(data, 1, "userkey", 1, function(err, result){
                should.not.exist(err);
                result.should.equal(data.before);
                done();
            });
        });
    });

    describe('第六项：测试传递对象类型的data(data.endTime <= now)', function(){
        it("应当失败并且返回错误",function(done){
            var data = {
                beginTime : new Date().getTime() - 999999
                ,endTime : new Date().getTime() - 99
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

            qa(data, 1, "userkey", 1, function(err, result){
                should.not.exist(err);
                result.should.equal(data.after);
                done();
            });
        });
    });

    describe('第七项：测试传递对象类型的data((data.beginTime <= now) && (data.endTime > now))，传递url', function(){
        it("应当成功并修改url",function(done){
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

            qa(data, 21, "userkey23", 3, function(err, result){
                should.not.exist(err);
                result.should.equal(data.running);
                (/^h2\?c\=[a-z0-9]{32}$/.test(data.running.url)).should.be.ok;
                done();
            });
        });
    });
});