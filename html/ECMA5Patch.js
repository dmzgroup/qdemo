(function () {

if (!Object.keys) {

   Object.keys = function (obj) {

      var result = []
        , property
        ;

      for (property in obj) {

         if (obj.hasOwnProperty(property)) { result.push(property); }
      }

      return result;
   }
}

if (!window.JSON) { window.JSON = {}; }

if (!window.JSON.parse) {

   window.JSON.parse = function (str) {

      var result = eval('(' + str + ')')
        ;

      return result;
   }
}

if (!Array.prototype.forEach) {

   Array.prototype.forEach = function (callback) {

      var ix = 0
        ;

      for (ix = 0; ix < this.length; ix++) { callback (this[ix]); }
   };
}

})();

