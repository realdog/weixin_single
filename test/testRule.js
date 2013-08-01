var should = require('should');
var fs = require('fs');
var rewire = require('rewire');
var mysql = require('mysql');
var util = require('../utility')
var reg = require('../weixin/rule/reg');
var user = require('../proxy/weixin/database/user.js');
var rule = require('../weixin/rule');
var gaming = require('../weixin/rule/gaming');
var mission = require('../weixin/rule/mission');
pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'zerotest',
    database  : 'wx'
});

describe("测试rule入口", function(){
    var _getActivityTypeByKeywordAndWuid;
    var _gaming;
    var _mission;
    var _reg;

    describe("1:模拟测试", function(){
        before(function(){
            _getActivityTypeByKeywordAndWuid = util.getActivityTypeByKeywordAndWuid;
            util.getActivityTypeByKeywordAndWuid = function(keyword, wuid, callback){
                setImmediate(function(){
                    callback(true, {});
                });

            }
        });

        it("模拟getActivityTypeByKeywordAndWuid返回错误", function(done){
            rule.do(1, "userKey", "keyword", function(err, result){
                should.exist(err);
                err.message.should.equal('暂时木有这个活动哦!');
                done();
            })
        });

        after(function(){
            util.getActivityTypeByKeywordAndWuid = _getActivityTypeByKeywordAndWuid;
        })
    });



    describe("2:模拟测试", function(){
        before(function(){
            _getActivityTypeByKeywordAndWuid = util.getActivityTypeByKeywordAndWuid;
            util.getActivityTypeByKeywordAndWuid = function(keyword, wuid, callback){
                callback(false, [{},{}]);
            }
        });

        it("模拟getActivityTypeByKeywordAndWuid返回result长度不为1", function(done){
            rule.do(1, "userKey", "keyword", function(err, result){
                should.exist(err);
                err.message.should.equal('暂时木有这个活动哦!!');
                done();
            })
        });

        after(function(){
            util.getActivityTypeByKeywordAndWuid = _getActivityTypeByKeywordAndWuid;
        })
    });

    describe("3:模拟测试", function(){
        before(function(){
            _getActivityTypeByKeywordAndWuid = util.getActivityTypeByKeywordAndWuid;
            util.getActivityTypeByKeywordAndWuid = function(keyword, wuid, callback){
                callback(false, [{data:{}}]);
            }
        });

        it("模拟getActivityTypeByKeywordAndWuid返回result内容无法正常解析", function(done){
            rule.do(1, "userKey", "keyword", function(err, result){
                should.exist(err);
                err.message.should.equal('暂时木有这个活动哦!!!!!');
                done();
            })
        });

        after(function(){
            util.getActivityTypeByKeywordAndWuid = _getActivityTypeByKeywordAndWuid;
        })
    });

    describe("4:模拟测试", function(){
        before(function(){
            _getActivityTypeByKeywordAndWuid = util.getActivityTypeByKeywordAndWuid;
            util.getActivityTypeByKeywordAndWuid = function(keyword, wuid, callback){
                callback(false, [{id:1, data:'{"data":{"activity_type":"gaming"}}'}]);
            };
            _gaming = gaming;

        });

        it("模拟子模块没有正确加载_gaming", function(done){
            rule.do(1, "userKey", "keyword", function(err, result){
                should.exist(err);
                err.message.should.equal('暂时木有这个活动哦!!!!');
                done();
            })
        });

        after(function(){
            util.getActivityTypeByKeywordAndWuid = _getActivityTypeByKeywordAndWuid;
            gaming = _gaming;
        })
    });

    describe("5:模拟测试", function(){
        before(function(){
            _getActivityTypeByKeywordAndWuid = util.getActivityTypeByKeywordAndWuid;
            util.getActivityTypeByKeywordAndWuid = function(keyword, wuid, callback){
                callback(false, [{id:1, data:'{"data":{"activity_type":"mission"}}'}]);
            };
            _mission = mission;

        });

        it("模拟子模块没有正确加载_mission", function(done){
            rule.do(1, "userKey", "keyword", function(err, result){
                should.exist(err);
                err.message.should.equal('暂时木有这个活动哦!!!!');
                done();
            })
        });

        after(function(){
            util.getActivityTypeByKeywordAndWuid = _getActivityTypeByKeywordAndWuid;
            mission = _mission;
        })
    });


    describe("6:模拟测试", function(){
        before(function(){
            _getActivityTypeByKeywordAndWuid = util.getActivityTypeByKeywordAndWuid;
            util.getActivityTypeByKeywordAndWuid = function(keyword, wuid, callback){
                callback(false, [{id:1, data:'{"data":{"activity_type":"reg"}}'}]);
            };
            _reg = reg;

        });

        it("模拟子模块没有正确加载_reg", function(done){
            rule.do(1, "userKey", "keyword", function(err, result){
                should.exist(err);
                err.message.should.equal('暂时木有这个活动哦!!!!');
                done();
            })
        });

        after(function(){
            util.getActivityTypeByKeywordAndWuid = _getActivityTypeByKeywordAndWuid;
            reg = _reg;
        })
    });


    describe("7:模拟测试", function(){
        before(function(){
            _getActivityTypeByKeywordAndWuid = util.getActivityTypeByKeywordAndWuid;
            util.getActivityTypeByKeywordAndWuid = function(keyword, wuid, callback){
                callback(false, [{id:1, data:'{"data":{"activity_type":"reg"}}'}]);
            };


        });

        it("模拟data数据中没有sub_type", function(done){
            rule.do(1, "userKey", "keyword", function(err, result){
                should.exist(err);
                err.message.should.equal('暂时木有这个活动哦!!!!');
                done();
            });
        });

        after(function(){
            util.getActivityTypeByKeywordAndWuid = _getActivityTypeByKeywordAndWuid;

        });
    });

    describe("8:模拟测试", function(){
        var _subscribe;
        before(function(){
            _getActivityTypeByKeywordAndWuid = util.getActivityTypeByKeywordAndWuid;
            util.getActivityTypeByKeywordAndWuid = function(keyword, wuid, callback){
                callback(false, [{id:1, data:'{"activity_type":"reg","sub_type":"subscribe"}'}]);
            };
            _subscribe = reg.subscribe;
            reg.subscribe = function(wuid, userkey, keywrod, recordId, callback) {
                callback(true, {msg:"test"});
            };
        });

        it("模拟obj[data.sub_type]返回错误", function(done){
            rule.do(1, "userKey", "keyword", function(err, result){
                should.exist(err);
                result.msg.should.equal("test");
                done();
            });
        });

        after(function(){
            util.getActivityTypeByKeywordAndWuid = _getActivityTypeByKeywordAndWuid;
            reg.subscribe = _subscribe;
        });
    });

    describe("9:模拟测试", function(){
        var _subscribe;
        before(function(){
            _getActivityTypeByKeywordAndWuid = util.getActivityTypeByKeywordAndWuid;
            util.getActivityTypeByKeywordAndWuid = function(keyword, wuid, callback){
                callback(false, [{id:1, data:'{"activity_type":"reg","sub_type":"subscribe"}'}]);
            };
            _subscribe = reg.subscribe;
            reg.subscribe = function(wuid, userkey, keywrod, recordId, callback) {
                callback(undefined, {});
            };


        });

        it("模拟obj[data.sub_type]返回正确", function(done){
            rule.do(1, "userKey", "keyword", function(err, result){
                should.not.exist(err);
                done();
            });
        });

        after(function(){
            util.getActivityTypeByKeywordAndWuid = _getActivityTypeByKeywordAndWuid;
            reg.subscribe = _subscribe;
        });
    });
});