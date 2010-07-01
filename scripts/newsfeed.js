var dmz = 
       { input: require("dmz/components/input")
       , defs: require("dmz/runtime/definitions")
       , object: require("dmz/components/object")
       , vector: require("dmz/types/vector")
       , matrix: require("dmz/types/matrix")
       , time: require("dmz/runtime/time")
       , util: require("dmz/types/util")
       }
  , point = dmz.vector.create(-1230.959538, 6.000923, 573.172788)
  , offset = dmz.vector.create(0, 80, -200)
  , angle = 0
  // Constants
  , Rate = Math.PI / 50
  , TwoPi = Math.PI * 2
  // Functions
  ;

dmz.time.setRepeatingTimer(self, function (time) {

   var hil = dmz.object.hil()
     , dir
     , lastPos = dmz.object.position(hil)
     , pos
     , ori
     , mat
     ;

   angle += Rate * time;

   if (angle > TwoPi) { angle -= TwoPi; }

   mat = dmz.matrix.create().fromAxisAndAngle(dmz.vector.Up, angle);

   dir = mat.transform(offset);
   pos = dir.add(point);

   dmz.object.position(hil, null, pos);
   dmz.object.orientation(
      hil,
      null,
      dmz.matrix.create().fromVector(dir.multiplyConst(-1)));

   if (lastPos && time > 0) {

      dmz.object.velocity(hil, null, pos.subtract(lastPos).multiplyConst(1/time));
      // self.log.error(dmz.object.velocity(hil).magnitude());
   }
});
