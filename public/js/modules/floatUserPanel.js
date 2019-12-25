"use strict";

var floatUserPanel = new Vue({
  el: "#floatUserPanel",
  data: {
    user: "",
    uid: NKC.configs.uid,
    over: false,
    show: false,
    count: 1,
    onPanel: false,
    users: {},
    timeoutName: ""
  },
  mounted: function mounted() {
    var self = this;
    var panel = $(self.$el);
    panel.css({
      top: 0,
      left: 0
    });
    panel.css({
      top: 300,
      left: 300
    });

    if (this.uid && !window.SubscribeTypes) {
      if (!NKC.modules.SubscribeTypes) {
        return sweetError("未引入与关注相关的模块");
      } else {
        window.SubscribeTypes = new NKC.modules.SubscribeTypes();
      }
    }

    this.initPanel();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    format: NKC.methods.format,
    fromNow: NKC.methods.fromNow,
    initPanel: function initPanel() {
      var doms = $("[data-float-uid]");

      for (var i = 0; i < doms.length; i++) {
        var dom = doms.eq(i);
        if (dom.attr("data-float-init") === "true") continue;
        this.initEvent(doms.eq(i));
      }
    },
    reset: function reset() {
      this.show = false;
      this.onPanel = false;
      this.over = false;
      this.user = "";
    },
    initEvent: function initEvent(dom) {
      var self = this;
      dom.on("mouseleave", function () {
        self.timeoutName = setTimeout(function () {
          self.reset();
        }, 200);
      });
      dom.on("mouseover", function _callee(e) {
        var uid, count_, left, top, width, height;
        return regeneratorRuntime.async(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // 鼠标已悬浮在元素上
                clearTimeout(self.timeoutName);
                self.count++;
                self.over = true;
                count_ = self.count;
                // 做一个延迟，过滤掉鼠标意外划过元素的情况。
                self.timeout(300).then(function () {
                  if (count_ !== self.count) throw "事件已过时1";
                  if (!self.over) throw "事件已过时2";
                  uid = dom.attr("data-float-uid");
                  left = dom.offset().left;
                  top = dom.offset().top;
                  width = dom.width();
                  height = dom.height();
                  return self.getUserById(uid);
                }).then(function (userObj) {
                  var user = userObj.user,
                      subscribed = userObj.subscribed;
                  if (count_ !== self.count) throw "事件已过时3";
                  if (!self.over) throw "事件已过时4";
                  self.user = user;
                  self.subscribed = subscribed;
                  var panel = $(self.$el);
                  self.show = true;
                  panel.on("mouseleave", function () {
                    self.reset();
                  });
                  panel.on("mouseover", function () {
                    clearTimeout(self.timeoutName);
                    self.onPanel = true;
                  });
                  var documentWidth = $(document).width() - 10;
                  var panelWidth = 26 * 12;

                  if (left + panelWidth > documentWidth) {
                    left = documentWidth - panelWidth;
                  }

                  panel.css({
                    top: top + height + 10,
                    left: left
                  });
                })["catch"](function (err) {
                  console.log(err);
                });

              case 5:
              case "end":
                return _context.stop();
            }
          }
        });
      });
      dom.attr("data-float-init", "true");
    },
    timeout: function timeout(t) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve();
        }, t);
      });
    },
    getUserById: function getUserById(id) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var userObj = self.users[id];

        if (userObj) {
          resolve(userObj);
        } else {
          nkcAPI("/u/".concat(id, "?from=panel"), "GET").then(function (data) {
            var userObj = {
              subscribed: data.subscribed,
              user: data.targetUser
            };
            self.users[data.targetUser.uid] = userObj;
            resolve(userObj);
          })["catch"](function (err) {
            console.log(err);
            reject(err);
          });
        }
      });
    },
    subscribe: function subscribe() {
      var user = this.user,
          subscribed = this.subscribed;
      SubscribeTypes.subscribeUser(user.uid, !subscribed);
    }
  }
});