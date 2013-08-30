var dbs = new app('1.0');
var MobApp={};
MobApp.version=1.39;
//MobApp.apiurl="http://api.m.q1.com/service1.asmx";
MobApp.apiurl="http://m.q1.com/service1.asmx";
var phoneNum = ""; 
var notify="";

var getUrled=0;
var bindok=1; 

function handleOpenURL(url)
{
	if(getUrled==1 || notify!="") {return;}
	getUrled=1;
	notify=url;
	//alert(notify)
	return true;
}
if("undefined" != typeof requesturl) {
	handleOpenURL(requesturl);
}

//取URL
function getURL() {
	if(getUrled==1) {return;}
	try {
		Cordova.exec(
		function (result) {if(result) handleOpenURL(result);},
		function (error) {}, 
		"gla.phoneinfo",
		"URL",
		[""]);
	} catch (e) {		
	}
}

// 显示动态密码
function getNewPwd() {
	var pwd = createPWD();
	$("#pass").html(pwd);
	CountDown("times", 30, getNewPwd)
}
//倒时间
function CountDown(countDownObjId, secCount, downFun) {
	secCount += parseInt((parseInt(unixtime() / 30) - (unixtime() / 30)) * 30)
	var interval = window.setInterval(function() {
		$("#" + countDownObjId).html(secCount);
		secCount--;
		if (secCount <= 0) {
			clearInterval(interval);
			if (downFun)
				downFun()
		}
		if(notify && notify!=""){
			doNotifiy();
			notify="";
		}
	}, 1000);
}

function doNotifiy(){
	
	var notifyurl=notify;
    
	notify="";
	loadQueryString(notifyurl);
	var qr=Request["qr"];
	var SignKey = $("#hidSignKeyCode").val();	
	if(qr && qr!="" ){
        if(bindok==1){
            qrurl=decodeURIComponent(qr);
		//alert(qrurl);
            if(qrurl.indexOf("q1.com/login.")>0 || qrurl.indexOf("ak18.cn/login.")>0 ){				
                if(qrurl.indexOf("?")==-1) qrurl+="?ver=20130605";
                qrurl+="&phone="+ phoneNum+"&sign="+SignKey+"&time="+unixtime();
			//alert(qrurl);
                openPage(qrurl);
            }
        }else{
            //showAlert(notifyurl);
			showAlert("您还没有激活此设备，请先激活!");
			GoPage2(phoneNum);
        }		
	}	
}


//测试是否可以取到网络参数
var Request = new Array();
function loadQueryString(url) {
	
	var s = url.replace("#","&");
	var n = s.indexOf("?");
	if (n >= 0)
		s = s.substring(n + 1);
	var valuelist = s.split("&");
	for (var i = 0; i < valuelist.length; i++) {
		var pair = valuelist[i].split("=");
		if (pair.length > 1) {
			Request[pair[0].toLowerCase()] = pair[1];
		};
	};
};
if(window.location.href.indexOf("?")>0){
	loadQueryString(window.location.href);	
	notify=window.location.href;
	//alert(notify);
}

// 动态密码 需要引用md5.js
function createPWD() {
	var SignKey = $("#hidSignKeyCode").val();
	var username = $("#hidphonnum").val();
	var uuid = $("#hidUuid").val();
	var t = parseInt(unixtime() / 30).toString();
	var str = username + uuid + SignKey + t;
	 //showAlert(str);
	return hex_md5(str).toUpperCase().substring(15, 15 + 6);
}

function timecheck(ServerTime) {
	var dt = new Date();
	var tspan = ((dt.getTime() / 1000) - ServerTime);
	if (tspan > 110) {
		showAlert("您的手机时间大约快了" + Math.abs(parseInt(tspan / 60))
				+ "分钟，请先校准您的手机时间！");
	} else if (tspan < -110) {
		showAlert("您的手机时间大约慢了" + Math.abs(parseInt(tspan / 60))
				+ "分钟，请先校准您的手机时间！");
	}
}

function unixtime() {
	var dt = new Date();
	return dt.getTime() / 1000;
}

// 获得位置
var getLocation = function() {	
	var watchID = null; 
	try {
		var suc = function(p) {
			$("#hidLat").val(p.coords.latitude );
			$("#hidlong").val(p.coords.longitude );			
		};
		var locFail = function() {
		};
		var options = { frequency: 60000 }; 
		watchID =navigator.geolocation.getCurrentPosition(suc, locFail,options);
	} catch (e) {
		//showAlert("获取地理位置失败");
		$("#hidLat").val(0);
		$("#hidlong").val(0);
	}	
	// 清除前述已经开始的监视 
 	var clearWatch=function () {  
		try{
			if (watchID) {  
				navigator.geolocation.clearWatch(watchID);  
				watchID = null;  
			} 
		}catch(e){}
    } 
}; 

var beep = function(id) {
	if(!id) id=2
	try {
		navigator.notification.beep(id);
	} catch (e) {		
	}
};


// 显示定制警告框
function showAlert(msg,title,btntext) {
	try{
		if(!title) title="温馨提示";
		if(!btntext) btntext="我知道了";
		if(navigator.notification && navigator.notification.alert){
   		navigator.notification.alert(
			msg,  // 显示信息
			alertDismissed, 
			title,            // 标题
			btntext            // 按钮名称
		);
		}else{
			alert(":"+msg);
		}
	}catch(e){
		alert("E:"+msg);
	}	
}
// alert dialog dismissed   
 function alertDismissed() {
	         // do something   
 }    

// 处理确认对话框返回的结果
function onConfirm(button) {
	alert('You selected button ' + button);
	return button==1;
}
	
// 显示一个定制的确认对话框
function showConfirm(msg,onConfirmFun,title,btn) {
	if(!onConfirmFun) onConfirmFun=onConfirm;
	if(!title) title='请选择：'
	if(!btn) btn='确定,取消';
	try{
		return navigator.notification.confirm(
		msg,  // 显示信息
		onConfirmFun,    // 按下按钮后触发的回调函数，返回按下按钮的索引	
		title,          // 标题
		btn          // 按钮标签
	);}
	catch(e){
		return onConfirmFun(window.confirm(msg));
	}
}


var vibrate = function(id) {
	if(!id) id=0
	try {
		navigator.notification.vibrate(id);
	} catch (e) {
	}
};

function roundNumber(num) {
	var dec = 3;
	var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
	return result;
}

var accelerationWatch = null;

function updateAcceleration(a) {
	document.getElementById('x').innerHTML = roundNumber(a.x);
	document.getElementById('y').innerHTML = roundNumber(a.y);
	document.getElementById('z').innerHTML = roundNumber(a.z);
}

var toggleAccel = function() {
	if (accelerationWatch !== null) {
		navigator.accelerometer.clearWatch(accelerationWatch);
		updateAcceleration({
			x : "",
			y : "",
			z : ""
		});
		accelerationWatch = null;
	} else {
		var options = {};
		options.frequency = 1000;
		accelerationWatch = navigator.accelerometer.watchAcceleration(
				updateAcceleration, function(ex) {
					alert("accel fail (" + ex.name + ": " + ex.message + ")");
				}, options);
	}
};

var preventBehavior = function(e) {
	e.preventDefault();
};

function dump_pic(data) {
	var viewport = document.getElementById('viewport');
	console.log(data);
	viewport.style.display = "";
	viewport.style.position = "absolute";
	viewport.style.top = "10px";
	viewport.style.left = "10px";
	document.getElementById("test_img").src = "data:image/jpeg;base64," + data;
}

function fail(msg) {
	showAlert(msg);
}

function show_pic() {
	navigator.camera.getPicture(dump_pic, fail, {
		quality : 50
	});
}

function close() {
	var viewport = document.getElementById('viewport');
	viewport.style.position = "relative";
	viewport.style.display = "none";
}

function contacts_success(contacts) {
	var number = contacts.length;
	if (contacts.length > 30)
		number = 30;
	var str = "<table>";
	for ( var i = 0; i < number; i++) {
		if (contacts[i].phoneNumbers && contacts[i].phoneNumbers[0]
				&& contacts[i].phoneNumbers[0].value)
			var phonenum = contacts[i].phoneNumbers[0].value;
		str += "<tr><td><input type='checkbox' id='checkbox-" + i
				+ "a></td><td>" + contacts[i].displayName + "</td></tr>"
	}
	str+="</table>";
	$("#txl").append(str).trigger("create");
}

function get_contacts() {
	var obj = new ContactFindOptions();
	obj.filter = "";
	obj.multiple = true;
	navigator.contacts.find([ "displayName", "phoneNumbers" ],contacts_success, fail, obj);
}

function check_network() {
	if (!navigator.network) {
		return true;
	}
	try {
		var networkState = navigator.network.connection.type;
		var states = {};
		states[Connection.UNKNOWN] = 'Unknown';
		states[Connection.ETHERNET] = 'Ethernet';
		states[Connection.WIFI] = 'WiFi';
		states[Connection.CELL_2G] = '2G';
		states[Connection.CELL_3G] = '3G';
		states[Connection.CELL_4G] = '4G';
		states[Connection.NONE] = 'None';
		if (states[networkState] == 'None') {			
			return false;
		}
		$("#hidConnType").val(states[networkState]);
		return true;
	} catch (e) {
		vibrate();
		return false;
	}
}


function init() {
	try {		
		document.addEventListener("deviceready", onDeviceReady, false);
		window.setTimeout("onDeviceReady(1)",1500);		

	} catch (e) {
		// showAlert(navigator.appName); //debug
	}
	
}

function onDeviceReady(id) {
	if(MobApp.DeviceReady) return;
	MobApp.DeviceReady=true;
	if(id==1) {
		MobApp.isApp=false;
		console.log("您正在使用浏览器版！");		
	}else{
		MobApp.isApp=true;
		console.log("您正在使用APP版！");		
	}
	
	getLocation();	
	//添加回退按钮事件 
	try {document.addEventListener("backbutton",onBackKeyDown,false); 	} catch (e) {}
	try {document.addEventListener("menubutton", onMenuKeyDown, false); } catch (e) {}
	try {document.addEventListener("searchbutton", onSearchKeyDown, false); } catch (e) {}
	deviceInfo();
	getPhoneNumber(); // 调用插件取手机号码
	getURL();
	//get_contacts(); // 提取通讯录
	if (navigator.network) {
		try {document.addEventListener("online", onOnline, false); } catch (e) {}
		try {document.addEventListener("offline", onOffline, false);} catch (e) {}
	}else{
		onOnline();
	}
	
}
function goPage(page)
{
	MobApp.currPage=page;
	window.location="#page"+page;
}
//BackButton按钮  
function onBackKeyDown(){  
	if($.mobile.activePage.is('#page1') ){ 
		showConfirm("您是否要退出冰川通行证？",function(r){			
			if(r==true || r==1)	{navigator.app.exitApp();}
			});
	}  else if($.mobile.activePage.is('#page6') ||
	 	$.mobile.activePage.is('#page5') ||
	 	$.mobile.activePage.is('#page4'))	{
	   		window.location="#page1"; 			
	}
	else {  
		if(window.history.length)
		navigator.app.backHistory(); 		
		else
		window.location="#page1";
	}  
}  

function onMenuKeyDown(){
	window.location="#page4";
}
function onSearchKeyDown() { 
	window.location="#page6";
}

function onOnline() {   
	if(MobApp.timer2) window.clearTimeout(MobApp.timer2);
	MobApp.timer2=window.setTimeout("Refresh()",5000);
}
function onOffline() {    
	if(MobApp.timer2) window.clearTimeout(MobApp.timer2);
	getLocation.clearWatch();
	//showAlert("您已断开连接！");
}

var deviceInfo = function() {
	try {
		document.getElementById("platform").innerHTML = device.platform;
		document.getElementById("version").innerHTML = device.version;
		document.getElementById("uuid").innerHTML = device.uuid;
		$("#hidUuid").val(device.uuid);
		document.getElementById("name").innerHTML = device.name;
		document.getElementById("width").innerHTML = screen.width;
		document.getElementById("height").innerHTML = screen.height;
		document.getElementById("colorDepth").innerHTML = screen.colorDepth;
		$("#hidplatform").val(device.platform);
		$("#hidversion").val(device.version);
		$("#hidname").val(device.name);
	} catch (e) {
	}
	try{
		if(device && device.name)
			MobApp.prototype.device=device;
		}
		catch(e){}
	try {
		if ($("#hidUuid").val() == "")
			$("#hidUuid").val(navigator.appName);
		if ($("#hidplatform").val() == "")
			$("#hidplatform").val(navigator.platform);
		if ($("#hidversion").val() == "")
			$("#hidversion").val(navigator.appVersion);
		if ($("#hidname").val() == "")
			$("#hidname").val(navigator.appName);
	} catch (e) {
	}

};

//取手机插件
function getPhoneNumber(returnSuccess) {
	try {
		Cordova.exec(
		getPhoneNumberResultHandler,
		function(error){
			LogSave("检测不到手机信号");
			showAlert("检测不到手机信号！\r\n" + error);
		}, 
		"gla.phoneinfo",
		"action",
		["getNumber"]);
	} catch (e) {
		getPhoneNumberResultHandler(""); 
	}
}
function getPhoneNumberResultHandler(result) {
	result = result ? result.replace("+86", "") : "";
	phoneNum = result;
	if (phoneNum != "") {
		$("#p2_phoneNum").attr("readonly", "readonly"); // 不支持手动输入
	} else {
		$("#p2_phoneNum").removeAttr("readonly");
	}
	if ($("#hidphonnum").val() == "") {
		GetData();
	}
    //SendWeixin(1);
}

//分享到微信
function SendWeixin(flag,text) {
    var act="send";
    if(flag==1) act="sendAll";    
    try {
        Cordova.exec(
                     function(result){},
                     function(error){},
                     "winxin",
                     act,
                     [text]);
    } catch (e) {}
}
//短信分享
function sendsms(content){
	cordova.exec(
                 function(result){},
                 function(result){},
                 "SmsPlugin",
                 "send",
                 [content]);
}
// 读取数据
function GetData() {
	showLoading(); // 显示加载中...
	try {
		if (window.openDatabase) {
			dbs.dbConnect("txz.q1.com.20120806", "1.0", "", "102400");
			dbs.dbDefineTable("DeviceInfo", {
				phonenum : 'text',
				uuid : 'text',
				SignKeyCode : 'text',
				TypeValue : "text"
			}); // 保存用户信息，TypeValue值为:账号密码登陆-动态密码登陆
			dbs.dbDefineTable("GameAcount", {
				phonenum : 'text',
				username : 'text'
			});
			dbs.dbDefineTable("LoginLog", {
				phonenum : 'text',
				CreateDate : 'Datetime',
				Content : ''
			});
			dbs.dbFindAll("DeviceInfo", DeviceInfoCallback);
			dbs.dbFindAll("GameAcount", funGameaccount);
		} else if (window.localStorage) {
			SearchWebStorage();
		}
	} catch (e) {
		DeviceInfoCallback({
			rows : {}
		});
	}	
	hideLoading();
	//检测版本
	
}
function loginout(action)
{

	if(!action){
		showConfirm("确定安全退出吗？若需再次使用可以重新激活。",function(r){
			if(r==true || r==1){loginout(true);}
	 	},'冰川通行证重要提示','是,不用了')
		return;
	}	
	
	//清空数据
	if (window.openDatabase) {
			dbs.dbTruncate("LoginLog");
			dbs.dbTruncate("DeviceInfo"); 
			dbs.dbTruncate("GameAcount");
	}
	if (window.localStorage){
		localStorage.removeItem("LoginLog"); 
		localStorage.removeItem("DeviceInfo");
		localStorage.removeItem("GameAcount"); 
	}
	
	$("#hidSignKeyCode").val("");
	$("#divMsg").empty();
	$("#divMsg").html("已安全退出");
	$("#hidTypeVaue").val("");
	LogSave("已安全退出");	
	GetData();
	//location.href = "#page2";
}

// 清除数据
function ClearData(action) {
	if(!action){
		showConfirm("确定要重新激活吗？",function(r){
			if(r==true || r==1){ClearData(true);}
	 	},'冰川通行证重要提示','是,不用了')
		return;
	}	
	try {
		// dbs.dbTruncate("DeviceInfo");
		// dbs.dbTruncate("GameAcount");

		$("#hidTypeVaue").val("");
		if (window.openDatabase) {
			dbs.dbTruncate("LoginLog");
		}

		if (window.localStorage)
			localStorage.removeItem("LoginLog"); // /清空本地操作日志

		LogSave("重新初始化");

	} catch (e) {
	}
	// SfReadonly();
	location.href = "#page2";
	
	// init();

}

function funGameaccount(result) {
	
	if (result && result.rows && result.rows.length > 0) {
		$("#divMsg").empty();
		$("#divMsg").append("<li role='heading' data-role='list-divider'></li>");
		if (result.rows[0]) {
			for ( var i = 0; i < result.rows.length; i++) {
				UserMessge(result.rows[i].item.username);
			}
		} else {
			for ( var i = 0; i < result.rows.length; i++) {
				UserMessge(result.rows.item(i).username);
			}
		}
		$("#page6").page(); 
		var ary = new Array("divMsg");
		ControlRefresh(ary,'listview');
		
	}
}

var UserMessge = function(userName) {
	var val = userName;
	if (userName.length > 50) {
		val = userName.substring(0, 50).toString();
		val += "...";
	}
	
	$("#divMsg")
			.append(
					"<li data-theme='c' ><a href='#page11' id="
							+ userName
							+ "  onclick='UserNameUnbind(this.id);' data-transition=\"slide\" >"
							+ val + "</a></li>");
	$("#username").val(userName);
	$("#hUserName").html(userName);
	$("#unuserName").val(userName);

}

// 给绑定账号赋值，并跳转到解绑页面
var UserNameUnbind = function(userName) {
	$("#unuserName").val(userName);	
	$("#username").val(userName);
	$("#hUserName").html(userName);
}
// 设备信息DB查询函数
function DeviceInfoCallback(result) {
	var typevalue = "";
	var SignKeyCode = "";
	var uuid = "";
	if (result && result.rows && result.rows.length > 0) {
		var currhoneNum = phoneNum;
		if (result.rows[0]) {
			phoneNum = result.rows[0].item.phonenum;
		} else {
			phoneNum = result.rows.item(0).phonenum;
		}
		if (currhoneNum != "" && phoneNum != currhoneNum) { // 您的手机换卡了，需要要重新初化
			showAlert("您的手机换卡了，当前手机号" + currhoneNum + "需要激活后才能正常使用！");
			LogSave("您的手机换卡了，当前手机号" + currhoneNum + "需要激活后后才能正常使用！")
			GoPage2(currhoneNum);
			return;
		}
		if (result.rows[0]) {
			typevalue = result.rows[0].item.TypeValue;
			SignKeyCode = result.rows[0].item.SignKeyCode;
			uuid = result.rows[0].item.uuid;
		} else {
			typevalue = result.rows.item(0).TypeValue;
			SignKeyCode = result.rows.item(0).SignKeyCode;
			uuid = result.rows.item(0).uuid;
		}
		$("#hidTypeVaue").val(typevalue);
		$('#toggleswitch1').val((typevalue & 1) == 1 ? "on" : "off");
		$('#toggleswitch2').val((typevalue & 2) == 2 ? "off" : "on");
		$('#toggleswitch4').val((typevalue & 4) == 4 ? "off" : "on");
		var Shield = (typevalue & 1) == 1 ? "on" : "off";
		if (Shield == "on") {
			document.getElementById("divDisplay").style.cssText = "display:none";
		} else {
			document.getElementById("divDisplay").style.cssText = "display:block";
		}
		$("#hidSignKeyCode").val(SignKeyCode);
		$("#hidUuid").val(uuid);
		showNumber(phoneNum);
		$("#page7").page();
		var ary = new Array("toggleswitch1", "toggleswitch2", "toggleswitch4");
		ControlRefresh(ary,'slider');
		//Refresh();		
		getNewPwd();
		bindok=1;
		
	} else {
		bindok=0;
		GoPage2(phoneNum);
	}
}

function GoPage2(phoneNum) {
	showNumber(phoneNum);
	location.href = "#page2";
}

function showNumber(phoneNum) {
	if (phoneNum != "") {
		$("#txtNumber")
				.html("您当前的号码:"
								+ phoneNum.replace(/(\d{3})(\d{4})(\d{4})/,
										"$1****$3"));
		$("#p2_phoneNum").val(phoneNum);
		$("#p14_phoneNum").html(phoneNum);
	} else {
		$("#txtNumber").html("通行证还没有激活<a href='#page2' style='color:yellow' >立即激活</a>");
		LogSave("没有取得手机号")
	}
	$("#hidphonnum").val(phoneNum);
}

function LogSave(remark) {
	console.log(remark)
	try {
		var time = new Date().getTime();
		var phoneNum = $("#hidphonnum").val();
		dbs.dbInsert("LoginLog", {
			phonenum : phoneNum,
			CreateDate : time,
			Content : remark
		}, addResult);
		dbs.dbFindAll("LoginLog", funlogMsg);
	} catch (e) {		
		try {
			
			var LoginLogMsg = window.localStorage.getItem("LoginLog");
			if (LoginLogMsg == undefined) {
				LoginLogMsg = phoneNum + "|" + time + "|" + remark;
			} else {
				LoginLogMsg += "," + phoneNum + "|" + time + "|" + remark;
			}
			addWebStorage("LoginLog", LoginLogMsg);
		} catch (e) {
			
		}
	}
}

// /清空所有登陆日志
function deleteLoginLog() {
	try {
		if (window.openDatabase) { // 判断是否支持数据库
			dbs.dbTruncate("LoginLog");
			dbs.dbFindAll("LoginLog", funlogMsg);
		}

		if (window.localStorage) { // 判断是否支持本地存储
			localStorage.removeItem("LoginLog");
			localStroageLoginLog();
		}
	} catch (e) {
	}
}

function addResult(result) {
}

function funlogMsg(result) {
	var tb = "<table border='1' style='border-collapse: collapse;color:White' width='100%'><tr><td>时间</td><td>备注</td></tr>";
	var t = new Date("yyyy,mth,dd,hh,mm,ss");
	var length = result.rows.length;
	if (result.rows.length > 10) {
		length = 10;
	}
	for ( var i = 0; i < length; i++) {
		t.setTime(result.rows.item(i).CreateDate);
		
		tb += "<tr><td>" + date2str(t,"MM-dd hh:mm") + "</td><td>"
				+ result.rows.item(i).Content + "</td></tr>";
	}
	tb += "</table>";
	$("#page8").page();
	$("#loginlogMsg").html(tb).trigger("create");
}

// /生成随机数
function rand(num) {
	if (num == null)
		num = 9999;
	return Math.floor(Math.random() * num) + Math.random();
}


var isneedtoKillAjax =true; 
function checkajaxkill()
{
	if(isneedtoKillAjax){
		showAlert("连接服务器超时，可能是服务器暂时无法响应，请稍候再试。");
		hideLoading();		
	}
	isneedtoKillAjax=true;
}

// /提交手机号码
function page2func() {

	phoneNum = $("#p2_phoneNum").val();
	if (phoneNum == "") {
		showAlert("请输入手机号码！");
		return;
	}
	showNumber(phoneNum);
	if (!check_network()) { // debug
		showAlert("您没有连接网络，暂时无法进行此操作，请检查网络是否正常！可以尝试断开和重新连接网络！");
		return;
	}
	//Checkversion(0); // 提示有新版本需要更新
	
	if(MobApp.getsms)
	{
		showAlert("请已经点击了获取验证码，请稍等，1分钟后如果还不能收到短信，请重试。");
		location.href = "#page14";
		return;
	}
	if(MobApp.clicked){
		showAlert("系统正在处理，请稍等...");
		return;
	}	
	if(!MobApp.clicked)
	{
		MobApp.clicked=true;		
		window.setTimeout("MobApp.clicked=false",11000)
	}		
	showLoading(); // 显示加载中...
	setTimeout(function(){checkajaxkill();},10000);// 10 seconds     
	try {
		$.getJSON(
				MobApp.apiurl+"/Getphnumber?jsoncallback=?",
				{
					q : rand(9999),
					number : phoneNum
				}, function(json) {
					isneedtoKillAjax =false;// set to false
					hideLoading();
					if (json.n != 1) {
						if (json.msg) {
							showAlert(json.msg);							
						} else {
							showAlert("获取短信验证码失败");							
						}
					} else {
						if(!MobApp.getsms)
						{
							MobApp.getsms=true;
							window.setTimeout("MobApp.getsms=false",60000)								
						}
						$("#p14_phoneNum").html(phoneNum);
						$("#hidphonnum").val(phoneNum);
						$("#suuid").html($("#hidUuid").val());
						LogSave("获取短信验证码成功");
						location.href = "#page14";
					}
				});
	} catch (e) {
		showAlert("手机通行证获取验证验证码失败，异常代码581，请向客服反馈！可以尝试断开和重新连接网络！");
		hideLoading();
	}
	
}

// 刷新
function Refresh(flag) {
	
	if (!check_network()) {
		if(flag)
		{
			showAlert("您没有连接网络，暂时无法进行此操作，请检查网络是否正常！");		
		}
		return false;
	}		
		
	var hidSignKeyCode = $("#hidSignKeyCode").val();
	if(hidSignKeyCode=="" )  
	{
		if(!$.mobile.activePage.is('#page2') && !$.mobile.activePage.is('#page14')){
			showConfirm("您的通行证还未激活，现在就激活冰川通行证？",function(r){
				if(r==true || r==1){location.href = "#page2";}
			},'冰川通行温馨提示','是,等一下')
		}
		return;
	}
	showLoading();	
	try{
		checkeData(hidSignKeyCode)		
		if(flag)
		{
			showAlert("刷新成功！");
			beep();
		}
		
	}catch(e){showAlert("通行证连接网络异常，异常代码703，请向客服反馈！")}
	hideLoading();
	
}

// 提交信息,并检测验证码是否正确，hidSignKeyCode为空时需要激活
function checkeData(hidSignKeyCode) {
	var telephone = $("#hidphonnum").val();
	var hiduuid = $("#hidUuid").val();
	var hidchecknum = $("#hidchecknum").val();
	var txchecknum = $("#txchecknum").val(); // 验证码
	var hidplatform = $("#hidplatform").val();
	var hidversion = $("#hidversion").val();
	var hidname = $("#hidname").val();
	var hidConnType = $("#hidConnType").val();
	var location = $("#hidLat").val()+","+$("#hidlong").val()
	var hidFlag = $("#hidTypeVaue").val();

	$("#page6").page();
	//Checkversion(0); // 提示有新版本需要更新
	
	if (hidSignKeyCode == "") {
		
		if (txchecknum == "") {
			showAlert("请输入验证码！");
			return;
		}
		if (txchecknum.length < 4) {
			showAlert("验证码不正确！");
			return;
		}
		if (!check_network()) {
		showAlert("您没有连接网络，暂时无法进行此操作，请检查网络是否正常！");
		return false;
		}	
		showLoading(); // 显示加载中...
		$.getJSON(
						MobApp.apiurl+"/MobiledeviceCheck?jsoncallback=?",
						{
							q : rand(9999),
							PhoneNum : telephone,
							UUID : hiduuid,
							Platform : hidplatform,
							Version : hidversion,
							Name : hidname,
							Location : location,
							ConnType : hidConnType,
							CheckCode : txchecknum
						},
						function(json) {	
							hideLoading();
							if (json.ReturnValue == 1) {
								$("#hidSignKeyCode").val(json.SignkeyCode);
								// 时间检查
								timecheck(json.ServerTime);
								try {
									if (window.openDatabase)
										dbs.dbTruncate("GameAcount"); // 清空数据
								} catch (e) {
								}

								$("#divMsg").empty();
								if (json.data.length > 0)
									$("#divMsg").append("<li role='heading' data-role='list-divider'></li>");
								var GameAcount = "";
								for ( var i = 0; i < json.data.length; i++) {

									UserMessge(json.data[i].Username);
									try {
										if (window.openDatabase)
											dbs
													.dbInsert(
															"GameAcount",
															{
																phonenum : telephone,
																username : json.data[i].Username
															}, addResult);
										else if (window.localStorage) {
											if (GameAcount == "")
												GameAcount = "{rows:[";
											else
												GameAcount += ","
											GameAcount += "{item:{phonenum: '"
													+ telephone
													+ "', username: '"
													+ json.data[i].Username
													+ "'}}";
										}
									} catch (e) {
									}
								}
								// $("#divMsg").listview("refresh");
								if (GameAcount != "")
									GameAcount += "]}";
								// /本地存储账号信息
								addWebStorage("GameAcount", GameAcount);
								try {
									if (window.openDatabase) {
										dbs.dbTruncate("DeviceInfo"); // 清空数据
										dbs.dbInsert("DeviceInfo", {
											phonenum : telephone,
											uuid : hiduuid,
											SignKeyCode : json.SignkeyCode,
											TypeValue : hidFlag
										}, addResult); // 插入数据
									} else if (window.localStorage) {
										// /使用localStorage存储手机信息
										var DeviceInfoValue = "{rows:[{item:{phonenum:'"
												+ telephone
												+ "',uuid:'"
												+ hiduuid
												+ "',SignKeyCode:'"
												+ json.SignkeyCode
												+ "',TypeValue:'"
												+ hidFlag
												+ "'}}]}";
										addWebStorage("DeviceInfo",
												DeviceInfoValue);
									}
								} catch (e) {

								}
								var time = new Date().getTime();
								showAlert(json.ReturnDesc);
								
								//$("#divMsg").listview("refresh");
								//$("#divMsg li").listview("refresh");
								var ary = new Array("divMsg");
								ControlRefresh(ary,'listview');
								LogSave("激活成功");
                                bindok=1;
								window.location.href = "#page1";
								

							} else {
								showAlert(json.ReturnDesc);
							}

						});
	} else {	
		showLoading(); // 显示加载中...
		$.getJSON(
						MobApp.apiurl+"/MobiledeviceConn?jsoncallback=?",
						{
							q : rand(9999),
							PhoneNum : telephone,
							UUID : hiduuid,
							Platform : hidplatform,
							Version : hidversion,
							Name : hidname,
							Location : location,
							ConnType : hidConnType,
							CheckCode : txchecknum,
							Signkey : hidSignKeyCode,
							flag : hidFlag
						},
						function(json) {		
							hideLoading();
							if (json.ReturnValue == 1) {
								// 时间检查
								timecheck(json.ServerTime);
								try {
									dbs.dbTruncate("GameAcount"); // 清空数据
								} catch (e) {
								}

								var GameAcount = "";
								$("#divMsg").empty();
								if (json.data.length > 0)
									$("#divMsg").append("<li role='heading' data-role='list-divider'></li>");
								for ( var i = 0; i < json.data.length; i++) {

									UserMessge(json.data[i].Username);
									try {
										// /循环插入数据(先判断是否支持SQLite数据库，如果不支持在使用本地localStorage进行数据存储)
										if (window.openDatabase) {
											dbs
													.dbInsert(
															"GameAcount",
															{
																phonenum : telephone,
																username : json.data[i].Username
															}, addResult);
										} else if (window.localStorage) {
											if (GameAcount == "")
												GameAcount = "{rows:[";
											else
												GameAcount += ","
											GameAcount += "{item:{phonenum: '"
													+ telephone
													+ "', username: '"
													+ json.data[i].Username
													+ "'}}";
										}
									} catch (e) {
									}
								}
								// $("#divMsg").listview("refresh"); //渲染divMsg
								if (GameAcount != "")
									GameAcount += "]}";
								// /本地存储账号信息
								// showAlert(GameAcount);
								addWebStorage("GameAcount", GameAcount);
								// /循环插入数据(先判断是否支持SQLite数据库，如果不支持在使用本地localStorage进行数据存储)
								try {
									if (window.openDatabase) {
										dbs.dbInsert("DeviceInfo", {
											phonenum : telephone,
											uuid : hiduuid,
											SignKeyCode : json.SignkeyCode,
											TypeValue : hidFlag
										}, addResult);
									} else if (window.localStorage) {
										var DeviceInfoValue = "{rows:[{item:{phonenum:'"
												+ telephone
												+ "',uuid:'"
												+ hiduuid
												+ "',SignKeyCode:'"
												+ json.SignkeyCode
												+ "',TypeValue:'"
												+ hidFlag
												+ "'}}]}";
										addWebStorage("DeviceInfo",
												DeviceInfoValue);
									}
								} catch (e) {
								}
								var time = new Date().getTime();
								console.log("刷新成功");
								
								var ary = new Array("divMsg");
								ControlRefresh(ary, 'listview');

							} else {
								showAlert(json.ReturnDesc);
							}

						});
	}
}

// 绑定账号
function bindPassport() {
	if (!check_network()) {
		showAlert("您没有连接网络，暂时无法进行此操作，请检查网络是否正常！");
		return false;
	}
	var telephone = $("#hidphonnum").val();
	var hidSignKeyCode = $("#hidSignKeyCode").val();
	var userName = $("#txuserName").val();
	var password = $("#txpwd").val();
	var IDCard = $("#IDCard").val();	
	if (userName == "") {
			showAlert("请输入账号名！");
			return;
		}
	if (password=="") {
		showAlert("请输入密码！");
		return;
	}	
	if (IDCard=="") {
			showAlert("请输入身份证号码！");
			return;
	}

	showLoading(); // 显示加载中...
	try{
	$.getJSON(
			MobApp.apiurl+"/GetBindAccount?jsoncallback=?",
			{
			    q: rand(9999),
			    PhoneNum: telephone,
			    UserName: userName,
			    PassWord: password,
			    Signkey: hidSignKeyCode,
			    IDCard: IDCard
			}, function (json) {
			    hideLoading();
			    LogSave("绑定账号:" + userName);
			    showAlert(json.ReturnDesc);				
			    Refresh();
			    location.href = "#page6";
			});
	
	}catch(e)
	{
		
	}	
	 hideLoading();
}

// /控件刷新
var ControlRefresh = function(ary, refreshType) {
	//showAlert("fgdf"=)
	switch (refreshType) {
	case 'listview':
		for ( var i = 0; i < ary.length; i++) {
			$("#" + ary[i]).listview("refresh");
			
		}
		break;
	case 'slider':
		for ( var i = 0; i < ary.length; i++) {
			$("#" + ary[i]).slider("refresh"); // 滑动，开关
		}
		break;
	case 'selectmenu':
		for ( var i = 0; i < ary.length; i++) {
			$("#" + ary[i]).selectmenu("refresh"); // 下拉列表
		}
		break;
	case 'checkboxradio':
		for ( var i = 0; i < ary.length; i++) {
			$("#" + ary[i]).checkboxradio("refresh"); // 单选或者多选
		}
		break;
	default:
		for ( var i = 0; i < ary.length; i++) {
			$("#" + ary[i]).trigger("create");
		}
		break;
	}
}
// 取消绑定
function unbindPassport() {
	if (!check_network()) {
		showAlert("您没有连接网络，暂时无法进行此操作，请检查网络是否正常！");
		return false;
		}
	var telephone = $("#hidphonnum").val();
	var hidSignKeyCode = $("#hidSignKeyCode").val();
	var userName = $("#unuserName").val();
	var password = $("#unpwd").val();
	showLoading(); // 显示加载中...
	try{
	$.getJSON(
					MobApp.apiurl+"/GetUnBindAccount?jsoncallback=?",
					{
					    q: rand(9999),
					    PhoneNum: telephone,
					    UserName: userName,
					    PassWord: password,
					    Signkey: hidSignKeyCode
					}, function (json) {
					    hideLoading();
					    LogSave("解除账号:" + userName);
					    showAlert(json.ReturnDesc);
					    if (json.ReturnValue > -1) {
					        Refresh();
					        location.href = "#page6";
					    }
					});
	}catch(e){}
	hideLoading();

}

$(document).ready(function(e) {
	setTimeout("getNewPwd(false)",6000);		
	setTimeout("Checkversion(0)", 5000);
	///提交验证码
	$("#txchecknum").keydown(function(event){
		var keycode=event.which;
		if (keycode==13){
			checkeData('');
		}	
	});
});


// /账号保护
var TypeVaue = "";
function ToggleswitchValue() {
	if (!check_network()) {
		showAlert("您没有连接网络，暂时无法进行此操作，请选连接移动网络或WiFi网络！");
		return false;
	}
	var phonenum = $("#hidphonnum").val();
	var flag = 0;
	var Shield = $("#toggleswitch1").val(); // 屏蔽账号
	var bankAccount = $("#toggleswitch2").val(); // 账号密码登陆
	var Dynamicpassword = $("#toggleswitch4").val(); // 动态密码登陆
	if (Shield == "on") {
		flag = 1;
	} else {
		flag = (Shield == "on" ? 1 : 0) | (bankAccount == "on" ? 0 : 2)
				| (Dynamicpassword == "on" ? 0 : 4);
	}
	if (Shield == "on") {
		document.getElementById("divDisplay").style.cssText = "display:none";
	} else {
		document.getElementById("divDisplay").style.cssText = "display:block";
	}

	$("#hidTypeVaue").val(flag);
	try {
		if (window.openDatabase)
			dbs.dbUpdate("DeviceInfo", {
				TypeValue : flag
			}, {
				phonenum : phonenum
			}, addResult);
		else if (window.localStorage) {
			var phoneNum = $("#hidphonnum").val();
			var uuid = $("#hidUuid").val();
			var signKeyCode = $("#hidSignKeyCode").val();
			var hidTypeVaue = $("#hidTypeVaue").val();
			var DeviceInfoValue = "{rows:[{item:{phonenum:'" + phoneNum
					+ "',uuid:'" + uuid + "',SignKeyCode:'" + signKeyCode
					+ "',TypeValue:'" + hidTypeVaue + "'}}]}"
			addWebStorage("DeviceInfo", DeviceInfoValue);
		}

	} catch (e) {
	}
    Refresh();
	return true;
}

// /添加本地存储信息
function addWebStorage(keyName, keyValue) {

	try {
		if (window.localStorage) {
			// localStorage.removeItem(keyName); //删除键值为k的变量。
			window.localStorage.setItem(keyName, keyValue);
		}
	} catch (e) {
	}
}

// /读取本地存储信息
function SearchWebStorage() {
	if (!window.localStorage) {
		showAlert("不支持localStorage"); // debug
		// SfReadonly();
		location.href = "#page2";
		
		return;
	}
	var DeviceInfoMsg = window.localStorage.getItem("DeviceInfo");
	if (DeviceInfoMsg == null)
		DeviceInfoMsg = "{}";
	if (DeviceInfoMsg)
		DeviceInfoMsg = eval("(" + DeviceInfoMsg + ")");
	DeviceInfoCallback(DeviceInfoMsg);

	var GameAcountMsg = window.localStorage.getItem("GameAcount");
	if (GameAcountMsg == null)
		GameAcountMsg = "{}";
	if (GameAcountMsg)
		GameAcountMsg = eval("(" + GameAcountMsg + ")");
	funGameaccount(GameAcountMsg);

	localStroageLoginLog();
}
/// <summary>
/// 格式化显示日期时间
/// </summary>
/// <param name="x">待显示的日期时间，例如new Date()</param>
/// <param name="y">需要显示的格式，例如yyyy-MM-dd hh:mm:ss</param>
function date2str(x,y) {
 var z = {M:x.getMonth()+1,d:x.getDate(),h:x.getHours(),m:x.getMinutes(),s:x.getSeconds()};
 y = y.replace(/(M+|d+|h+|m+|s+)/g,function(v) {return ((v.length>1?"0":"")+eval('z.'+v.slice(-1))).slice(-2)});
 return y.replace(/(y+)/g,function(v) {return x.getFullYear().toString().slice(-v.length)});
}

function localStroageLoginLog() {
	try {
		var LoginLogMsg = window.localStorage.getItem("LoginLog");
		var tb = "<table border='1' style='border-collapse: collapse' width='100%'><tr><td>时间</td><td>备注</td></tr>";
		if (LoginLogMsg != null) {
			var LoginLogRow = LoginLogMsg.split(',');
			var t = new Date("yyyy,mth,dd,hh,mm,ss");
			for ( var i = 0; i < LoginLogRow.length; i++) {
				var LoginLogColumn = LoginLogRow[i].split('|');
				if (LoginLogColumn.length >= 3) {
					t.setTime(LoginLogColumn[1].toString());					
					tb += "<tr><td>" + date2str(t,"MM-dd hh:mm")
							+ "</td><td>" + LoginLogColumn[2].toString()
							+ "</td></tr>";
				}
			}
		}

		tb += "</table>";
		$("#page8").page();
		$("#loginlogMsg").html(tb).trigger("create");

	} catch (e) {
	}
}
function showLoading() {
	try{
		$.mobile.pageLoading(); 
	}catch(e){
		$("#progressBar").show();
	}
	
}
function hideLoading() {
	try{
		$.mobile.pageLoading(true); 
	}catch(e){
		$("#progressBar").hide();
	}
	
}
// /检测是否有新版本
function Checkversion(flag) {
	if(flag==1){
		if (!check_network()) {
		showAlert("您没有连接网络，暂时无法进行此操作，请检查网络是否正常！");
		return false;
		}
	}
	try{
	$.getJSON(MobApp.apiurl+"/Download?jsoncallback=?", {
		q : rand(9999),
		Vsersion : MobApp.version,
		Platform : $("#hidplatform").val()
	}, function(json) {
		
		if (json.ReturnDesc != "" && json.ReturnDesc.indexOf("http://") >= 0) {
				showConfirm("有新版本,请到帮助中点击下载！",function(r){
					if(r==true || r==1){download(json.ReturnDesc);}
				},'冰川通行证','去看看,暂不更新')	
		} else if (flag == 1) {
			showAlert("当前没有可更新版本");	
			//showAlert($("#hidplatform").val())		
		}
	});
	}catch(e){}
}

var download = function(url) {
	$("#updatelink").attr("href",url);
	$("#updatelink").show();	
	window.location="#page5";	
}

function loaded() {
	try {
		if(window.localStorage){
			var HomeLogo = window.localStorage.getItem("HomeLogo");
			if (HomeLogo == null) {
				window.location.href = "index2.html?p=1";
			}			
		}else{
			//window.location.href = "index2.html?p=1";
		}
	} catch (e) {
		showAlert("设备不支持！"); // debug
	}
}

var onSend = function() {
	var success = function(data) {
		alert('消息发送成功');
	};
	var error = function(e) {
		showAlert(e);
	};
	var tels = $("#smsMen").val();
	if (tels == "") {
		showAlert("请输入收件人");
		return;
	}
	var content = $("#message").val();
	var tel = tels.split(',');
	var message = new Message();
	for ( var i = 0; i < tel.length; i++) {
		message.send(success, error, tel[i].toString(), content);
	}
};

function SendSMS() {
	var SMSToMen = "";
	$("input[id^='checkbox']").each(function() {
		if ($(this).attr("checked") == 'checked') {
			if (SMSToMen == "")
				SMSToMen += $(this).val();
			else
				SMSToMen += "," + $(this).val();
		}
	});
	$("#smsMen").val(SMSToMen);
	location.href = "#page12";
}

var RefreshLoginlog = function() {
    Refresh();
	location.href = "#page8";
}

var barcodeScanner=new BarcodeScanner();
var barcodemsg=function(){  
	try{
		   $("#iframepage").empty();
		   $("#qrtext").show();
           barcodeScanner.scan( 
                   function(result) {	
                       $('#iframeurl').attr('src','');
					   if(IsURL(result.text)) {
						   OpenURL(result.text);
					   }else if(result.text && result.text.length>0){
						   $("#hidbarcodemsg").val(result.text);
						   $("#spbarcodemsg").html(result.text);
						   location.href="#page16";
					   }  
                   }, 
                   function(error) {
					   showAlert("扫描失败："+error)
                       $("#spbarcodemsg").html("扫描失败："+error);
           		}
       ); 
	}catch(e){
		//$("#spbarcodemsg").html("");
		$("#iframepage").height(getTotalHeight()-60);
		$("#iframepage").html("<iframe src='http://m.q1.com' id='iframeurl'  width='100%' height='100%' ></iframe>");
		window.location.href="#page16";
	}
}

function OpenURL(Url) {
	if (Url.indexOf("q1.com") >= 0 || Url.indexOf("alipay.com") >= 0
			|| Url.indexOf("ak18.cn") >= 0 || Url.indexOf("qq.com") >= 0) {
		if(Url.indexOf("login.aspx")>0)
		{
			notify="bctxz://m.q1.com?qr="+encodeURIComponent(Url); //二维码登录
			return;
		}else{
			openPage(Url);
		}
	} else {
		showConfirm(Url, function(r) {
			if (r == true || r == 1) {
				openPage(Url);
			} else {
				$("#hidbarcodemsg").val(Url);
				$("#spbarcodemsg").html(
						"<a href='" + Url + "' onclick='openPage(this.href);'>"
								+ Url + "</a>");
				location.href = "#page16";
			}
		}, '是否打开此网址？', '是,否');
	}
} 
 var openPage =function(url,title){
	 	//showLoading(); // 显示加载中...
		$("#qrtext").hide();
		
		if(!title) title="扫描结果...";
		$("#iframepage_headerText").html(title);
	    $("#iframepage").height(getTotalHeight()-60);
	    //$("#iframeurl").attr("src",url);
		//$("#iframepage").html("<iframe src='"+url+"' id='iframeurl'  width='100%' height='100%' ></iframe>");	
		$("#iframepage").html("<iframe src='"+url+"' id='iframeurl'  width='100%' height='100%' ></iframe>");	
		//	alert(getTotalHeight());
		location.href='#page16';
		//hideLoading();
		return false;
 }
 function IsURL(str_url){
	 var strRegex = "^((https|http|ftp|rtsp|mms)://.*)" 
	 var re=new RegExp(strRegex); 
        if (re.test(str_url)){
            return (true); 
        }else{ 
            return (false);
        }	
    }
function getUrlDoMain(str_url){
var re = "^((https|http|ftp|rtsp|mms)?://)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-zA-Z_!~*'().&=+$%-]+@)";
 var h = str_url.match(re);
 //alert(h);
}

/*var Message = function(){};
Message.prototype = {
		send: function(success, error, target, content){
			PhoneGap.exec(success, error, "SmsPlugin", "send", [target, content]);
		}
};

PhoneGap.addConstructor(function() {
	PhoneGap.addPlugin("message", new Message());
});*/

var Message = function(){};
Message.prototype = {
		send: function(success, error, target, content){
			cordova.exec(success, error, "SmsPlugin", "send", [target, content]);
		}
};

cordova.addConstructor(function() {
	cordova.addPlugin("message", new Message());
});

function getTotalHeight(){
    
    if($.browser.msie){
        return document.compatMode == "CSS1Compat"? document.documentElement.clientHeight :
                 document.body.clientHeight;
    }else{
        return self.innerHeight;
    }
}

 function getTotalWidth (){
     
    if($.browser.msie){
        return document.compatMode == "CSS1Compat"? document.documentElement.clientWidth :
                 document.body.clientWidth;
    }else{
        return self.innerWidth;
    }
} 
 
///提交反馈信息
 var txzFeeBackMsg=function(){
 	var hidphonnum=$("#hidphonnum").val();
 	var hidSignKeyCode=$("#hidSignKeyCode").val();
 	var txt_exp=$("#txt_exp").val();	
 	if (txt_exp==""){
 		showAlert("意见内容不能为空");
 		return ;
 	}
 	
 	if (txt_exp.length<5){
 		showAlert("意见内容应大于5个字符");
 		return;
 	}
 	setTimeout(function(){checkajaxkill();},10000);// 10 seconds 
 	showLoading(); // 显示加载中...
 	$.getJSON(MobApp.apiurl+"/GetFeedBack?jsoncallback=?",
 		{
 		q:rand(9999),
 		PhoneNum:hidphonnum,
 		SignKeyCode:hidSignKeyCode,
 		Message:txt_exp
 		},
 		function(json)
 		{
 			hideLoading();
 			isneedtoKillAjax =false;// set to false
 			if (json.ReturnValue>0){
 				alert(json.ReturnDesc)
 				$("#txtphonetype").val('');
 				$("#txt_exp").val('');
 				$("#page12").page();
 				
 			}else{
 				alert(json.ReturnDesc);
 			}
 		});	
 	}
  
 var toPay=function(){
	var userName = $("#unuserName").val();
	window.location.href="pay/index.html?username="+userName;
 }
 
  var ClipboardManager = function() {}
 ClipboardManager.prototype.copy = function(str, success, fail) {
	 cordova.exec(success, fail, "ClipboardManager", "copy", [str]);
 };

 ClipboardManager.prototype.paste = function(success, fail) {
	 cordova.exec(success, fail, "ClipboardManager", "paste", []);
 };

 cordova.addConstructor(function() {
	 cordova.addPlugin('clipboardManager', new ClipboardManager());
 });

 var copybarcodemsg =function(){	 
	 var clipboardManager=new ClipboardManager();
	 clipboardManager.copy(
			 $("#hidbarcodemsg").val(),
				function(r){alert("复制成功")},
				function(e){alert("复制失败")}
			);
 }
 
 
 




 
 