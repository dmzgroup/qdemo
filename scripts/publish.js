var dmz =
       { object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , http: require("dmz/components/http")
       , time: require("dmz/runtime/time")
       , vector: require("dmz/types/vector")
       , matrix: require("dmz/types/matrix")
       , defs: require("dmz/runtime/definitions")
       , util: require("dmz/types/util")
       }
  , inUpload = false
  , revInt = 0
  , plumes = {}
  , reports = {}
  , vehicles = {}
  , outData = { _id: "data", reports: reports, vehicles: vehicles, plumes: plumes, ship: {} }
  , publish = false
//  Constants
  , DataFile = "http://localhost:5984/demo/data"
  , PlumeType = dmz.objectType.lookup("plume")
  , ReportType = dmz.objectType.lookup("field-report")
  , ShipType = dmz.objectType.lookup("cargo-ship")
  , FireTruckType = dmz.objectType.lookup("firetruck")
  , PoliceCarType = dmz.objectType.lookup("policecar")
  , YellowState = dmz.defs.lookupState("Yellow")
  , RedState = dmz.defs.lookupState("Red")
  , PlumeRadiusAttr = dmz.defs.createNamedHandle("plume-radius")
//  Functions 
  , getRevInt
  , timer
  ;

getRevInt = function (rev) {

   var result = 0
     ;

   if (rev) { result = parseInt(rev.split("-")[0]); }

   return result;
};


timer = function (time) {

   var keys = Object.keys(reports)
     , out
     ;

   if (publish && !inUpload) {

      out = JSON.stringify(outData);

      inUpload = true;

      dmz.http.upload(self, DataFile, out, function(value, addr, error) {

         var crev
           , data = JSON.parse(value)
           ;

         if (data.ok === true) { self.log.info(value); }
         else { self.log.error(value); }

         if (data.rev) {

            crev = getRevInt(data.rev);

            if (crev > revInt) {

               outData._rev = data.rev;
               revInt = crev;
            }
         }
         else { self.log.error(data.error, data.reason); }

         inUpload = false;
      });

      publish = false;
   }
};


dmz.http.download(self, DataFile, function(value, error) {

   var data
     ;

   if (value) {

      data = JSON.parse(value);

      if (data.error && (data.error === "not_found")) {

         inUpload = true;
         dmz.http.upload(self, DataFile, "{}", function(value, addr, error) {

            var data
              ;

            if (value) {

               data = JSON.parse(value);

               if (data.rev) {

                  outData._rev = data.rev
                  revInt = getRevInt(data.rev);
                  dmz.time.setRepeatingTimer(self, 2, timer);
               }
            }

            inUpload = false;
         });
      }
      else if (data._rev) {

         outData._rev = data._rev
         revInt = getRevInt(data._rev);
         dmz.time.setRepeatingTimer(self, 2, timer);
      }
   }
});


self.shutdown = function () {

  // Reset the text overlays to their original values.
};


dmz.object.create.observe(self, function (handle, type) {

   var obj
     ;

   if (type.isOfType(PlumeType)) {

      obj =
         { position: dmz.object.position(handle)
         , radius: dmz.object.scalar(handle, PlumeRadiusAttr)
         };

      plumes[handle] = obj;
      publish = true;
   }
   else if (type.isOfType(ReportType)) {

      obj = {};

      obj.position = dmz.object.position(handle);
      obj.text = dmz.object.text(handle, "field-report-text");

      reports[handle] = obj;
      publish = true;
   }
   else if (type.isOfType(FireTruckType)) {

      obj = { type: 1 };
      obj.position = dmz.object.position(handle);
      vehicles[handle] = obj;
   }
   else if (type.isOfType(PoliceCarType)) {

      obj = { type: 2 };
      obj.position = dmz.object.position(handle);
      vehicles[handle] = obj;
   }
   else if (type.isOfType(ShipType)) {

      outData.ship.handle = handle;
      outData.ship.position = dmz.object.position(handle);
      publish = true;
   }
});


dmz.object.destroy.observe(self, function (handle) {

   if (plumes[handle]) { delete plumes[handle]; publish = true; }
   else if (reports[handle]) { delete reports[handle]; publish = true; }
   else if (vehicles[handle]) { delete vehicles[handle]; publish = true; }
   else if (outData.ship.handle === handle) {

      outData.ship = {};
      publish = true;
   }
   else if (outData.ship.plumeHandle === handle) {

      outData.ship.plumeHandle = undefined;
      outData.ship.radius = 1;
   }
});


dmz.object.position.observe(self, function (handle, attr, value) {

   if (plumes[handle]) { plumes[handle].position = value; publish = true; }
   else if (reports[handle]) { reports[handle].position = value; publish = true; }
   else if (vehicles[handle]) { vehicles[handle].position = value; publish = true; }
   else if (outData.ship.handle === handle) {

      outData.ship.position = value;
      publish = true;
   }
});


dmz.object.state.observe(self, function (handle, attr, value) {

   var obj = reports[handle]
     ;

   if (obj && value) {

      if (value.and(YellowState).bool()) { obj.state = "y"; }
      else if (value.and(RedState).bool()) { obj.state = "r"; }
      else { obj.state = "b"; }

      publish = true;
   }
});


dmz.object.scalar.observe(self, PlumeRadiusAttr, function(handle, attr, value) {

   if (plumes[handle]) {

      plumes[handle].radius = value;
      publish = true;
   }
});


dmz.object.text.observe(self, "field-report-text", function (handle, attr, value) {

   var obj = reports[handle]
     ;

   if (obj) { obj.text = value; publish = true; }
   else { self.log.error("Got text:", value, "for unmapped object:", handle); }
});

