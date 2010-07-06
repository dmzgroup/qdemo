var dmz =
       { object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , messaging: require("dmz/runtime/messaging")
       , data: require("dmz/runtime/data")
       , defs: require("dmz/runtime/definitions")
       , undo: require("dmz/runtime/undo")
       , util: require("dmz/types/util")
       }
  , currentPath
//  Constants
  , VectorAttr = dmz.defs.createNamedHandle("vector")
  , ObjectAttr = dmz.defs.createNamedHandle("handle")
  , PathAttr = dmz.defs.createNamedHandle("Object_Path_Link_Attribute")
  , PathType = dmz.objectType.lookup("path")
//  Functions 
  ;

dmz.messaging.subscribe("Object_Path_Message", self,  function (data) {

   var pos
     , obj
     , path
     , undo
     , type
     , createPath = true
     ;

   if (data) {

      pos = data.vector(VectorAttr);
      obj = data.handle(ObjectAttr);

      if (obj) {

         if (obj === currentPath) {

            currentPath = undefined;
            createPath = false;
         }
         else {

            type = dmz.object.type(obj);

            if (type && type.isOfType(PathType)) {

               currentPath = obj;
               dmz.object.select(obj);
               createPath = false;
            }
         }
      }

      if (pos && createPath) {

         undo = dmz.undo.startRecord((currentPath ? "Add to" : "Start") + " Path");
         path = dmz.object.create(PathType);
         dmz.object.position(path, null, pos);
         dmz.object.activate(path);
         dmz.object.select(path);
         if (currentPath) { dmz.object.link(PathAttr, currentPath, path); }
         currentPath = path;
         dmz.undo.stopRecord(undo);
      }
   }
});

dmz.messaging.subscribe("Deactivate_Path_Tool_Message", self,  function (data) {

   currentPath = undefined;
});
