var net = require("net");
var server = net.createServer();

var port = 9000;

server.on("connection", function(socket){
    // The information of the client, Address:Port
    var remoteAddress = socket.remoteAddress + ":" + socket.remotePort;

    // When a new client is connected, the following message is logged in console.
    console.log("New client was connected!");

    // When a new client is connected, the following message will appear in their console.
    socket.write("Welcome to Patricio's Memcached-Server!");

    socket.on("data", function (info) {
        /*
        What happens when you receive data
        */
    });

    //When the connection with a client is lost, a message is logged on console saying which connection was terminated.
    socket.once("close", function(){
        console.log(`Connection from ${remoteAddress} was terminated`);
    });

    //When an error from the client is detected, the error message is log on console.
    socket.on("error", function(err){
        console.log(`Connection ${remoteAddress} error: ${err.message}`);
    });

});

// When the server it's running, a message showing it's information will be logged in console.
server.listen(port, function(){
    console.log("Server listening on %j ", server.address());
});