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
  , Speed = 20
  , Acceleration = 2
  , PathAttr = dmz.defs.createNamedHandle("Object_Path_Link_Attribute")
  , AssignAttr = dmz.defs.createNamedHandle("Object_Assign_Link_Attribute")
  , StartStateAttr = dmz.defs.createNamedHandle("Object_Start_State_Attribute")
  , CurrentNodeAttr = dmz.defs.createNamedHandle("Object_Current_Node_Attribute")
  , SirenState = dmz.defs.lookupState("Siren")
  // Functions
  , normalizeAngle
  , randomTime
  , getNextPosition
  , startNode
  , nextNode
  , updateSiren
  , move
  ;


self.shutdown = function () {

   var keys = Object.keys(list)
     ;

   keys.forEach(function (key) {

      var handle = list[key].handle
        ;

      dmz.object.position(handle, null, dmz.object.position(handle, StartStateAttr));
      dmz.object.orientation(
         handle,
         null,
         dmz.object.orientation(handle, StartStateAttr));
      dmz.object.unlinkSubObjects(handle, CurrentNodeAttr);
   });
}


normalizeAngle = function (angle) {

   var result = angle
     , sign = 1
     ;

   if (result < 0) { result = -result; sign = -1; }

   if (result > Math.PI) { result = -((Math.PI * 2) - result); }

   return result * sign;
};


randomTime = function () {

   return Math.random() * 15 + 15;
};


getNextPosition = function (handle, obj) {

   var result
     , subs = dmz.object.subLinks(handle, PathAttr)
     ;

   if (!subs) {

      subs = dmz.object.subLinks(obj.handle, AssignAttr)
   }

   if (subs) { result = { handle: subs[0], pos: dmz.object.position(subs[0]) }; }

   return result;
};


startNode = function (obj) {

   var result = dmz.object.subLinks(obj.handle, AssignAttr)
     ;

   if (result) {

      dmz.object.unlinkSubObjects(obj.handle, CurrentNodeAttr);
      dmz.object.link(CurrentNodeAttr, obj.handle, result[0]);

      obj.target.prev = { pos: dmz.object.position(obj.handle) };
      obj.target.current = { handle: result[0], pos: dmz.object.position(result[0]) };
      obj.target.next = getNextPosition(result[0], obj);
   }

   return result;
};


nextNode = function (obj) {

   var path = dmz.object.subLinks(obj.handle, CurrentNodeAttr)
     ;

   if (!path) { startNode(obj); }
   else {

      dmz.object.unlinkSubObjects(obj.handle, CurrentNodeAttr);
      dmz.object.link(CurrentNodeAttr, obj.handle, obj.target.current.handle);

      obj.target.prev = obj.target.current;
      obj.target.current = obj.target.next;
      obj.target.next = getNextPosition(obj.target.current.handle, obj);
   }
};


updateSiren = function (time, obj) {

   dmz.object.state(obj.handle, null, SirenState);
};


move = function (time, obj) {

   var v1
     , v2
     , v3
     , v4
     , angle
     , length
     , distance
     , scale
     , mat
     , currentHPR
     , nextHPR
     , hd
     , pd
     ;

   obj.pos = dmz.object.position(obj.handle);

   if (!obj.pos) { obj.pos = dmz.vector.create(); }

   v1 = obj.target.current.pos.subtract(obj.target.prev.pos);

   if (obj.pos.subtract(obj.target.prev.pos).magnitudeSquared() >=
         v1.magnitudeSquared()) {

      nextNode(obj);
   }

   v1 = obj.target.current.pos.subtract(obj.target.prev.pos);

   length = v1.magnitude();

   distance = obj.pos.subtract(obj.target.prev.pos).magnitude();

   obj.ori = dmz.matrix.create().fromVector(v1);

   if ((length - distance) <= obj.wheelLength) {

      scale = (obj.wheelLength - (length - distance)) / obj.wheelLength;

      v2 = obj.target.next.pos.subtract(obj.target.current.pos);

      mat = dmz.matrix.create().fromVector(v2);

      currentHPR = obj.ori.toEuler();
      nextHPR = mat.toEuler();

      hd = normalizeAngle(nextHPR[0] - currentHPR[0]);
      pd = normalizeAngle(nextHPR[1] - currentHPR[1]);

      currentHPR[0] += hd * scale;
      currentHPR[1] += pd * scale;

      obj.ori.fromEuler(currentHPR);
   }

   if ((length - distance) <= (obj.wheelLength * 3)) {

      scale = 1 - ((length - distance) / (obj.wheelLength * 3));
      v3 = obj.target.next.pos.subtract(obj.target.current.pos);
      v4 = obj.target.prev.pos.subtract(obj.target.current.pos);

      angle = v3.getAngle(v4);

      if (angle < (Math.PI * 0.75)) {

         obj.speedMod = (1 - (angle / (Math.PI * 0.75))) * 15 * scale;
      }
      else { obj.speedMod = 0; }
   }
   else if (obj.speedMod > 0) {

      obj.speedMod -= Acceleration * time;
      if (obj.speedMod < 0) { obj.speedMod = 0; }
   }

   obj.vel = v1.normalize().multiply(Speed - obj.speedMod);

   obj.pos = obj.pos.add(obj.vel.multiply(time));

   updateSiren(time, obj);

   dmz.object.position(obj.handle, null, obj.pos);
   dmz.object.velocity(obj.handle, null, obj.vel);
   dmz.object.orientation(obj.handle, null, obj.ori);
};


dmz.time.setRepeatingTimer(self, function (time) {

   var keys = Object.keys(list)
     ;

   if (time > (0.066666666666667)) { time = 0.066666666666667; }

   if (time > 0) { keys.forEach(function (key) { move(time, list[key]); }); }
});


dmz.object.link.observe(self, AssignAttr, function (link, attr, super, sub) {

   var obj = {}
     ;

   obj.handle = super;
   obj.startNode = sub;
   dmz.object.position(super, StartStateAttr, dmz.object.position(super));
   dmz.object.orientation(super, StartStateAttr, dmz.object.orientation(super));
   obj.wheelLength = dmz.object.type(super).config().number("wheels.length", 5);
   obj.width = dmz.object.type(super).config().number("wheels.width", 5);
   obj.startSiren = randomTime();
   obj.speedMod = Speed;
   obj.target = {};

   startNode(obj);

   //self.log.error(JSON.stringify(obj));

   list[super] = obj;
});


dmz.object.unlink.observe(self, AssignAttr, function (link, attr, super, sub) {

   var obj = list[super]
     ;

   if (obj && (obj.startNode === sub)) { delete list[super]; }
});
