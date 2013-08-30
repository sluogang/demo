var myScroll;
var imgnum=5;
function loaded() {
	window.localStorage.setItem("HomeLogo", "HomeLogo_hide");
	var width = getTotalWidth();//window.screen.availWidth ;
	var height =getTotalHeight();// window.screen.availHeight;
	updateCss(width, height);
	var num = 0;
	myScroll = new iScroll('wrapper', {
		snap: true,
		momentum: false,
		hScrollbar: false,
		onScrollEnd: function () {
			document.querySelector('#indicator > li.active').className = '';
			document.querySelector('#indicator > li:nth-child(' + (this.currPageX + 1) + ')').className = 'active';
			num = parseInt(this.currPageX + 1);
			if (num == imgnum) {
				if (Request["p"] != 0) {
					location.href = "index.html#page2";
				} else {
				location.href = "index.html#page5";
				 }
			}

		}
	});
}

var Request = new Array();
function loadQueryString() {
	var s = window.location.href;
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
loadQueryString();
function updateCss(width, height) {
	var obj = document.getElementById("wrapper");
	var scroller = document.getElementById("scroller");
	scroller.style.width = width * imgnum + "px";
	$("#scroller li").css("width", width + "px");
	$("#scroller li").css("height", height + "px");
	$("#scroller li img").css("width", width + "px");
	$("#scroller li img").css("height", height + "px");
	$("#nav").css("width", width * imgnum + "px");
	$("#nav").css("left", width / 3+"px");
	$("#nav").css("top", height-60+"px");
	obj.style.width = width + "px";
	obj.style.height = height + "px";
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
