
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
function getcookie(name) {
    var cookie_start = document.cookie.indexOf(name);
    var cookie_end = document.cookie.indexOf(";", cookie_start);
    return cookie_start == -1 ? '' : unescape(document.cookie.substring(cookie_start + name.length + 1, (cookie_end > cookie_start ? cookie_end : document.cookie.length)));
}
function setcookie(cookieName, cookieValue, seconds, path, domain, secure) {
    var expires = new Date();
    expires.setTime(expires.getTime() + seconds);
    document.cookie = escape(cookieName) + '=' + escape(cookieValue)
    + (expires ? '; expires=' + expires.toGMTString() : '')
    + (path ? '; path=' + path : '/')
    + (domain ? '; domain=' + domain : '')
    + (secure ? '; secure' : '');
}
//截取字符串，长度为字符为单位
function subHZString(str, len, hasDot)
{
    var newLength = 0;
    var newStr = '';
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = '';
    var strLength = str.replace(chineseRegex,'**').length;
    for(var i = 0;i < strLength;i++)
    {
        singleChar = str.charAt(i).toString();
        if(singleChar.match(chineseRegex) != null)
        {
            newLength += 2;
        }
        else
        {
            newLength++;
        }
        if(newLength > len)
        {
            break;
        }
        newStr += singleChar;
    }

    if(strLength > len)
    {
        newStr += hasDot;
    }
    return newStr;
}

//获取用户消息数
function getMsgNoReadNum() {
    var nMsgNoReadNum = 0;

    $.ajax({
        type: "post",
        dataType: "json",
        url: "/message/mymsg/getMsgInfoNoReadNum",
        async: true,
        data: {"bIsThirduser":false},
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        },
        success: function (returnData) {
            if (returnData.isSuccess) {
                nMsgNoReadNum = returnData.iMsgNoReadNum;
                if(nMsgNoReadNum!="" && nMsgNoReadNum!=null && nMsgNoReadNum!='0'){
                    //$("#newCounts").html(nMsgNoReadNum);
                    $(".news_box").html("<a class='news_box_img' href='http://user.haier.com/HaierFramework/haier/appuser/vipUser/haiermymsg.jsp'><span><img src='/cn/images/hn_news.png' url='/cn/images/hn_news.png' class='orange' /><i class='hasNews orangeQ'></span></i></a>");
                }else{
                    $(".news_box").html("<a class='news_box_img' href='http://user.haier.com/HaierFramework/haier/appuser/vipUser/haiermymsg.jsp' title='没有最新消息'><span><img src='/cn/images/hn_news.png' url='/cn/images/hn_news.png' /></span></a>");
                }

            } else {
                // alert("获取当前用户未读消息数目失败...");
            }
        }
    });

    return nMsgNoReadNum;
}




function getUserInfo(){
    $.ajax({
        type:"post",
        url:"/HaierFramework/uExchange/getScores.do?random="+Math.random(),
        //async: true,
        //cache: false, //关闭AJAX缓存
        data:{},
        error : function(XMLHttpRequest, textStatus, errorThrown){
        },
        success: function(returnData){
            if(jQuery.trim(returnData).length > 0){
                var res = eval("("+returnData+")");
                if("true"==res.isSuccess || res.isSuccess){
                    var scores = res.scores;
                    var level = res.level;
                    var headpic = res.headpic;
                    /*if(0==level){
                     $("#detailInfoLevel").html("普通会员")
                     }else{
                     $("#detailInfoLevel").html(level+"星会员");
                     }*/
                    if(""==headpic || headpic==null){
                        headpic='/cn/images/ui_po05.png';
                        $("#detailInfoImg").attr("src",headpic);
                        $("#detailInfoImg").attr("url",headpic);
                    }
                    $("#detailInfoImg").attr("src",headpic);
                    $("#detailInfoImg").attr("url",headpic);
                    //$("#detailInfoScore").html(scores);
                    $("#vipUserCenterShowScores").html(scores);
                }
            }
        }

    });
}

function userloginstatus(){
    //查找头部购买下含有海尔商城的连接 end


    //拼接html
    var _down="";
    var returnUrl = window.location.href;
    var ehaier=jQuery.cookie("EHaierSSOToken");//商城的cookie
    var trsidssdssotoken = "trsidssdssotoken";//同域Cookie
    var sdssotoken = jQuery.cookie(trsidssdssotoken);

    if(sdssotoken!=null && sdssotoken!=''){

        jQuery("#hn_no_login").hide();//未登录状态id
        $("#hn_login").removeClass("none");
        $(".news_box").removeClass("none").show();
        jQuery("#hn_login").show();//登陆状态id
        var loginUserName = "haieruser";//当前登录用户
        var ck_loginUserName = jQuery.cookie(loginUserName);

        if(ck_loginUserName!=null && ck_loginUserName!=''){
            //var logusername=subHZString(ck_loginUserName,8,'');
            if(/^[a-zA-Z0-9]*$/.test(ck_loginUserName)){
                if(ck_loginUserName.length>12){
                    ck_loginUserName = ck_loginUserName.substring(0,12)+"...";
                }
            }else{
                if(ck_loginUserName.length>6){
                    ck_loginUserName = ck_loginUserName.substring(0,6)+"...";
                }
            }
            //从cookie中读取当前登录用户
            jQuery("#hn_login span:first").attr("title",jQuery.cookie(loginUserName));
            jQuery("#hn_login span:first").html(ck_loginUserName);
            var thishref = $("#js_tool").attr("href");
            if(thishref!=undefined){
                if(thishref.indexOf("haier_logout")>-1 && thishref.indexOf("returnUrl")<0){
                    $("#js_tool").attr("href",$("#js_tool").attr("href")+"?returnUrl="+returnUrl);
                }
            }

            //详情页地址转换 end


        }else{
            //同域cookie存在，但是 haieruser 没有取出值，去请求haier_ssosession.jsp获取当前登录用户
            var surl = "/ids/cn/haier_ssosession.jsp";
            jQuery.ajax({
                type: "post",
                dataType: "text",
                url: surl,
                error : function(XMLHttpRequest, textStatus, errorThrown){
                },
                success: function(returnData){
                    if(jQuery.trim(returnData).length > 0){
                        var loginUser = jQuery.trim(returnData);
                        //var loginUser2=subHZString(loginUser,8,'');
                        if(/^[a-zA-Z0-9]*$/.test(ck_loginUserName)){
                            if(ck_loginUserName.length>12){
                                var ck_loginUserName = ck_loginUserName.substring(0,12)+"...";
                            }
                        }else{
                            if(ck_loginUserName.length>6){
                                var ck_loginUserName = ck_loginUserName.substring(0,6)+"...";
                            }
                        }
                        jQuery("#hn_login span:first").attr("title",loginUser);
                        jQuery("#hn_login span:first").html(ck_loginUserName);
                        //加载用户海贝以及星级
                        //getUserInfo();
                        //加载消息数量
                        //getMsgNoReadNum();

                        var thishref = $("#js_tool").attr("href");
                        if (thishref != undefined) {
                            if (thishref.indexOf("haier_logout") > -1 && thishref.indexOf("returnUrl") < 0) {
                                $("#js_tool").attr("href", $("#js_tool").attr("href") + "?returnUrl=" + returnUrl);
                            }
                        }

                        //头部购买 海尔商城地址转换 start
                        /*if(bmamount>0){
                            var bmhrf="http://member.ehaier.com/loginhaier.html?host="+bmhost+"&pathname="+bmpathname;

                            $("#gm li i a:eq("+bmcount+")").attr("href",bmhrf);


                        }*/
                        //头部购买 海尔商城地址转换 end


                        //头部购物车地址转换	 start
                        /*var hf  = $("#bshopping").attr("href");
                        if(hf!=null && hf!=''){
                            var link=hf.split("/");
                            var host=link[2]+"";
                            var pathname=link[3]+"";

                            var hrf="http://member.ehaier.com/loginhaier.html?host="+host+"&pathname="+pathname;
                            $("#bshopping").attr("href",hrf);
                        }*/
                        //头部购物车地址转换	 end
                        //详情页地址转换 start
                       /* var payhf = $("#payShopping").attr("href");
                        if(payhf!=null && payhf!=''){
                            var paylink=payhf.split("/");
                            var payhost=paylink[2]+"";
                            var paypathname=paylink[3]+"";

                            var payhrf="http://member.ehaier.com/loginhaier.html?host="+payhost+"&pathname="+paypathname;
                            $("#payShopping").attr("href",payhrf);
                        }*/
                        //详情页地址转换 end




                    }else{
                        jQuery("#hn_no_login").show();
                        var loginurl=jQuery("#hn_no_login").find('a:eq(0)').attr("href");
                        jQuery("#hn_no_login").find('a:eq(0)').attr("href",loginurl);
                        jQuery("#hn_login").hide();
                        $(".news_box").hide();


                    }
                }
            });
        }
    }else{
        window.location.href="http://testuser.haier.com/ids/cn/haier_login.jsp?returnUrl="+returnUrl;
    }
}

jQuery(function(){
    //加载用户登录信息
    userloginstatus();




});
