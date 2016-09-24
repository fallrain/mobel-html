(function(){
  var beforeSendFn = function(ajaxRequest){
    ajaxRequest.setRequestHeader("Accept", "application/json");
  };
  var completeFn = function(){
  };
  var successFn = function(json){
    if(typeof json === 'string'){
      try{
        json = eval("(" + json + ")");
      }catch(e){
      }
    }
    this.callBack(json);
  };
  var errorFn = function(x, t, e){
    var data = {
      success: false
    };
    if(t == "timeout"){
      data.message = "请求超时";
    }else if(x.status == 404){
      data.message = "404:您访问的资源不存在";
    }else{
      data.message = "未知异常！源：" + (x && x.responseText) + "； 错误类型：" + t + "；异常：" + e;
    }
    this.callBack(data);
  };
  window.Common = {
    sendFormData: function(url, callBack, data, options){
      options = options || {};
      $.ajax($.extend({
        url: url,
        type: 'post',
        async: true,
        data: data,
        beforeSend: beforeSendFn,
        complete: completeFn,
        success: successFn,
        error: errorFn,
        callBack: callBack
      }, options));
    },
  };
  var urlHead = 'http://eshop.haier.com';//url头部
  var urlObj = {
    isShowOrder: '/showorder/isShowOrder',//判断用户是否晒单服务
    showOrderList: '/showorder/showOrderList',//晒单活动列表页服务
    saveShowOrder: '/showorder/saveShowOrder',//晒单保存服务
    saveAssist: '/showorder/saveAssist',//晒单点赞服务
    showOrderPicUpload: '/showorder/showOrderList',//上传图片保存
  };

  /*判断登录区域*/
  //判断当前是否存在同域Cookie
  function istrsidssdssotoken(){
    var trsidssdssotoken = "trsidssdssotoken";//同域Cookie
    var sdssotoken = jQuery.cookie(trsidssdssotoken);
    if(sdssotoken != null && sdssotoken != ''){
      return true;
    }else{
      return false;
    }
  }

  var gotoLogin = function(){
    var returnUrl = window.location.href;
    location.href = "http://testuser.haier.com/ids/mobile/login.jsp?returnUrl=" + returnUrl;
    //location.href = "http://user.haier.com/ids/mobile/login.jsp?returnUrl=" + returnUrl;
  };

  if(!istrsidssdssotoken()){//cookie 中的是否登录
    gotoLogin();
  }


  function showOederCheck(){
    /*判断是否晒单来判断*/
    var beShowurl = urlObj.isShowOrder;
    Common.sendFormData(beShowurl, function(data){
      if(data.isSuccess){
        var isshow = data.data.isshow;
        if(isshow == 0){//无数据
          showOrderObj.myCpList = data.data.orderList;
          $('#js-sdbtn').addClass("z-hide");
        }
        if(isshow == 1){
          showOrderObj.myCpOrder = data.data.showOrder;
          $('#js-nosdbtn').addClass("z-hide");
        }
      }
    });
  }


  function showMyCpList(){
    /*点击跳轉我要曬單*/
    var ordData = JSON.stringify(showOrderObj.myCpList);
    location.href = 'mob-tj.html?mylist?' + ordData;
  }

  function mysetinfo(){
    var args = location.href.split('?');
    if(args[1] == 'mylist'){
      var wantData = args[2]
      wantData = decodeURI(wantData);
      wantData = JSON.parse(wantData);
      showOrderObj.myCpList = wantData;
      toShowOrder(wantData);
    }
  }

  function toShowOrder(data){
    /*填写信息晒单*/
    var ordList = data;
    var ordListLen = ordList.length;
    var liAy = [];
    for(var i = 0; i < ordListLen; i++){
      var ord = ordList[i];
      var li = '<li data-productID="' + ord.GOODS_ID + '" data-orderId="' + ord.ORDER_ID + '" data-productDesc="' + ord.GOODS_NAME + '">';
      li += ord.GOODS_NAME + '</li>';
      liAy.push(li);
    }
    $('#beShowOrd').html(liAy.join(''));
  }

  //图片上传绑定事件
  $.jUploader.setDefaults({
    cancelable: true, // 可取消上传
    allowedExtensions: ['jpg', 'png'], // 只允许上传图片
    messages: {
      upload: '上传',
      cancel: '取消',
      emptyFile: "{file} 为空，请选择一个文件.",
      //invalidExtension: "{file} 后缀名不合法. 只有 {extensions} 是允许的.",
      invalidExtension: "只能上传后缀名是 {extensions} 的图片。",
      onLeave: "文件正在上传，如果你现在离开，上传将会被取消。"
    }
  });
  var smtImgsAy = [];//保存图片的数组


  function bindUpImg(){
    /*图片都绑定上事件*/
    smtImgsAy = [];//开始就置空
    for(var i = 0; i < 5; i++){
      $.jUploader({
        button: 'upImg' + i, // 这里设置按钮id
        action: urlHead + '/showorder/showOrderPicUpload',
        // 开始上传事件
        onUpload: function(data){
        },
        // 上传完成事件
        onComplete: function(name, data){
          if(data.isSuccess){
            var picSrc = '/files/' + data.data; //获取图片路径
            var btn = this.button;
            var img = btn.siblings('img');
            img.prop('src', picSrc);
            btn.css('display', 'none');
            img.css('display', 'block');
            var btnId = btn.prop('id');
            var btnIdNum = btnId.substr(btnId.length - 1) * 1 + 1;
            if(btnIdNum > 4){
              return;
            }
            $('#upImg' + btnIdNum).css('display', 'block');
            smtImgsAy.push(picSrc);
          }else{
            //alert(data.resultMsg);
          }
        },
        // 系统信息显示（例如后缀名不合法）
        showMessage: function(message){
        },
        // 取消上传事件
        onCancel: function(fileName){
        },
        debug: true
      });
    }
  }

  function smtOrd(){
    /*提交晒单*/
    var showContentStr = $('#showContent').val();
    checkNumOfContent(showContentStr);
  }

  function checkShowOrdForm(){
    /*校验表单*/
    var showContentStr = $('#showContent').val();
    var isContentSuc = checkNumOfContent(showContentStr);
    //检查图片
    var isImgSuc = true;
    if(smtImgsAy.length < 1){
      $('#upImgTip').css('display', 'block');
      isImgSuc = false;
    }else{
      $('#upImgTip').css('display', 'none');
    }
    var isOrdIdSuc = !!$('#js-name').html();
    if(!$('#js-name').html()){
      $('#ordSltTip').css('display', 'block');
    }else{
      $('#ordSltTip').css('display', 'none');
    }
    if(isContentSuc && isImgSuc && isOrdIdSuc){
      return true;
    }
  }

  function smtOrd(){
    /*提交晒单*/
    if(!checkShowOrdForm()){
      alert('请完整填写表单！');
      return;
    }
    var ordSlt = $('#js-name');
    var ID = ordSlt.attr('data-id');
    var productID = ordSlt.attr('data-productID');
    var productDesc = ordSlt.attr('data-productDesc');
    var orderId = ordSlt.attr('data-orderId');
    var showContent = $('#showContent').val();
    var showPics = smtImgsAy.join(',');
    var params = {
      id: ID,
      productID: productID,
      productDesc: productDesc,
      orderId: orderId,
      showContent: showContent,
      showPics: showPics,
    };
    var url = urlObj.saveShowOrder;
    Common.sendFormData(url, function(data){
      if(data.isSuccess){
        //成功則跳轉頁面
        location.href = 'index.html';
      }else{
        alert(data.resultMsg);
      }
    }, params);
  }


  var upImg = function(data){
    /*上传图片的html*/
    var imglen = data.length;
    var upimgul = $('<ul class="m-upimg"></ul>');
    for(var i = 0; i < 5; i++){
      var ord = data[i];
      var upImg = $('<div class="js-m-imgbox m-imgbox"><img src=""/></div>');
      var btnImg = $('<a class="z-add"></a>');
      var li = $('<li></li>');
      li.append(btnImg);
      li.append(upImg);
      upimgul.append(li);
    }
  };

  function showMyCpOrder(){
    /*点击跳轉我的產品*/
    var ordData = JSON.stringify(showOrderObj.myCpOrder);
    location.href = 'mob.html?myOrder?' + ordData;
  }

  function myseordsetinfo(){
    var args = location.href.split('?');
    if(args[1] == 'myOrder'){
      var mycpData = args[2];
      mycpData = decodeURI(mycpData);
      mycpData = JSON.parse(mycpData);
      showOrderObj.curMyOrdData = mycpData;
      fillInMyOrd(mycpData);
    }
  }

  function fillInMyOrd(data){
    /*我的晒单信息*/
    var order = data;
    var showOrderPar = $('#js-sdminute');
    var proUserPic = $('#js-sdUserPic');
    proUserPic.html(order.idsUserPic);
    var userName = $('#js-idname');
    userName.html(order.idsUserName);
    var proName = $('#js-sdname');
    proName.html(order.productDesc);
    var proNum = $('#js-sdOrderId');
    proNum.html(order.orderId);
    var proCont = $('#js-sdcont');
    proCont.html(order.showContent);
    var proClickzan = $('#js-dznum');
    proClickzan.html(order.assistcount);
    var showOrderImgPar = $('#js-sdpics');
    var showPics = order.showPics.split(',');
    var picLen = showPics.length;
    for(var i = 0; i < picLen; i++){
      var pic = showPics[i];
      var img = $('<img class="img100per" src="' + '/files' + pic + '"/>');
      var imgPar = $('<div class="m-imgbox"></div>');
      imgPar.append(img);
    }
    showOrderImgPar.html(imgPar);
  }


  function showMyOrder(){
    /*点击跳轉other產品*/
    var $this = $(this);
    //debugger
    var num = $this.attr('data-index');
    var ordData = showOrderObj.ordsData[num];
    ordData = JSON.stringify(ordData);
    location.href = 'mob-other.html?otherOrder?' + ordData;
  }

  function myordsetinfo(){
    var args = location.href.split('?');
    if(args[1] == 'otherOrder'){
      var sendData = args[2]
      sendData = decodeURI(sendData);
      sendData = JSON.parse(sendData);
      showOrderObj.curMyOrdData = sendData;
      fillInProOrd(sendData);
    }
  }

  function fillInProOrd(data){
    /*会员晒单信息*/
    var order = data;
    var showOrderPar = $('#js-sdminute');
    var proUserPic = $('#js-sdUserPic');
    proUserPic.html(order.idsUserPic);
    var userName = $('#js-idname');
    userName.html(order.idsUserName);
    var proName = $('#js-sdname');
    proName.html(order.productDesc);
    var proNum = $('#js-sdOrderId');
    proNum.html(order.orderId);
    var proCont = $('#js-sdcont');
    proCont.html(order.showContent);
    var proClickzan = $('#js-othdznum');
    proClickzan.html(order.assistcount);
    var showOrderImgPar = $('#js-sdpics');
    var showPics = order.showPics.split(',');
    var picLen = showPics.length;
    for(var i = 0; i < picLen; i++){
      var pic = showPics[i];
      var img = $('<img class="img100per" src="' + '/files' + pic + '"/>');
      var imgPar = $('<div class="m-imgbox"></div>');
      imgPar.append(img);
    }
    showOrderImgPar.html(imgPar);
  }


  var showOrderObj = {};
  window.showOrderObj = showOrderObj;//对外释放的对象
  showOrderObj.showOrderList = function(currentPage, pageSize){
    /*查询晒单列表*/
    var url = urlObj.showOrderList;
    Common.sendFormData(url, function(data){
      if(data.isSuccess){
        var orderListHtml = genOrderListHtml(data.data.resultList);
        var orderListPar = $('#js-prolist');
        //添加进去
        orderListPar.html(orderListHtml);
        //给定单绑定跳转
        $('.js-m-leftimg').on('click', showMyOrder);
      }else{
        //alert(data.resultMsg);
      }
    });
  };
  var genOrderListHtml = function(data){
    /*组合晒单的html*/
    showOrderObj.ordsData = data;
    var len = data.length;
    var cpListall = $('<div></div>');
    for(var i = 0; i < len; i++){
      var ord = data[i];
      var name = $('<div class="m-name">' + ord.idsUserName + '</div>');
      var img = $('<img class="img100per" src="' + '/files' + ord.showPics + '"/>');
      var proLeft = $('<div class="js-m-leftimg m-leftimg" data-index="' + i + '"></div>');
      proLeft.append(img);
      var zanNum = $('<div class="m-num">' + ord.assistcount + '</div>');
      var zan = $('<a class="z-zan" data-showOrderId="' + ord.id + '"></a>');
      var zanPar = $('<div class="m-rigbtn"></div>');
      zanPar.append(zanNum);
      zanPar.append(zan);
      var txt = $('<div class="m-txt">' + ord.showContent + '</div>');
      var proRight = $('<div class="m-rightbox"></div>');
      proRight.append(zanPar);
      proRight.append(txt);
      var cpList = $('<div class="m-list"></div>');
      cpList.append(name);
      cpList.append(proLeft);
      cpList.append(proRight);
      cpListall.append(cpList);
    }
    return cpListall;
  };


  function clickZan(e){
    /*点赞事件*/
    var tg = e.target;
    var $tg = $(tg);
    if(!$tg.hasClass('z-zan')){
      return;
    }
    var url = urlObj.saveAssist;
    var params = {
      showOrderId: $tg.attr('data-showOrderId')
    };
    Common.sendFormData(url, function(data){
      if(data.isSuccess){
        var $zanNum = $($tg.siblings('.m-nubmer'));
        var num = $zanNum.html() * 1;
        $zanNum.html(++num);
        $tg.addClass('z-crt');
      }else{
        alert(data.resultMsg);
      }
    }, params);
  }


  function checkNumOfContent(str){
    /*检查字数*/
    var len = str.split('').length;
    if(len > 50 && len <= 100){
      $('#showContentTip').html('输入晒单文字不得少于50个字多于100个字');
      return true;
    }
    $('#showContentTip').html('输入错误！输入晒单文字不得少于50个字多于100个字');
  }


  function myOrdClickZan(){
    /*给别人点赞事件*/
    var $this = $(this);
    $this.prop('disabled', true);
    var url = urlObj.saveAssist;
    var params = {
      showOrderId: showOrderObj.curMyOrdData.id
    };
    Common.sendFormData(url, function(data){
      if(data.isSuccess){
        $this.find('.z-dzan').addClass('z-crt');
        var othdznum = $('#js-othdznum');
        var num = othdznum.html() * 1
        $('#js-othdznum').html(++num);
      }else{
        $this.prop('disabled', false);
        alert(data.resultMsg);
      }
    }, params);
  }

  function bindLis(){
    $('#js-prolist').off('click');
    $('#js-prolist').on('click', clickZan);
    $('#z-up').on('click', smtOrd);
    bindUpImg();//绑定上传图片事件
    $('.js-otherzan').click(myOrdClickZan);
    $('#js-mysd').click(showMyCpOrder);//绑定我的晒单
    $('#js-iwantsd').click(showMyCpList);//绑定我要晒单
    //$('.js-m-leftimg').on('click', fillInProOrd);
  }

  (function init(){
    /*初始化页面*/
    showOederCheck();//晒单服务
    bindLis();//绑定事件
    showOrderObj.showOrderList();//查询列表页
    myordsetinfo();
    myseordsetinfo();
    mysetinfo();
  })();
})();