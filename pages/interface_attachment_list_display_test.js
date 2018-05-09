var ResourceListItem = React.createClass({
    click:function(event){
      event.index = this.props.index;
      event.rid = this.props.robject.rid
      this.props.click(event);
    },
    render:function(){
      var robject = this.props.robject;
      var rid = robject.rid
      var oname = robject.oname
  
      //附件名太长的处理
      var oname1 = oname.split('.')[0];
      var oname2 = oname.split('.')[1];
      var new_oname;
      if(oname1.length > 15){
        new_oname = oname1.substring(0,15)+'.'+oname2;
      }else{
        new_oname = oname;
      }
  
      return (
        <div className="ResourceListItem" onClick={this.click}>
          <img className="ResourceListItemThumb" src={'/rt/'+rid}></img>
          <div className="ResourceListItemText">{new_oname}</div>
        </div>
      )
    }
  })
  
  var MoarButton = React.createClass({
    render:function(){
      return (
        <button onClick={showMoreAttachments} className="btn btn-default">更多</button>
      )
    }
  })

  var littleButton = React.createClass({
    render:function(){
      return (
        <button onClick={showLittleAttachments} className="btn btn-default">收起</button>
      )
    }
  })
  
  var ResourceList = React.createClass({
    render:function(){
      var list = this.props.list
      var renderedNodes = []
      for(i in list){
        var robject = list[i]
  
        renderedNodes.push(
          <ResourceListItem click={this.props.itemclick} key={robject.rid} index={i} robject={robject}/>
        )
      }
      return(
        <div className="ResourceList">
          {renderedNodes}
          <MoarButton/>
          <button onClick={showLittleAttachments} className="btn btn-default">收起</button>
        </div>
      )
    }
  })
  
  var list_display = function(options){
    var list_display = {};
  
    //init of attachment list display.
    var list_father = geid('list-container');
  
    list_father.innerHTML = '';//clear
    list_display.rlist = [];
    list_display.quota = 5;
    list_display.refresh = function(){
      //obtain rlist here
      nkcAPI('/me/resource?quota='+list_display.quota, 'get',{})
      .then(rarr=>{
        rarr = rarr.resources;
        list_display.rlist = rarr;
        React.render(
          <ResourceList itemclick={content_insert_resource} list={rarr}/>,
          list_father
        );
      })
      .catch(jalert)
    }
  
    list_display.showMore = function(){
      list_display.quota+=10;
      list_display.refresh();
    }

    list_display.showLittle = function(){
      list_display.quota-=10;
      list_display.refresh();
    }
  
    return list_display;
  }
  
  var list = list_display();
  list.refresh();
  
  function showMoreAttachments(){
    list.showMore();
  }

  function showLittleAttachments(){
    list.showLittle();
  }
  
  function content_insert_resource(event)
  { 
    edInsertContent('text-elem', '/r/' + event.rid, this.robject.ext, this.robject.oname);
  }
  

  