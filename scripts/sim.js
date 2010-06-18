var dmz =
       { object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , overlay: require("dmz/components/overlay")
       , portal: require("dmz/components/portal")
       , input: require("dmz/components/input")
       , time: require("dmz/runtime/time")
       , vector: require("dmz/types/vector")
       , matrix: require("dmz/types/matrix")
       , messaging: require("dmz/runtime/messaging")
       , defs: require("dmz/runtime/definitions")
       , data: require("dmz/runtime/data")
       , util: require("dmz/types/util")
       }
  , locations = {}
  , animate = {}
//  Constants
  , LocationType = dmz.objectType.lookup("location")
  , ReportType = dmz.objectType.lookup("field-report")
  , ReportPointType = dmz.objectType.lookup("field-report-point")
//  Functions 
  ;


self.shutdown = function () {

};

dmz.object.create.observe(self, function (object, type) {

   var report
     , pos
     , frobj
     , point
     ;

   if (type.isOfType (LocationType)) {

      report = {
         top: { handle: dmz.object.create(ReportType) }
         bottom: { handle: dmz.object.create(ReportPointType) }
      };

      pos = dmz.object.position(object);

      if (pos) {

         dmz.object.position(report.bottom.handle, null, pos);
         pos.y += 10;
         dmz.object.position(report.top.handle, null, pos);
      }

      dmz.object.activate(report.top.handle);
      dmz.object.activate(report.bottom.handle);

      animate[object] = report;

      location[object] = report;
   }
});

dmz.object.destroy.observe(self, function (object) {

   var report = location[object];

   if (report) {

      dmz.object.destroy(report.top.handle);
      dmz.object.destroy(report.bottom.handle);

      delete location[object];
   }
});

dmz.object.position.observe(self, function (object, attr, value) {

});

