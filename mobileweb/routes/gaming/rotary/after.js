exports.name = "after";
exports.run = function(req, res, next){
    return  res.render("gaming/rotary/after",{
        resourceDomain: req.resource_domain,
        desc: "活动已经结束",
        provider: provider
    });
};