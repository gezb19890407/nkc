const Router = require('koa-router');
const loginRouter = new Router();
loginRouter
  .get('/', async (ctx, next) => {
    ctx.data = '登陆页面';
    next();
  })
  .post('/', async (ctx, next) => {
    ctx.data = '提交登陆信息';
    next();
  })

module.exports = loginRouter;