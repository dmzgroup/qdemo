var dmz =
       { object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , time: require("dmz/runtime/time")
       , vector: require("dmz/types/vector")
       , matrix: require("dmz/types/matrix")
       , defs: require("dmz/runtime/definitions")
       , util: require("dmz/types/util")
       }
  , reports = {}
//  Constants
  , ReportType = dmz.objectType.lookup("field-report")
//  Functions 
  ;


self.shutdown = function () {

  // Reset the text overlays to their original values.
};


dmz.time.setRepeatingTimer(self, 2, function (time) {

   var keys = Object.keys(reports)
     ;

   self.log.error(JSON.stringify(reports));
});


dmz.object.create.observe(self, function (handle, type) {

   var obj
     ;

   if (type.isOfType(ReportType)) {

      obj = {};

      obj.position = dmz.object.position(handle);
      obj.text = dmz.object.text(handle, "field-report-text");

      reports[handle] = obj;
   }
});


dmz.object.destroy.observe(self, function (handle) {

   var obj = reports[handle]
     ;

   if (obj) { delete reports[handle]; }
});


dmz.object.position.observe(self, function (handle, attr, value) {

   var obj = reports[handle]
     ;

   if (obj) { obj.position = value; }
});


dmz.object.state.observe(self, function (handle, attr, value) {

   var obj = reports[handle]
     ;

   if (obj) { obj.state = value; }
});


dmz.object.text.observe(self, "field-report-text", function (handle, attr, value) {

   var obj = reports[handle]
     ;

   if (obj) { obj.text = value; }
});

