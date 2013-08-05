

var crypto = require('crypto');


//加密
module.exports.encrypt = function (str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};


//解密
module.exports.decrypt = function (str, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};


//md5加密
module.exports.md5 = function (str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};


//随机数
var _randomString = function (size) {
    size = size || 6;
    var code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var max_num = code_string.length;
    var new_pass = '';
    while (size > 0) {
        new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
        //console.log(new_pass);
        size--;
    }
    return new_pass;
};
module.exports.randomString = _randomString;


//不重复随机数组
module.exports.randomUniqueArray = function(strSize, arraySize){
    var tmpStr = ''
      , resStr = '';
    for(var i=0; i<arraySize; i++){
        tmpStr = _randomString(strSize);
        if(resStr.indexOf(tmpStr) < 0){
            resStr += (tmpStr + ',');
        }else{
            i--;
        }
    }
    resStr = resStr.split(",");
    resStr.pop();
    return resStr;
};


//日期格式化
module.exports.formatDate = function (time){
    if(time){
        var date = new Date(time); //日期对象
    }else{
        var date = new Date(); //日期对象
    }

    var now = "";
    now = date.getFullYear()+"-"; //读英文就行了
    now = now + (date.getMonth()+1)+"-";//取月的时候取的是当前月-1如果想取当前月+1就可以了
    now = now + date.getDate()+" ";
    now = now + date.getHours()+":";
    now = now + date.getMinutes()+":";
    now = now + date.getSeconds()+"";
    return now;
};


//复制对象
var a= function cloneAll(fromObj){
    var toObj = {};
    for(var i in fromObj){
        if(typeof fromObj[i] == "object"){
            toObj[i]=cloneAll(fromObj[i]);
            continue;
        }
        toObj[i] = fromObj[i];
    }
    return toObj;
}


//自动分页
module.exports._autoPage = function(recordset, page, pagesize, url){

    if(!page)page=1;
    if(page<1)page=1;
    if(!pagesize)pagesize=10;
    if(pagesize<1)pagesize=10;
    if(isNaN(page) || isNaN(pagesize)){
        page = 1;
        pagesize =10;
    }
    var href = '';
    if(url.indexOf('page=')>-1){
        href = url.split('page=')[0];
    }else{
        if(url.indexOf('?')>-1){
            href += url + '&';
        }else{
            href += url + '?';
        }
    }
    var reData = {
        page        : page,
        maxpage     : Math.ceil(recordset.length/pagesize),
        pagesize    : pagesize,
        data        : null,
        href        : href
    };
    var tmp = [];
    for(var i=(page-1)*pagesize;i<page*pagesize;i++){
        if(!recordset[i])break;
        tmp.push(recordset[i]);
    }
    reData.data = tmp;
    return reData;
};


var _query = function(connection, sql, obj, callback){

    if (!!connection) {
        connection.query(sql, obj, function(err, results){
            callback(err, results);
        });
    }else {
        pool.getConnection(function(err, connection) {
            if (!!err) {
                return callback(err);
            } else {
                var query = connection.query(sql, obj, function(err, results){
                    connection.end();
                    callback(err, results);
                });
                console.log(query.sql);
            }
        });
    }
};

/**
 * 自动分页
 * @param maxsql     j查询纪录数sql count(*) as count
 * @param pagesql    j查询语句
 * @param obj        jsql参数
 * @param page       j当前页数
 * @param pagesize   j每页条数
 * @param url        j当前url
 * @returns {*}
 */
module.exports.autoPage = function(maxsql, pagesql, obj, page, pagesize, url, callback){

    if(!page)page=1;
    if(page<1)page=1;
    if(!pagesize)pagesize=10;
    if(pagesize<1)pagesize=10;
    if(isNaN(page) || isNaN(pagesize)){
        page = 1;
        pagesize =10;
    }
    var href = '';
    if(url.indexOf('page=')>-1){
        href = url.split('page=')[0];
    }else{
        if(url.indexOf('?')>-1){
            href += url + '&';
        }else{
            href += url + '?';
        }
    }

    var returnData = {
        success     : false,
        err         : null,
        page        : page,
        maxpage     : 0,
        pagesize    : pagesize,
        data        : null,
        href        : href
    };

    _query(null, maxsql, obj, function(err, result){
        if(!!err){
            returnData.err = err.message;
            return callback(returnData);
        }
        returnData.maxpage = Math.ceil(result[0].count/pagesize);
        pagesql += " limit " + (page-1)*pagesize + "," + pagesize;
        _query(null, pagesql, obj, function(err, result){
            if(!!err){
                returnData.err = err.message;
                return callback(returnData);
            }
            returnData.success = true;
            returnData.data = result;
            return callback(returnData);
        });
    });
};


