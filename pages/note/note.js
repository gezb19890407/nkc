(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
data.note.notes.map(function (note) {
  note.edit = false;
  note.options = false;
});
var app = new Vue({
  el: "#note",
  data: {
    uid: NKC.configs.uid,
    note: data.note,
    content: ""
  },
  mounted: function mounted() {
    document.body.addEventListener("click", function (e) {
      if (e.target.classList.contains("note-options-icon")) return;
      app.note.notes.map(function (note) {
        return note.options = false;
      });
    });
  },
  methods: {
    visitUrl: NKC.methods.visitUrl,
    getUrl: NKC.methods.tools.getUrl,
    fromNow: NKC.methods.fromNow,
    openOptions: function openOptions(nc) {
      app.note.notes.map(function (note) {
        return note.options = false;
      });
      nc.options = !nc.options;
    },
    resetTextarea: function resetTextarea(nc) {
      var textArea;

      if (!nc) {
        textArea = this.$refs.newNote;
      } else {
        textArea = this.$refs[nc._id][0];
      }

      if (!textArea) return;
      var rem = 5;
      var num = rem * 12;
      textArea.style.height = rem + 'rem';

      if (num < textArea.scrollHeight) {
        textArea.style.height = textArea.scrollHeight + 'px';
      }
    },
    saveNewNote: function saveNewNote() {
      // 创建新的
      var content = this.content,
          note = this.note;
      Promise.resolve().then(function () {
        if (!content) throw "请输入笔记内容";
        var type = note.type,
            targetId = note.targetId,
            _id = note._id,
            node = note.node;
        return nkcAPI("/note", "POST", {
          _id: _id,
          type: type,
          targetId: targetId,
          node: node,
          content: content
        });
      }).then(function (data) {
        app.content = "";
        /*if(!app.note._id) {
          window.location.href = `/note/${data.note._id}`;
        }*/

        data.note.notes.map(function (note) {
          note.options = false;
          note.edit = false;
        });
        app.note = data.note;
        setTimeout(function () {
          app.resetTextarea();
        }, 50);
      })["catch"](sweetError);
    },
    saveNote: function saveNote(n) {
      // 保存编辑
      var note = this.note,
          uid = this.uid;
      var url,
          method,
          data = {};

      if (n.uid === uid) {
        url = "/note/".concat(note._id, "/c/").concat(n._id);
        method = "PATCH";
        data.content = n.content;
      } else {
        url = "/nkc/note";
        method = "POST";
        data.type = "modify";
        data.noteId = note._id;
        data.noteContentId = n._id;
        data.content = n.content;
      }

      nkcAPI(url, method, data).then(function (data) {
        n.html = data.noteContentHTML;
        app.modifyNoteContent(n);
        Vue.set(note.notes, note.notes.indexOf(n), n);
      })["catch"](sweetError);
    },
    modifyNoteContent: function modifyNoteContent(nc) {
      nc.edit = !nc.edit;

      if (nc.edit) {
        setTimeout(function () {
          app.resetTextarea(nc);
        }, 50);
      }
    },
    deleteNoteContent: function deleteNoteContent(n, type) {
      var note = this.note;
      var url,
          method,
          data = {};

      if (type === "delete") {
        url = "/note/".concat(note._id, "/c/").concat(n._id);
        method = "DELETE";
      } else {
        method = "POST";
        url = "/nkc/note";

        if (n.disabled) {
          data.type = "cancelDisable";
        } else {
          data.type = "disable";
        }

        data.noteId = note._id;
        data.noteContentId = n._id;
      }

      sweetQuestion("确定要执行此操作？").then(function () {
        return nkcAPI(url, method, data);
      }).then(function () {
        if (type === "delete") {
          n.deleted = true;
        } else {
          n.disabled = !n.disabled;
        }

        sweetSuccess("操作成功");
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL25vdGUvbm90ZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLENBQWdCLEdBQWhCLENBQW9CLFVBQUEsSUFBSSxFQUFJO0FBQzFCLEVBQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxLQUFaO0FBQ0EsRUFBQSxJQUFJLENBQUMsT0FBTCxHQUFlLEtBQWY7QUFDRCxDQUhEO0FBSUEsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbEIsRUFBQSxFQUFFLEVBQUUsT0FEYztBQUVsQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FEYjtBQUVKLElBQUEsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUZQO0FBR0osSUFBQSxPQUFPLEVBQUU7QUFITCxHQUZZO0FBT2xCLEVBQUEsT0FQa0IscUJBT1I7QUFDUixJQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsZ0JBQWQsQ0FBK0IsT0FBL0IsRUFBd0MsVUFBQyxDQUFELEVBQU87QUFDN0MsVUFBRyxDQUFDLENBQUMsTUFBRixDQUFTLFNBQVQsQ0FBbUIsUUFBbkIsQ0FBNEIsbUJBQTVCLENBQUgsRUFBcUQ7QUFDckQsTUFBQSxHQUFHLENBQUMsSUFBSixDQUFTLEtBQVQsQ0FBZSxHQUFmLENBQW1CLFVBQUEsSUFBSTtBQUFBLGVBQUksSUFBSSxDQUFDLE9BQUwsR0FBZSxLQUFuQjtBQUFBLE9BQXZCO0FBQ0QsS0FIRDtBQUlELEdBWmlCO0FBYWxCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxRQUFRLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQURmO0FBRVAs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QUNEOztBQUNELFFBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNELE9BWEgsV0FZUyxVQVpUO0FBYUQ7QUFwSE07QUFiUyxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJkYXRhXCIpO1xyXG5kYXRhLm5vdGUubm90ZXMubWFwKG5vdGUgPT4ge1xyXG4gIG5vdGUuZWRpdCA9IGZhbHNlO1xyXG4gIG5vdGUub3B0aW9ucyA9IGZhbHNlO1xyXG59KTtcclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6IFwiI25vdGVcIixcclxuICBkYXRhOiB7XHJcbiAgICB1aWQ6IE5LQy5jb25maWdzLnVpZCxcclxuICAgIG5vdGU6IGRhdGEubm90ZSxcclxuICAgIGNvbnRlbnQ6IFwiXCJcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xyXG4gICAgICBpZihlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJub3RlLW9wdGlvbnMtaWNvblwiKSkgcmV0dXJuO1xyXG4gICAgICBhcHAubm90ZS5ub3Rlcy5tYXAobm90ZSA9PiBub3RlLm9wdGlvbnMgPSBmYWxzZSk7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIHZpc2l0VXJsOiBOS0MubWV0aG9kcy52aXNpdFVybCxcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgZnJvbU5vdzogTktDLm1ldGhvZHMuZnJvbU5vdyxcclxuICAgIG9wZW5PcHRpb25zKG5jKSB7XHJcbiAgICAgIGFwcC5ub3RlLm5vdGVzLm1hcChub3RlID0+IG5vdGUub3B0aW9ucyA9IGZhbHNlKTtcclxuICAgICAgbmMub3B0aW9ucyA9ICFuYy5vcHRpb25zO1xyXG4gICAgfSxcclxuICAgIHJlc2V0VGV4dGFyZWEobmMpIHtcclxuICAgICAgbGV0IHRleHRBcmVhO1xyXG4gICAgICBpZighbmMpIHtcclxuICAgICAgICB0ZXh0QXJlYSA9IHRoaXMuJHJlZnMubmV3Tm90ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0ZXh0QXJlYSA9IHRoaXMuJHJlZnNbbmMuX2lkXVswXTtcclxuICAgICAgfVxyXG4gICAgICBpZighdGV4dEFyZWEpIHJldHVybjtcclxuICAgICAgY29uc3QgcmVtID0gNTtcclxuICAgICAgY29uc3QgbnVtID0gcmVtICogMTI7XHJcbiAgICAgIHRleHRBcmVhLnN0eWxlLmhlaWdodCA9IHJlbSArICdyZW0nO1xyXG4gICAgICBpZihudW0gPCB0ZXh0QXJlYS5zY3JvbGxIZWlnaHQpIHtcclxuICAgICAgICB0ZXh0QXJlYS5zdHlsZS5oZWlnaHQgPSB0ZXh0QXJlYS5zY3JvbGxIZWlnaHQgKyAncHgnO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgc2F2ZU5ld05vdGUoKSB7XHJcbiAgICAgIC8vIOWIm+W7uuaWsOeahFxyXG4gICAgICBjb25zdCB7Y29udGVudCwgbm90ZX0gPSB0aGlzO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCFjb250ZW50KSB0aHJvdyBcIuivt+i+k+WFpeeslOiusOWGheWuuVwiO1xyXG4gICAgICAgICAgY29uc3Qge3R5cGUsIHRhcmdldElkLCBfaWQsIG5vZGV9ID0gbm90ZTtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoXCIvbm90ZVwiLCBcIlBPU1RcIiwge1xyXG4gICAgICAgICAgICBfaWQsXHJcbiAgICAgICAgICAgIHR5cGUsXHJcbiAgICAgICAgICAgIHRhcmdldElkLFxyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBjb250ZW50XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgYXBwLmNvbnRlbnQgPSBcIlwiO1xyXG4gICAgICAgICAgLyppZighYXBwLm5vdGUuX2lkKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYC9ub3RlLyR7ZGF0YS5ub3RlLl9pZH1gO1xyXG4gICAgICAgICAgfSovXHJcbiAgICAgICAgICBkYXRhLm5vdGUubm90ZXMubWFwKG5vdGUgPT4ge1xyXG4gICAgICAgICAgICBub3RlLm9wdGlvbnMgPSBmYWxzZTtcclxuICAgICAgICAgICAgbm90ZS5lZGl0ID0gZmFsc2U7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGFwcC5ub3RlID0gZGF0YS5ub3RlO1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGFwcC5yZXNldFRleHRhcmVhKCk7XHJcbiAgICAgICAgICB9LCA1MClcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICBzYXZlTm90ZShuKSB7XHJcbiAgICAgIC8vIOS/neWtmOe8lui+kVxyXG4gICAgICBjb25zdCB7bm90ZSwgdWlkfSA9IHRoaXM7XHJcbiAgICAgIGxldCB1cmwsIG1ldGhvZCwgZGF0YSA9IHt9O1xyXG4gICAgICBpZihuLnVpZCA9PT0gdWlkKSB7XHJcbiAgICAgICAgdXJsID0gYC9ub3RlLyR7bm90ZS5faWR9L2MvJHtuLl9pZH1gO1xyXG4gICAgICAgIG1ldGhvZCA9IFwiUEFUQ0hcIjtcclxuICAgICAgICBkYXRhLmNvbnRlbnQgPSBuLmNvbnRlbnQ7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdXJsID0gYC9ua2Mvbm90ZWA7XHJcbiAgICAgICAgbWV0aG9kID0gXCJQT1NUXCI7XHJcbiAgICAgICAgZGF0YS50eXBlID0gXCJtb2RpZnlcIjtcclxuICAgICAgICBkYXRhLm5vdGVJZCA9IG5vdGUuX2lkO1xyXG4gICAgICAgIGRhdGEubm90ZUNvbnRlbnRJZCA9IG4uX2lkO1xyXG4gICAgICAgIGRhdGEuY29udGVudCA9IG4uY29udGVudDtcclxuICAgICAgfVxyXG4gICAgICBua2NBUEkodXJsLCBtZXRob2QsIGRhdGEpXHJcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgIG4uaHRtbCA9IGRhdGEubm90ZUNvbnRlbnRIVE1MO1xyXG4gICAgICAgICAgYXBwLm1vZGlmeU5vdGVDb250ZW50KG4pO1xyXG4gICAgICAgICAgVnVlLnNldChub3RlLm5vdGVzLCBub3RlLm5vdGVzLmluZGV4T2YobiksIG4pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIG1vZGlmeU5vdGVDb250ZW50KG5jKSB7XHJcbiAgICAgIG5jLmVkaXQgPSAhbmMuZWRpdDtcclxuICAgICAgaWYobmMuZWRpdCkge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgYXBwLnJlc2V0VGV4dGFyZWEobmMpO1xyXG4gICAgICAgIH0sIDUwKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGRlbGV0ZU5vdGVDb250ZW50KG4sIHR5cGUpIHtcclxuICAgICAgY29uc3Qge25vdGV9ID0gdGhpcztcclxuICAgICAgbGV0IHVybCwgbWV0aG9kLCBkYXRhID0ge307XHJcbiAgICAgIGlmKHR5cGUgPT09IFwiZGVsZXRlXCIpIHtcclxuICAgICAgICB1cmwgPSBgL25vdGUvJHtub3RlLl9pZH0vYy8ke24uX2lkfWA7XHJcbiAgICAgICAgbWV0aG9kID0gXCJERUxFVEVcIjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBtZXRob2QgPSBcIlBPU1RcIjtcclxuICAgICAgICB1cmwgPSBgL25rYy9ub3RlYDtcclxuICAgICAgICBpZihuLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICBkYXRhLnR5cGUgPSBcImNhbmNlbERpc2FibGVcIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZGF0YS50eXBlID0gXCJkaXNhYmxlXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRhdGEubm90ZUlkID0gbm90ZS5faWQ7XHJcbiAgICAgICAgZGF0YS5ub3RlQ29udGVudElkID0gbi5faWQ7XHJcbiAgICAgIH1cclxuICAgICAgc3dlZXRRdWVzdGlvbihcIuehruWumuimgeaJp+ihjOatpOaTjeS9nO+8n1wiKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkodXJsLCBtZXRob2QsIGRhdGEpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZih0eXBlID09PSBcImRlbGV0ZVwiKSB7XHJcbiAgICAgICAgICAgIG4uZGVsZXRlZCA9IHRydWU7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuLmRpc2FibGVkID0gIW4uZGlzYWJsZWQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLmk43kvZzmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgIH1cclxuICB9XHJcbn0pOyJdfQ==
