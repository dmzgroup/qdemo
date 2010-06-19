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
  , location = {}
  , animate = {}
//  Constants
  , MaxHeight = 250
  , LinkAttr = dmz.defs.createNamedHandle("field-report")
  , LocationType = dmz.objectType.lookup("location")
  , ReportType = dmz.objectType.lookup("field-report")
  , ReportPointType = dmz.objectType.lookup("field-report-point")
//  Functions 
  ;


self.shutdown = function () {

};

dmz.time.setRepeatingTimer(self, function (time) {

   var keys = Object.keys(animate);

   keys.forEach(function (key) {

      var obj = animate[key].bottom
        , pos = dmz.object.position(obj.handle)
        ;

      if (pos && obj.target) {

         if (pos.y > obj.target.y) {

            pos.y -= time * obj.rate;

            if (pos.y < obj.target.y) {

               delete animate[obj.handle];
               pos.y = obj.target.y;
            }

            dmz.object.position(obj.handle, null, pos);
         }
      }
   });
});

dmz.object.create.observe(self, function (object, type) {

   var report
     , pos
     ;

   if (type.isOfType (LocationType)) {

      report = {
         top: { handle: dmz.object.create(ReportType) },
         bottom: { handle: dmz.object.create(ReportPointType) }
      };

      pos = dmz.object.position(object);

      if (pos) {

         report.bottom.target = pos.copy();
         report.bottom.rate = (MaxHeight - pos.y) * 0.75;
         pos.y = MaxHeight;
         dmz.object.position(report.bottom.handle, null, pos);
         dmz.object.position(report.top.handle, null, pos);
      }

      dmz.object.activate(report.top.handle);
      dmz.object.activate(report.bottom.handle);
      dmz.object.link(LinkAttr, report.top.handle, report.bottom.handle);

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

