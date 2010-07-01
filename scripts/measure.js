var dmz =
       { object: require("dmz/components/object")
       , isect: require("dmz/components/isect")
       , objectType: require("dmz/runtime/objectType")
       , messaging: require("dmz/runtime/messaging")
       , data: require("dmz/runtime/data")
       , defs: require("dmz/runtime/definitions")
       , undo: require("dmz/runtime/undo")
       , util: require("dmz/types/util")
       }
  , head
  , tail
  , attrObj
//  Constants
  , MinScale = 0.01
  , VectorAttr = dmz.defs.createNamedHandle("vector")
  , HideAttr = dmz.object.HideAttribute
  , ScaleAttr = dmz.defs.createNamedHandle("Measure_Radius_Attribute")
  , Type = dmz.objectType.lookup(self.config.string("object-type.name", "measure-node"))
//  Functions 
  , toVector
  , findClosest
  , move
  ;

// Init
(function () {

   var link
     ;

   head = dmz.object.create(Type)
   tail = dmz.object.create(Type)
   attrObj = dmz.object.create(Type)

   if (head && tail) {

      dmz.object.flag(tail, HideAttr, true);
      dmz.object.flag(head, HideAttr, true);

      dmz.object.activate(head);
      dmz.object.activate(tail);
      dmz.object.activate(attrObj);

      link = dmz.object.link("Measure_Attribute", head, tail);

      if (link) {

         dmz.object.linkAttributeObject(link, attrObj);
         dmz.isect.disable(link);
      }
   }
}) ();

toVector = function (data) {

   var result
     ;

   if (data) { result = data.vector(VectorAttr); }

   return result;
};


dmz.messaging.subscribe("First_Measure_Message", self,  function (data) {

   var pos
     ;

   pos = toVector(data);

   if (pos && head && tail) {

      dmz.object.position(head, null, pos);
      dmz.object.position(tail, null, pos);

      if (attrObj) { dmz.object.scalar(attrObj, ScaleAttr, MinScale); }
   }
});


dmz.messaging.subscribe("Measure_Message", self,  function (data) {

   var pos = toVector(data)
     , start = dmz.object.position(tail)
     , length
     , scale
     ;

   if (head && pos) {

      dmz.object.position(head, null, pos);

      if (start) {

         length = pos.subtract(start).magnitude();

         if (attrObj && length > 0) {

            scale = length * 0.01;
            if (scale < MinScale) { scale = MinScale; }
            else if (scale > 10) { scale = 10; }

            dmz.object.scalar(attrObj, ScaleAttr, scale);
         }
      }
   }
});


dmz.messaging.subscribe("Activate_Measure_Tool_Message", self,  function () {

   if (head && tail) {

      dmz.object.flag(tail, HideAttr, false);
      dmz.object.flag(head, HideAttr, false);
   }
});


dmz.messaging.subscribe("Deactivate_Measure_Tool_Message", self,  function () {

   if (head && tail) {

      dmz.object.flag(tail, HideAttr, true);
      dmz.object.flag(head, HideAttr, true);
   }
});
