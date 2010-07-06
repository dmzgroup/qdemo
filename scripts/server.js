var http = require('http')
  , log = require("sys").log
  ;

http.createServer(function (req, res) {

  var sizeStr
    , remain = 0
    ;

  if (req.method === "GET") {

     res.writeHead(200, {'content-type': 'text/plain'});
     res.end('Goodbye World\n');
  }
  else if (req.method == "PUT") {

     log("Got PUT request");
     sizeStr = req.headers["content-length"]
     if (sizeStr) { remain = parseInt(sizeStr); }
     res.connection.addListener("data", function(chunk) {

         log(chunk);
         remain -= chunk.length;

         if (remain <= 0) {

            res.writeHead(200, {});
            res.end();
         }
     });
     res.connection.addListener("end", function() { log("end"); });
//     res.end();
  }

}).listen(8124, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8124/');
