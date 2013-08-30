var share = {    
 callNativeFunction: function (success, fail, resultType) {
      return Cordova.exec( 
success, fail, "gla.phoneinfo",
"action", [resultType]);  
      }

};