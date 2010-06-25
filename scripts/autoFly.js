var dmz = 
       { input: require("dmz/components/input")
       , defs: require("dmz/runtime/definitions")
       , object: require("dmz/components/object")
       , vector: require("dmz/types/vector")
       , matrix: require("dmz/types/matrix")
       , time: require("dmz/runtime/time")
       , util: require("dmz/types/util")
       }
  , start
  , current
  // Constants
  , Speed = 100
  , BreadCrumbAttr = dmz.defs.createNamedHandle("Bread_Crumb_Attribute")
  // Functions
  , updateDistance
  , rotate
  , newOri
  , timeSlice
  ;

updateDistance = function () {

   var hil = dmz.object.hil()
     , pos
     , target
     ;

   if (hil && current) {

      pos = dmz.object.position(hil);
      target = dmz.object.position(current);

      if (pos && target) {

         dmz.object.position(hil, BreadCrumbAttr, pos);
         dmz.object.scalar(hil, BreadCrumbAttr, target.subtract(pos).magnitude());
      }
   }
};

rotate = function (time, orig, target) {

   var result = target
     , diff = target - orig
     , max = time * Math.PI * 0.5
     ;

   if (diff > Math.PI) { diff -= Math.PI * 2; }
   else if (diff < -Math.PI)  { diff += Math.PI * 2; }

   if (Math.abs (diff) > max) {

      if (diff > 0) { result = orig + max; }
      else { result = orig - max; }
   }

   return result;
};


newOri = function (time, ori, targetVec) {

   var result = dmz.matrix.create()
     , hvec = targetVec.copy()
     , hpr = ori.toEuler()
     , heading
     , hcross
     , pitch
     , pcross
     , ncross
     , pm
     ;

   hvec.y = 0.0;
   hvec = hvec.normalize();
   heading = dmz.vector.Forward.getAngle(hvec);

   hcross = dmz.vector.Forward.cross(hvec).normalize();

   if (hcross.y < 0.0) { heading = (Math.PI * 2) - heading; }

   if (heading > Math.PI) { heading = heading - (Math.PI * 2); }
   else if (heading < -Math.PI) { heading = heading + (Math.PI * 2); }

   pitch = targetVec.getAngle(hvec);
   pcross = targetVec.cross(hvec).normalize();
   ncross = hvec.cross(pcross);

   if (ncross.y < 0.0) { pitch = (Math.PI * 2) - pitch; }

   heading = rotate(time, hpr[0], heading);

   pitch = rotate(time, hpr[1], pitch);

   if (dmz.util.isZero(pitch - hpr[1]) && dmz.util.isZero(heading - hpr[0])) {

//      obj.onTarget = true;
   }

   pm = dmz.matrix.create().fromAxisAndAngle(dmz.vector.Right, pitch);

   result = result.fromAxisAndAngle(dmz.vector.Up, heading);

   result = result.multiply(pm);

   return result;
};


timeSlice = function (time) {

   var hil = dmz.object.hil()
     , startPos
     , distance
     , target
     , dir
     , pos
     , vel
     , ori
     , links
     ;

   if (!current) {

      current = start;
      updateDistance();
   }

   if (hil && current) {

      target = dmz.object.position(current);
      pos = dmz.object.position(hil);
      ori = dmz.object.orientation(hil);

      if (target && pos && ori) {

         startPos = dmz.object.position(hil, BreadCrumbAttr);
         distance = dmz.object.scalar(hil, BreadCrumbAttr);

         if (!distance) { distance = 0; }
         if (!startPos) { startPos = dmz.vector.create(); }

         dir = target.subtract(pos).normalize();

         ori = newOri(time, ori, dir);

         vel = ori.transform(dmz.vector.Forward).multiplyConst(Speed);

         pos = pos.add(vel.multiplyConst(time));

         if (pos.subtract(startPos).magnitude() > distance) {

self.log.error("Reached target");
            links = dmz.object.subLinks(current, "Bread_Crumb_Attribute");

            if (links) { current = links[0]; }

            if (!links) { current = start; }

            updateDistance();
         }

         dmz.object.position(hil, null, pos);
         dmz.object.orientation(hil, null, ori);
         dmz.object.velocity(hil, null, vel);
      }
   }
};

dmz.object.flag.observe(self, "Bread_Crumb_Attribute", function (obj, attr, value) {

   if (value) { start = obj; }
});


dmz.input.channel.observe(self, "bread-crumb-follow", function (channel, state) {

   if (state) { dmz.time.setRepeatingTimer(self, timeSlice); self.log.error ("Start"); }
   else { dmz.time.cancleTimer(self, timeSlice); self.log.error ("Stop"); }
});
