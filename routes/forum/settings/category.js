const Router = require('koa-router');
const categoryRouter = new Router();
categoryRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {forum} = data;
		const parentForums = [];
		let f = forum;
		let n = 0;
		while(n < 1000) {
		  // 避免死循环，版块数暂小于1000
		  n++;
			if(f.parentsId.length !== 0) {
				f = await db.ForumModel.findOnly({fid: f.parentsId[0]});
				parentForums.unshift(f);
			} else {
				break;
			}
		}
		data.parentForums = parentForums;
		data.threadTypes = await db.ThreadTypeModel.find({fid: forum.fid}).sort({order: 1});
		ctx.template = 'interface_forum_settings_category.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, db, body, redis} = ctx;
		const {forum} = data;
		const {operation} = body;
		if(operation === 'selectForumType') {
      const {forumType} = body;
      if(!['topic', 'discipline'].includes(forumType)) ctx.throw(400, `未定义的专业属性：${forumType}`);
      if(forum.parentsId.length !== 0) ctx.throw(400, '该专业不是顶级专业，暂无法更改专业属性');
      const fids = await forum.getAllChildForumsId();
      fids.push(forum.fid);
			await db.ForumModel.updateMany({fid: {$in: fids}}, {$set: {
        forumType: forumType
      }});
		}else if(operation === 'savePosition') {
			const {parentId} = body;
			if(parentId === forum.fid) ctx.throw(400, '板块不能成为自己的子版块');
			if(!parentId) {
				await forum.update({parentsId: []});
			} else {
				const targetForum = await db.ForumModel.findOnly({fid: parentId});
				await forum.update({parentsId:[parentId], forumType:targetForum.forumType});
        forum.parentsId = [parentId];
        const fids = await forum.getAllChildForumsId();
        await db.ForumModel.updateMany({fid: {$in: fids}}, {$set: {
          forumType: targetForum.forumType
        }});
				await forum.updateForumMessage();
			}
		} else if(operation === 'saveOrder') {
			const {childrenFid, threadTypesCid} = body;
			for(let i = 0; i < childrenFid.length; i++) {
				const fid = childrenFid[i];
				const childrenForum = await db.ForumModel.findOnly({fid});
				await childrenForum.update({order: i});
			}
			for(let i = 0; i < threadTypesCid.length; i++) {
				const cid = threadTypesCid[i];
				const threadType = await db.ThreadTypeModel.findOnly({cid});
				await threadType.update({order: i});
			}
		} else if(operation === 'changeThreadType') {
			const {name, oldName} = body;
			const threadType = await db.ThreadTypeModel.findOne({name: oldName, fid: forum.fid});
			if(!threadType) ctx.throw(400, '原分类名不存在');
			if(!name) ctx.throw(400, '新分类名不能为空');
			await threadType.update({name});
		}
    await redis.cacheForums();
		await db.ForumModel.saveForumsIdToRedis("topic");
    await db.ForumModel.saveForumsIdToRedis("discipline");
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body, redis} = ctx;
		const {forum} = data;
		const {name} = body;
		if(!name) ctx.throw(400, '分类名不能为空');
		const saveNameType = await db.ThreadTypeModel.findOne({fid: forum.fid, name});
		if(saveNameType) ctx.throw(400, '分类名已存在');
		const lastType = await db.ThreadTypeModel.findOne({fid: forum.fid}).sort({order: -1});
		let order = 1;
		if(lastType) {
			order = lastType.order + 1;
		}
		const cid = await db.SettingModel.operateSystemID('threadTypes', 1);
		const newType = db.ThreadTypeModel({
			cid,
			name,
			order,
			fid: forum.fid
		});
		await newType.save();
    data.newType = newType;
    await redis.cacheForums();
		await next();
	})
	.del('/', async (ctx, next) => {
		const {db, query, data, redis} = ctx;
		const {forum} = data;
		const {name} = query;
		if(!name) ctx.throw('分类名不能为空');
		const threadType = await db.ThreadTypeModel.findOne({fid: forum.fid, name});
		if(!threadType) ctx.throw(400, '分类不存在');
		await db.ThreadModel.updateMany({categoriesId: threadType.cid}, {$pull: {categoriesId: threadType.cid}});
    await threadType.remove();
    await redis.cacheForums();
		await next();
	})
module.exports = categoryRouter;