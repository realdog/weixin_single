module.exports = {
    development: {
        log_mobileweb : {
            name: 'weixin_mobileweb',
            path: './logs/mobileweb.log',
            period: '1d',
            count: 365,
            type: 'rotating-file',
            level: 'error'

        },
        proxy_type: 'database',
        mysql: {
            host: '172.16.130.172',
            username: 'root',
            password: 'zerotest',
            db: 'wx_business'
        },

        db: 'mongodb://172.16.130.172/wx',
        local_domain: "http://60.30.119.187",
        resource_domain : "http://60.30.119.187/resource",
        token: "grgeg4"
    }
    , production: {
        log_mobileweb : {
            name: 'weixin_mobileweb',
            path: './logs/mobileweb.log',
            period: '1d',
            count: 365,
            type: 'rotating-file',
            level: 'error'

        },
        proxy_type: 'database',
        mysql: {
            host: '172.16.130.172',
            username: 'root',
            password: 'zerotest',
            db: 'wx_business'
        },

        db: 'mongodb://172.16.130.172/wx',
        local_domain: "http://60.30.119.187",
        resource_domain : "http://60.30.119.187/resource",
        token: "grgeg4"
    }
};
