var should = require('should');
var fs = require('fs');
var rewire = require('rewire');
var mysql = require('mysql');
var _util = require('../utility')
var reg = require('../weixin/rule/reg');
var user = require('../proxy/weixin/database/user.js');
pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'zerotest',
    database  : 'wx'
});
var crypto = require('crypto');

describe('module_reg',function(){
    var data;
    var userkey = "userkey";
    var wuid  = 1;
    var userKey = "userKey";
    var recordId = 1;
    var _query = undefined;
    var _pool = undefined;
    var _user = undefined;
    var _updateUserStatus;
    var _checkUser;
    var _createUser;


    describe('1:测试subscribe', function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            callback(true, {});
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it ("失败：因为获取连接错误", function(done){
            reg.subscribe({},  1, 'userKey', function(err, result){
                should.exist(err);
                err.message.should.equal("get connection fail");
                done();
            });
        });

        after(function(){
            pool = _pool;
        });

    });

    describe('2:测试subscribe', function(){

        before(function(){
             _updateUserStatus = user.updateUserStatus;
             _checkUser = user.checkUser;
             _createUser = user.createUser;

            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
            user.updateUserStatus = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
        });

        it ("错误：因为checkUser错误", function(done){
            reg.subscribe({},  1, 'userKey', function(err, result){
                should.exist(err);
                err.message.should.equal("checkUser fail");
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;

        });

    });


    describe('3:测试subscribe', function(){

        before(function(){
            _updateUserStatus = user.updateUserStatus;
            _checkUser = user.checkUser;
            _createUser = user.createUser;

            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(false, [{id:1}]);
            };
            user.updateUserStatus = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
        });

        it ("失败：当checkUser返回一条记录时，更新失败", function(done){
            reg.subscribe({},  1, 'userKey',function(err, result){
                should.exist(err);
                err.message.should.equal("update fail");
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;

        });

    });

    describe('4:测试subscribe', function(){

        before(function(){
            _updateUserStatus = user.updateUserStatus;
            _checkUser = user.checkUser;
            _createUser = user.createUser;

            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(false, [{id:1}]);
            };
            user.updateUserStatus = function(connection, wuid, userKey, callback) {
                callback(false, {affectedRows:10});
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
        });

        it ("失败:当checkUser查找用户为一条记录，updateUser更新记录不是1条", function(done){
            reg.subscribe({},  1, 'userKey', function(err, result){
                should.exist(err);
                err.message.should.equal("update too may recorders");
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;

        });

    });

    describe('5:测试subscribe', function(){

        before(function(){
            _updateUserStatus = user.updateUserStatus;
            _checkUser = user.checkUser;
            _createUser = user.createUser;

            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(false, [{id:1}]);
            };
            user.updateUserStatus = function(connection, wuid, userKey, callback) {
                callback(false, {affectedRows:1});
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
        });

        it ("成功:模拟checkUser、updateUser，使checkUser检测出一个用户。updateUser更新一条(使用字符串)", function(done){
            reg.subscribe({second:{welcome:"welcome"}},  1, 'userKey', function(err, result){
                should.not.exist(err);
                result.should.equal("welcome");
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;

        });
    });


    describe('5_a:测试subscribe', function(){

        before(function(){
            _updateUserStatus = user.updateUserStatus;
            _checkUser = user.checkUser;
            _createUser = user.createUser;

            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(false, [{id:1}]);
            };
            user.updateUserStatus = function(connection, wuid, userKey, callback) {
                callback(false, {affectedRows:1});
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
        });

        it ("成功:模拟checkUser、updateUser，使checkUser检测出一个用户。updateUser更新一条(使用对象)", function(done){
            reg.subscribe({second:{welcome:{title:"title", summary: "summary", cover:"cover", url:"url"}}},  1, 'userKey', function(err, result){
                should.not.exist(err);
                result.title.should.equal("title");
                result.description.should.equal("summary");
                result.picUrl.should.equal("cover");
                result.url.should.equal("url");
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;

        });
    });

    describe('6:测试subscribe', function(){

        before(function(){
            _updateUserStatus = user.updateUserStatus;
            _checkUser = user.checkUser;
            _createUser = user.createUser;

            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(false, []);
            };
            user.updateUserStatus = function(connection, wuid, userKey, callback) {
                callback(false, {affectedRows:1});
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
        });

        it ("失败：模拟checkUser使得发现用户为0条", function(done){
            reg.subscribe({first:{welcome:"welcome"}},  1, 'userKey', function(err, result){
                should.exist(err);
                err.message.should.equal("insert fail");
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;

        });
    });

    describe('7:测试subscribe', function(){

        before(function(){
            _updateUserStatus = user.updateUserStatus;
            _checkUser = user.checkUser;
            _createUser = user.createUser;

            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(false, []);
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(false, undefined);
            };
        });

        it ("失败:模拟检测出一条用户但是建立用户获得insertId失败", function(done){
            reg.subscribe({first:{welcome:"welcome"}},  1, 'userKey', function(err, result){
                should.exist(err);
                err.message.should.equal("get insert id fail");
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;
        });
    });

    describe('8:测试subscribe', function(){

        before(function(){
            _updateUserStatus = user.updateUserStatus;
            _checkUser = user.checkUser;
            _createUser = user.createUser;

            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(false, []);
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(false, {insertId:1});
            };
        });

        it ("成功:当checkUser返回0条后，createUser建立成功(使用字符串)", function(done){
            reg.subscribe({first:{welcome:"welcome"}},  1, 'userKey', function(err, result){
                should.not.exist(err);
                result.should.equal("welcome");
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;

        });
    });

    describe('8_a:测试subscribe', function(){

        before(function(){
            _updateUserStatus = user.updateUserStatus;
            _checkUser = user.checkUser;
            _createUser = user.createUser;

            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(false, []);
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(false, {insertId:1});
            };
        });

        it ("成功:当checkUser返回0条后，createUser建立成功(使用对象)", function(done){
            reg.subscribe({first:{welcome:{title:"title", summary: "summary", cover:"cover", url:"url"}}},  1, 'userKey', function(err, result){
                should.not.exist(err);
                result.title.should.equal("title");
                result.description.should.equal("summary");
                result.picUrl.should.equal("cover");
                result.url.should.equal("url");
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;

        });
    });

    describe('9:测试unsubscribe', function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            callback(true, {});
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it ("失败:模拟因为获得connection失败", function(done){
            reg.unsubscribe({},  1, 'userKey', function(err){
                should.exist(err);
                err.message.should.equal("get connection fail");
                done();
            });
        });

        after(function(){
            pool = _pool;
        });

    });

    describe('10:测试unsubscribe', function(){
        before(function(){
            _updateUserStatus = user.updateUserStatus;
            _checkUser = user.checkUser;
            _createUser = user.createUser;
            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
            user.updateUserStatus = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
        });




        it ("失败:模拟cheUser返回失败", function(done){
            reg.unsubscribe({},  1, 'userKey', function(err){
                should.exist(err);
                err.message.should.equal("checkUser fail");
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;

        });

    });


    describe('11:测试unsubscribe', function(){

        before(function(){
            _updateUserStatus = user.updateUserStatus;
            _checkUser = user.checkUser;
            _createUser = user.createUser;

            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(false, [{id:1}]);
            };
            user.updateUserStatus = function(connection, wuid, userKey, callback) {
                callback(false, {affectedRows:10});
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
        });

        it ("失败：当checkUser返回1条记录的时候，却更新了多条", function(done){
            reg.unsubscribe({},  1, 'userKey', function(err, result){
                should.exist(err);
                err.message.should.equal("update too may user");
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;
        });

    });



    describe('12:测试unsubscribe ', function(){

        before(function(){
            _updateUserStatus = user.updateUserStatus;
            _checkUser = user.checkUser;
            _createUser = user.createUser;
            user.checkUser = function(connection, wuid, userKey, callback) {
                callback(false, [{id:1}]);
            };
            user.updateUserStatus = function(connection, wuid, userKey, callback) {
                callback(false, {affectedRows:1});
            };
            user.createUser = function(connection, wuid, userKey, callback) {
                callback(true, {});
            };
        });

        it ("成功", function(done){
            reg.unsubscribe({},  1, 'userKey', function(err){
                should.not.exist(err);
                done();
            });
        });

        after(function(){
            user.updateUserStatus = _updateUserStatus ;
            user.checkUser = _checkUser;
            user.createUser = _createUser ;
        });

    });




    describe('13:实际测试subscribe', function(){
        before(function(done){
            _util.query(undefined, "truncate table user", {}, function(err, result){
                should.not.exist(err);
                done();
            });
        });

        it("成功第一次注册", function(done){
            reg.subscribe({first:{welcome:"welcome"}},  1, 'userKey', function(err, result){
                should.not.exist(err);
                result.should.equal("welcome");
                _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                    should.not.exist(err);
                    results.length.should.equal(1);
                    results[0].status.should.equal(1);
                    done();
                });
            });
        });

        after(function(){

        });
    });


    describe('14:实际测试subscribe', function(){
        before(function(done){
            _util.query(undefined, "truncate table user", {}, function(err, result){
                should.not.exist(err);
                done();
            });
        });

        it("成功第二次注册", function(done){
            reg.subscribe({first:{welcome:"welcome"}},  1, 'userKey', function(err, result){
                should.not.exist(err);
                result.should.equal("welcome");
                _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                    should.not.exist(err);
                    results.length.should.equal(1);
                    results[0].status.should.equal(1);
                    reg.subscribe({second:{welcome:"welcome1"}},  1, 'userKey',  function(err, result){
                        should.not.exist(err);
                        result.should.equal("welcome1")
                        done();
                    });
                });
            });
        });

        after(function(){

        });
    });


    describe('15:实际测试unsubscribe', function(){
        before(function(done){
            _util.query(undefined, "truncate table user", {}, function(err){
                should.not.exist(err);
                reg.subscribe({first:{welcome:"welcome"}},  1, 'userKey',function(err, result){
                    should.not.exist(err);
                    result.should.equal("welcome");
                    _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                        should.not.exist(err);
                        results.length.should.equal(1);
                        results[0].status.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("成功第一次注销", function(done){
            reg.unsubscribe({},  1, 'userKey', function(err){
                should.not.exist(err);
                _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                    should.not.exist(err);
                    results.length.should.equal(1);
                    results[0].status.should.equal(0);
                    done();
                });
            });
        });
    });

    describe('16:实际测试unsubscribe', function(){
        before(function(done){
            _util.query(undefined, "truncate table user", {}, function(err, result){
                should.not.exist(err);
                reg.subscribe({first:{welcome:"welcome"}},  1, 'userKey', function(err, result){
                    should.not.exist(err);
                    result.should.equal("welcome");
                    _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                        should.not.exist(err);
                        results.length.should.equal(1);
                        results[0].status.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("成功第一次注销", function(done){
            reg.unsubscribe({},  1, 'userKey', function(err){
                should.not.exist(err);
                _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                    should.not.exist(err);
                    results.length.should.equal(1);
                    results[0].status.should.equal(0);
                    done();
                });
            });
        });

    });


    describe('17:实际混合测试', function(){
        before(function(done){
            _util.query(undefined, "truncate table user", {}, function(err, result){
                should.not.exist(err);
                reg.subscribe({first:{welcome:"welcome"}},  1, 'userKey', function(err, result){
                    should.not.exist(err);
                    result.should.equal("welcome");
                    _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                        should.not.exist(err);
                        results.length.should.equal(1);
                        results[0].status.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("成功注册、注销、注册", function(done){
            reg.unsubscribe({},  1, 'userKey', function(err){
                should.not.exist(err);
                _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                    should.not.exist(err);
                    results.length.should.equal(1);
                    results[0].status.should.equal(0);
                    reg.subscribe({second:{welcome:"welcome1"}},  1, 'userKey', function(err, result){
                        should.not.exist(err);
                        result.should.equal("welcome1");
                        _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                            results.length.should.equal(1);
                            results[0].status.should.equal(1);
                            done();
                        });


                    });
                });
            });
        });
    });
    describe('18:实际混合测试', function(){
        before(function(done){
            _util.query(undefined, "truncate table user", {}, function(err, result){
                should.not.exist(err);
                reg.subscribe({first:{welcome:"welcome"}},  1, 'userKey', function(err, result){
                    should.not.exist(err);
                    result.should.equal("welcome");
                    _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                        should.not.exist(err);
                        results.length.should.equal(1);
                        results[0].status.should.equal(1);
                        done();
                    });
                });
            });
        });

        it("成功注册、注销、注册、注销", function(done){
            reg.unsubscribe({},  1, 'userKey', function(err){
                should.not.exist(err);
                _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                    should.not.exist(err);
                    results.length.should.equal(1);
                    results[0].status.should.equal(0);
                    reg.subscribe({second:{welcome:"welcome1"}},  1, 'userKey', function(err, result){
                        should.not.exist(err);
                        result.should.equal("welcome1");
                        _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                            results.length.should.equal(1);
                            results[0].status.should.equal(1);
                            reg.unsubscribe({},  1, 'userKey', function(err){
                                should.not.exist(err);
                                _util.query(undefined, "select * from user where wuid = ? and userKey = ?", [1, 'userKey'], function(err, results){
                                    results.length.should.equal(1);
                                    results[0].status.should.equal(0);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});