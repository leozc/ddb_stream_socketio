var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var serverList = {};
/**
* When user access GET /channel/:name, a socket server is created
* TODO: a way to close ununsed namespace
**/
app.get('/channel/:name', function(req, res){
  var ns = req.params.name;
  var nsp = null;
  // potentially race
  if (ns in serverList){
    console.log("Found cached socket");
    nsp = serverList[ns];
  }
  else {
    nsp = io.of('/'+ns);
    serverList[ns] = nsp;
    console.log("Adding socket " + ns);
  }

  nsp.on('connection', function(socket){

    console.log(ns + ': a user connected');
    socket.join("default");
    socket.on('signal', function(msg){
      console.log(ns + ': message:' + msg +" "+ socket);
      socket.broadcast.to('default').emit("server", ns + ":echo " + msg);
      // everyone including the sender
      //io.to('default').emit("server", ns + ":echo " + msg);
    });

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
    socket.on('join', function(room) {
      console.log('joining room ' + room);
      socket.join(room);
    });
  });
  res.sendFile('index.html', { root: __dirname });

});

http.listen(3000, function(){
  console.log('listening on http *:3000');
});
