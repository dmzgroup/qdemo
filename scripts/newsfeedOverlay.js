var dmz =
       { object: require("dmz/components/object")
       , overlay: require("dmz/components/overlay")
       , portal: require("dmz/components/portal")
       , input: require("dmz/components/input")
       , time: require("dmz/runtime/time")
       , vector: require("dmz/types/vector")
       , matrix: require("dmz/types/matrix")
       , message: require("dmz/runtime/messaging")
       , defs: require("dmz/runtime/definitions")
       , data: require("dmz/runtime/data")
       , util: require("dmz/types/util")
       }
  , root = dmz.overlay.lookup("ticker group")
  , startImage = dmz.overlay.lookup("start image")
  , caption = dmz.overlay.lookup("breaking text")
  , ticker = [{}, {}, {}]
  , timeTicker = {}
  , screen = { x: 0, y: 0 }
  , timeCounter = 0
  , tickerText
  , currentTickerText
  , currentTicker = 0
//  Constants
  , SizeHandle = dmz.defs.createNamedHandle("DMZ_Render_Portal_Resize_Portal_Size")
//  Functions 
  , setupTicker
  , setupTimeTicker
  , moveTicker
  , updateTickerPlace
  ;

setupTicker = function (ticker, text, offset) {

   if (ticker.top) { dmz.overlay.destroy(ticker.top); ticker.top = undefined; }
   ticker.top = dmz.overlay.instance("news ticker");
   ticker.toggle = ticker.top.lookup("switch");
   ticker.toggle.setSwitchStateAll(true);
   ticker.transform = ticker.top.lookup("transform");
   ticker.pos = ticker.transform.position();
   ticker.pos[0] = offset;
   ticker.transform.position(ticker.pos[0], ticker.pos[1]);
   ticker.text = ticker.top.lookup("text");
   ticker.text.text (text);
   ticker.length = ticker.text.size().length + 15;
   root.add(ticker.top);
};

setupTimeTicker = function (time, offset) {

   var date = new Date
     , hours = date.getHours()
     , min = date.getMinutes()
     , suffix = "AM"
     , text
     ;

   if (hours > 12) { 

      hours -= 12;
      suffix = "PM";
   }

   text = hours.toString() + ":" + (min < 10 ? "0" : "") + min.toString() + " " + suffix;

   if (time.top) { dmz.overlay.destroy(time.top); time.top = undefined; }
   time.top = dmz.overlay.instance("news ticker time");
   time.toggle = time.top.lookup("switch");
   time.toggle.setSwitchStateAll(true);
   time.transform = time.top.lookup("transform");
   time.pos = time.transform.position();
   time.pos[0] = offset;
   time.transform.position(time.pos[0], time.pos[1]);
   time.text = time.top.lookup("text");
   time.text.text (text);
   time.length = time.text.size().length + 30;
   root.add(time.top);
};

moveTicker = function (time, ticker) {

   ticker.pos[0] -= time * 80;
   ticker.transform.position(ticker.pos[0], ticker.pos[1]);
};

updateTickerPlace = function (time) {

   var tmp
     , target
     , posX
     , timeOffset = 0
     , nextText
     ;

   timeCounter -= time;

   if (ticker[1].pos[0] < 0) {

      target = ticker[2].length + ticker[2].pos[0];
      posX = target > screen.x ? target : screen.x;


      if (timeCounter <= 0) {

         timeCounter = 60;

         setupTimeTicker(timeTicker, posX);

         timeOffset = timeTicker.length;
      }

      tmp = ticker[0];
      ticker[0] = ticker[1];
      ticker[1] = ticker[2];
      ticker[2] = tmp;
      if (currentTickerText.list.length <= currentTicker) { currentTicker = 0; }
      nextText = currentTickerText.list[currentTicker];
      setupTicker (ticker[2], nextText, posX + timeOffset);
      currentTicker++;
   }
};

self.shutdown = function () {

   dmz.overlay.destroy(ticker[0].top);
   dmz.overlay.destroy(ticker[1].top);
   dmz.overlay.destroy(ticker[2].top);
   dmz.overlay.destroy(timeTicker.top);

   ticker[0].top = ticker[1].top = ticker[2].top = timeTicker = undefined;
};


dmz.time.setRepeatingTimer (self,  function (time) {

   moveTicker (time, ticker[0]);
   moveTicker (time, ticker[1]);
   moveTicker (time, ticker[2]);

   if (dmz.util.isDefined(timeTicker.top)) {

      moveTicker(time, timeTicker);

      if (timeTicker.length < -timeTicker.pos[0]) {

         dmz.overlay.destroy(timeTicker.top);
         timeTicker.top = undefined;
      }
   }

   updateTickerPlace (time);
});


dmz.message.subscribe(self, "DMZ_Render_Portal_Resize_Message", function (data) {

   screen.x = data.number(SizeHandle, 0);
   screen.y = data.number(SizeHandle, 1);
});


tickerText = [

   { radius: 0
   , caption: "SUMMER IN KRAKOW"
   , list:
      [ "President visits foreign nation."
      , "Schools enjoy a day at the City Park."
      , "Stock market down on reports of imminent terrorist attack."
      , "Dog learns to ride skateboard."
      ]
   }
 , { radius: 400
   , caption: "CONTAINER SHIP ERUPTS INTO FLAMES"
   , list:
      [ "Cargo ship fire reported in harbor."
      , "Construction begins on new amusement park."
      , "Dog quits skateboarding over creative differences with owner."
      ]
   }
 , { radius: 600
   , caption: "SHIP SPEWING TOXIC SMOKE"
   , list:
      [ "Hospitals reporting unusual respiratory symptoms."
      , "Governor calls for citizens to stay in their homes."
      , "All sporting events have been canceled."
      ]
   }
 , { radius: 700
   , caption: "MASS CAUSALITIES REPORTED THROUGHOUT THE CITY"
   , list:
      [ "School trip in City Park turns to a field of horrors."
      , "Governor call for state of emergency."
      , "Looting reported through out the city."
      ]
   }
 , { radius: 800
   , caption: "TERRORIST GROUP CLAIMS RESPONSIBILITY FOR SHIP EXPLOSION"
   , list:
      [ "Smoke from the ship contains unknown biological agent."
      , "Airspace over city closed by the FAA."
      , "Paramedics unable to respond high number of casualties."
      ]
   }
 , { radius: 1000
   , caption: "HOSPITALS AT CAPACITY"
   , list:
      [ "Libraries and schools being used for triage."
      , "President deploys National Guard to biological hot zone."
      , "European leaders condemn cowardly attack on port city."
      ]
   }
];


currentTickerText = tickerText[0];


setupTicker(
   ticker[0],
   currentTickerText.list[0],
   0);

setupTicker(
   ticker[1],
   currentTickerText.list[1],
   ticker[0].length);

setupTicker(
   ticker[2],
   currentTickerText.list[2],
   ticker[0].length + ticker[1].length);


dmz.object.scalar.observe(self, "plume-radius", function (handle, attr, value) {

   if (value < 400) { startImage.setSwitchStateAll(true); }
   else { startImage.setSwitchStateAll(false); }

   tickerText.forEach(function (info) {

      if (info.radius <= value) { currentTickerText = info; }
   });

   caption.text(currentTickerText.caption);
});

