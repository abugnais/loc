module.exports = function(Location) {
    Location.observe('after save', (context, next) => {
        Location.app.io.publish('Location', context.instance);
        next();
    });
};
