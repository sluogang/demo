/**
 * cordova is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) Matt Kane 2010
 * Copyright (c) 2011, IBM Corporation
 */
var BarcodeScanner = function() { 

}
BarcodeScanner.Encode = {
		TEXT_TYPE: "TEXT_TYPE",
		EMAIL_TYPE: "EMAIL_TYPE",
		PHONE_TYPE: "PHONE_TYPE",
		SMS_TYPE: "SMS_TYPE",
		//  CONTACT_TYPE: "CONTACT_TYPE",  // TODO:  not implemented, requires passing a Bundle class from Javascriopt to Java
		//  LOCATION_TYPE: "LOCATION_TYPE" // TODO:  not implemented, requires passing a Bundle class from Javascriopt to Java
	}
//读取二维码
BarcodeScanner.prototype.scan = function(success, fail) {
    return cordova.exec(
    		function(args) {success(args);	},
    		function(args) {  fail(args);   }, 
    		'BarcodeScanner', 
    		'scan', 
    		[]);
};

///生成二维码
BarcodeScanner.prototype.encode = function(type, data, success, fail, options) {
    return cordova.exec(function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'BarcodeScanner', 'encode', [{"type":type, "data":data, "installTitle":installTitle, "installMessage":installMessage, "yesString":yesString, "noString":noString}]);
};

if(!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.barcodeScanner) {
    window.plugins.barcodeScanner = new BarcodeScanner();
}
