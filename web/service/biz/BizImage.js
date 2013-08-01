/**
 * Created with JetBrains WebStorm.
 * User: tjrb
 * Date: 13-7-3
 * Time: 上午9:40
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');

var imgConfig = {
    activitySavePath    : CONSTANT.pic_upload_path + 'activityPic/',
    activityReturnPath  : CONSTANT.pic_return_url + 'activityPic/',
    articleSAVEPath     : CONSTANT.pic_upload_path + 'articlePic/',
    articleReturnPath   : CONSTANT.pic_return_url + 'articlePic/',
    maxSize             : 1000000,
    allowFiles          : '.gif.png.jpg.jpeg.bmp'
};

var _chkExtensions = function(filename){
    filename = filename.toLowerCase();
    var extensions = filename.substring(filename.indexOf('.'), filename.length);
    if(imgConfig.allowFiles.indexOf(extensions) > -1){
        return true;
    }else{
        return false;
    }
};

var _rename = function (source_path, target_path, target_name){

    if(!fs.existsSync(target_path)){
        fs.mkdirSync(target_path);
    }
    fs.renameSync(source_path , target_path + target_name);
    //fs.unlinkSync(source_path);
}


//ueditor图片上传
module.exports.imageUp = function(req, res){

    var reData = {
        url         : req.files.upfile.path,
        title       : xss(req.body.pictitle||0),
        original    : xss(req.files.upfile.name||0),
        state       : 'false'
    }

    if(!_chkExtensions(req.files.upfile.name)){
        reData.state = 'err extensions';
        console.log(reData);
        res.json(reData);
        return;
    }

    if(req.files.upfile.size > imgConfig.maxSize){
        reData.state = 'max size';
        console.log(reData);
        res.json(reData);
        return;
    }

    var extensions = reData.original.substring(reData.original.indexOf('.'), reData.original.length);
    _rename(req.files.upfile.path, imgConfig.articleSAVEPath + req.session.loginInfo.token + '/', (new Date().getTime()) + extensions);
    reData.url = imgConfig.articleReturnPath + req.session.loginInfo.token + '/' + (new Date().getTime()) + extensions;
    reData.state = 'SUCCESS';
    console.log(reData);
    res.json(reData);
}


//ueditor图片管理
module.exports.imageManager = function(req, res){
    var filePath = imgConfig.articleSAVEPath + req.session.loginInfo.token;
    var returnPath = imgConfig.articleReturnPath + req.session.loginInfo.token + '/';
    var files = fs.readdirSync(filePath);
    var reData = '';
    for(var i = 0; i< files.length; i++){
        reData += returnPath + files[i] + "ue_separate_ue";
    }
    console.log(reData);
    res.send(reData);
}


//上传文件
module.exports.fileUpload = function(req, res){

    var reData = {
        success : false,
        fileUrl : null,
        errMsg  : null
    };


    var extensions = req.files.Filedata.name.substring(req.files.Filedata.name.indexOf('.'), req.files.Filedata.name.length);
    var target_path = imgConfig.activitySavePath + req.session.loginInfo.token + '/';
    var return_path = imgConfig.activityReturnPath + req.session.loginInfo.token + '/';
    var target_name = (new Date().getTime()) + extensions;

    if(!_chkExtensions(req.files.Filedata.name)){
        reData.errMsg = 'err extensions';
        console.log(reData);
        res.json(reData);
        return;
    }

    if(req.files.Filedata.size > imgConfig.maxSize){
        reData.errMsg = 'max size';
        console.log(reData);
        res.json(reData);
        return;
    }

    _rename(req.files.Filedata.path, target_path, target_name);
    reData.success = true;
    reData.fileUrl = return_path + target_name;
    res.json(reData);
    console.log(reData);

 /*   fs.exists(target_path, function (exists) {
        if(!exists){
            fs.mkdir(target_path, function(err){
                if(!!err){
                    reData.errMsg = err;
                    res.json(reData);
                    return;
                }
                fs.rename(tmp_path , target_path + target_name, function(err){
                    if(!!err){
                        reData.errMsg = err;
                        res.json(reData);
                        return;
                    }
                    reData.success = true;
                    reData.fileUrl = return_path + target_name;
                    res.json(reData);
                });
            });
        }else{
            fs.rename(tmp_path , target_path + target_name, function(err){
                if(!!err){
                    reData.errMsg = err;
                    res.json(reData);
                    return;
                }
                reData.success = true;
                reData.fileUrl = return_path + target_name;
                res.json(reData);
            });
        }
    });*/

};



