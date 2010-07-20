var dmz =
       { object: require("dmz/components/object")
       , messaging: require("dmz/runtime/messaging")
       , data: require("dmz/runtime/data")
       , defs: require("dmz/runtime/definitions")
       , undo: require("dmz/runtime/undo")
       , util: require("dmz/types/util")
       }
  , closestObject
//  Constants
  , VectorAttr = dmz.defs.createNamedHandle("vector")
//  Functions 
  , toVector
  , findClosest
  , move
  ;

toVector = function (data) {

   var result
     ;

   if (data) { result = data.vector(VectorAttr); }

   return result;
};


findClosest = function (pos) {

   var result
     , magnitude
     , list = dmz.object.getSelected()
     ;

   list.forEach(function(handle) {

      var cpos = dmz.object.position(handle)
        , cmag
        ;

      if (cpos) {

         cmag = cpos.subtract(pos).magnitudeSquared();

         if (dmz.util.isUndefined(magnitude) || (cmag < magnitude)) {

            magnitude = cmag;
            result = handle;
         }
      }
   });

   return result;
};


move = function (pos) {

   var offset
     , cpos
     , list
     ;

   if (closestObject) {

      cpos = dmz.object.position(closestObject);

      if (!cpos) { cpos = dmz.vector.create(); }

      offset = pos.subtract(cpos);

      list = dmz.object.getSelected();

      list.forEach(function (handle) {

         cpos = dmz.object.position(handle);

         if (cpos) {

            cpos = cpos.add(offset);

            dmz.object.position(handle, null, cpos);
         }
      });
   }
};


dmz.messaging.subscribe(self, "Object_First_Move_Message",  function (data) {

   var pos
     , undo
     ;

   closestObject = undefined

   pos = toVector(data);

   if (pos) {

      closestObject = findClosest(pos);

      undo = dmz.undo.startRecord("Move Object(s)");

      move(pos);

      dmz.undo.stopRecord(undo);
   }
});


dmz.messaging.subscribe(self, "Object_Move_Message",  function (data) {

   var pos = toVector(data);
     ;

   if (pos) { move(pos); }
});
