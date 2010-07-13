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
     , info
     , p1
     , p2
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

            if (dmz.object.isObject(obj)) {

               type = dmz.object.type(obj);

               if (type && type.isOfType(PathType)) {

                  currentPath = obj;
                  dmz.object.select(obj);
                  createPath = false;
               }
            }
            else if (dmz.object.isLink(obj)) {

               info = dmz.object.linkedObjects(obj);

               if (info.attribute === PathAttr) {

                  currentPath = undefined;
                  createPath = false;
                  p1 = dmz.object.position(info.super);
                  p2 = dmz.object.position(info.sub);

                  if (p1 && p2) {

                     undo = dmz.undo.startRecord("Insert Path Node");

                     dmz.object.unlink(obj);

                     path = dmz.object.create(PathType);
                     dmz.object.position(
                        path,
                        null,
                        p1.subtract(p2).multiply(0.5).add(p2));
                     dmz.object.activate(path);
                     dmz.object.select(path);
                     dmz.object.link(PathAttr, info.super, path);
                     dmz.object.link(PathAttr, path, info.sub);

                     if (undo) { dmz.undo.stopRecord(); }
                  }
               }
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
