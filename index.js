// Dependencies
var server = require('./server');
var cluster = require('cluster');
var os = require('os');

// Declare the app
var app = {};

// Init function
app.init = function(callback){

  // If we're on the master thread, just fork loop
  if(cluster.isMaster){

    // Fork the process
    for(var i = 0; i < os.cpus().length; i++){
      cluster.fork();
    }

  } else {
    // If we're not on the master thread, start the HTTP server
    server.init();
  }
};

app.init();
