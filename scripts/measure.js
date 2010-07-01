var dmz =
       { object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , messaging: require("dmz/runtime/messaging")
       , data: require("dmz/runtime/data")
       , defs: require("dmz/runtime/definitions")
       , undo: require("dmz/runtime/undo")
       , util: require("dmz/types/util")
       }
  , head
  , tail
//  Constants
  , VectorAttr = dmz.defs.createNamedHandle("vector")
  , HideAttr = dmz.object.HideAttribute
  , Type = dmz.objectType.lookup(self.config.string("object-type.name", "measure-node"))
//  Functions 
  , toVector
  , findClosest
  , move
  ;

// Init
(function () {

   head = dmz.object.create(Type)
   tail = dmz.object.create(Type)

   if (head && tail) {

      dmz.object.flag(tail, HideAttr, true);
      dmz.object.flag(head, HideAttr, true);

      dmz.object.activate(head);
      dmz.object.activate(tail);

      dmz.object.link("Measure_Attribute", head, tail);
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
   }
});


dmz.messaging.subscribe("Measure_Message", self,  function (data) {

   var pos = toVector(data);
     ;

   if (head && pos) {

      dmz.object.position(head, null, pos);
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
