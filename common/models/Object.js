var PassThrough = require('stream').PassThrough;
var loopback = require('loopback');


module.exports = function(Object) {
    Object.streamLocation = function (objectId, callback) {
        var Model = this;
        var changes = new PassThrough({objectMode: true});
        var writeable = true;


        changes.destroy = function() {
            changes.removeAllListeners('error');
            changes.removeAllListeners('end');
            writeable = false;
            changes = null;
        };

        changes.on('error', function() {
            writeable = false;
        });

        changes.on('end', function() {
            writeable = false;
        });

        process.nextTick(function () {
            callback(null, changes);
        });

        Model.observe('after save', function (context, next) {
            var data = context.instance;

            if (data.id === objectId) {
                changes.write({
                    type: 'create',
                    data: data,
                    target: objectId
                });
            }
            next();
        });
    };

    Object.remoteMethod('streamLocation', {
        description: 'stream updated location to the observed object.',
        accessType: 'READ',
        accepts: {
            arg: 'id',
            type: 'number',
            required: true
        },
        http: {
            verb: 'get',
            path: '/:id/stream-location'
        },
        returns: {
            arg: 'changes',
            type: 'ReadableStream',
            json: true
        }
    });
};
