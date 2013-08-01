/**
 * Created with JetBrains WebStorm.
 * User: tjrb
 * Date: 13-6-4
 * Time: 上午10:11
 * To change this template use File | Settings | File Templates.
 */


//main页
module.exports.mainPage = function(req, res){

    res.render('business/admin/main',req.session.loginInfo);

};


//营销推广模块页
module.exports.serviceModulePage = function(req, res){

    res.render('business/admin/shoper/service-module',req.session.loginInfo);

};


