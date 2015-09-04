module.exports = function(EndorsementProject) {
  EndorsementProject.observe('before save', function setDefaultCreated(ctx, next) {
    if (ctx.instance) {
      ctx.instance.created = Date.now();
      ctx.instance.modified = Date.now();
    }
    if (ctx.currentInstance) {
      ctx.data.modified = Date.now();
    }

    next();
  });
};
