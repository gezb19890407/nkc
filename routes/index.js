const Router = require('koa-router');
const router = new Router();
const routers = require('../requireFolder')(__dirname);
const userRouter = routers.user;
const meRouter = routers.me;
const threadRouter = routers.thread;
const postRouter = routers.post;
const forumRouter = routers.forum;
const otherRouter = routers.other;
const experimentalRouter = routers.experimental;
const questionRouter = routers.question;
const resourceRouter = routers.resource;
const fundRouter = routers.fund;
const registerRouter = routers.register;
const personalForumRouter = routers.personalForum;
<<<<<<< HEAD
const setRouter = routers.set;
const downloadRouter = routers.download;
=======
const systemRouter = routers.system;
>>>>>>> 3fcfc943979283c17ac6825cefcdebc23ddfdf25


router.use('/', otherRouter.routes(), otherRouter.allowedMethods());
router.use('/u', userRouter.routes(), userRouter.allowedMethods());
router.use('/me', meRouter.routes(), meRouter.allowedMethods());
router.use('/t', threadRouter.routes(), threadRouter.allowedMethods());
router.use('/p', postRouter.routes(), postRouter.allowedMethods());
router.use('/f', forumRouter.routes(), forumRouter.allowedMethods());
router.use('/e', experimentalRouter.routes(), experimentalRouter.allowedMethods());
router.use('/q', questionRouter.routes(), questionRouter.allowedMethods());
router.use('/r', resourceRouter.routes(), resourceRouter.allowedMethods());
router.use('/m', personalForumRouter.routes(), personalForumRouter.allowedMethods());
router.use('/fund', fundRouter.routes(), fundRouter.allowedMethods());
router.use('/register', registerRouter.routes(), registerRouter.allowedMethods());
<<<<<<< HEAD
router.use('/set', setRouter.routes(), setRouter.allowedMethods());
router.use('/download', downloadRouter.routes(), downloadRouter.allowedMethods());
=======
router.use('/system', systemRouter.routes(), systemRouter.allowedMethods());
>>>>>>> 3fcfc943979283c17ac6825cefcdebc23ddfdf25
module.exports = router;