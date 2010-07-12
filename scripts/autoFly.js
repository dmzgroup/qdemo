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
  , Speed = 50
  , BreadCrumbAttr = dmz.defs.createNamedHandle("Bread_Crumb_Attribute")
  // Functions
  , updateDistance
  , newHeading
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


newHeading = function (time, ori, dir) {

   var MaxTurn = time * Math.PI * 0.5
     , cdir = ori.transform(dmz.vector.Forward)
     , tdir = dir.copy()
     , result
     , angle = 0
     ;

   if (time > 1) { time = 1; }

   cdir.y = 0;
   cdir = cdir.normalize();
   tdir.y = 0;
   tdir = tdir.normalize();

   if (!cdir.isZero() && !tdir.isZero()) {

      angle = cdir.getSignedAngle(tdir) * time;

      result = dmz.matrix.create();
      result.fromAxisAndAngle(dmz.vector.Up, angle);
      result = result.multiply(ori);
   }
   else { result = ori; }

   return result;
}


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
         ori = newHeading(time, ori, dir);
         vel = dir.multiply(Speed);

         pos = pos.add(vel.multiplyConst(time));

         if (pos.subtract(startPos).magnitude() > distance) {

            //self.log.error("Reached target");
            links = dmz.object.subLinks(current, "Bread_Crumb_Attribute");

            if (links) { current = links[0]; }
            else { current = start; }

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

   if (state) {

      dmz.object.orientation(dmz.object.hil(), null, dmz.matrix.create());
      dmz.time.setRepeatingTimer(self, timeSlice);
     // self.log.error ("Start");
   }
   else {

      dmz.time.cancleTimer(self, timeSlice);
      // self.log.error ("Stop");
   }
});
