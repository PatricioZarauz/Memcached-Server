const Executer = require("./executer");
const InputFormat = require("./inputFormat");
const Message = require("./message");
const Validation = require("./validaton");

class Parser {
	static clearEndOfLine = (line) => {
		return line.toString().replace("\n", "").replace("\r", "");
	};

	static clearClientInfo = (client) => {
		client.command = null;
		client.key = null;
		client.flags = null;
		client.expTime = null;
		client.bytes = null;
		client.noReply = false;
		client.casUnique = null;
		client.isLoaded = false;
		client.dataBlock = null;
	};

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
	static parseAndSetInput = (input, client) => {
		const [commandName, ...tail] = input;
		return getCommand(commandName, input, tail, client);
	};
}

const clearClientAndSendError = (client) => {
	Parser.clearClientInfo(client);
	return Message.argumentError;
};

const basicConversion = (client) => {
	client.flags = Number(client.flags);
	client.expTime = Number(client.expTime);
	client.bytes = Number(client.bytes);
	client.noReply = client.noReply === "noreply";
	client.isLoaded = true;
	return null;
};

const casConversion = (client) => {
	client.casUnique = Number(client.casUnique);
	return null;
};

const basicVerificationAndDataConversion = (clientData) => {
	return Validation.basicVerification(clientData)
		? basicConversion(clientData)
		: clearClientAndSendError(clientData);
};

const casVerificationAndDataConversion = (clientData) => {
	return Validation.casVerification(clientData)
		? casConversion(clientData)
		: clearClientAndSendError(clientData);
};

const basicSet = (parameters, input, client) => {
	return (
		createObject(parameters, input, client) ||
		basicVerificationAndDataConversion(client)
	);
};

const casSet = (parameters, input, client) => {
	return (
		basicSet(parameters, input, client) ||
		casVerificationAndDataConversion(client)
	);
};

const createObject = (parameters, input, client) => {
	const result = Validation.verifyAmmountOfParameters(parameters, input);
	if (!result) {
		const obj = Object.fromEntries(
			parameters.map((_, i) => [parameters[i], input[i]])
		);
		for (const key in obj) {
			client[key] = obj[key];
		}
		client.isLoaded = true;
	}
	return result;
};

const getCommand = (commandName, input, tail, client) => {
	const itsBasic = () => basicSet(InputFormat.basicFormat, input, client);
	const itsCas = () => casSet(InputFormat.casFormat, input, client);
	const itsGet = () => Executer.memcachedGet(tail, client);
	const itsGets = () => Executer.memcachedGets(tail, client);

	const commands = {
		get: itsGet,
		gets: itsGets,
		set: itsBasic,
		add: itsBasic,
		replace: itsBasic,
		append: itsBasic,
		prepend: itsBasic,
		cas: itsCas,
		default: () => Message.error,
	};
	return (commands[commandName] || commands.default)();
};

module.exports = Parser;
