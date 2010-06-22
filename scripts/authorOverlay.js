var dmz =
       { object: require("dmz/components/object")
       , data: require("dmz/runtime/data")
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
  , toolOverlay = dmz.overlay.lookup("tool")
  , posOverlay = dmz.overlay.lookup("pos")
  , oriOverlay = dmz.overlay.lookup("ori")
//  Constants
//  Functions 
  ;


self.shutdown = function () {

};


dmz.time.setRepeatingTimer (self,  function (time) {

   var  hpr
     , scale
     , view = dmz.portal.view()
     ;

   if (view) {

      posOverlay.text(
         view.position.x.toFixed() + " " +
         view.position.y.toFixed() + " " +
         view.position.z.toFixed());

      hpr = view.orientation.toEuler();

      hpr[0] = dmz.util.radiansToDegrees(hpr[0]);
      hpr[1] = dmz.util.radiansToDegrees(hpr[1]);
      hpr[2] = dmz.util.radiansToDegrees(hpr[2]);

      oriOverlay.text(
         hpr[0].toFixed() + " " +
         hpr[1].toFixed() + " " +
         hpr[2].toFixed());
   }
});

dmz.messaging.subscribe("Update_Tool_Name", self, function (data) {

   var text = dmz.data.unwrapString(data);

   if (toolOverlay && text) { toolOverlay.text(text); }
});
