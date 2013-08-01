
var test = require('./../service/test')
  , Biz = require('./../service/BusinessService');

module.exports = function (app){

    //测试
    app.get('/test', test.get);
    app.get('/test/:name/:pwd', test.path);
    app.post('/test', test.post);
    app.get('/',test.root);
    //app.get('/',Biz.Img.test);
    app.get('/update',test.update);


    /**
     * 商户登陆注册
     */
    //app.post('/business/admin/invite', Biz.User.inviteReg);  //邀请码注册
    //app.post('/business/admin/chkcode', Biz.User.chkCode);   //邀请码验证
    app.post('/business/admin/reg', Biz.User.userReg);       //商户注册
    app.post('/business/admin/bind1', Biz.User.bind1);       //帐号绑定1
    app.post('/business/admin/bind2', Biz.User.bind2);       //帐号绑定2
    app.post('/business/admin/login', Biz.User.login);       //商户登陆
    app.get('/business/admin/login', Biz.User.login);        //商户登陆
    app.get('/business/admin/logout', Biz.User.logout);      //商户登出
    app.get('/business/admin/account/changepwd', Biz.User.changepwd);
    app.post('/business/admin/account/changepwd', Biz.User.changepwdpost);


    /**
     * 商户后台框架页面
     */
    app.get('/business/admin/main', Biz.Page.mainPage);                             //main页面
    app.get('/business/admin/shoper/service-module', Biz.Page.serviceModulePage);   //营销推广模块页面


    /**
     * 商户活动管理
     */
    app.get('/business/admin/shoper/add-activity', Biz.Activity.addActivityPage);       //营销推广模块-添加活动页面
    app.get('/business/admin/shoper/activitylist', Biz.Activity.activityListPage);      //营销推广模块-我的推广活动页面
    app.post('/business/admin/shoper/activityManager', Biz.Activity.activityManager);   //营销推广模块-商户添加停止删除活动处理
    app.get('/business/admin/shoper/activityManager', Biz.Activity.activityManager);    //营销推广模块-商户添加停止删除活动处理
    app.get('/business/admin/shoper/sncode-manage', Biz.Activity.snList);               //营销推广模块-sn列表

    app.get('/business/admin/shoper/coupon-setting', Biz.Activity.couponPage);          //营销推广模块-优惠卷coupon活动页面
    app.post('/business/admin/shoper/coupon-save', Biz.Activity.couponConfig);          //营销推广模块-优惠卷coupon活动配置
    app.get('/business/admin/shoper/lottery-setting', Biz.Activity.lotteryPage);        //营销推广模块-刮刮卡lottery活动页面
    app.post('/business/admin/shoper/lottery-save', Biz.Activity.lotteryConfig);        //营销推广模块-刮刮卡lottery活动配置
    app.get('/business/admin/shoper/pan-setting', Biz.Activity.panPage);                //营销推广模块-大转盘pan活动页面
    app.post('/business/admin/shoper/pan-save', Biz.Activity.panConfig);                //营销推广模块-大转盘pan活动配置

    /**
     * 互联网接入服务
     */
    app.get('/business/admin/netservice-setting', Biz.Service.getNetService);      //互联网接入模块-获取开启的服务
    app.post('/business/admin/netservice-save', Biz.Service.setNetService);        //互联网接入模块-保存服务设置

    /**
     * 素菜馆里
     */
    app.get('/business/admin/content/articlelist', Biz.Article.articleList);                //素材管理-图文列表
    app.get('/business/admin/content/article-detail', Biz.Article.articleDetail);           //素材管理-单图文消息
    app.get('/business/admin/content/article-mul-detail', Biz.Article.articleMuDetail);     //素材管理-多图文消息
    app.post('/business/admin/content/article-save', Biz.Article.articleSave);              //素材管理-单图文消息保存
    app.post('/business/admin/content/article-mul-save', Biz.Article.articleMulSave);       //素材管理-多图文消息保存
    app.post('/business/admin/content/article', Biz.Article.articleManager);                //素材管理

    /**
     * 自定义回复
     */
    app.get('/business/admin/ai/question', Biz.Reply.questionList);
    app.post('/business/admin/ai/qhandler', Biz.Reply.questionManager);
    app.get('/business/admin/ai/qhandler', Biz.Reply.questionManager);
    app.get('/business/admin/ai/answer', Biz.Reply.answerList);
    app.post('/business/admin/ai/anhandler', Biz.Reply.answerManager);

    /**
     * 图片
     */
    app.post('/business/admin/upload', Biz.Img.fileUpload);
    app.post('/business/admin/ueditor/imageUp', Biz.Img.imageUp);
    app.post('/business/admin/ueditor/imageManager', Biz.Img.imageManager);

    /**
     * sys
     */
    app.get('/business/admin/sys/setwel', Biz.Sys.setwel);
    app.post('/business/admin/sys/savewel', Biz.Sys.savewel);
    app.get('/business/admin/sys/setmsg', Biz.Sys.setmsg);
    app.post('/business/admin/sys/savemsg', Biz.Sys.savemsg);
    app.get('/business/admin/sys/mlist', Biz.Sys.usermsglist);
}
