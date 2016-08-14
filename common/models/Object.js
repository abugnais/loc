module.exports = function(Object) {
    Object.disableRemoteMethod('deleteById', true);
    Object.disableRemoteMethod('__destroyById__locations', false);
    Object.disableRemoteMethod('createChangeStream', true);
};
