exports.name = "after";

exports.run = function(req, res, next){
    return  res.render("gaming/scratch/after",{
        resourceDomain: req.resource_domain,
        desc: "您好，活动已经结束了哦",
        provider:provider
    });
};