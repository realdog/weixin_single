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
var _util = require('../utility/index.js');
describe('用户库模块',function(){
    var data;
    var userkey = "userkey";
    var wuid = 1;
    var userKey = "userKey";
    var recordId = 1;
    var _query = undefined;
    var _pool = undefined;
    var _checkUser = undefined;
    var _updateUserStatus = undefined;
    var _createUser = undefined;

    describe('第一项：createUser失败_模拟query中连接失败', function(){

        before(function(){
            _query = _util.query;
            _util.query = function(connection, sql, obj, callback){
                callback(new Error("connection fail"), {});
            };
        });

        it('应当连接失败', function(done){
            user.createUser(undefined, 1, "userKey",  function(err, result){
                should.exist(err);
                err.message.should.equal('insert fail');
                done();
            });
        });

        after(function(){
            _util.query = _query;
        });

    });


    describe('第二项：createUser失败', function(){

        before(function(){
            _query = _util.query;
            _util.query = function(connection, sql, obj, callback){
                callback(undefined, {insertId: undefined});
            };
        });

        it('插入错误，应当获取插入id错误', function(done){
            user.createUser(undefined, 1, "userKey", function(err, insertId){
                should.exist(err);
                err.message.should.be.equal('get insert id fail');
                done();
            });
        });

        after(function(){
            _util.query = _query;
        });

    });

    describe('第三项：createUser应当成功', function(){
        it('在没有connection参数的时候操作成功', function(done){
            user.createUser(undefined, 1, "userKey", function(err, insertId){
                should.not.exist(err);
                should.exist(insertId);
                done();
            });
        });
    });

    describe('第四项：createUser应当成功', function(){
        it('在有connection参数的时候操作成功', function(done){
            pool.getConnection(function(err, connection){
                should.not.exist(err);
                user.createUser(connection, 2, "userKey", function(err, insertId){
                    should.not.exist(err);
                    should.exist(insertId);
                    done();
                });
            });
        });
    });


    describe('第五项：checkuser 应当成功', function(){
        it('在有connection参数的时候操作成功', function(done){
            pool.getConnection(function(err, connection){
                should.not.exist(err);
                user.checkUser(connection, 1, "userKey", function(err, result){
                    should.not.exist(err);
                    should.exist(result);
                    result.length.should.be.above(0);
                    done();
                });
            });
        });
    });

    describe('第六项：checkuser 应当成功', function(){
        it('在没有connection参数的时候操作成功', function(done){
            user.checkUser(undefined, 1, "userKey", function(err, result){
                should.not.exist(err);
                should.exist(result);
                result.length.should.be.above(0);
                done();
            });
        });
    });

    describe('第七项：checkuser 应当成功', function(){
        it('应当执行成功，但是木有发现任何符合记录（有connection参数）', function(done){
            user.checkUser(undefined, 1, "userKey1", function(err, result){
                should.not.exist(err);
                should.exist(result);
                result.length.should.be.equal(0);
                done();
            });
        });
    });

    describe('第八项：checkuser 应当成功', function(){
        it('应当执行成功，但是木有发现任何符合记录（没有connection参数）', function(done){
            user.checkUser(undefined, 11, "userKey", function(err, result){
                should.not.exist(err);
                should.exist(result);
                result.length.should.be.equal(0);
                done();
            });
        });
    });

    describe('第九项：updateuser应当失败', function(){
        var _query;
        before(function(){
            _query = _util.query;
            _util.query = function(connection, sql, obj, callback){
                callback(true);
            };
        });

        it('应当更新错误', function(done){
            user.updateUserStatus(undefined, 1, 1,function(err, result){
                should.exist(err);
                err.message.should.be.equal('update fail');
                done();
            });
        });

        after(function(){
            _util.query = _query;
        });

    });


    describe('第十项：updateuser应当失败', function(){
        var _query;
        before(function(){
            _query = _util.query;
            _util.query = function(connection, sql, obj, callback){
                callback(undefined,{affectedRows:2});
            };
        });

        it('更新数据数量出现错误', function(done){
            user.updateUserStatus(undefined, 1, 1,function(err, result){
                should.exist(err);
                err.message.should.be.equal('update too may recorders');
                done();
            });
        });

        after(function(){
            _util.query = _query;
        });

    });


    describe('第十一项：updateuser应当成功', function(){
        it('更新成功', function(done){
            user.updateUserStatus(undefined, 1, 1,function(err, result){
                should.not.exist(err);
                should.exist(result);
                result.affectedRows.should.equal(1);
                done();
            });
        });
    });

    describe("第十二项目测试:updateUserMoney", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(false, {});
                            } else {
                                callback(true, {});
                            }
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("模拟query，应当返回连接错误_updateUserMoneyById", function(done){
            user.updateUserMoney(undefined, {id:1, price:100}, function(err, result){
                should.exist(err);
                err.message.should.equal("get connection fail");
                done();
            });
        });

        after(function(){
            pool = _pool;
        });
    });


    describe("第十三项目测试:updateUserMoney", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(false, {});
                            } else {
                                callback(true, {});
                            }
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("模拟query，应当返回连接错误_updateUserMoneyByUserkeyAndWuid", function(done){
            user.updateUserMoney(undefined, {userKey:1, wuid:1, price:100}, function(err, result){
                should.exist(err);
                err.message.should.equal("get connection fail!");
                done();
            });
        });

        after(function(){
            pool = _pool;
        });
    });


    describe("第十四项目测试:updateUserMoney", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(false, {});
                            } else {
                                callback(true, {});
                            }
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("模拟query，应当返回连接错误", function(done){
            user.updateUserMoney(undefined, {price:100}, function(err, result){
                should.exist(err);
                err.message.should.equal("params error");
                done();
            });
        });

        after(function(){
            pool = _pool;
        });
    });

    describe("第十五项目测试:updateUserMoney", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(new Error("query fail"), []);
                            } else {
                                callback(new Error("query fail"), []);
                            }
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("模拟query，应当返回更新错误_updateUserMoneyById", function(done){
            pool.getConnection(function(err, connection){
                user.updateUserMoney(connection, {id:1, price:100}, function(err, result){
                    should.exist(err);
                    err.message.should.equal("update fail");
                    done();
                });
            });

        });

        after(function(){
            pool = _pool;
        });
    });
    describe("第十五项目测试:updateUserMoney", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("update") >= 0){
                                callback(false, {affectedRows: 0});
                            }
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("模拟query，应当显示没有足够money_updateUserMoneyById", function(done){
            pool.getConnection(function(err, connection){
                user.updateUserMoney(connection, {id:1, price:100}, function(err, result){
                    should.exist(err);
                    err.message.should.equal("have no enough money");
                    done();
                });
            });

        });

        after(function(){
            pool = _pool;
        });
    });


    describe("第十五项目测试:updateUserMoney", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("update") >= 0){
                                callback(false, {affectedRows: 1});
                            }
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("模拟query，应当显示没有足够money_updateUserMoneyById", function(done){
            pool.getConnection(function(err, connection){
                user.updateUserMoney(connection, {id:1, price:100}, function(err, result){
                    should.not.exist(err);
                    result.affectedRows.should.equal(1)
                    done();
                });
            });

        });

        after(function(){
            pool = _pool;
        });
    });



    describe("第十六项目测试:updateUserMoney", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(new Error("query fail"), []);
                            } else {
                                callback(new Error("query fail"), []);
                            }
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("模拟query，应当返回更新错误_updateUserMoneyById", function(done){
            pool.getConnection(function(err, connection){
                user.updateUserMoney(connection, {userKey:1, wuid:1, price:100}, function(err, result){
                    should.exist(err);
                    err.message.should.equal("update fail");
                    done();
                });
            });

        });

        after(function(){
            pool = _pool;
        });
    });
    describe("第十六项目测试:updateUserMoney", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("update") >= 0){
                                callback(false, {affectedRows: 0});
                            }
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("模拟query，应当显示没有足够money_updateUserMoneyById", function(done){
            pool.getConnection(function(err, connection){
                user.updateUserMoney(connection, {userKey:1, wuid:1, price:100}, function(err, result){
                    should.exist(err);
                    err.message.should.equal("have no enough money");
                    done();
                });
            });

        });

        after(function(){
            pool = _pool;
        });
    });


    describe("第十六项目测试:updateUserMoney", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("update") >= 0){
                                callback(false, {affectedRows: 1});
                            }
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("模拟query，应当显示没有足够money__updateUserMoneyByUserkeyAndWuid", function(done){
            pool.getConnection(function(err, connection){
                user.updateUserMoney(connection, {userKey:1, wuid:1, price:100}, function(err, result){
                    should.not.exist(err);
                    result.affectedRows.should.equal(1)
                    done();
                });
            });

        });

        after(function(){
            pool = _pool;
        });
    });



    describe("第十七项：测试money_updateUserMoneyByUserkeyAndWuid", function(){
        before(function(){
            // insert into user set userkey = 'userkey' , wuid = 1 ,gold = 100, silver = 100
        });

        it("更新wuid==1的记录，使得其gold减少10,应当成功", function(done){
            pool.getConnection(function(err, connection){
                user.updateUserMoney(connection, {userKey:'userkey', wuid:1, price:10}, function(err, result){
                    should.not.exist(err);
                    result.affectedRows.should.equal(1)
                    done();
                });
            });
        });

    })

    describe("第十八项：测试money__updateUserMoneyByUserkeyAndWuid", function(){
        before(function(){
            // insert into user set userkey = 'userkey' , wuid = 1 ,gold = 100, silver = 100
        });

        it("更新wuid==1的记录，使得其gold减少100,应当失败", function(done){
            pool.getConnection(function(err, connection){
                user.updateUserMoney(connection, {userKey:'userkey', wuid:1, price:100}, function(err, result){
                    should.exist(err);
                    err.message.should.equal("have no enough money");
                    done();
                });
            });
        });

    });



    describe("第十九项：测试money_updateUserMoneyById", function(){
        before(function(){
            // insert into user set userkey = 'userkey' , wuid = 1 ,gold = 100, silver = 100
        });

        it("更新wuid==1的记录，使得其gold减少10,应当成功", function(done){
            pool.getConnection(function(err, connection){
                user.updateUserMoney(connection, {id:1, price:10}, function(err, result){
                    should.not.exist(err);
                    result.affectedRows.should.equal(1)
                    done();
                });
            });
        });

    })

    describe("第二十项：测试money_updateUserMoneyById", function(){
        before(function(){
            // insert into user set userkey = 'userkey' , wuid = 1 ,gold = 100, silver = 100
        });

        it("更新wuid==1的记录，使得其gold减少100,应当失败", function(done){
            pool.getConnection(function(err, connection){
                user.updateUserMoney(connection, {id:1, price:100}, function(err, result){
                    should.exist(err);
                    err.message.should.equal("have no enough money");
                    done();
                });
            });
        });

    });
});