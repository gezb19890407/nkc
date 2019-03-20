const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const serverConfig = require('../config/server.json');
const alipay2 = require('../nkcModules/alipay2');
const kcbsRecordSchema = new Schema({
  _id: Number,
  // 花费科创币用户的ID
  from: {
    type: String,
    required: true,
    index: 1
  },
  // 获得科创币用户的ID
  to: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 交易类型
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 转账金额
  num: {
    type: Number,
    required: true,
    index: 1
  },
  // 备注
  description: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: '0.0.0.0',
    index: 1
  },
  port: {
    type: String,
    default: '0',
  },
  pid: {
    type: String,
    default: '',
    index: 1
  },
  tid: {
    type: String,
    default: '',
    index: 1
  },
  tUid: {
    type: String,
    default: '',
    index: 1
  },
  problemId: {
    type: String,
    default: '',
    index: 1
  },
  ordersId: {
    type: [String]
  },
  verify: {
    type: Boolean,
    index: 1,
    default: true,
  },
  error: {
    type: String,
    default: ''
  },
  c: {
    type: Schema.Types.Mixed,
    default: {}
  }   
}, {
  collection: 'kcbsRecords',
  toObject: {
    getters: true,
    virtuals: true
  }
});

kcbsRecordSchema.virtual('fromUser')
  .get(function() {
    return this._fromUser;
  })
  .set(function(p) {
    this._fromUser = p;
  });

// 与银行间的交易记录
kcbsRecordSchema.statics.insertSystemRecord = async (type, u, ctx, additionalReward) => {
  additionalReward = additionalReward || 0;
  const {nkcModules, address, port, data, db} = ctx;
  const {user} = data;
  if(!user || !u) return;
  // 加载相应科创币设置
  const kcbsType = await db.KcbsTypeModel.findOnly({_id: type});
  // 如果是撤销操作则扣除额外的奖励
  kcbsType.num -= additionalReward;
  if(kcbsType.count === 0) {
    // 此操作未启动
    return;
  } else if(kcbsType.count !== -1) {
    // 获取今日已触发该操作的次数
    const today = nkcModules.apiFunction.today();
    const recordsCount = await db.KcbsRecordModel.count({
      type,
      $or: [
        {
          from: u.uid,
          to: 'bank'
        },
        {
          from: 'bank',
          to: u.uid
        }
      ],
      toc: {$gt: today}
    });
    // 若次数已达上限则不做任何处理
    if(recordsCount >= kcbsType.count) return;
  }
  // 若kcbsType === -1则不限次数
  const kcbSettings = await db.SettingModel.findOnly({_id: 'kcb'});
  const _id = await db.SettingModel.operateSystemID('kcbsRecords', 1);
  const newRecords = db.KcbsRecordModel({
    _id,
    from: 'bank',
    to: u.uid,
    type,
    num: kcbsType.num,
    ip: address,
    port
  });
  let bankChange = -1*kcbsType.num;
  // 若该操作科创币为负，则由用户转给银行
  if(kcbsType.num < 0) {
    newRecords.from = u.uid;
    newRecords.to = 'bank';
    bankChange = -1*kcbsType.num;
    newRecords.num = -1*newRecords.num;
  }
  if(data.targetUser) {
    if(data.user !== u) {
      newRecords.tUid = data.user.uid;
    } else {
      newRecords.tUid = data.targetUser.uid;
    }
  }
  let thread, forum, post;
  if(data.thread) {
    thread = data.thread;
  } else if (data.targetThread) {
    thread = data.targetThread;
  }
  /* if(data.forum) {
    forum = data.forum;
  } else if (data.targetForum) {
    forum = data.targetForum;
  } */
  if(data.post) {
    post = data.post;
  } else if (data.targetPost) {
    post = data.targetPost;
  }
  if(thread) {
    newRecords.tid = thread.tid;
    newRecords.fid = thread.fid;
  }
  if(post) {
    newRecords.pid = post.pid;
    newRecords.fid = post.fid;
    newRecords.tid = post.tid;
  }
  // if(forum) newRecords.fid = forum.fid;
  if(data.problem) newRecords.problemId = data.problem._id;
  try{
    await newRecords.save();
  } catch(err) {
    // await db.SettingModel.operateSystemID('kcbsRecords', -1);
    ctx.throw(err);
  }
  try{
    await kcbSettings.update({$inc: {'c.totalMoney': bankChange}});
  } catch(err) {
    await newRecords.remove();
    // await db.SettingModel.operateSystemID('kcbsRecords', -1);
  }

  u.kcb += -1*bankChange;
  await u.save();
};

// 用户间转账记录
kcbsRecordSchema.statics.insertUsersRecord = async (options) => {
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const SettingModel = mongoose.model('settings');
  const {
    fromUser, toUser, num, description, post, ip, port
  } = options;
  const _id = await SettingModel.operateSystemID('kcbsRecords', 1);
  const record = KcbsRecordModel({
    _id,
    from: fromUser.uid,
    to: toUser.uid,
    num,
    description,
    pid: post.pid,
    ip,
    port,
    type: 'creditKcb'
  });
  let fromUsersKcb, toUsersKcb;
  if(fromUser.uid !== toUser.uid) {
    fromUsersKcb = fromUser.kcb;
    toUsersKcb = toUser.kcb;
    fromUser.kcb -= num;
    toUser.kcb += num;
  }
  try{
    await record.save();
    await fromUser.save();
    await toUser.save();
  } catch(err) {
    // await SettingModel.operateSystemID('kcbsRecords', 1);
    if(fromUser.uid !== toUser.uid) {
      fromUser.kcb = fromUsersKcb;
      toUser.kcb = toUsersKcb;
      await fromUser.save();
      await toUser.save();
    }
    throw err;
  }
};


kcbsRecordSchema.statics.extendKcbsRecords = async (records) => {
  const UserModel = mongoose.model('users');
  const ThreadModel = mongoose.model('threads');
  const PostModel = mongoose.model('posts');
  const ForumModel = mongoose.model('forums');
  const KcbsTypeModel = mongoose.model('kcbsTypes');
  const uid = new Set(), pid = new Set(), tid = new Set(), fid = new Set(), kcbsTypesId = new Set();
  for(const r of records) {
    if(r.from !== 'bank') {
      uid.add(r.from);
    }
    if(r.to !== 'bank') {
      uid.add(r.to);
    }
    if(r.pid) pid.add(r.pid);
    if(r.tid) tid.add(r.tid);
    if(r.fid) fid.add(r.fid);
    if(r.tUid) uid.add(r.tUid);
    kcbsTypesId.add(r.type);
  }
  const usersObj = {}, threadsObj = {}, forumsObj = {}, postsObj = {}, typesObj = {};
  const users = await UserModel.find({uid: {$in: [...uid]}});
  const threads = await ThreadModel.find({tid: {$in: [...tid]}});
  const forums = await ForumModel.find({fid: {$in: [...fid]}});
  const posts = await PostModel.find({pid: {$in: [...pid]}});
  const types = await KcbsTypeModel.find({_id: {$in: [...kcbsTypesId]}});
  for(const t of types) {
    typesObj[t._id] = t;
  }
  for(const user of users) {
    usersObj[user.uid] = user;
  }
  for(const forum of forums) {
    forumsObj[forum.fid] = forum;
  }
  for(const thread of threads) {
    threadsObj[thread.fid] = thread;
  }
  for(const post of posts) {
    postsObj[post.fid] = post;
  }
  return records.map(r => {
    r = r.toObject();
    if(r.tUid) r.targetUser = usersObj[r.tUid];
    if(r.from !== 'bank') {
      r.fromUser = usersObj[r.from];
    }
    if(r.to !== 'bank') {
      r.toUser = usersObj[r.to];
    }
    if(r.tid) r.thread = threadsObj[r.tid];
    if(r.fid) r.forum = forumsObj[r.fid];
    if(r.pid) r.post = postsObj[r.pid];
    r.kcbsType = typesObj[r.type];
    return r
  });
};

/* 
  获取支付宝链接，去充值或付款。付款时需传递参数options.type = 'pay'
  @param options
    uid: 充值用户、付款用户
    money: 金额，分
    ip: 操作人IP地址,
    port: 操作人端口，
    title: 账单标题, 例如：科创币充值
    notes: 账单说明，例如：充值23个科创币
    backParams: 携带的参数，会原样返回
  @return url: 返回链接
  @author pengxiguaa 2019/3/13  
*/
kcbsRecordSchema.statics.getAlipayUrl = async (options) => {
  let {uid, money, ip, port, title, notes, backParams} = options;
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const SettingModel = mongoose.model('settings');
  money = Number(money);
  if(money > 0) {}
  else {
    throwErr(400, '金额必须大于0');
  }
  const kcbsRecordId = await SettingModel.operateSystemID('kcbsRecords', 1);
  const record = KcbsRecordModel({
    _id: kcbsRecordId,
    from: 'bank',
    to: uid,
    type: 'recharge',
    num: money,
    ip,
    port,
    verify: false,
    description: `科创币充值，充值金额${money/100}`
  });
  await record.save();
  const o = {
    money: money/100,
    id: kcbsRecordId,
    title,
    notes,
    backParams,
    returnUrl: serverConfig.domain + '/account/finance/recharge?type=back' + (backParams.type === 'pay'?'&pay=true':'')
  };
  return await alipay2.receipt(o);
};


module.exports = mongoose.model('kcbsRecords', kcbsRecordSchema);