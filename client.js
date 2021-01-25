const Executer = require("./executer");
const Message = require("./message");
const Parser = require("./parser");
const Validation = require("./validaton");

class Client {
	constructor(socket) {
		// The information of the client, Address:Port
		Client.remoteAddress = socket.remoteAddress + ":" + socket.remotePort;

		//Saves only the numbers that make up the remoteAddress, in the userID constant.
		const regexp = /[\d]+/g;

		this.socket = socket;
		this.command = null;
		this.key = null;
		this.flags = null;
		this.expTime = null;
		this.bytes = null;
		this.noReply = false;
		this.casUnique = null;
		this.userId = Number(Client.remoteAddress.match(regexp).join(""));
		this.isLoaded = false;
		this.dataBlock = null;
	}
	static remoteAddress;

	openSocket = () => {
		// When a new client is connected, the following message is logged in console.
		console.log("New client was connected!");

		// When a new client is connected, the following message will appear in their console.
		this.socket.write(Message.greetings);

		//When the client sends data over (through the <info> parameter) to the server, this event will be executed.
		this.socket.on("data", (info) => {
			let infoClean = Parser.clearEndOfLine(info);

			let message = null;

			//Asking if the client has already sent parameters over.
			if (this.isLoaded) {
				this.dataBlock = infoClean;
				if (
					Validation.bytesAndDataBlockMatches(
						this.bytes,
						this.dataBlock
					)
				) {
					message = Executer.memcachedFunction(this);
				} else message = Message.wrongByteSize;
				Parser.clearClientInfo(this);
			} else
				message = Parser.parseAndSetInput(infoClean.split(" "), this);

			Array.isArray(message)
				? sendToClientMultipleLines(message)
				: sendToClient(message);
		});

		/**
		 * This function sends data to the client
		 * @param {string} data - The data that will be sent over to the client
		 */
		const sendToClient = (data) => {
			if (data) {
				this.socket.write(data);
			}
		};

		/**
		 * This function sends the data stored in the array over to the client
		 * @param {[string]} data - Data that will be sent over to the client
		 */
		const sendToClientMultipleLines = (data) => {
			data.forEach((element) => {
				this.socket.write(element);
			});
		};

		//When the connection with a client is lost, a message is logged on console, saying which connection was terminated.
		this.socket.once("close", () => {
			console.log(
				`Connection from ${Client.remoteAddress} was terminated`
			);
		});

		//When an error from the client is detected, the error message is log on console.
		this.socket.on("error", (err) => {
			console.log(
				`Connection ${Client.remoteAddress} error: ${err.message}`
			);
		});
	};
}

module.exports = Client;
