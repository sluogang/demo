var Message = function(){};

Message.prototype = {
		send: function(success, error, target, content){
			PhoneGap.exec(success, error, "SmsPlugin", "send", [target, content]);
		}
};

PhoneGap.addConstructor(function() {
	PhoneGap.addPlugin("message", new Message());
});