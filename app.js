var app = require('pm').createMaster({
    'pidfile'    : __dirname + '/pid/bench.pid',
    'statusfile' : __dirname + '/logs/status.log'
});


app.on('giveup', function (name, fatals, pause) {
    console.log('Master giveup to restart "%s" process after %d times. pm will try after %d ms.', name, fatals, pause);
});

app.on('disconnect', function (worker, pid) {
    // var w = cluster.fork();

});

app.on('fork', function () {
    console.log('fork', arguments);
});

app.on('quit', function () {
    console.log('quit', arguments);
});

app.register('weixin_tx', __dirname + '/app_weixin.js', {
    'listen' : [ 65001, 65002 ],
    'children' : 2,
    'max_fatal_restart': 100
});
app.register('mobile_web', __dirname + '/app_mobile.js', {
    'listen' : [ 65003,  65004 ],
    'children' : 2,
    'max_fatal_restart': 100
});
app.register('web', __dirname + '/app_web.js', {
    'listen' : [ 55001 ],
    'children' : 2,
    'max_fatal_restart': 100
});
app.dispatch();