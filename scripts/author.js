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
       , undo: require("dmz/runtime/undo")
       }
  , editMsg = dmz.messaging.create("Edit_Location_Attributes_Message")
//  Constants
  , LocationType = dmz.objectType.lookup("location")
//  Functions 
  ;


self.shutdown = function () {

  // Reset the text overlays to their original values.
};


dmz.messaging.subscribe(self, "Create_Location_Message",  function (data) {

   var pos
     , obj
     , out
     , undo
     ;

   if (dmz.data.isTypeOf(data)) {

      pos = data.vector("position", 0);
      obj = data.handle("object", 0);

      if (dmz.util.isUndefined(obj)) { obj = 0; }

      if (dmz.vector.isTypeOf(pos)) {

         out = dmz.data.create();

         if (obj !== 0) {

            if (!dmz.object.type(obj).isOfType(LocationType)) { obj = 0; }
         }


         if (obj === 0) {

            undo = dmz.undo.startRecord("Create Location");

            obj = dmz.object.create("location");
            dmz.object.position(obj, null, pos);
            dmz.object.activate(obj);

            out.handle("created", 0, obj);
         }
         else {

            undo = dmz.undo.startRecord("Edit Location");
         }

         out.handle("object", 0, obj);

         editMsg.send(out);

         if (undo) { dmz.undo.stopRecord(undo); }
      }
   }
});


dmz.object.text.observe(self, "Location_Name", function (obj, attr, value) {

   var pop = dmz.object.scalar(obj, "Location_Population")
     ;

   if (pop) { value = value + ": " + pop.toFixed(); }

   dmz.object.text(obj, "Location_Text", value);
});

dmz.object.scalar.observe(self, "Location_Population", function (obj, attr, value) {

   var loc = dmz.object.text(obj, "Location_Name")
     , str = value.toFixed()
     ;

   if (loc) { str = loc + ": " + str; }

   dmz.object.text(obj, "Location_Text", str);
});
