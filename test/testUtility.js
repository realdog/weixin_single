var should = require('should');
var fs = require('fs');
var muk = require('muk');
var rewire = require('rewire');
var mysql = require('mysql');
pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'zerotest',
    database  : 'wx'
});

var crypto = require('crypto');
var _util = require('../utility');

describe('模块util测试',function(){
    var mydata = '{"percent":99,"prize":{"prize1":"11","amount1":"11","prize2":"11","amount2":"11","prize3":"11","amount3":"12","totalPeople":"111"},"beginTime":1369976400000,"endTime":1369994400000,"amount":10000,"timesPreUser":10,"before":{"title":"活动即将开始","cover":"./upload/25/13699701440512.jpg","summary":"活动说明","url":"","tips":"亲，活动还没有开始"},"running":{"title":"中奖公告","cover":"shoper/coupon/d-02.jpg","summary":"你获得优惠说明，使用权限说明","url":"","tips":"亲，抢券活动每人只能抽一次哦。"},"after":{"title":"活动已经结束","cover":"shoper/coupon/d-03.jpg","summary":"亲，下次早点哦~请继续关注我们的后续活动","url":"","tips":""}}';
    describe('第一项：测试query',function(){
        var _Date;
        var _pool
        before(function(){
            _Date = Date;
            Date = function(){
                this.getTime = function(){
                    return 123123123;
                };
            };
            Date.now = _Date.now;
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {});
                }
            };
        });

        it('测试query方法：会因为获取连接错误而失败', function(done){
            _util.query(undefined, "", {}, function(err, result){
                arguments.length.should.equal(1);
                should.exist(err);
                done();
            });
        });

        after(function(){
            pool = _pool;
            Date = _Date;
        });
    });


    describe('第二项：测试query',function(){
        var _Date;
        var _pool
        before(function(){
            _Date = Date;
            Date = function(){
                this.getTime = function(){
                    return 123123123;
                };
            };
            Date.now = _Date.now;
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
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

        it('模拟mysql的query使得util.query获取数据错误', function(done){
            _util.query(undefined, "", {}, function(err, result){
                should.exist(err);
                done();
            });
        });

        after(function(){
            pool = _pool;
            Date = _Date;
        });
    });


    describe('第三项：测试query',function(){
        var _Date;
        var _pool
        before(function(){
            _Date = Date;
            Date = function(){
                this.getTime = function(){
                    return 123123123;
                };
            };
            Date.now = _Date.now;
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
                        query: function(sql, obj, callback){
                            callback(undefined, {msg:'ok'});
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it('query方法应当正确获得数据', function(done){
            _util.query(undefined, "", {}, function(err, result){
                should.not.exist(err);
                result.msg.should.equal("ok");
                done();
            });
        });

        after(function(){
            pool = _pool;
            Date = _Date;
        });
    });

    describe('第四项：测试清空表',function(){
        var _Date;
        var _pool
        before(function(done){
            pool.getConnection(function(err, connection){
                should.not.exist(err);
                connection.query("insert into identifier set code='code', wuid=1, userkey = 'userkey', activity_id = '1', status =1", function(err, result){
                    connection.end();
                    should.not.exist(err);
                    should.exist(result.insertId);
                    done();
                });
            });
        });

        it('不使用connection参数,真实清空表identifier', function(done){
            _util.query(undefined, "truncate table identifier", {}, function(err, result){
                should.not.exist(err);
                pool.getConnection(function(err, connection){
                    connection.end();
                    should.not.exist(err);
                    _util.query(undefined, "select count(*) as abc from identifier ", {}, function(err, results){
                        should.not.exist(err);
                        results.length.should.equal(1);
                        results[0]["abc"].should.equal(0);
                        done();
                    });
                });
            });
        });

    });


    describe('第五项：成功清空表',function(){
        var _Date;
        var _pool
        before(function(done){
            pool.getConnection(function(err, connection){
                should.not.exist(err);
                connection.query("insert into identifier set code='code', wuid=1, userkey = 'userkey', activity_id = '1', status =1", function(err, result){
                    should.not.exist(err);
                    should.exist(result.insertId);
                    connection.end();
                    done();
                });
            });
        });

        it('通过已有的connection参数调用query以成功清除表', function(done){
            pool.getConnection(function(err, connection){
                should.not.exist(err);
                _util.query(connection, "truncate table identifier", {}, function(err, result){
                    should.not.exist(err);
                    _util.query(connection, "select count(*) as abc from identifier ", {}, function(err, results){
                        should.not.exist(err);
                        results.length.should.equal(1);
                        results[0]["abc"].should.equal(0);
                        _util.query(connection, "select abc from abc", {}, function(err,results){
                            connection.end();
                            should.exist(err);
                            done();
                        });
                    });
                });
            });

        });

        after(function(){

        });
    });


    describe('第六项：清空表测试',function(){
        var _Date;
        var _pool
        before(function(done){
            pool.getConnection(function(err, connection){
                should.not.exist(err);
                connection.query("insert into identifier set code='code', wuid=1, userkey = 'userkey', activity_id = '1', status =1", {}, function(err, result){
                    connection.end();
                    should.not.exist(err);
                    should.exist(result.insertId);
                    done();
                });
            });
        });

        it('不使用connection参数清空表，应当成功', function(done){
            pool.getConnection(function(err, connection){
                connection.end();
                should.not.exist(err);
                _util.query(undefined, "truncate table identifier", {}, function(err, result){
                    should.not.exist(err);
                    _util.query(undefined, "select count(*) as abc from identifier ", {}, function(err, results){
                        should.not.exist(err);
                        results.length.should.equal(1);
                        results[0]["abc"].should.equal(0);
                        _util.query(undefined, "select abc from abc", {}, function(err,results){
                            should.exist(err);
                            done();
                        })
                    });
                });
            });

        });

    });


    describe('第七项：测试更新表',function(){
        var _Date;
        var _pool
        before(function(done){
            pool.getConnection(function(err, connection){
                should.not.exist(err);
                connection.query("insert into identifier set code='code', wuid=1, userkey = 'userkey', activity_id = '1', status =1", {}, function(err, result){
                    connection.end();
                    should.not.exist(err);
                    should.exist(result.insertId);
                    done();
                });
            });
        });

        it('通过使用已经存在的connection参数成功的update数据', function(done){
            pool.getConnection(function(err, connection){
                should.not.exist(err);
                _util.query(connection, "update identifier set code = 'code1', wuid=11, userkey='userkey1', activity_id = '2', status =0 where code = 'code'", {}, function(err, result){
                    should.not.exist(err);
                    result.affectedRows.should.equal(1);
                    _util.query(connection, "select * from identifier where code='code1'", {}, function(err, results){
                        should.not.exist(err);
                        results.length.should.equal(1);
                        results[0]["code"].should.equal('code1');
                        results[0]["wuid"].should.equal(11);
                        results[0]["userkey"].should.equal('userkey1');
                        results[0]["activity_id"].should.equal(2);
                        results[0]["status"].should.equal(0);
                        connection.end();
                        done();
                    });
                });
            });
        });

        after(function(done){
            _util.query(undefined, "truncate table identifier", {}, function(err, result){
                should.not.exist(err);
                done();
            })
        });
    });


    describe('第八项：测试更新表',function(){
        var _Date;
        var _pool
        before(function(done){
            pool.getConnection(function(err, connection){
                should.not.exist(err);
                connection.query("insert into identifier set code='code', wuid=1, userkey = 'userkey', activity_id = '1', status =1", {}, function(err, result){
                    should.not.exist(err);
                    should.exist(result.insertId);
                    connection.end();
                    done();
                });
            });
        });

        it('不使用connection参数而调用query更新表', function(done){
            //pool.getConnection(function(err, connection){
            //should.not.exist(err);
            _util.query(undefined, "update identifier set code = 'code1', wuid=11, userkey='userkey1', activity_id = '2', status =0 where code = 'code'", {}, function(err, result){
                should.not.exist(err);
                result.affectedRows.should.equal(1);
                _util.query(undefined, "select * from identifier where code='code1'",{},  function(err, results){
                    should.not.exist(err);
                    results.length.should.equal(1);
                    results[0]["code"].should.equal('code1');
                    results[0]["wuid"].should.equal(11);
                    results[0]["userkey"].should.equal('userkey1');
                    results[0]["activity_id"].should.equal(2);
                    results[0]["status"].should.equal(0);
                    done();
                });
            });
            // });
        });

        after(function(){

        });
    });


    describe('第九项：测试genUserCode', function(){
        var _Date;
        var _pool
        before(function(){
            _Date = Date;
            Date = function(){
                this.getTime = function(){
                    return 123123123;
                };
            };
            Date.now = _Date.now;
        });
        it ('应当成功调用genUserCode', function(done){
            var str = 'userkey' + 1 + "100" + "123123123";
            var hash =crypto.createHash("md5");
            hash.update(str);
            var hashmsg = hash.digest('hex');
            var code = hashmsg.toString();
            _util.genUserCode(mydata, 'userkey', 1, 100, function(err , returnCode){
                should.not.exist(err);              ;
                (returnCode == code).should.equal(true);
                pool.getConnection(function(err, connection){
                    connection.end();
                    if (!err) {
                        connection.query("select * from identifier where code = ?", [code], function(err, results){
                            ((!err) && (results.length  == 1) && (results[0].code == code ) && (results[0].wuid == 1) && (results[0].userkey == "userkey") && (results[0].activity_id == "100")   && (results[0].status == 1)).should.equal(true);
                            done();
                        });
                    }
                });
            });
        });
        after(function(){
            Date = _Date;
        });


    });

    describe('第十项：测试genUserCode', function(){
        var _Date;
        var _pool
        before(function(){
            _Date = Date;
            Date = function(){
                this.getTime = function(){
                    return 123123123;
                };
            };
            Date.now = _Date.now;
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {});
                }
            };
        });
        it ('模拟获取连接错误使得genUserCode返回错误', function(done){
            var str = 'userkey' + 1 + "100" + "123123123";
            var hash =crypto.createHash("md5");
            hash.update(str);
            var hashmsg = hash.digest('hex');
            var code = hashmsg.toString();
            _util.genUserCode(mydata, 'userkey', 1, 100, function(err , returnCode){
                should.exist(err);
                done();
            });
        });
        after(function(){
            pool = _pool;
            Date = _Date;
        });
    });

    describe('第十一项：测试genUserCode', function(){
        var _Date;
        var _pool
        before(function(){
            _Date = Date;
            Date = function(){
                this.getTime = function(){
                    return 123123123;
                };
            };
            Date.now = _Date.now;
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(true, {});
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(true, {});
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
        it ('模拟select错误使得genUserCode失败', function(done){
            var str = 'userkey' + 1 + "100" + "123123123";
            var hash =crypto.createHash("md5");
            hash.update(str);
            var hashmsg = hash.digest('hex');
            var code = hashmsg.toString();
            _util.genUserCode(mydata, 'userkey', 1, 100, function(err , returnCode){
                should.exist(err);
                err.message.should.be.equal('select fail')
                done();
            });
        });
        after(function(){
            pool = _pool;
            Date = _Date;
        });
    });

    describe('第十二项：测试genUserCode', function(){
        var _Date;
        var _pool
        before(function(){
            _Date = Date;
            Date = function(){
                this.getTime = function(){
                    return 123123123;
                };
            };
            Date.now = _Date.now;
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(false, []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(true, {});
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
        it ('模拟insert错误使得genUserCode失败_1', function(done){
            var str = 'userkey' + 1 + "100" + "123123123";
            var hash =crypto.createHash("md5");
            hash.update(str);
            var hashmsg = hash.digest('hex');
            var code = hashmsg.toString();
            _util.genUserCode(mydata, 'userkey', 1, 100, function(err , returnCode){
                should.exist(err);
                (returnCode == code).should.equal(true);
                done();
            });
        });
        after(function(){
            pool = _pool;
            Date = _Date;
        });
    });



    describe('第十三项：测试genUserCode', function(){
        var _Date;
        var _pool
        before(function(){
            _Date = Date;
            Date = function(){
                this.getTime = function(){
                    return 123123123;
                };
            };
            Date.now = _Date.now;
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(false, []);
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
        it ('模拟insert错误使得genUserCode失败_2', function(done){
            var str = 'userkey' + 1 + "100" + "123123123";
            var hash =crypto.createHash("md5");
            hash.update(str);
            var hashmsg = hash.digest('hex');
            var code = hashmsg.toString();
            _util.genUserCode(mydata, 'userkey', 1, 100, function(err , returnCode){
                should.exist(err);
                err.message.should.equal("insertId lost");
                (returnCode == code).should.equal(true);
                done();
            });
        });
        after(function(){
            pool = _pool;
            Date = _Date;
        });
    });


    describe('第十四项：测试genUserCode', function(){
        var _Date;
        var _pool
        before(function(){
            _Date = Date;
            Date = function(){
                this.getTime = function(){
                    return 123123123;
                };
            };
            Date.now = _Date.now;
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(false, []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(false, {insertId:1});
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
        it ('模拟insert成功', function(done){
            var str = 'userkey' + 1 + "100" + "123123123";
            var hash =crypto.createHash("md5");
            hash.update(str);
            var hashmsg = hash.digest('hex');
            var code = hashmsg.toString();
            _util.genUserCode(mydata, 'userkey', 1, 100, function(err , returnCode){
                should.not.exist(err);
                (returnCode == code).should.equal(true);
                done();
            });
        });
        after(function(){
            pool = _pool;
            Date = _Date;
        });
    });


    describe('第十五项：测试genUserCode', function(){
        var _Date;
        var _pool
        before(function(){
            _Date = Date;
            Date = function(){
                this.getTime = function(){
                    return 123123123;
                };
            };
            Date.now = _Date.now;
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(false, [{code:123},{code:423}]);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(false, {insertId:1});
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
        it ('模拟select到多条有相同条件的id以及只有一个相同条件id', function(done){
            var str = 'userkey' + 1 + "100" + "123123123";
            var hash =crypto.createHash("md5");
            hash.update(str);
            var hashmsg = hash.digest('hex');
            var code = hashmsg.toString();
            _util.genUserCode(mydata, 'userkey', 1, 100, function(err , returnCode){
                should.not.exist(err);
                (returnCode).should.equal(123);
                pool = {
                    getConnection: function(callback){
                        callback(false, {
                            query: function(sql, obj, callback){
                                if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(false, [{code:456}]);
                                } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                    callback(false, {insertId:1});
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
                _util.genUserCode(mydata, 'userkey', 1, 100, function(err , returnCode){
                    should.not.exist(err);
                    (returnCode).should.equal(456);
                    done();
                });

            });
        });
        after(function(){
            pool = _pool;
            Date = _Date;
        });
    });

    describe("第十六项:测试getActivityTypeByKeywordAndWuid", function(){
        var _tempId = undefined;
        before(function(done){
            var sql = "insert into biz_activity set ?";
            var obj = {
                config: '{"activity_type":"reg","sub_type":"subscribe","first":{"welcome":"欢迎关注我哦"},"second":{"welcome":"欢迎关注我哦@@"}}'
                ,wuid: 1
                ,keyword: 'subscribe'
                ,status : 1
            };

            _util.query(undefined, sql, obj, function(err, result){
                should.not.exist(err);
                should.exist(result);
                result.insertId.should.not.equal(0);
                _tempId = result.insertId;
                done();
            });
        });

        it("应当可以获得data和id号", function(done){
            _util.getActivityTypeByKeywordAndWuid('subscribe',1, function(err, result){
                should.not.exist(err);

                should.exist(result[0].data);
                should.exist(result[0].id);

                result[0].id.should.equal(_tempId);
                done();
            });
        });

        after(function(done){
            var sql = "delete  from  biz_activity where  wuid = ? AND keyword = ? AND status= 1";
            var obj = [1, 'subscribe']

            _util.query(undefined, sql, obj, function(err, result){
                should.not.exist(err);
                done();
            });
        })
    });


    describe("第十七项:测试getSN", function(){
        it ("传递空data，应当报错", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN({}, {}, 45, function(err ,result){
                        should.exist(err);
                        err.message.should.equal("NULL data");
                        done();
                    });
                }
            });


        });
    });


    describe("第十八项:测试getSN", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(true, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(false, [{code:123},{code:423}]);
                                } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                    callback(false, {insertId:1});
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟getconnection失败，应当报错", function(done){
            _util.getSN(undefined, {name:1}, 45, function(err ,result){
                should.exist(err);
                err.message.should.equal("get connection fail");
                done();
            });

        });

        after(function(){
            pool = _pool;
        })
    });

    describe("第十九项:测试getSN", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(false, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("update") >= 0) {
                                    process.nextTick(function(){
                                        callback(new Error(""));
                                    });
                                } else if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(false, {insertId:1});
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟update失败，应当报错", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, {name:1}, 45, function(err ,result){
                        should.exist(err);
                        err.message.should.equal("update fail");
                        done();
                    });
                }
            });


        });

        after(function(){
            pool = _pool;
        })
    });


    describe("第二十项:测试getSN", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(false, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("update") >= 0) {
                                    process.nextTick(function(){
                                        callback(undefined, {affectedRows:2});
                                    });
                                } else if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(false, {insertId:1});
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟update更新了多条记录，应当报错", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, {name:1}, 45, function(err ,result){
                        should.exist(err);
                        err.message.should.equal("update too many recorder");
                        result.affectedRows.should.equal(2);
                        done();
                    });
                }
            });


        });

        after(function(){
            pool = _pool;
        })
    });


    describe("第二十一项:测试getSN", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(false, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("update") >= 0) {
                                    process.nextTick(function(){
                                        callback(undefined, {affectedRows:0});
                                    });
                                } else if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(false, {insertId:1});
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟update更新了0条记录，应当报错", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, {name:1},45, function(err ,result){
                        should.exist(err);
                        err.message.should.equal("update zero recorder")
                        result.affectedRows.should.equal(0);
                        done();
                    });

                }
            });

        });

        after(function(){
            pool = _pool;
        })
    });


    describe("第二十二项:测试getSN", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(false, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("update") >= 0) {
                                    process.nextTick(function(){
                                        callback(undefined, {affectedRows:1});
                                    });
                                } else if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(true, []);
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟select错误，应当报错", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, {name:1}, 45, function(err ,result){
                        should.exist(err);
                        err.message.should.equal("select error");
                        done();
                    });
                }
            });


        });

        after(function(){
            pool = _pool;
        })
    });

    describe("第二十三项:测试getSN", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(false, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("update") >= 0) {
                                    process.nextTick(function(){
                                        callback(undefined, {affectedRows:1});
                                    });
                                } else if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(undefined, []);
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟select了0条记录，应当报错", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, {name:1}, 45, function(err ,result){
                        should.not.exist(err);
                        result.should.equal(0);
                        done();
                    });
                }
            });


        });

        after(function(){
            pool = _pool;
        })
    });

    describe("第二十四项:测试getSN", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(false, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("update") >= 0) {
                                    process.nextTick(function(){
                                        callback(undefined, {affectedRows:1});
                                    });
                                } else if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(undefined, [{},{}]);
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟select了多条记录，应当报错", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, {name:1}, 45, function(err ,result){
                        should.exist(err);
                        err.message.should.equal("select too many recorder");
                        result.should.equal(2);
                        done();
                    });
                }
            });


        });

        after(function(){
            pool = _pool;
        })
    });


    describe("第二十五项:测试getSN", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(false, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("update") >= 0) {
                                    process.nextTick(function(){
                                        callback(undefined, {affectedRows:1});
                                    });
                                } else if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(undefined, [{sn: "abc", id: 123}]);
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟select了一条记录，应当成功", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, {name:1}, 45, function(err ,result){
                        should.not.exist(err);
                        result["sn"].should.equal("abc");
                        result["id"].should.equal(123);
                        done();
                    });
                }
            });


        });

        after(function(){
            pool = _pool;
        })
    });

    describe("第二十六项:实际数据测试getSN", function(){
        var _sn;
        var _id;
        before(function(done){
            var sql = "insert into biz_sn set baid = 99999, sn = '123123123', flag = 0";
            _util.query(undefined, sql, [], function(err, result){
                if (!err && !!result.insertId) {
                    _sn = "123123123";
                    _id = result.insertId;
                }
                done();
            });
        });

        it ("select了一条记录，应当成功", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, {name:"1", mobile:"1302102821", userkey:"userkey1"}, 99999, function(err ,result){
                        connection.end();
                        should.not.exist(err);
                        result["sn"].should.equal(_sn);
                        result["id"].should.equal(_id);
                        done();
                    });
                }
            });

        });

        after(function(done){
            var sql = "delete  from  biz_sn where baid = 99999";
            _util.query(undefined, sql, [], function(err, result){
                if (!(!err && !!result.affectedRows)) {
                    throw new Error("delete fail");
                }
                done();
            });
        })
    });

    describe("第二十七项:实际数据测试getSN", function(){
        var _sn;
        var _id;
        before(function(done){
            var sql = "insert into biz_sn set baid = 99999, sn = '123123123', flag = 0";
            _util.query(undefined, sql, [], function(err, result){
                if (!err && !!result.insertId) {
                    _sn = "123123123";
                    _id = result.insertId;
                }
                done();
            });
        });

        it ("update userkey，应当成功", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, { userkey:"userkey1"}, 99999, function(err ,result){
                        connection.end();
                        should.not.exist(err);
                        result["sn"].should.equal(_sn);
                        result["id"].should.equal(_id);

                        done();
                    });
                }
            });

        });

        after(function(done){
            var sql = "delete  from  biz_sn where baid = 99999";
            _util.query(undefined, sql, [], function(err, result){
                if (!(!err && !!result.affectedRows)) {
                    throw new Error("delete fail");
                }
                done();
            });
        })
    });
    describe("第二十八项:实际数据测试getSN", function(){
        var _sn;
        var _id;
        before(function(done){
            var sql = "insert into biz_sn set baid = 99999, sn = '123123123', flag = 0";
            _util.query(undefined, sql, [], function(err, result){
                if (!err && !!result.insertId) {
                    _sn = "123123123";
                    _id = result.insertId;
                }
                done();
            });
        });


        it ("update n/p，应当成功", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, { name:"1", mobile:"1302102821"}, 99999, function(err ,result){
                        connection.end();
                        should.not.exist(err);
                        result["sn"].should.equal(_sn);
                        result["id"].should.equal(_id);

                        done();
                    });
                }
            });

        });

        after(function(done){
            var sql = "delete  from  biz_sn where baid = 99999";
            _util.query(undefined, sql, [], function(err, result){
                if (!(!err && !!result.affectedRows)) {
                    throw new Error("delete fail");
                }
                done();
            });
        })
    });


    describe("第二十八项:测试getSN_修改逻辑_1", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(false, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("update") >= 0) {
                                    process.nextTick(function(){
                                        callback(undefined, {affectedRows:1});
                                    });
                                } else if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(undefined, [{sn:"abc",id:123}]);
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟select了一条记录，应当成功", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, "userkey", 45, function(err ,result){
                        should.not.exist(err);
                        result["sn"].should.equal("abc");
                        result["id"].should.equal(123);
                        done();
                    });
                }
            });


        });

        after(function(){
            pool = _pool;
        })
    });


    describe("第二十八项:测试getSN_修改逻辑_2", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(false, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("update") >= 0) {
                                    process.nextTick(function(){
                                        callback(undefined, {affectedRows:1});
                                    });
                                } else if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(undefined, [{sn:"abc",id:123},{sn:'abcd', id:3}]);
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟select了多条记录，应当返回成功", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, "userkey", 45, function(err ,result){
                        should.exist(err);
                        err.message.should.equal("find too many recorder");
                        result.should.equal(2);
                        done();
                    });
                }
            });


        });

        after(function(){
            pool = _pool;
        })
    });


    describe("第二十八项:测试getSN_修改逻辑_3", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(false, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("update") >= 0) {
                                    process.nextTick(function(){
                                        callback(undefined, {affectedRows:1});
                                    });
                                } else if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(undefined, []);
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟select了0条记录，应当返回失败", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, "userkey", 45, function(err ,result){
                        should.exist(err);
                        err.message.should.equal("find zero recorder");
                        result.should.equal(0);
                        done();
                    });
                }
            });


        });

        after(function(){
            pool = _pool;
        })
    });


    describe("第二十八项:测试getSN_修改逻辑_4", function(){
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    process.nextTick(function(){
                        callback(false, {
                            query: function( sql, obj, callback){
                                if (sql.toLowerCase().indexOf("update") >= 0) {
                                    process.nextTick(function(){
                                        callback(undefined, {affectedRows:1});
                                    });
                                } else if (sql.toLowerCase().indexOf("select") >= 0) {
                                    callback(true, []);
                                } else {
                                    callback(true, {});
                                }

                            },
                            end: function(){
                                return;
                            }
                        });
                    });

                }
            };
        });

        it ("模拟select失败，应当返回失败", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, "userkey", 45, function(err ,result){
                        should.exist(err);
                        err.message.should.equal("select error");
                        done();
                    });
                }
            });


        });

        after(function(){
            pool = _pool;
        })
    });


    describe("第二十八项:测试getSN_修改逻辑_5", function(done){
        before(function(done){
            var sql = "insert into biz_sn set sid = 99999, sn='123', baid = 99999, userkey='userkey'";
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("28_5 before fail");
                } else {
                    _util.query(connection, sql, [], function(err, result){
                        connection.end();
                        if (!!err) {
                            throw new Error("28_5 before query fail");
                        } else {
                            result.affectedRows.should.equal(1);
                            done();
                        }
                    });
                }
            });
        });

        it ("实际数据测试，应当返回成功", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, "userkey", 99999, function(err ,result){
                        connection.end();
                        should.not.exist(err);
                        result.sn.should.equal("123");
                        done();
                    });
                }
            });
        });

        after(function(done){
            var sql = "delete from  biz_sn where sid = 99999";
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("28_5 before fail");
                } else {
                    _util.query(connection, sql, [], function(err, result){
                        connection.end();
                        if (!!err) {
                            throw new Error("28_5 it fail");
                        } else {
                            result.affectedRows.should.equal(1)
                            done();
                        }
                    });
                }
            });
        })
    });


    describe("第二十八项:测试getSN_修改逻辑_6", function(done){
        before(function(done){
            var sql = "insert into biz_sn set sid = 99999, sn='123', baid = 99998, userkey='userkey'";
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("28_5 before fail");
                } else {
                    _util.query(connection, sql, [], function(err, result){
                        if (!!err) {
                            throw new Error("28_5 before query fail");
                        } else {
                            result.affectedRows.should.equal(1);
                            var sql = "insert into biz_sn set sid = 99998, sn='123', baid = 99998, userkey='userkey'";
                            _util.query(connection, sql, [], function(err, result){
                                connection.end();
                                if (!err) {
                                    done();
                                } else {
                                    console.log(err);
                                    throw new Error("28_5 before query twice fail");
                                };
                        })

                        }
                    });
                }
            });
        });

        it ("实际数据测试，找到>1条数据,应当返回失败", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, "userkey", 99998, function(err ,result){
                        connection.end();
                        should.exist(err);
                        err.message.should.equal("find too many recorder");
                        result.should.equal(2);
                        done();
                    });
                }
            });
        });

        after(function(done){
            var sql = "delete from  biz_sn where baid >= 99998";
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("28_5 after getconnection fail");
                } else {
                    _util.query(connection, sql, [], function(err, result){
                        connection.end();
                        if (!!err) {
                            throw new Error("28_5 after fail");
                        } else {
                            result.affectedRows.should.equal(2)
                            done();
                        }
                    });
                }
            });
        })
    });


    describe("第二十八项:测试getSN_修改逻辑_7", function(done){


        it ("实际数据测试，找到零条数据，应当返回失败", function(done){
            pool.getConnection(function(err, connection){
                if (!!err) {
                    throw new Error("connection fail");
                } else {
                    _util.getSN(connection, "userkey", 999, function(err ,result){
                        connection.end();
                        should.exist(err);
                        err.message.should.equal("find zero recorder");
                        done();
                    });
                }
            });
        });

    });


    describe("第二十九项测试:getDataFromIdentifierByCWA", function(){

        it("实际数据测试,不传递connection,应当导致失败", function(done){
            _util.getDataFromIdentifierByCWA(undefined, 1, 2, 3, function(err, results){
                should.exist(err);
                err.message.should.equal("get connection fail");
                done();
            });
        });
    });

    describe("第三十项目测试:getDataFromIdentifierByCWA", function(){
        it("实际数据测试,不传递正确参数,应当导致失败", function(done){
            pool.getConnection(function(err, connection){
                _util.getDataFromIdentifierByCWA(connection, 1, undefined, null, function(err, results){
                    connection.end();
                    should.exist(err);
                    err.message.should.equal("invalid params");
                    done();
                });
            });

        });
    });

    describe("第三十一项目测试:getDataFromIdentifierByCWA", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
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

        it("实际数据测试,传递正确参数,模拟查询失败，应当失败", function(done){
            pool.getConnection(function(err, connection){
                _util.getDataFromIdentifierByCWA(connection, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 100, function(err, results){
                    connection.end();
                    should.exist(err);
                    err.message.should.equal("query fail");
                    done();
                });
            });

        });

        after(function(){
            pool = _pool;
        });
    });

    describe("第三十二项目测试:getDataFromIdentifierByCWA", function(){

        it("实际数据测试,传递正确参数,应当成功", function(done){
            pool.getConnection(function(err, connection){
                _util.getDataFromIdentifierByCWA(connection, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 100, function(err, results){
                    connection.end();
                    should.not.exist(err);
                    results[0]["data"].should.equal('{"percent":99,"prize":{"prize1":"11","amount1":"11","prize2":"11","amount2":"11","prize3":"11","amount3":"12","totalPeople":"111"},"beginTime":1369976400000,"endTime":1369994400000,"amount":10000,"timesPreUser":10,"before":{"title":"活动即将开始","cover":"./upload/25/13699701440512.jpg","summary":"活动说明","url":"","tips":"亲，活动还没有开始"},"running":{"title":"中奖公告","cover":"shoper/coupon/d-02.jpg","summary":"你获得优惠说明，使用权限说明","url":"","tips":"亲，抢券活动每人只能抽一次哦。"},"after":{"title":"活动已经结束","cover":"shoper/coupon/d-03.jpg","summary":"亲，下次早点哦~请继续关注我们的后续活动","url":"","tips":""}}');
                    results[0]["userkey"].should.equal("userkey");
                    done();
                });
            });

        });
    });


    describe("第三十三项测试:userJoinActivity", function(){

        it("实际数据测试,不传递connection,应当导致失败", function(done){
            _util.userJoinActivity(undefined, 1, 2, 3, function(err, results){
                should.exist(err);
                err.message.should.equal("get connection fail");
                done();
            });
        });
    });

    describe("第三十四项目测试:userJoinActivity", function(){
        it("实际数据测试,不传递正确参数,应当导致失败", function(done){
            pool.getConnection(function(err, connection){
                _util.userJoinActivity(connection, "1", undefined, null, function(err, results){
                    connection.end();
                    should.exist(err);
                    err.message.should.equal("invalid params");
                    done();
                });
            });

        });
    });

    describe("第三十五项目测试:userJoinActivity", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
                        query: function(sql, obj, callback){
                            if (sql.toLowerCase().indexOf("select") >= 0) {
                                callback(new Error("query fail"), []);
                            } else if (sql.toLowerCase().indexOf("insert") >= 0) {
                                callback(new Error("query fail"), {});
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

        it("实际数据测试,传递正确参数,模拟insert失败，应当失败", function(done){
            pool.getConnection(function(err, connection){
                _util.userJoinActivity(connection, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 100, function(err, results){
                    connection.end();
                    should.exist(err);
                    err.message.should.equal("query fail");
                    done();
                });
            });
        });

        after(function(){
            pool = _pool;
        });
    });

    describe("第三十六项目测试:userJoinActivity", function(){
        it("实际数据测试,传递正确参数,应当成功", function(done){
            pool.getConnection(function(err, connection){
                _util.userJoinActivity(connection, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 100, function(err, results){
                    connection.end();
                    should.not.exist(err);
                    results.insertId.should.above(0);
                    done();
                });
            });
        });
    });


    describe("第三十七项测试:getUserJoinTimes", function(){

        it("实际数据测试,不传递connection,应当导致失败", function(done){
            _util.getUserJoinTimes(undefined, 1, 2, 3, function(err, results){
                should.exist(err);
                err.message.should.equal("get connection fail");
                done();
            });
        });
    });

    describe("第三十八项目测试:getUserJoinTimes", function(){
        it("实际数据测试,不传递正确参数,应当导致失败", function(done){
            pool.getConnection(function(err, connection){
                _util.getUserJoinTimes(connection, 1, undefined, null, function(err, results){
                    connection.end();
                    should.exist(err);
                    err.message.should.equal("invalid params");
                    done();
                });
            });

        });
    });

    describe("第三十九项目测试:getUserJoinTimes", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
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

        it("实际数据测试,传递正确参数,模拟查询失败，应当失败", function(done){
            pool.getConnection(function(err, connection){
                _util.getUserJoinTimes(connection, 1, 2, 100, function(err, results){
                    connection.end();
                    should.exist(err);
                    err.message.should.equal("query fail");
                    done();
                });
            });

        });

        after(function(){
            pool = _pool;
        });
    });

    describe("第四十项目测试:getUserJoinTimes", function(){

        it("实际数据测试,传递正确参数,应当成功", function(done){
            pool.getConnection(function(err, connection){
                _util.getUserJoinTimes(connection, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 100, function(err, results){
                    connection.end();
                    should.not.exist(err);
                    results[0]["times"].should.above(0);
                    done();
                });
            });

        });
    });



    describe("第四十一项测试:getActivityJoinTimes", function(){

        it("实际数据测试,不传递connection,应当导致失败", function(done){
            _util.getActivityJoinTimes(undefined, 2, 3, function(err, results){
                should.exist(err);
                err.message.should.equal("get connection fail");
                done();
            });
        });
    });

    describe("第四十二项目测试:getActivityJoinTimes", function(){
        it("实际数据测试,不传递正确参数,应当导致失败", function(done){
            pool.getConnection(function(err, connection){
                _util.getActivityJoinTimes(connection, undefined, null, function(err, results){
                    connection.end();
                    should.exist(err);
                    err.message.should.equal("invalid params");
                    done();
                });
            });

        });
    });

    describe("第四十三项目测试:getActivityJoinTimes", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
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

        it("实际数据测试,传递正确参数,模拟查询失败，应当失败", function(done){
            pool.getConnection(function(err, connection){
                _util.getActivityJoinTimes(connection, 2, 100, function(err, results){
                    connection.end();
                    should.exist(err);
                    err.message.should.equal("query fail");
                    done();
                });
            });

        });

        after(function(){
            pool = _pool;
        });
    });

    describe("第四十四项目测试:getActivityJoinTimes", function(){

        it("实际数据测试,传递正确参数,应当成功", function(done){
            pool.getConnection(function(err, connection){
                _util.getActivityJoinTimes(connection, 1, 100, function(err, results){
                    connection.end();
                    should.not.exist(err);
                    results[0]["times"].should.above(0);
                    done();
                });
            });

        });
    });


    describe("第四十五项测试:getUserTodayJoinTimes", function(){

        it("实际数据测试,不传递connection,应当导致失败", function(done){
            _util.getUserTodayJoinTimes(undefined, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 100, function(err, results){
                should.exist(err);
                err.message.should.equal("get connection fail");
                done();
            });
        });
    });

    describe("第四十六项目测试:getUserTodayJoinTimes", function(){
        it("实际数据测试,不传递正确参数,应当导致失败", function(done){
            pool.getConnection(function(err, connection){
                _util.getUserTodayJoinTimes(connection, undefined, undefined, null, function(err, results){
                    connection.end();
                    should.exist(err);
                    err.message.should.equal("invalid params");
                    done();
                });
            });

        });
    });

    describe("第四十七项目测试:getUserTodayJoinTimes", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(false, {
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

        it("实际数据测试,传递正确参数,模拟查询失败，应当失败", function(done){
            pool.getConnection(function(err, connection){
                _util.getUserTodayJoinTimes(connection, "userkey", 2, 100, function(err, results){
                    connection.end();
                    should.exist(err);
                    err.message.should.equal("query fail");
                    done();
                });
            });

        });

        after(function(){
            pool = _pool;
        });
    });

    describe("第四十八项目测试:getUserTodayJoinTimes", function(){
        it("实际数据测试,传递正确参数,应当成功", function(done){
            pool.getConnection(function(err, connection){
                _util.getUserTodayJoinTimes(connection, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 100, function(err, results){
                    connection.end();
                    should.not.exist(err);
                    done();
                });
            });

        });
    });

    describe("第四十九项目测试:setSNTableData", function(){
        var _pool;
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

        it("测试传递空数据", function(){
            _util.setSNTableData(1, {}, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 2, function(err, result){
                should.exist(err);
                err.message.should.equal("NULL data");
            });
        });
        after(function(){
            pool = _pool;
        });

    });



    describe("第五十项测试:setSNTableData", function(){
        var _pool;
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

        it("测试没有获得链接", function(){
            pool.getConnection(function(err, connection) {
                _util.setSNTableData(undefined, { mobile:"13021028211"}, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 2, function(err, result){
                    should.exist(err);
                    err.message.should.equal("get connection fail");
                });
            })

        });
        after(function(){
            pool = _pool;
        });

    });



    describe("第五十一项测试:setSNTableData", function(){
        var _pool;
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

        it("测试更新失败", function(done){
            pool.getConnection(function(err, connection) {
                _util.setSNTableData(connection, {mobile:"13021028211"}, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 2, function(err, result){
                    should.exist(err);
                    err.message.should.equal("update fail");
                    done()
                });
            })

        });
        after(function(){
            pool = _pool;
        });

    });



    describe("第五十二项测试:setSNTableData", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            callback(false, {affectedRows:0});
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("测试0条", function(done){
            pool.getConnection(function(err, connection) {
                _util.setSNTableData(connection, {mobile:"13021028211"}, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 2, function(err, result){
                    should.exist(err);
                    err.message.should.equal("update zero recorder");
                    done()
                });
            })

        });
        after(function(){
            pool = _pool;
        });

    });


    describe("第五十三项测试:setSNTableData", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            callback(false, {affectedRows:10});
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("测试多条", function(done){
            pool.getConnection(function(err, connection) {
                _util.setSNTableData(connection, { mobile:"13021028211"},'d5cfa4c8de3a08d8a809fee230254fe3', 1, 2, function(err, result){
                    should.exist(err);
                    err.message.should.equal("update too many recorder");
                    done();
                });
            })

        });
        after(function(){
            pool = _pool;
        });

    });


    describe("第五十四项测试:setSNTableData", function(){
        var _pool;
        before(function(){
            _pool = pool;
            pool = {
                getConnection: function(callback){
                    callback(true, {
                        query: function(sql, obj, callback){
                            callback(false, {affectedRows:1,insertId:1});
                        },
                        end: function(){
                            return;
                        }
                    });
                }
            };
        });

        it("测试1条", function(done){
            pool.getConnection(function(err, connection) {
                _util.setSNTableData(connection, { mobile:"13021028211"}, 'd5cfa4c8de3a08d8a809fee230254fe3', 1, 2, function(err, result){
                    should.not.exist(err);
                    result.should.equal(1);
                    done()
                });
            })

        });
        after(function(){
            pool = _pool;
        });
    });


    describe("第五十五项测试:实际测试setSNTableData", function(){
        before(function(done){
            pool.getConnection(function(err, connection) {
                var sql = "update biz_sn set userkey = 'd5cfa4c8de3a08d8a809fee230254fe3' where sn = 'FSVsTlP0PS' and baid = 100";
                _util.query(connection, sql, [], function(err, result){
                    connection.end();
                    should.not.exist(err);
                    done();
                });
            });
        });

        it("测试1条", function(done){
            pool.getConnection(function(err, connection) {
                _util.setSNTableData(connection, { mobile:"13021028211"}, 'd5cfa4c8de3a08d8a809fee230254fe3', 'FSVsTlP0PS', 100, function(err, result){
                    should.not.exist(err);
                    result.should.equal(21);
                    connection.end();
                    done();
                });
            })

        });

        after(function(done){
            pool.getConnection(function(err, connection) {
                var sql = "select count(*) as times from biz_sn where userkey = 'd5cfa4c8de3a08d8a809fee230254fe3' and mobile = '13021028211' and sn = 'FSVsTlP0PS' and baid = 100";
                _util.query(connection, sql, [], function(err, result){
                    connection.end();
                    should.not.exist(err);
                    result[0].times.should.equal(1);
                    done();
                });
            });

        });

    });
});


