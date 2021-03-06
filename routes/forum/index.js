const Router = require('koa-router');
const singleForumRouter = require('./singleForum');
const forumRouter = new Router();

forumRouter
  .get('/', async (ctx, next) => {
    const {data, db, nkcModules} = ctx;
    const {user} = data;
    const threadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
    let subFid = [];
    if(user) {
			subFid = await db.SubscribeModel.getUserSubForumsId(user.uid);
		}
		const forumsOrigin = await db.ForumModel.visibleForums(data.userRoles, data.userGrade, data.user);
		data.recommendForums = await db.ForumModel.getRecommendForums(forumsOrigin.map(f => f.fid));
		data.recommendForums = data.recommendForums.slice(0, 4);
		const forumsObj = {}, forums = [];
		let parentsId = [];
		for(const f of forumsOrigin) {
			const forum = f.toObject();
			parentsId = parentsId.concat(forum.parentsId);
			forum.subscribed = subFid.includes(forum.fid);
			forumsObj[forum.fid] = forum;
			forums.push(forum);
		}

		forums.map(f => {
			f.canSubscribe = !parentsId.includes(f.fid);
		});

		data.forums = nkcModules.dbFunction.forumsListSort(forums, threadTypes);


		data.disciplineForums = [];
		data.topicForums = [];
		data.forums.map(f => {
			f.canSubscribe = !parentsId.includes(f.fid);
			if(f.forumType === "topic") {
				data.topicForums.push(f);
			} else {
				data.disciplineForums.push(f);
			}
		});

		if(user) {
			const subForums = [], visitedForums = [];
			for(const fid of subFid) {
				const f = forumsObj[fid];
				if(!f) continue;
				const cloneForum = Object.assign({}, f);
				cloneForum.childrenForums = [];
				subForums.push(f);
			}
			const visitedForumsId = user.generalSettings.visitedForumsId.slice(0, 5);
			for(const fid of visitedForumsId) {
				const f = forumsObj[fid];
				if(!f) continue;
				const cloneForum = Object.assign({}, f);
				cloneForum.childrenForums = [];
				visitedForums.push(cloneForum);
			}
			data.subForums = subForums;
			data.visitedForums = visitedForums;
		}
		ctx.template = "forums/forums.pug";
    data.uid = user? user.uid: undefined;
    await next();
  })
	.post('/', async (ctx, next) => {
		const {data, redis, db, body} = ctx;
		const {displayName, forumType} = body;
		if(!displayName) ctx.throw(400, '名称不能为空');
		const sameDisplayNameForum = await db.ForumModel.findOne({displayName});
		if(sameDisplayNameForum) ctx.throw(400, '名称已存在');
		let _id;
		while(1) {
			_id = await db.SettingModel.operateSystemID('forums', 1);
			const sameIdForum = await db.ForumModel.findOne({fid: _id});
			if(!sameIdForum) {
				break;
			}
		}
		const newForum = db.ForumModel({
			fid: _id,
			displayName,
			accessible: false,
			visibility: false,
			type: 'forum'
    });

    await newForum.save();

    // await newForum.createLibrary(data.user.uid);
    
    await redis.cacheForums();
		data.forum = newForum;
		await next();
	})
  .use('/:fid', singleForumRouter.routes(), singleForumRouter.allowedMethods());
module.exports = forumRouter;