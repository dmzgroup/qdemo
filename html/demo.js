(function () {

var log
  , setupUi
  , onload
  , writeText
  , clearCanvas
  , processReports
  , processVehicles
  , processShip
  , processPlumes
  , render
  , tick
  , timeout
  , map = new Image()
  , ship = new Image()
  , police = new Image()
  , fire = new Image()
  , Scale = 0.381621621621622
  , XOffset = 1902
  , YOffset = 1246
  , imagesLoading = 4
  , showPlume = true
  , showReports = true
  , showVehicles = true
  , data
  , uiList = {}
  , ui = {}
  ;

log = function (value) {

   if (window && window.console && window.console.log) {

      window.console.log(value);
   }
};


uiList.plume = { onclick: function () { showPlume = ui.plume.checked; render(); } };
uiList.reports = { onclick: function () { showReports = ui.reports.checked; render(); } };
uiList.vehicles = { onclick: function () { showVehicles = ui.vehicles.checked; render(); } };

setupUi = function () {

   var keys = Object.keys(uiList)
     ;

   keys.forEach(function(key) {

      var element = document.getElementById(key)
        , init
        , list
        ;

      if (element) {

         init = uiList[key];
         ui[key] = element;
         delete uiList[key];

         list = Object.keys(init);

         list.forEach(function(value) { element[value] = init[value]; });
      }
   });

   keys = Object.keys(uiList);

   log("Trying to setup ui");

   if (keys.length > 0) { setTimeout(setupUi, 1000); }
};

setupUi();

map.src = "map.png";
ship.src = "ship.png";
police.src = "police.png";
fire.src = "fire.png";

onload = function () { imagesLoading--; }

map.onload = onload;
ship.onload = onload;
police.onload = onload;
fire.onload = onload;

writeText = function (str) {

   var canvas = document.getElementById("view")
     ;

   if (canvas) {

      context = canvas.getContext("2d");

log("Writing text: " + str);
      if (context) {

         context.clearRect(0, 0, canvas.width, canvas.height);

         context.save();
         context.textBaseline = "middle";
         context.textAlign = "center";
         context.fillStyle = "black";
         context.fillText(str, canvas.width * 0.5, canvas.height * 0.5);
         context.restore();
      }
   }
};


clearCanvas = function() {

   var canvas = document.getElementById("view")
     , context
     ;

   if ((imagesLoading === 0) && canvas) {

      context = canvas.getContext("2d");

      if (context) {

         context.clearRect(0, 0, canvas.width, canvas.height);

         context.save();
         context.moveTo(0, 0);
         context.drawImage(map, 0, 0);
         context.restore();
      }
   }
};


processReports = function (reports) {

   var canvas = document.getElementById("view")
     , keys = Object.keys(reports)
     , context
     ;

   if ((imagesLoading === 0) && canvas) {

      context = canvas.getContext("2d");

      if (context) {

         keys.forEach(function (key) {

            var obj = reports[key]
              , x
              , z
              , lineWidth = context.lineWidth
              ;

            if (obj.position) {

               context.save();

               context.beginPath();
               x = Math.floor((obj.position.x + XOffset) * Scale);
               z = Math.floor(canvas.height + ((obj.position.z - YOffset) * Scale));
               context.moveTo(x, z);
               context.fillStyle = "black";
               context.arc(x, z, 6, 0, Math.PI * 2, true);
               context.fill();

               context.beginPath();
               if (obj.state === "r") { context.fillStyle = "red"; }
               else if (obj.state === "y") { context.fillStyle = "yellow"; }
               else { context.fillStyle = "blue"; }

               context.arc(x, z, 5, 0, Math.PI * 2, true);
               context.fill();

               context.beginPath();
               context.textBaseline = "middle";
               context.moveTo (x + 10, z);
               context.lineWidth = lineWidth + 2;
               context.strokeStyle = "white";
               context.strokeText(obj.text, x + 10, z);
               context.moveTo (x + 10, z);
               context.lineWidth = lineWidth;
               context.fillStyle = "black";
               context.fillText(obj.text, x + 10, z);

               context.restore();
            }
         });
      }
   }
};


processVehicles = function (vehicles) {

   var canvas = document.getElementById("view")
     , keys = Object.keys(vehicles)
     , context
     ;

   if ((imagesLoading === 0) && canvas) {

      context = canvas.getContext("2d");

      if (context) {

         keys.forEach(function (key) {

            var obj = vehicles[key]
              , x
              , z
              , lineWidth = context.lineWidth
              ;

            if (obj.position) {

               context.save();

               context.beginPath();
               x = Math.floor((obj.position.x + XOffset) * Scale);
               z = Math.floor(canvas.height + ((obj.position.z - YOffset) * Scale));
               context.moveTo(x, z);
               if (obj.type === 1) { context.drawImage(fire, x - 10, z - 10); }
               else { context.drawImage(police, x - 10, z - 10); }

               context.restore();
            }
         });
      }
   }
};

processShip = function (obj) {

   var canvas = document.getElementById("view")
     , context
     , x
     , z
     ;

   if (canvas) { context = canvas.getContext("2d"); }

   if ((imagesLoading === 0) && context && obj.position) {

      x = Math.floor((obj.position.x + XOffset) * Scale);
      z = Math.floor(canvas.height + ((obj.position.z - YOffset) * Scale));

      if (obj.radius) {

         if (showPlume) {

            context.save();
            context.beginPath();
            context.fillStyle = "red";
            context.globalAlpha = "0.2";
            context.arc(x, z, obj.radius * Scale * 0.5, 0, Math.PI * 2, true);
            context.fill();
            context.arc(x, z, obj.radius * Scale, 0, Math.PI * 2, true);
            context.fill();
            context.restore();
         }

         context.save();
         context.beginPath();

         context.fillStyle = "black";

         context.fillText(
            "Plume Radius: " + obj.radius.toFixed() + "m",
            2,
            canvas.height - 2);

         context.restore();
      }

      context.save();
      context.translate(x, z);
      context.drawImage(ship, -5, -17);
      context.restore();
   }
};


processPlumes = function (plumes) {

   var canvas = document.getElementById("view")
     , keys = Object.keys(plumes)
     , context
     ;

   if ((imagesLoading === 0) && canvas) {

      context = canvas.getContext("2d");

      if (context) {

         keys.forEach(function (key) {

            var obj = plumes[key]
              , x
              , z
              ;

            if (obj.position) {

               x = Math.floor((obj.position.x + XOffset) * Scale);
               z = Math.floor(canvas.height + ((obj.position.z - YOffset) * Scale));

               context.save();

               context.save();
               context.beginPath();
               context.fillStyle = "red";
               context.globalAlpha = 0.1 + (0.1 * (obj.radius / 300));
               context.arc(x, z, obj.radius * Scale, 0, Math.PI * 2, true);
               context.fill();

               context.restore();
            }
         });
      }
   }
};

render = function () {

   clearCanvas();

   if (imagesLoading > 0) { writeText ("Now Loading..."); }

   if (data) {

      if (showVehicles && data.vehicles) { processVehicles(data.vehicles); }
      if (showReports && data.reports) { processReports(data.reports); }
      if (data.ship) { processShip(data.ship); }
      if (showPlume && data.plumes) { processPlumes(data.plumes); }
   }
};


tick = function () {

   var req = new XMLHttpRequest()
     , canvas
     , context
     , uniqueStr
     ;

   // Require so that IE will actually fetch a new document and not just read it from
   // the cache -rb

   try {

      uniqueStr = (new Date()).getTime().toString();

      req.open("GET", "http://localhost:5984/demo/data", false);
//      req.open("GET", "/demo/data?" + uniqueStr, false);
      req.send();
   }
   catch (e) {

      writeText("Attempting to connect to server. " + e);
      log("Caught: " + e);
   }

   if (req.responseText) {

      data = JSON.parse(req.responseText);

      render();
   }

   timeout = setTimeout(tick, 2000);
};


tick();

})();
