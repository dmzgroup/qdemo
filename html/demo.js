(function () {

var clearCanvas
  , processReports
  , processShip
  , tick
  , timeout
  , map = new Image()
  , ship = new Image()
  , Scale = 0.381621621621622
  , XOffset = 1902
  , YOffset = 1246
  , prevRadius = 0
//  , Scale = 2.616621983914209
  ;

map.src = "map.png";
ship.src = "ship.png";

clearCanvas = function() {

   var canvas = document.getElementById("view")
     , context
     ;

   if (canvas) {

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

   if (canvas) {

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
               context.arc(x, z, 6, 0, Math.PI * 2);
               context.fill();

               context.beginPath();
               if (obj.state === "r") { context.fillStyle = "red"; }
               else if (obj.state === "y") { context.fillStyle = "yellow"; }
               else { context.fillStyle = "blue"; }

               context.arc(x, z, 5, 0, Math.PI * 2);

               context.fill();

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


processShip = function (obj) {

   var canvas = document.getElementById("view")
     , context
     , x
     , z
     ;

   if (canvas) { context = canvas.getContext("2d"); }

   if (context && obj.position) {


      x = Math.floor((obj.position.x + XOffset) * Scale);
      z = Math.floor(canvas.height + ((obj.position.z - YOffset) * Scale));

      if (obj.radius) {

         context.save();
         context.beginPath();
         context.fillStyle = "red";
         context.globalAlpha = "0.2";
         context.arc(x, z, obj.radius * Scale * 0.5, 0, Math.PI * 2);
         context.fill();
         context.arc(x, z, obj.radius * Scale, 0, Math.PI * 2);
         context.fill();
         context.restore();

         context.save();
         context.fillStyle = "black";
         context.fillText("Plume Radius: " + obj.radius.toFixed(), 2, canvas.height - 2);
         context.restore();
      }

      context.save();
      context.translate(x, z);
      context.drawImage(ship, -5, -17);
      context.restore();
   }
};


tick = function () {

   var req = new XMLHttpRequest()
     , data
     , canvas
     , context
     ;

   try {

//      req.open("GET", "http://127.0.0.1:5984/demo/data", false);
      req.open("GET", "/demo/data", false);
      req.send();
   }
   catch (e) {

      canvas = document.getElementById("view");

      if (canvas) {

         context = canvas.getContext("2d");

         if (context) {

            context.clearRect(0, 0, canvas.width, canvas.height);

            context.save();
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.fillStyle = "black";
            context.fillText(
               "Attempting to connect to server. " + e,
               canvas.width * 0.5,
               canvas.height * 0.5);
            context.restore();
         }
      }
   }

   if (req.responseText) {

//      window.console.log(req.responseText);

      data = JSON.parse(req.responseText);

      clearCanvas();
      if (data.reports) { processReports(data.reports); }
      if (data.ship) { processShip(data.ship); }
   }

   timeout = setTimeout(tick, 2000);
};


timeout = setTimeout(tick, 0);

})();
