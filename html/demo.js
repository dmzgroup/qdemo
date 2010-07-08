(function () {

var processReports
  , tick
  , timeout
  , map = new Image()
  , Scale = 0.381621621621622
//  , Scale = 2.616621983914209
  ;

map.src = "map.png";

processReports = function (reports) {

   var canvas = document.getElementById("view")
     , keys = Object.keys(reports)
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

         keys.forEach(function (key) {

            var obj = reports[key]
              , x
              , z
              , lineWidth = context.lineWidth
              ;

            if (obj.position) {

               context.save();

               context.beginPath();
               x = Math.floor((obj.position.x + 1902) * Scale);
               z = Math.floor(600 + ((obj.position.z - 1246) * Scale));
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


tick = function () {

   var req = new XMLHttpRequest()
     , reports
     , canvas
     , context
     ;

   try {

      req.open("GET", "http://localhost:5984/demo/data", false);
//      req.open("GET", "/demo/data", false);
      req.send();
   }
   catch (e) {

      canvas = document.getElementById("view");

      if (canvas) {

         context = canvas.getContext("2d");

         if (context) {

            context.clearRect(0, 0, canvas.width, canvas.height);

            context.save();
            //context.moveTo(canvas.width * 0.5, canvas.height * 0.5);
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.fillStyle = "black";
            context.fillText(
               "Attempting to connect to server.",
               canvas.width * 0.5,
               canvas.height * 0.5);
            context.restore();
         }
      }
   }

   if (req.responseText) {

//      window.console.log(req.responseText);

      reports = JSON.parse(req.responseText);

      processReports(reports);
   }

   timeout = setTimeout(tick, 2000);
};


timeout = setTimeout(tick, 0);

})();
