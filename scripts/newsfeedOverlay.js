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
  , ticker = [{}, {}, {}]
  , timeTicker = {}
  , screen = { x: 0, y: 0 }
  , timeCounter = 0
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

   ticker.pos[0] -= time * 60;
   ticker.transform.position(ticker.pos[0], ticker.pos[1]);
};

updateTickerPlace = function (time) {

   var tmp
     , target
     , posX
     , timeOffset = 0
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
      setupTicker (ticker[2], ticker[2].text.text(), posX + timeOffset);
   }
};

setupTicker(
   ticker[0],
   "A long string of text about a news story that is breaking now.",
   0);

setupTicker(
   ticker[1],
   "Orange crops adversly affected by early freeze in Florida.",
   ticker[0].length);

setupTicker(
   ticker[2],
   "No news is good news.",
   ticker[0].length + ticker[1].length);

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


dmz.message.subscribe("DMZ_Render_Portal_Resize_Message", self, function (data) {

   screen.x = data.number(SizeHandle, 0);
   screen.y = data.number(SizeHandle, 1);
});

