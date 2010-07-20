window.onload = function () {

var log
  , setupUi
  , onload
  , writeText
  , clearCanvas
  , processReports
  , processVehicles
  , processShip
  , render
  , tick
  , timeout
  , bg
  , map
  , ship
  , police
  , fire
  , Scale = 0.381621621621622
  , XOffset = 1902
  , YOffset = 1246
  , showPlume = true
  , showReports = true
  , showVehicles = true
  , data
  , uiList = {}
  , ui = {}
  , paper
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

var photo = document.getElementById("photo")
photo.style.display = "none";

map = photo.src;
ship = "ship.png";
police = "police.png";
fire = "fire.png";

paper = Raphael("holder", 799, 600);

writeText = function (str) {

   paper.clear ();
   
   var msg = paper.text (paper.width * 0.5, paper.height * 0.5, str);
   log("Writing text: " + str);
};


clearCanvas = function() {

   paper.clear ();
   bg = paper.image(map, 0, 0, paper.width, paper.height);
};


processReports = function (reports) {

   var keys = Object.keys(reports)
     ;

   keys.forEach(function (key) {

      var obj = reports[key]
        , x
        , z
        , c
        , r = 6
        , dot
        ;

      if (obj.position) {

         x = Math.floor((obj.position.x + XOffset) * Scale);
         z = Math.floor(paper.height + ((obj.position.z - YOffset) * Scale));
         
         if (obj.state === "r") { c = "red"; }
         else if (obj.state === "y") { c = "yellow"; }
         else { c = "blue"; }

         dot = paper.circle(x, z, r).attr ({
             "fill": c
           , "stroke": "black"
           , "stroke-width": 2   
         });
         
         dot.x = x;
         dot.z = z;
         dot.r = r;
         dot.text = obj.text;
         
         dot.hover(function () {
             this.tag = this.tag || paper.g.tag(this.x, this.z, this.text, 0, this.r);
             this.tag.show();
         }, function () {
             this.tag && this.tag.hide();
         });
           
         // tag = paper.g.flag(x + radius, z, obj.text, 0).attr({opacity: 0.75});
         
         // label = paper.text(x, z - 5, obj.text).attr({
         //      "stroke": "white"
         //    , "stroke-width": 2   
         // });
         // 
         // label = paper.text(x, z - 5, obj.text).attr({
         //    "fill": "black"
         // });
      }
   });
};


processVehicles = function (vehicles) {

   var keys = Object.keys(vehicles)
     ;

   keys.forEach(function (key) {

      var obj = vehicles[key]
        , x
        , z
        ;

      if (obj.position) {

         x = Math.floor((obj.position.x + XOffset) * Scale);
         z = Math.floor(paper.height + ((obj.position.z - YOffset) * Scale));

         if (obj.type === 1) { paper.image(fire, x - 10, z - 10, 20, 20); }
         else { paper.image(police, x - 10, z - 10, 20, 20); }
      }
   });
};


processShip = function (obj) {

   var plume
     , x
     , z
     , st
     , info
     ;

   if (obj.position) {

      x = Math.floor((obj.position.x + XOffset) * Scale);
      z = Math.floor(paper.height + ((obj.position.z - YOffset) * Scale));

      if (obj.radius) {

         if (showPlume) {

            st = paper.set();

            st.push(
               paper.circle (x, z, obj.radius * Scale * 0.5),
               paper.circle (x, z, obj.radius * Scale)
            );
            
            st.attr({
               fill: "red",
               opacity: 0.2,
            });
         }

         info = paper.text(
            56, 
            paper.height - 6,
            "Plume Radius: " + obj.radius.toFixed() + "m").attr({fill: "black"});
      }

      paper.image(ship, x - 5, z - 17, 10, 37);
   }
};


render = function () {

   clearCanvas();

   if (data) {

      if (showVehicles && data.vehicles) { processVehicles(data.vehicles); }
      if (data.ship) { processShip(data.ship); }
      if (showReports && data.reports) { processReports(data.reports); }
   }
};


tick = function () {

   var req = new XMLHttpRequest()
     , uniqueStr
     ;

   // Require so that IE will actually fetch a new document and not just read it from
   // the cache -rb

   try {

      uniqueStr = (new Date()).getTime().toString();

      // req.open("GET", "http://localhost:5984/demo/data", false);
      req.open("GET", "/demo/data?" + uniqueStr, false);
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

/*
   data = {};
   
   data.vehicles = [
       { position: { x: -200, z: 20 }, type: 1 }
     , { position: { x: -330, z: 30 }, type: 2 }
   ];

   data.reports = [
       { position: { x: -200, z: 220 }, state: "r", text: "red text" }
     , { position: { x: -330, z: 330 }, state: "y", text: "yellow text" }
     , { position: { x: -330, z: 430 }, state: "b", text: "blue text" }
   ];
   
   data.ship = {
      position: { x: 10, z: 10 },
      radius: 500
   };
   
   render ();
*/
   
  timeout = setTimeout(tick, 2000);
};

tick();

};
