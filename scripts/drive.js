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
  , clampCount = 0
  , currentClamp = 0
  // Constants
  , Speed = 20
  , PathAttr = dmz.defs.createNamedHandle("Object_Path_Link_Attribute")
  , AssignAttr = dmz.defs.createNamedHandle("Object_Assign_Link_Attribute")
  , StartStateAttr = dmz.defs.createNamedHandle("Object_Start_State_Attribute")
  , CurrentNodeAttr = dmz.defs.createNamedHandle("Object_Current_Node_Attribute")
  , SirenState = dmz.defs.lookupState("Siren")
  // Functions
  , randomTime
  , startNode
  , nextNode
  , targetPosition
  , clamp
  , newHeading
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

randomTime = function () {

   return Math.random() * 15 + 15;
};


startNode = function (obj) {

   var result = dmz.object.subLinks(obj.handle, AssignAttr)
     ;

   if (result) {

      dmz.object.unlinkSubObjects(obj.handle, CurrentNodeAttr);
      dmz.object.link(CurrentNodeAttr, obj.handle, result[0]);
   }

   return result;
};


nextNode = function (obj) {

   var path = dmz.object.subLinks(obj.handle, CurrentNodeAttr)
     ;

   if (!path) { startNode(obj); }
   else {

      path = dmz.object.subLinks(path[0], PathAttr);

      if (path) {

         path = path[dmz.util.randomInt(path.length - 1)];

         dmz.object.unlinkSubObjects(obj.handle, CurrentNodeAttr);
         dmz.object.link(CurrentNodeAttr, obj.handle, path);
      }
      else { startNode(obj); }
   }
};


targetPosition = function (obj) {

   var nodes = dmz.object.subLinks(obj.handle, CurrentNodeAttr)
     , handle
     , result
     ;

   if (!nodes) { nodes = startNode(obj); }

   if (nodes) { result = dmz.object.position(nodes[0]); }

   if (!result) {

      self.log.error("No target position found for object:", obj.handle);
      result = dmz.vector.create();
   }

   return result;
};


clamp = function (obj, pos, ori) {

   var result = {}
     , start = pos.copy()
     , value
     ;

   if (obj.clampId === currentClamp) {

      start.y += 5;

      dmz.isect.disable(obj.handle);

      value = dmz.isect.doIsect({ start: start, end: dmz.vector.Up.multiply(-10).add(pos) });

      if (!value) {

         start.y -= 6;
//      value = dmz.isect.doIsect({ start: start, direction: dmz.vector.Up });
      }

      dmz.isect.enable(obj.handle);

      if (value) {

         result.pos = value[0].point;

         result.ori = dmz.matrix.create().fromTwoVectors(
            dmz.vector.Up,
            value[0].normal).multiply(ori);
      }
      else { result.pos = pos; result.ori = ori; }
   }
   else { result.pos = pos; result.ori = ori; }

   return result;
};


newHeading = function (time, dir, ori) {

   var cdir = ori.transform(dmz.vector.Forward)
     , tdir = dir.copy()
     , angle
     , sign = 1
     , result
     ;

   cdir.y = 0;
   cdir = cdir.normalize();

   tdir.y = 0;
   tdir = tdir.normalize();

   if (!cdir.isZero() && !tdir.isZero()) {

      angle = cdir.getSignedAngle(tdir);

      if (angle < 0) { sign = -1; angle = -angle; }

      if (angle > (time * Math.PI)) { angle = time * Math.PI; }

      angle = (angle * sign) + dmz.vector.Forward.getSignedAngle(cdir);

      result = dmz.matrix.create().fromAxisAndAngle(dmz.vector.Up, angle);
   }
   else { result = ori; }

   return result;
};


updateSiren = function (time, obj) {

   dmz.object.state(obj.handle, null, SirenState);
/*
   if (dmz.util.isDefined(obj.startSiren)) {

      obj.startSiren -= time;

      if (obj.startSiren <= 0) {

         obj.startSiren = undefined;
         obj.stopSiren = randomTime();

         dmz.object.state(obj.handle, null, SirenState);
      }
   }
   if (dmz.util.isDefined(obj.stopSiren)) {

      obj.stopSiren -= time;

      if (obj.stopSiren <= 0) {

         obj.stopSiren = undefined;
         obj.startSiren = randomTime();

         dmz.object.state(obj.handle, null, "");
      }
   }
*/
};


move = function (time, obj) {

   var pos = dmz.object.position(obj.handle)
     , origPos = pos.copy()
     , ori = dmz.object.orientation(obj.handle)
     , vel = dmz.object.velocity(obj.handle)
     , target = targetPosition(obj)
     , speed
     , dir
     , normal
     , mat
     , view
     ;

   if (!pos) { pos = dmz.vector.create(); }
   if (!ori) { ori = dmz.matrix.create(); }

   dir = target.subtract(pos);

   ori = newHeading(time, dir, ori);

   vel = ori.transform(dmz.vector.Forward).multiply(Speed);
   pos = pos.add(vel.multiply(time));
   if (pos.subtract(target).magnitude() < obj.wheelLength) { nextNode(obj); }

   view = clamp (obj, pos, ori);

   updateSiren(time, obj);

   dmz.object.position(obj.handle, null, view.pos);
   dmz.object.velocity(obj.handle, null, vel);
   dmz.object.orientation(obj.handle, null, view.ori);
};


dmz.time.setRepeatingTimer(self, function (time) {

   var keys = Object.keys(list)
     ;

   if (time > 0) { keys.forEach(function (key) { move(time, list[key]); }); }

   currentClamp++;
   if (currentClamp >= clampCount) { currentClamp = 0; }
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
   obj.clampId = clampCount;
   clampCount++;

   //self.log.error(JSON.stringify(obj));

   list[super] = obj;
});


dmz.object.unlink.observe(self, AssignAttr, function (link, attr, super, sub) {

   var obj = list[super]
     ;

   if (obj && (obj.startNode === sub)) { delete list[super]; }
});
