const Net = require("net");
const Client = require("./client");
const server = Net.createServer();
const Memcached = require("./memcached");

const memcachedSize = undefined;
const port = 9000;

//When someone connects to the server this event will be executed
server.on("connection", (socket) => {
	const client = new Client(socket);
	client.openSocket();
});

// When the server it's running, a message showing its information will be logged in console.
server.listen(port, () => {
	console.log(
		`Server listening on ${server.address().address} : ${
			server.address().port
		}`
	);

	new Memcached(memcachedSize);
});
