// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

var unifiedServer = function(req,res){ // HTTP / HTTPS servers logic

    var parsedUrl = url.parse(req.url, true); // Parse the url
  
    var trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, ''); // Get the trimmed path
  
    // Get the payload,if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });

    req.on('end', function() {
        buffer += decoder.end();

        var data = { // Construct the request data object 
            'trimmedPath' : trimmedPath,
            'queryStringObject' : parsedUrl.query, // Get the query string as an object
            'method' : req.method.toLowerCase(), // Get the HTTP method
            'headers' : req.headers, //Get the headers as an object
            'payload' : buffer,
          };

        RoutesHandler(trimmedPath)(data,function(statusCode,payload){ // handle the request
          
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(typeof(statusCode) == 'number' ? statusCode : 200);
          res.end(JSON.stringify(typeof(payload) == 'object'? payload : {}));
          console.log(trimmedPath,statusCode);
        });
  
    });
};

 var httpServer = http.createServer(function(req,res){ // HTTP server up
  unifiedServer(req,res);
});

httpServer.listen(config.httpPort,function(){ // HTTP server running
  console.log('The HTTP server is running on port '+config.httpPort);
});

var httpsServerOptions = { // HTTPS server set up options
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions,function(req,res){ // HTTPS server up
  unifiedServer(req,res);
});

httpsServer.listen(config.httpsPort,function(){ // HTTPS server running
 console.log('The HTTPS server is running on port '+config.httpsPort);
});

const RoutesHandler = function(path) {
    switch (path) {
        case 'ping' : // ping route
          return function(data,callback){
            callback(200);
        };
        case 'hello': // hello route
          return function(data,callback){
            callback(200, {
                greetMsg: "Hi there, you are welcome to use our API!"
            });
        };
        default     : // unknown routes
          return function(data,callback){
            callback(404);
        };
    };
};

