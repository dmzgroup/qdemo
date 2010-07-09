var dmz = 
       { input: require("dmz/components/input")
       , isect: require("dmz/components/isect")
       , defs: require("dmz/runtime/definitions")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , vector: require("dmz/types/vector")
       , matrix: require("dmz/types/matrix")
       , time: require("dmz/runtime/time")
       , util: require("dmz/types/util")
       }
  , list = {}
  // Constants
  , Speed = 5
  , AssignAttr = dmz.defs.createNamedHandle("Object_Assign_Link_Attribute")
  // Functions
  , clamp
  , move
  ;

clamp = function (obj, pos, ori) {

   var result = pos.copy ()
     ;

   return result;
};


move = function (time, obj) {

   var pos = dmz.object.position(obj.handle)
     , ori = dmz.object.orientation(obj.handle)
     , vel = dmz.object.velocity(obj.handle)
//     , targetPos = getTargetPos(obj)
     , speed
     ;

   if (!pos) { pos = dmz.vector.create(); }
   if (!ori) { ori = dmz.matrix.create(); }
   if (!vel) {

      vel = dmz.vector.create(0, 0, -Speed);
      vel = ori.transform(vel);
   }

   pos = pos.add(vel.multiply(time));
   pos = clamp (obj, pos, ori);

   dmz.object.position(obj.handle, null, pos);
   dmz.object.velocity(obj.handle, null, vel);
   dmz.object.orientation(obj.handle, null, ori);
};


dmz.time.setRepeatingTimer(self, function (time) {

   var keys = Object.keys(list)
     ;

   keys.forEach(function (key) { move(time, list[key]); });
});


dmz.object.link.observe(self, AssignAttr, function (link, attr, super, sub) {

   var obj = {}
     ;

    obj.handle = super;
    obj.startNode = sub;
    obj.length = dmz.object.type(super).config().number("wheels.length", 5);
    obj.width = dmz.object.type(super).config().number("wheels.width", 5);

self.log.error(JSON.stringify(obj));

   list[super] = obj;
});


dmz.object.unlink.observe(self, AssignAttr, function (link, attr, super, sub) {

   var obj = list[super]
     ;

   if (obj && (obj.startNode === sub)) { delete list[super]; }
});
