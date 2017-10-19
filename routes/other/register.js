const Router = require('koa-router');
const registerRouter = new Router();
registerRouter
  .get('/', async (ctx, next) => {
    ctx.redirect('/register/mobile');
    ctx.template = 'interface_user_register.pug';
    next();
  })
  .get('/mobile', async (ctx, next) => {
    let code = ctx.query.code;
    if(code) {
      ctx.data.regCode = code;
    }
    ctx.data.getcode = false;
    ctx.template = 'interface_user_register.pug';
    next();
  })
  .post('/mobile', async (ctx, next) => {
    ctx.data = '手机提交注册信息';
    next();
  })
  .get('/email', async (ctx, next) => {
    let code = ctx.query.code;
    if(code) {
      ctx.data.regCode = code;
    }
    ctx.template = 'interface_user_register2.pug';
    next();
  })
  .post('/email', async (ctx, next) => {
    ctx.data = '邮箱提交注册信息';
    next();
  });
module.exports = registerRouter;