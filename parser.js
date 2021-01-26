const Executer = require("./executer");
const InputFormat = require("./inputFormat");
const Message = require("./message");
const Validation = require("./validaton");
const Client = require("./client");

class Parser {
	/**
	 * This function removes the end of line information from a line.
	 * @param {string} line - The line which we want to remove the end of file information of.
	 * @returns {string} The updated line.
	 */
	static clearEndOfLine = (line) =>
		line.toString().replace("\n", "").replace("\r", "");

	/**
	 * This function clears the information of a client.
	 * @param {Client} client - The client that we want to empty.
	 */
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
	 * client.
	 * Also, if the command sent over by the client is the get(s) function, the command will be
	 * verified and executed.
	 * @param {[string]} input - The paramaters we want to parse.
	 * @param {Client} client - The client which the information will be stored in.
	 * @returns {[string]|string} The error messages or the result of the get/gets function.
	 * function to execute.
	 */
	static parseAndSetInput = (input, client) => {
		const [commandName, ...tail] = input;
		return commandSelector(commandName, input, tail, client);
	};
}
/**
 * This function clears the client's information and sends error message.
 * @param {Client} client - The client whose information will be cleared.
 * @returns {string} The desired error message
 */
const clearClientAndSendError = (client) => {
	Parser.clearClientInfo(client);
	return Message.argumentError;
};

/**
 * This function converts the client's basic information to it's correct type.
 * @param {Client} client - The client whose information will be convertated to it's corresponding
 * type.
 */
const basicConversion = (client) => {
	client.flags = Number(client.flags);
	client.expTime = Number(client.expTime);
	client.bytes = Number(client.bytes);
	client.noReply = client.noReply === "noreply";
	client.isLoaded = true;
	return null;
};

/**
 * This function converts the client's cas specific information to it's correct type.
 * @param {Client} client - The client whose information will be convertated to it's corresponding
 * type.
 */
const casConversion = (client) => {
	client.casUnique = Number(client.casUnique);
	return null;
};

/**
 * This function verifies if the client's basic information is correct, in which case, it will
 * be converted to it's corresponding type. Otherwise, it will send an error message.
 * @param {client} client - The client whose information we want to verify and convert.
 * @returns {string} The error message stating the problem encountered.
 */
const basicVerificationAndDataConversion = (client) =>
	Validation.basicVerification(client)
		? basicConversion(client)
		: clearClientAndSendError(client);

/**
 * This function verifies if the client's cas specific information is correct, in which case, it will
 * be converted to it's corresponding type. Otherwise, it will send an error message.
 * @param {client} client - The client whose information we want to verify and convert.
 * @returns {string} The error message stating the problem encountered.
 */
const casVerificationAndDataConversion = (client) =>
	Validation.casVerification(client)
		? casConversion(client)
		: clearClientAndSendError(client);

/**
 * This function loads, verifies and converts the clients basic information, depending of the desired command.
 * @param {[string]} inputFormat - The desired input format.
 * @param {[string]]} parametersClient - The parameters that the client sent over.
 * @param {Client} client - The client where the information will be loaded at.
 * @returns {string} The error message stating the problem encountered.
 */
const basicSet = (inputFormat, parametersClient, client) =>
	loadClient(inputFormat, parametersClient, client) ||
	basicVerificationAndDataConversion(client);

/**
 * This function loads, verifies and converts the clients basic and cas specific information, depending of the desired command.
 * @param {[string]} inputFormat - The desired input format.
 * @param {[string]]} parametersClient - The parameters that the client sent over.
 * @param {Client} client - The client where the information will be loaded at.
 * @returns {string} The error message stating the problem encountered.
 */
const casSet = (inputFormat, parametersClient, client) =>
	basicSet(inputFormat, parametersClient, client) ||
	casVerificationAndDataConversion(client);

/**
 * This function verifies that the ammount of parameters sent over by the client, corresponds with
 * the desired input format and the loads the client with the parameters sent over by the client.
 * @param {[string]} inputFormat - The desired input format.
 * @param {[string]} parametersClient - The parameters that the client sent over.
 * @param {Client} client - The client where the information will be loaded at.
 * @returns {string} The error message stating the problem encountered.
 */
const loadClient = (inputFormat, parametersClient, client) => {
	const result = Validation.verifyAmmountOfParameters(
		parametersClient,
		inputFormat
	);
	if (!result) {
		const obj = Object.fromEntries(
			inputFormat.map((_, i) => [inputFormat[i], parametersClient[i]])
		);
		for (const key in obj) client[key] = obj[key];

		client.isLoaded = true;
	}
	return result;
};
/**
 * This function determines what should be done next, depending on the command name.
 * The posibilities are: to verify and load a client or execute either the get/gets functions.
 * @param {string} commandName - The name of the command that the client sent over.
 * @param {[string]} input - The client's input.
 * @param {[string]} tail - The client's input without the command name.
 * @param {Client} client - The client where the information will be loaded at.
 * @returns {[string]} The corresponding error message or the results of the get/gets functions.
 */
const commandSelector = (commandName, input, tail, client) => {
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
