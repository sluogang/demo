(function($) {
  $.widget('mobile.tabbar', $.mobile.navbar, {
    _create: function() {
      // Set the theme before we call the prototype, which will 
      // ensure buttonMarkup() correctly grabs the inheritied theme.
      // We default to the "a" swatch if none is found
      var theme = this.element.jqmData('theme') || "a";
      this.element.addClass('ui-footer ui-footer-fixed ui-bar-' + theme);

      // Make sure the page has padding added to it to account for the fixed bar
      this.element.closest('[data-role="page"]').addClass('ui-page-footer-fixed');


      // Call the NavBar _create prototype
      $.mobile.navbar.prototype._create.call(this);
    },

    // Set the active URL for the Tab Bar, and highlight that button on the bar
    setActive: function(url) {
      // Sometimes the active state isn't properly cleared, so we reset it ourselves
      this.element.find('a').removeClass('ui-btn-active ui-state-persist');
      this.element.find('a[href="' + url + '"]').addClass('ui-btn-active ui-state-persist');
    }
  });

  $(document).bind('pagecreate create', function(e) {
    return $(e.target).find(":jqmData(role='tabbar')").tabbar();
  });
  
  $(":jqmData(role='page')").live('pageshow', function(e) {
    // Grab the id of the page that's showing, and select it on the Tab Bar on the page
    var tabBar, id = $(e.target).attr('id');

    tabBar = $.mobile.activePage.find(':jqmData(role="tabbar")');
    if(tabBar.length) {
      tabBar.tabbar('setActive', '#' + id);
    }
  });

var attachEvents = function() {
	var hoverDelay = $.mobile.buttonMarkup.hoverDelay, hov, foc;

	$( document ).bind( {
		"vmousedown vmousecancel vmouseup vmouseover vmouseout focus blur scrollstart": function( event ) {
			var theme,
				$btn = $( closestEnabledButton( event.target ) ),
				evt = event.type;
		
			if ( $btn.length ) {
				theme = $btn.attr( "data-" + $.mobile.ns + "theme" );
		
				if ( evt === "vmousedown" ) {
					if ( $.support.touch ) {
						hov = setTimeout(function() {
							$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-down-" + theme );
						}, hoverDelay );
					} else {
						$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-down-" + theme );
					}
				} else if ( evt === "vmousecancel" || evt === "vmouseup" ) {
					$btn.removeClass( "ui-btn-down-" + theme ).addClass( "ui-btn-up-" + theme );
				} else if ( evt === "vmouseover" || evt === "focus" ) {
					if ( $.support.touch ) {
						foc = setTimeout(function() {
							$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-hover-" + theme );
						}, hoverDelay );
					} else {
						$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-hover-" + theme );
					}
				} else if ( evt === "vmouseout" || evt === "blur" || evt === "scrollstart" ) {
					$btn.removeClass( "ui-btn-hover-" + theme  + " ui-btn-down-" + theme ).addClass( "ui-btn-up-" + theme );
					if ( hov ) {
						clearTimeout( hov );
					}
					if ( foc ) {
						clearTimeout( foc );
					}
				}
			}
		},
		"focusin focus": function( event ){
			$( closestEnabledButton( event.target ) ).addClass( $.mobile.focusClass );
		},
		"focusout blur": function( event ){
			$( closestEnabledButton( event.target ) ).removeClass( $.mobile.focusClass );
		}
	});

	attachEvents = null;
};

$.fn.buttonMarkup = function( options ) {
	var $workingSet = this;

	// Enforce options to be of type string
	options = ( options && ( $.type( options ) == "object" ) )? options : {};
	for ( var i = 0; i < $workingSet.length; i++ ) {
		var el = $workingSet.eq( i ),
			e = el[ 0 ],
			o = $.extend( {}, $.fn.buttonMarkup.defaults, {
				icon:       options.icon       !== undefined ? options.icon       : el.jqmData( "icon" ),
				iconpos:    options.iconpos    !== undefined ? options.iconpos    : el.jqmData( "iconpos" ),
				theme:      options.theme      !== undefined ? options.theme      : el.jqmData( "theme" ) || $.mobile.getInheritedTheme( el, "c" ),
				inline:     options.inline     !== undefined ? options.inline     : el.jqmData( "inline" ),
				shadow:     options.shadow     !== undefined ? options.shadow     : el.jqmData( "shadow" ),
				corners:    options.corners    !== undefined ? options.corners    : el.jqmData( "corners" ),
				iconshadow: options.iconshadow !== undefined ? options.iconshadow : el.jqmData( "iconshadow" ),
				iconsize:   options.iconsize   !== undefined ? options.iconsize   : el.jqmData( "iconsize" ),
				mini:       options.mini       !== undefined ? options.mini       : el.jqmData( "mini" )
			}, options ),

			// Classes Defined
			innerClass = "ui-btn-inner",
			textClass = "ui-btn-text",
			buttonClass, iconClass,
			// Button inner markup
			buttonInner,
			buttonText,
			buttonIcon,
			buttonElements;

		$.each(o, function(key, value) {
			e.setAttribute( "data-" + $.mobile.ns + key, value );
			el.jqmData(key, value);
		});

		// Check if this element is already enhanced
		buttonElements = $.data(((e.tagName === "INPUT" || e.tagName === "BUTTON") ? e.parentNode : e), "buttonElements");

		if (buttonElements) {
			e = buttonElements.outer;
			el = $(e);
			buttonInner = buttonElements.inner;
			buttonText = buttonElements.text;
			// We will recreate this icon below
			$(buttonElements.icon).remove();
			buttonElements.icon = null;
		}
		else {
			buttonInner = document.createElement( o.wrapperEls );
			buttonText = document.createElement( o.wrapperEls );
		}
		buttonIcon = o.icon ? document.createElement( "span" ) : null;

		if ( attachEvents && !buttonElements) {
			attachEvents();
		}
		
		// if not, try to find closest theme container	
		if ( !o.theme ) {
			o.theme = $.mobile.getInheritedTheme( el, "c" );	
		}		

		buttonClass = "ui-btn ui-btn-up-" + o.theme;
		buttonClass += o.inline ? " ui-btn-inline" : "";
		buttonClass += o.shadow ? " ui-shadow" : "";
		buttonClass += o.corners ? " ui-btn-corner-all" : "";

		if ( o.mini !== undefined ) {
			// Used to control styling in headers/footers, where buttons default to `mini` style.
			buttonClass += o.mini ? " ui-mini" : " ui-fullsize";
		}
		
		if ( o.inline !== undefined ) {			
			// Used to control styling in headers/footers, where buttons default to `mini` style.
			buttonClass += o.inline === false ? " ui-btn-block" : " ui-btn-inline";
		}
		
		
		if ( o.icon ) {
			o.icon = "ui-icon-" + o.icon;
			o.iconpos = o.iconpos || "left";

			iconClass = "ui-icon " + o.icon;

			if ( o.iconshadow ) {
				iconClass += " ui-icon-shadow";
			}

			if ( o.iconsize ) {
				iconClass += " ui-iconsize-" + o.iconsize;
			}
		}

		if ( o.iconpos ) {
			buttonClass += " ui-btn-icon-" + o.iconpos;

			if ( o.iconpos == "notext" && !el.attr( "title" ) ) {
				el.attr( "title", el.getEncodedText() );
			}
		}
    
		innerClass += o.corners ? " ui-btn-corner-all" : "";

		if ( o.iconpos && o.iconpos === "notext" && !el.attr( "title" ) ) {
			el.attr( "title", el.getEncodedText() );
		}

		if ( buttonElements ) {
			el.removeClass( buttonElements.bcls || "" );
		}
		el.removeClass( "ui-link" ).addClass( buttonClass );

		buttonInner.className = innerClass;

		buttonText.className = textClass;
		if ( !buttonElements ) {
			buttonInner.appendChild( buttonText );
		}
		if ( buttonIcon ) {
			buttonIcon.className = iconClass;
			if ( !(buttonElements && buttonElements.icon) ) {
				buttonIcon.appendChild( document.createTextNode("\u00a0") );
				buttonInner.appendChild( buttonIcon );
			}
		}

		while ( e.firstChild && !buttonElements) {
			buttonText.appendChild( e.firstChild );
		}

		if ( !buttonElements ) {
			e.appendChild( buttonInner );
		}

		// Assign a structure containing the elements of this button to the elements of this button. This
		// will allow us to recognize this as an already-enhanced button in future calls to buttonMarkup().
		buttonElements = {
			bcls  : buttonClass,
			outer : e,
			inner : buttonInner,
			text  : buttonText,
			icon  : buttonIcon
		};

		$.data(e,           'buttonElements', buttonElements);
		$.data(buttonInner, 'buttonElements', buttonElements);
		$.data(buttonText,  'buttonElements', buttonElements);
		if (buttonIcon) {
			$.data(buttonIcon, 'buttonElements', buttonElements);
		}
	}

	return this;
};

$.fn.buttonMarkup.defaults = {
	corners: true,
	shadow: true,
	iconshadow: true,
	iconsize: 18,
	wrapperEls: "span"
};

function closestEnabledButton( element ) {
    var cname;

    while ( element ) {
		// Note that we check for typeof className below because the element we
		// handed could be in an SVG DOM where className on SVG elements is defined to
		// be of a different type (SVGAnimatedString). We only operate on HTML DOM
		// elements, so we look for plain "string".
        cname = ( typeof element.className === 'string' ) && (element.className + ' ');
        if ( cname && cname.indexOf("ui-btn ") > -1 && cname.indexOf("ui-disabled ") < 0 ) {
            break;
        }

        element = element.parentNode;
    }

    return element;
}

	
})(jQuery);


function Request(sName) {
    //本javascript函数 实现重任意的IE地址栏取出参数 
    var sURL = new String(window.location).toLowerCase(); //不区分大小写
    sName = new String(sName).toLowerCase();
    sURL = sURL.replace(/'/g, "");
    var iQMark = sURL.lastIndexOf('?');
    var iLensName = sName.length;
    //retrieve loc. of sName
    var iStart = sURL.indexOf('?' + sName + '=') //limitation 1
    if (iStart == -1) {//not found at start
        iStart = sURL.indexOf('&' + sName + '=')//limitation 1
        if (iStart == -1) {//not found at end
            return ""; //not found
        }
    }
    iStart = iStart + +iLensName + 2;
    var iTemp = sURL.indexOf ('&', iStart); //next pair start
    if (iTemp == -1) {//EOF
		iTemp = sURL.indexOf('#', iStart);
		 if (iTemp == -1) {//EOF
        	iTemp = sURL.length;
		 }
    }
    return sURL.slice(iStart, iTemp);
    sURL = null; //destroy String
}

//平台、设备和操作系统
var system ={
win : false,
mac : false,
xll : false
};
//检测平台
var p = navigator.platform;
system.win = p.indexOf("Win") == 0;
system.mac = p.indexOf("Mac") == 0;
system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
//跳转语句，如果是手机访问就自动跳转到wap.baidu.com页面
if(system.win||system.mac||system.xll){
 //window.location.href="http://www.q1.com/pay";
}else{

//window.location.href="http://wap.baidu.com";
}
 

function showLoading() {
	try{
	$.mobile.loadingMessageTextVisible = true;
 	$.mobile.showPageLoadingMsg( 'a', "请稍候..." );
	}catch(e){}
}
function hideLoading() {
	try{
	$.mobile.hidePageLoadingMsg();
	}catch(e){}
}

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
			alert(msg);
		}
	}catch(e){
		alert(msg);
	}	
}

// /生成随机数
function rand(num) {
	if (num == null)
		num = 9999;
	return Math.floor(Math.random() * num) + Math.random();
}
function purl(gid){
	switch(gid){
		case "1":
		case "2":{return "pay1"}
		case "3":{return "pay9"}
		case "1000":{return "payyy"}
		default:return "pay1";
	}
}

var isneedtoKillAjax =true; 
function checkajaxkill(msg)
{
	if(isneedtoKillAjax){
		if(msg)
			showAlert(msg);
		else
			showAlert("连接服务器超时，可能是网速太慢，请稍候再试。");
		hideLoading();		
	}
	isneedtoKillAjax=true;
}

function submitForm(obj){
	setTimeout(function(){checkajaxkill();},10000);// 10 seconds     
	try {	
		var gid=$("#h_gameid").val();
		if($(":radio[name='gameid']:checked").val()!=gid){window.location="#page1"; return false;}		
		showLoading();
		$.getJSON(
				"https://"+purl(gid)+".q1.com/payment/MOrderAdd?"+$(obj).serialize()+"&jsoncallback=?",
				{
					q : rand(9999)				
				}, function(json) {
					isneedtoKillAjax =false;// set to false	
					hideLoading();			
					if(json.code=="1") //成功
					{
						$("#paylink").attr("href",decodeURIComponent(json.url));	
						$("#qrimg").html("<img src='http://m.q1.com/qr.aspx?size=2&data="+decodeURIComponent(json.url)+"' />")				
						$("#orderMsg").html(json.message+"");
						window.location="#page3";
					}else{
						$("#paylink").attr("href","");
						showAlert(json.message);
						window.location="#page1";
					}
				});
	} catch (e) {
		alert(e);
		hideLoading();
	}
}


function pay(){
	if($("#paylink").attr("href").indexOf("http")==0){
		//$("#paylink").attr("target","_blank");	
		openPage($("#paylink").attr("href"));
		return false;	
	}
	else{
		showAlert("请重新下单！");
		window.location="#page1";
		return false;
	}
}

$(document).ready(function(e) {
    $("#paylink").click(function(){
		return pay();
	});
	$("#username").blur(function(){
		$("#username").val($("#username").val().replace(/\s+/g,""));
	});
	$("#nextlink").click(function(){
		return formCheck();
	});
	
	$("#username").keydown(function(event){
		var keycode = event.which;  
		if (keycode == 13) {  
			if(formCheck()){
				window.location="#page2";
				return false;
			}			
		} 
	});
});

function AutoNext(){
	if(formCheck()){
		window.location="#page2";
	}
}

function formCheck()
{
	localStorage.setItem("gameid",$(":radio[name='gameid']:checked").val());	
	localStorage.setItem("username",$("#username").val());
	localStorage.setItem("paynum",$("#paynum").val());	
	$("#lab_gameid").html($(":radio[name='gameid']:checked").attr("title"));
	$("#lab_username").html($("#username").val());
	$("#h_gameid").val($(":radio[name='gameid']:checked").val());
	$("#lab_paynum").html($("#paynum").find("option:selected").text());	
	if($(":radio[name='gameid']:checked").val()==null){
		showAlert("请选择游戏！");
		return false;
	}
	if($("#username").val().length<3){
		showAlert("请输入用户名！");
		return false;
	}	
	return true;	
}
function read(name)
{
	if(Request(name)) return Request(name);
	return localStorage.getItem(name);
}

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
 var openPage =function(url){
	 	showLoading(); // 显示加载中...
		
		$("#qrtext").hide();
	    $("#iframepage").height(getTotalHeight()-60);
		$("#iframepage").html("<iframe src="+url+" id='iframeurl'  width='100%' height='100%' ></iframe>");		
		location.href='#page16';	
		hideLoading();
		
 }