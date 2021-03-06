const Router = require('koa-router');
const router = new Router();

router
  .post('/', async (ctx, next) => {
    const {body, data, db, nkcModules} = ctx;
    const {UsersPersonalModel} = db;
    const {user} = data;
    body.id = Date.now();
    const up = await UsersPersonalModel.findOnly({uid: user.uid});
    try {
      if(up.education) {
        up.education.push(body)
      } else {
        up.education = [];
        up.education.push(body)
      }
      await up.save()
    } catch(e) {
      return ctx.throw(400, e.message)
    }
    return ctx.redirect('/me')
  })
  .del('/:id', async (ctx, next) => {
    const {params, data, db} = ctx;
    const {UsersPersonalModel} = db;
    const {user} = data;
    const {id} = params;
    const up = await UsersPersonalModel.findOnly({uid: user.uid});
    try {
      const index = up.education.indexOf(e => e.id === id);
      if(index) {
        ctx.data.education = up.education[index];
        up.education.splice(index, 1);
        await up.save();
        return next()
      } else {
        return ctx.throw(400, `id: ${id} document not found`)
      }
    } catch(e) {
      return ctx.throw(400, e.message)
    }
  });

module.exports = router;