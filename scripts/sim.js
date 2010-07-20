var dmz =
       { object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , overlay: require("dmz/components/overlay")
       , portal: require("dmz/components/portal")
       , input: require("dmz/components/input")
       , time: require("dmz/runtime/time")
       , vector: require("dmz/types/vector")
       , mask: require("dmz/types/mask")
       , matrix: require("dmz/types/matrix")
       , messaging: require("dmz/runtime/messaging")
       , defs: require("dmz/runtime/definitions")
       , data: require("dmz/runtime/data")
       , util: require("dmz/types/util")
       }
  , location = {}
  , animate = {}
  , plume //  = { pos: dmz.vector.create(), handle: 0, radius: 0}
  , start = false
  , reportCount = 0
//  Constants
  , InitialRadius = 330
  , RedState = dmz.defs.lookupState("Red")
  , YellowState = dmz.defs.lookupState("Yellow")
  , AllState = RedState.or(YellowState)
  , MaxHeight = 80
  , PlumeRate = 4
  , LinkAttr = dmz.defs.createNamedHandle("field-report")
  , TextAttr = dmz.defs.createNamedHandle("field-report-text")
  , NameAttr = dmz.defs.createNamedHandle("Location_Name")
  , PopulationAttr = dmz.defs.createNamedHandle("Location_Population")
  , CasualtiesAttr = dmz.defs.createNamedHandle("Location_Casualties")
  , ProbablityAttr = dmz.defs.createNamedHandle("Location_Probability")
  , PlumeRadiusAttr = dmz.defs.createNamedHandle("plume-radius")
  , LocationType = dmz.objectType.lookup("location")
  , ReportType = dmz.objectType.lookup("field-report")
  , PlumeType = dmz.objectType.lookup("plume")
  , ReportPointType = dmz.objectType.lookup("field-report-point")
//  Functions 
  , createReport
  ;


self.shutdown = function () {

};


createReport = function (loc) {

   var report =
       { top: { handle: dmz.object.create(ReportType) }
       , bottom: { handle: dmz.object.create(ReportPointType) }
       }
     , pos
     ;

   reportCount += 1;

   if (loc.pos) {

      report.bottom.target = loc.pos.copy();
      report.bottom.rate = (MaxHeight - loc.pos.y) * 2;
      pos = loc.pos.copy();
      pos.y = MaxHeight;
      dmz.object.position(report.bottom.handle, null, pos);
      dmz.object.position(report.top.handle, null, pos);
   }

   dmz.object.activate(report.top.handle);
   dmz.object.activate(report.bottom.handle);
   dmz.object.link(LinkAttr, report.top.handle, report.bottom.handle);

   animate[report.bottom.handle] = report;

   loc.report = report;
};


dmz.time.setRepeatingTimer(self, function (time) {

   var keys
     , r2
     ;

   if (start && plume) {

      plume.radius += PlumeRate * time;

      if (plume.radius > 1200) { 

         plume.radius = InitialRadius;

         keys = Object.keys(location);

         keys.forEach(function (key) {

            var obj = location[key]
              ;

            if (obj.report) {

               if (obj.report.top.handle) { dmz.object.destroy(obj.report.top.handle); }

               if (obj.report.bottom.handle) {

                  dmz.object.destroy(obj.report.bottom.handle);
               }

               obj.report = undefined;
            }

            obj.inPlume = false;
         });
      }

      dmz.object.scalar(plume.handle, PlumeRadiusAttr, plume.radius);

      r2 = (plume.radius - 40) * (plume.radius - 40);

      keys = Object.keys(location);

      keys.forEach(function (key) {

         var obj = location[key]
           , dist
           , name
           , population
           , casualties
           , percent
           , state
           , probability
           ;

         if (!obj.inPlume) {

            if (r2 > plume.pos.subtract(obj.pos).magnitudeSquared()) {

               obj.inPlume = true;

               probability = dmz.object.scalar(obj.handle, ProbablityAttr);

               if (!probability) { probability = 0; }

               if (Math.random() <= probability) { createReport(obj); }
            }
         }

         if (obj.inPlume) {

            dist = plume.pos.subtract(obj.pos).magnitudeSquared() / r2;

            name = dmz.object.text(obj.handle, NameAttr);
            if (!name) { name = "<Unknown>"; }
            population = dmz.object.scalar(obj.handle, PopulationAttr);
            casualties = dmz.object.scalar(obj.handle, CasualtiesAttr);

            if (population) {

               if (!casualties) { casualties = 0; }

               casualties = Math.floor((1 - dist) * (1 - dist) * population);
            }

            if (obj.report && obj.report.top) {

               if (population > 0) {

                  percent = casualties / population * 100;
                  if (percent < 1) { percent = 1; }
               }
               else { percent = 0; }

               state = dmz.object.state(obj.report.top.handle);
               if (state) { state = state.unset(AllState); }
               else { state = dmz.mask.create(); }

               if (percent >= 40) { state = state.or(RedState); }
               else if (percent >= 10) { state = state.or(YellowState); }

               dmz.object.state(obj.report.top.handle, null, state);

               dmz.object.text(
                  obj.report.top.handle,
                  TextAttr,
                  name + ": " + percent.toFixed() + "%");
            }
         }
      });
   }

   keys = Object.keys(animate);

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

   var obj
     ;

   if (type.isOfType (LocationType)) {

      obj = { handle: object, pos: dmz.object.position(object), inPlume: false };

      location[object] = obj;
   }
});


dmz.object.destroy.observe(self, function (object) {

   var obj = location[object];

   if (obj && obj.report) {

      dmz.object.destroy(obj.report.top.handle);
      dmz.object.destroy(obj.report.bottom.handle);

      delete location[object];
   }
});


dmz.object.flag.observe(self, "Plume_Source", function (object, attr, value) {

   if (value) {

      plume =
         { handle: dmz.object.create(PlumeType)
         , pos: dmz.object.position(object)
         , radius: InitialRadius
         };

      if (!plume.pos) { plume.pos = dmz.vector.create(); }

      if (plume.handle) {

         dmz.object.position(plume.handle, null, plume.pos);
         dmz.object.scalar(plume.handle, PlumeRadiusAttr, plume.radius);
         dmz.object.activate(plume.handle);
      }
   }
});


dmz.input.channel.observe(self, "bread-crumb-follow", function (channel, value) {

   if (!start && value) { start = true; }

});
