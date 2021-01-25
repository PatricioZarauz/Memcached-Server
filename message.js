class Message {
	static argumentError =
		"CLIENT_ERROR - Please make sure that the arguments conform to the protocol\r\n";
	static manyArgumentsError =
		"CLIENT_ERROR - There are too many arguments in the command given\r\n";
	static fewArgumentsError =
		"CLIENT_ERROR - There are missing arguments in the command given\r\n";
	static error = "ERROR\r\n";
	static greetings = "Welcome to Patricio's Memcached-Server!\n";
	static wrongByteSize =
		"CLIENT_ERROR - Please make sure that the bytes and datablock size are the same\r\n";
	static stored = "STORED\r\n";
	static notStored = "NOT_STORED\r\n";
	static exists = "EXISTS\r\n";
	static notFound = "NOT_FOUND\r\n";
	static end = "END\r\n";
}

module.exports = Message;
