var dmz =
       { object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , messaging: require("dmz/runtime/messaging")
       , data: require("dmz/runtime/data")
       , defs: require("dmz/runtime/definitions")
       , undo: require("dmz/runtime/undo")
       , util: require("dmz/types/util")
       }
  , source
//  Constants
  , ObjectAttr = dmz.defs.createNamedHandle("handle")
  , AssignAttr = dmz.defs.createNamedHandle("Object_Assign_Link_Attribute")
  , PathType = dmz.objectType.lookup("path")
//  Functions 
  ;

dmz.messaging.subscribe("Object_Assign_Source_Message", self,  function (data) {

   var handle
     , type
     ;

   if (data) {

      handle = data.handle(ObjectAttr);

      type = dmz.object.type(handle);

      if (type && !type.isOfType(PathType)) {

         source = handle;
      }
   }
});


dmz.messaging.subscribe("Object_Assign_Target_Message", self,  function (data) {

   var handle
     , type
     , undo
     ;

   if (source && data) {

      handle = data.handle(ObjectAttr);

      type = dmz.object.type(handle);

      if (type && type.isOfType(PathType)) {

         undo = dmz.undo.startRecord("Assign object to path");
         dmz.object.link(AssignAttr, source, handle);
         dmz.undo.stopRecord(undo);
      }

      source = undefined;
   }
});


dmz.messaging.subscribe("Deactivate_Assign_Tool_Message", self,  function (data) {

   source = undefined;
});
