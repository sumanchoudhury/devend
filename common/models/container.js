module.exports = function(Container) {
  Container.beforeRemote('*.save', function(ctx, unused, next) {
    if(!ctx.req.accessToken) {
      return next(new Error('must be logged in to update'));
    }
    ctx.req.accessToken.user(function(err, currentUser) {
      console.log(currentUser);

      next();
    });
  });
};
