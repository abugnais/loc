var loopback = require('loopback');
var boot = require('loopback-boot');
var socketIO = require('socket.io');
var socketIOAuth = require('socketio-auth');

var app = module.exports = loopback();

app.start = function() {
    // start the web server
    return app.listen(function() {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
    if (err) {
        throw err;
    }

    if (!require.main === module) {
        return;
    }

    app.io = socketIO(app.start());

    socketIOAuth(app.io, {
        authenticate: function (socket, value, callback) {
            console.log(socket);
            var AccessToken = app.models.AccessToken;
            //get credentials sent by the client
            var token = AccessToken.find({
                where:{
                    and: [{ userId: value.userId }, { id: value.id }]
                }
            }, function(err, tokenDetail) {
                if (err) throw err;

                callback(null, tokenDetail.length > 0);
            });
        }
    });

    app.io.on('connection', function(socket) {
        console.log('a user connected');
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });
    });

    app.io.publish = function (collection, data) {
        app.io.emit(collection, data);
    };
});
