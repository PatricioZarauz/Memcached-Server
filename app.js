var net = require("net");
var server = net.createServer();
const Memcached = require("./memcached");

const port = 9000;

var memcached = new Memcached();

server.on("connection", function (socket) {
	// The information of the client, Address:Port
	var remoteAddress = socket.remoteAddress + ":" + socket.remotePort;

	const regexp = /[\d]+/g;
	const clientID = Number(remoteAddress.match(regexp).join(""));

	var data = [];
	// When a new client is connected, the following message is logged in console.
	console.log("New client was connected!");

	// When a new client is connected, the following message will appear in their console.
	socket.write("Welcome to Patricio's Memcached-Server!\n");

	socket.on("data", function (info) {
		var infoClean = info.toString().replace("\n", "");
		infoClean = infoClean.replace("\r", "");
		if (data.length > 1) {
			memcachedFunctionExecuter(data, clientID);
			data = [];
		} else {
			var infoSeparated = infoClean.split(" ");
			data = memcachedFunctionIdentifierAndGetFunctionExecuter(
				infoSeparated,
				clientID
			);
		}

		/**
		 * This function allows us to execute the correct memcached function depending on the parameters saved.
		 * @param {[string | Number | Boolean]} parameters - The paramaters that will be given to the corresponding function of the memcached.
		 */
		function memcachedFunctionExecuter(parameters, clientID) {
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
									clientID
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
									clientID,
									true
								)
							);
						}
					} else {
						socket.write(
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
									clientID
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
									clientID,
									true
								)
							);
						}
					} else {
						socket.write(
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
									clientID
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
									clientID,
									true
								)
							);
						}
					} else {
						socket.write(
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
									clientID
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
									clientID,
									true
								)
							);
						}
					} else {
						socket.write(
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
									clientID
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
									clientID,
									true
								)
							);
						}
					} else {
						socket.write(
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
									clientID
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
									clientID,
									true
								)
							);
						}
					} else {
						socket.write(
							"CLIENT_ERROR - Please make sure that the bytes and datablock size are the same\r\n"
						);
					}

					break;
				default:
					break;
			}
		}
		/**
		 * This function allows us to verify that the command send over by the client, doesn't have any issues and if so it saves each argument
		 * and the command name in <parameters>.
		 * Also if the command sent over by the client is get(s) function the command will be verified and executed.
		 * @param {[string]} infoSeparated - The paramaters that will be given to the corresponding function of the memcached.
		 * @returns {[string | Number | Boolean]} - Arguments and command name of the memcached function to execute.
		 */
		function memcachedFunctionIdentifierAndGetFunctionExecuter(
			infoSeparated,
			clientID
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
						Number.isInteger(Number(infoSeparated[2])) &&
						Number(infoSeparated[2]) <= Math.pow(2, 16) - 1 &&
						Number(infoSeparated[2]) >= 0 &&
						Number.isInteger(Number(infoSeparated[3])) &&
						Number.isInteger(Number(infoSeparated[4])) &&
						Number(infoSeparated[4]) >= 0 &&
						Number(infoSeparated[4]) <= 256
					) {
						parametersConverter(infoSeparated, parameters);
					} else if (
						infoSeparated.length === 6 &&
						Number.isInteger(Number(infoSeparated[2])) &&
						Number(infoSeparated[2]) <= Math.pow(2, 16) - 1 &&
						infoSeparated[2] >= 0 &&
						Number.isInteger(Number(infoSeparated[3])) &&
						Number.isInteger(Number(infoSeparated[4])) &&
						Number(infoSeparated[4]) >= 0 &&
						Number(infoSeparated[4]) <= 256 &&
						infoSeparated[5] === "noreply"
					) {
						parametersConverter(infoSeparated, parameters, true);
					} else {
						if (
							infoSeparated.length < 5 ||
							infoSeparated.length > 6
						) {
							socket.write(
								"CLIENT_ERROR - There are missing arguments in the command given\r\n"
							);
						} else {
							socket.write(
								"CLIENT_ERROR - Please make sure that the arguments conform to the protocol\r\n"
							);
						}
					}
					break;
				case "cas":
					if (
						infoSeparated.length === 6 &&
						Number.isInteger(Number(infoSeparated[2])) &&
						Number(infoSeparated[2]) <= Math.pow(2, 16) - 1 &&
						Number(infoSeparated[2]) >= 0 &&
						Number.isInteger(Number(infoSeparated[3])) &&
						Number.isInteger(Number(infoSeparated[4])) &&
						Number(infoSeparated[4]) >= 0 &&
						Number(infoSeparated[4]) <= 256 &&
						Number.isInteger(Number(infoSeparated[5])) &&
						Number(infoSeparated[5]) >= 0 &&
						Number(infoSeparated[5]) <= Math.pow(2, 64) - 1
					) {
						parametersConverter(infoSeparated, parameters);
					} else if (
						infoSeparated.length === 7 &&
						Number.isInteger(Number(infoSeparated[2])) &&
						Number(infoSeparated[2]) <= Math.pow(2, 16) - 1 &&
						Number(infoSeparated[2]) >= 0 &&
						Number.isInteger(Number(infoSeparated[3])) &&
						Number.isInteger(Number(infoSeparated[4])) &&
						Number(infoSeparated[4]) >= 0 &&
						Number(infoSeparated[4]) <= 256 &&
						Number.isInteger(Number(infoSeparated[5])) &&
						Number(infoSeparated[5]) >= 0 &&
						Number(infoSeparated[5]) <= Math.pow(2, 64) - 1 &&
						infoSeparated[6] === "noreply"
					) {
						parametersConverter(infoSeparated, parameters, true);
					} else {
						if (
							infoSeparated.length < 6 ||
							infoSeparated.length > 7
						) {
							socket.write(
								"CLIENT_ERROR - There are missing arguments in the command given\r\n"
							);
						} else {
							socket.write(
								"CLIENT_ERROR - Please make sure that the arguments conform to the protocol\r\n"
							);
						}
					}
					break;
				case "get":
					if (infoSeparated.length > 1) {
						infoSeparated.shift();
						sendToClientMultipleLines(
							memcached.get(infoSeparated, clientID)
						);
					} else {
						socket.write(
							"CLIENT_ERROR - There are missing arguments in the command given\r\n"
						);
					}
					break;
				case "gets":
					if (infoSeparated.length > 1) {
						infoSeparated.shift();
						sendToClientMultipleLines(
							memcached.gets(infoSeparated, clientID)
						);
					} else {
						socket.write(
							"CLIENT_ERROR - There are missing arguments in the command given\r\n"
						);
					}
					break;
				default:
					socket.write("ERROR\r\n");
					break;
			}
			return parameters;
		}

		function sendToClient(result) {
			if (result) {
				socket.write(result);
			}
		}

		function sendToClientMultipleLines(result) {
			result.forEach((element) => {
				socket.write(element);
			});
		}

		function parametersConverter(
			infoSeparated,
			parameters,
			noreply = false
		) {
			for (
				let i = 0;
				(i < infoSeparated.length && !noreply) ||
				(noreply && i < infoSeparated.length - 1);
				i++
			) {
				if (i > 1) {
					infoSeparated[i] = Number(infoSeparated[i]);
				}
				parameters.push(infoSeparated[i]);
			}
			if (noreply) {
				parameters.push(true);
			}
		}

		/**
		 * This function tells us if the Bytes argument and DataBlock size matches.
		 * @param {Number} bytes - The byte size of the datablock.
		 * @param {string} dataBlock - The datablock sent by the client.
		 * @returns {Boolean} - Arguments and command name of the memcached function to execute.
		 */
		function bytesAndDataBlockMatches(bytes, dataBlock) {
			return bytes === dataBlock.length;
		}
	});

	//When the connection with a client is lost, a message is logged on console saying which connection was terminated.
	socket.once("close", function () {
		console.log(`Connection from ${remoteAddress} was terminated`);
	});

	//When an error from the client is detected, the error message is log on console.
	socket.on("error", function (err) {
		console.log(`Connection ${remoteAddress} error: ${err.message}`);
	});
});

// When the server it's running, a message showing it's information will be logged in console.
server.listen(port, function () {
	console.log(
		`Server listening on ${server.address().address} : ${
			server.address().port
		}`
	);
});
