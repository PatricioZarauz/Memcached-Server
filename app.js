var net = require("net");
var server = net.createServer();
const Memcached = require("./memcached");

const port = 9000;

var memcached = new Memcached();

//When someone connects to the server this event will be executed
server.on("connection", function (socket) {
	// The information of the client, Address:Port
	var remoteAddress = socket.remoteAddress + ":" + socket.remotePort;

	//Saves only the numbers that make the remoteAddress, in the casID constant.
	const regexp = /[\d]+/g;
	const casID = Number(remoteAddress.match(regexp).join(""));

	//Stores the information recevied from the client, each argument will have it's
	//own position in the array.
	var data = [];

	// When a new client is connected, the following message is logged in console.
	console.log("New client was connected!");

	// When a new client is connected, the following message will appear in their console.
	socket.write("Welcome to Patricio's Memcached-Server!\n");

	//When the client sends data over (through the <info> parameter) to the server, this event will be executed.
	socket.on("data", function (info) {
		var infoClean = info.toString().replace("\n", "");
		infoClean = infoClean.replace("\r", "");

		//Asking if the client has already sent parameters over.
		if (data.length > 1) {
			memcachedFunctionExecuter(data, casID);
			data = [];
		} else {
			var infoSeparated = infoClean.split(" ");
			data = memcachedFunctionIdentifierAndGetFunctionExecuter(
				infoSeparated,
				casID
			);
		}

		/**
		 * This function allows us to execute the correct memcached function depending on the
		 * parameters saved.
		 * @param {[string | Number | Boolean]} parameters - The paramaters that will be given
		 * to the corresponding function of the memcached.
		 * @param {Number} casID - The number that uniquely identifies the client
		 */
		function memcachedFunctionExecuter(parameters, casID) {
			switch (parameters[0]) {
				case "set":
					if (bytesAndDataBlockMatches(parameters[4], infoClean)) {
						if (parameters.length === 5) {
							sendToClient(
								memcached.set(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID
								)
							);
						} else if (parameters.length === 6) {
							sendToClient(
								memcached.set(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID,
									true
								)
							);
						}
					} else {
						sendToClient(
							"CLIENT_ERROR - Please make sure that the bytes and datablock size are the same\r\n"
						);
					}

					break;
				case "add":
					if (bytesAndDataBlockMatches(parameters[4], infoClean)) {
						if (parameters.length === 5) {
							sendToClient(
								memcached.add(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID
								)
							);
						} else if (parameters.length === 6) {
							sendToClient(
								memcached.add(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID,
									true
								)
							);
						}
					} else {
						sendToClient(
							"CLIENT_ERROR - Please make sure that the bytes and datablock size are the same\r\n"
						);
					}

					break;
				case "replace":
					if (bytesAndDataBlockMatches(parameters[4], infoClean)) {
						if (parameters.length === 5) {
							sendToClient(
								memcached.replace(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID
								)
							);
						} else if (parameters.length === 6) {
							sendToClient(
								memcached.replace(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID,
									true
								)
							);
						}
					} else {
						sendToClient(
							"CLIENT_ERROR - Please make sure that the bytes and datablock size are the same\r\n"
						);
					}

					break;
				case "prepend":
					if (bytesAndDataBlockMatches(parameters[4], infoClean)) {
						if (parameters.length === 5) {
							sendToClient(
								memcached.prepend(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID
								)
							);
						} else if (parameters.length === 6) {
							sendToClient(
								memcached.prepend(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID,
									true
								)
							);
						}
					} else {
						sendToClient(
							"CLIENT_ERROR - Please make sure that the bytes and datablock size are the same\r\n"
						);
					}

					break;
				case "append":
					if (bytesAndDataBlockMatches(parameters[4], infoClean)) {
						if (parameters.length === 5) {
							sendToClient(
								memcached.append(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID
								)
							);
						} else if (parameters.length === 6) {
							sendToClient(
								memcached.append(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID,
									true
								)
							);
						}
					} else {
						sendToClient(
							"CLIENT_ERROR - Please make sure that the bytes and datablock size are the same\r\n"
						);
					}

					break;
				case "cas":
					if (bytesAndDataBlockMatches(parameters[4], infoClean)) {
						if (parameters.length === 6) {
							sendToClient(
								memcached.cas(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID
								)
							);
						} else if (parameters.length === 7) {
							sendToClient(
								memcached.cas(
									parameters[1],
									parameters[2],
									parameters[3],
									parameters[4],
									infoClean,
									casID,
									true
								)
							);
						}
					} else {
						sendToClient(
							"CLIENT_ERROR - Please make sure that the bytes and datablock size are the same\r\n"
						);
					}

					break;
				default:
					break;
			}
		}

		/**
		 * This function allows us to verify that the command sent over by the client, doesn't
		 * have any issues; and if so, it saves each argument and the command name in the
		 * <parameters> variable.
		 * Also, if the command sent over by the client is the get(s) function, the command will be
		 * verified and executed.
		 * @param {[string]} infoSeparated - Paramaters that will be given to the
		 * corresponding function of the memcached.
		 * @param {Number} casID - Number that uniquely identifies the client
		 * @returns {[string | Number | Boolean]} - Arguments and command name of the memcached
		 * function to execute.
		 */
		function memcachedFunctionIdentifierAndGetFunctionExecuter(
			infoSeparated,
			casID
		) {
			var parameters = [];
			switch (infoSeparated[0]) {
				case "set":
				case "add":
				case "replace":
				case "prepend":
				case "append":
					if (
						infoSeparated.length === 5 &&
						is16BitUnsignedInteger(infoSeparated[2]) &&
						Number.isInteger(Number(infoSeparated[3])) &&
						is8BitUnsignedInteger(infoSeparated[4])
					) {
						argumentsConverter(infoSeparated, parameters);
					} else if (
						infoSeparated.length === 6 &&
						is16BitUnsignedInteger(infoSeparated[2]) &&
						Number.isInteger(Number(infoSeparated[3])) &&
						is8BitUnsignedInteger(infoSeparated[4]) &&
						infoSeparated[5] === "noreply"
					) {
						argumentsConverter(infoSeparated, parameters, true);
					} else {
						if (infoSeparated.length < 5) {
							sendToClient(
								"CLIENT_ERROR - There are missing arguments in the command given\r\n"
							);
						} else if (infoSeparated.length > 6) {
							sendToClient(
								"CLIENT_ERROR - There are too many arguments in the command given\r\n"
							);
						} else {
							sendToClient(
								"CLIENT_ERROR - Please make sure that the arguments conform to the protocol\r\n"
							);
						}
					}
					break;
				case "cas":
					if (
						infoSeparated.length === 6 &&
						is16BitUnsignedInteger(infoSeparated[2]) &&
						Number.isInteger(Number(infoSeparated[3])) &&
						is8BitUnsignedInteger(infoSeparated[4]) &&
						is64BitUnsignedInteger(infoSeparated[5])
					) {
						argumentsConverter(infoSeparated, parameters);
					} else if (
						infoSeparated.length === 7 &&
						is16BitUnsignedInteger(infoSeparated[2]) &&
						Number.isInteger(Number(infoSeparated[3])) &&
						is8BitUnsignedInteger(infoSeparated[4]) &&
						is64BitUnsignedInteger(infoSeparated[5]) &&
						infoSeparated[6] === "noreply"
					) {
						argumentsConverter(infoSeparated, parameters, true);
					} else {
						if (infoSeparated.length < 6) {
							sendToClient(
								"CLIENT_ERROR - There are missing arguments in the command given\r\n"
							);
						} else if (infoSeparated.length > 7) {
							sendToClient(
								"CLIENT_ERROR - There are too many arguments in the command given\r\n"
							);
						} else {
							sendToClient(
								"CLIENT_ERROR - Please make sure that the arguments conform to the protocol\r\n"
							);
						}
					}
					break;
				case "get":
					if (infoSeparated.length > 1) {
						infoSeparated.shift();
						sendToClientMultipleLines(
							memcached.get(infoSeparated, casID)
						);
					} else {
						sendToClient(
							"CLIENT_ERROR - There are missing arguments in the command given\r\n"
						);
					}
					break;
				case "gets":
					if (infoSeparated.length > 1) {
						infoSeparated.shift();
						sendToClientMultipleLines(
							memcached.gets(infoSeparated, casID)
						);
					} else {
						sendToClient(
							"CLIENT_ERROR - There are missing arguments in the command given\r\n"
						);
					}
					break;
				default:
					sendToClient("ERROR\r\n");
					break;
			}
			return parameters;
		}

		/**
		 * This function tells us if the string in question is a 16 bit unsigned integer
		 * @param {string} data - String which we are trying to determining if it's a 16 bit
		 * unsigned integer.
		 * @returns {Boolean} - The result of whether the string in questions is a 16 bit unsigned
		 * integer or not.
		 */
		function is16BitUnsignedInteger(data) {
			return (
				Number.isInteger(Number(data)) &&
				Number(data) <= Math.pow(2, 16) - 1 &&
				Number(data) >= 0
			);
		}

		/**
		 * This function tells us if the string in question is a 8 bit unsigned integer
		 * @param {string} data - String which we are trying to determine if it's a 8 bit
		 * unsigned integer.
		 * @returns {Boolean} - Returns if the string in questions is a 8 bit unsigned
		 * integer or not.
		 */
		function is8BitUnsignedInteger(data) {
			return (
				Number.isInteger(Number(data)) &&
				Number(data) <= Math.pow(2, 8) - 1 &&
				Number(data) >= 0
			);
		}

		/**
		 * This function tells us if the string in question is a 64 bit unsigned integer
		 * @param {string} data - The string which we are trying to determine if it's a 64 bit
		 * unsigned integer.
		 * @returns {Boolean} - Returns if the string in questions is a 64 bit unsigned
		 * integer or not.
		 */
		function is64BitUnsignedInteger(data) {
			return (
				Number.isInteger(Number(data)) &&
				Number(data) <= Math.pow(2, 64) - 1 &&
				Number(data) >= 0
			);
		}

		/**
		 * This function sends data to the client
		 * @param {string} data - The data that will be sent over to the client
		 */
		function sendToClient(data) {
			if (data) {
				socket.write(data);
			}
		}

		/**
		 * This function sends the data stored in the array over to the client
		 * @param {[string]} data - Data that will be sent over to the client
		 */
		function sendToClientMultipleLines(data) {
			data.forEach((element) => {
				socket.write(element);
			});
		}

		/**
		 * This function converts the arguments from a string to their respective memcached
		 * function type and saves them in <parameters>.
		 * @param {[string]} arguments - Arguments to be converted
		 * @param {[string | Number | Boolean]} parameters - It is where the converted arguments
		 * wil be stored.
		 * @param {Boolean} noreply - It's a boolean flag that determines whether there's a noreply
		 * argument.
		 */
		function argumentsConverter(arguments, parameters, noreply = false) {
			for (
				let i = 0;
				(i < arguments.length && !noreply) ||
				(noreply && i < arguments.length - 1);
				i++
			) {
				if (i > 1) {
					arguments[i] = Number(arguments[i]);
				}
				parameters.push(arguments[i]);
			}
			if (noreply) {
				parameters.push(true);
			}
		}

		/**
		 * This function tells us if the Bytes argument and DataBlock size matches.
		 * @param {Number} bytes - Byte size of the datablock.
		 * @param {string} dataBlock - Datablock sent by the client.
		 * @returns {Boolean} - Arguments and command name of the memcached function to execute.
		 */
		function bytesAndDataBlockMatches(bytes, dataBlock) {
			return bytes === dataBlock.length;
		}
	});

	//When the connection with a client is lost, a message is logged on console, saying which connection was terminated.
	socket.once("close", function () {
		console.log(`Connection from ${remoteAddress} was terminated`);
	});

	//When an error from the client is detected, the error message is log on console.
	socket.on("error", function (err) {
		console.log(`Connection ${remoteAddress} error: ${err.message}`);
	});
});

// When the server it's running, a message showing its information will be logged in console.
server.listen(port, function () {
	console.log(
		`Server listening on ${server.address().address} : ${
			server.address().port
		}`
	);
});
