var dmz = 
       { input: require("dmz/components/input")
       , object: require("dmz/components/object")
       , vector: require("dmz/types/vector")
       , matrix: require("dmz/types/matrix")
       }
  , prev
  ;

dmz.input.button.observe(self, function (channel, button) {

   var obj
     ;

   if ((button.id === 1) && !button.value) {

      obj = dmz.object.create("bread-crumb");
      dmz.object.position(obj, null, dmz.object.position(dmz.object.hil()));
      dmz.object.orientation(obj, null, dmz.object.orientation(dmz.object.hil()));
      dmz.object.activate(obj);

      if (prev) { dmz.object.link("Bread_Crumb_Attribute", prev, obj); }
      else { dmz.object.flag(obj, "Bread_Crumb_Attribute", true); }

      prev = obj;
   }
});
