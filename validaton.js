const Message = require("./message");

class Validation {
	/**
	 * This function verifies if the cas specific information of a client is correct.
	 * @param {Client} client - The client whose information we want to verify.
	 * @returns {Boolean} If the client's information is correct.
	 */
	static casVerification = ({ casUnique }) =>
		is64BitUnsignedInteger(casUnique);

	/**
	 * This function verifies if the basic information of a client is correct.
	 * @param {Client} client - The client whose information we want to verify.
	 * @returns {Boolean} If the client's information is correct.
	 */
	static basicVerification = ({ flags, expTime, bytes, noReply }) =>
		is16BitUnsignedInteger(flags) &&
		Number.isInteger(Number(expTime)) &&
		is8BitUnsignedInteger(bytes) &&
		(noReply === "noreply" || noReply == null);

	/**
	 * This function determines if the ammount of parameters sent over by the client matches the
	 * ammount the desired input format has, and send an error message if it doesn't.
	 * @param {[string]} parametersClient - The parameters sent over by the client.
	 * @param {[string]} inputFormat - The desired input format.
	 * @returns {string} The corresponding error message
	 */
	static verifyAmmountOfParameters = (parametersClient, inputFormat) =>
		areTheSameSize(parametersClient, inputFormat)
			? null
			: parametersClient.length < inputFormat.length
			? Message.fewArgumentsError
			: Message.manyArgumentsError;

	/**
	 * This function tells us if the Bytes argument and DataBlock size matches.
	 * @param {Number} bytes - Byte size of the datablock.
	 * @param {string} dataBlock - Datablock sent by the client.
	 * @returns {Boolean} - Arguments and command name of the memcached function to execute.
	 */
	static bytesAndDataBlockMatches = (bytes, dataBlock) =>
		bytes === dataBlock.length;
}
/**
 * This function determines whether an inputFormat and the command sent over by the client has the
 * correct ammount of parameters. It takes into consideration the fact that the client may not
 * have sent over the noreply parameter.
 * @param {[string]} parametersClient - The parameters sent over by the client.
 * @param {[string]} inputFormat - The desired input format.
 * @returns {Boolean} - If the user has sent the correct ammount of parameters.
 */
const areTheSameSize = (parametersClient, inputFormat) => {
	const [, ...init] = [...inputFormat].reverse();
	return (
		inputFormat.length === parametersClient.length ||
		init.length === parametersClient.length
	);
};

/**
 * This function tells us if the string in question is a 16 bit unsigned integer
 * @param {string} data - String which we are trying to determine if it's a 16 bit
 * unsigned integer.
 * @returns {Boolean} - The result of whether the string in questions is a 16 bit unsigned
 * integer or not.
 */
const is16BitUnsignedInteger = (data) =>
	Number.isInteger(Number(data)) &&
	Number(data) <= Math.pow(2, 16) - 1 &&
	Number(data) >= 0;

/**
 * This function tells us if the string in question is an 8 bit unsigned integer
 * @param {string} data - String which we are trying to determine if it's an 8 bit
 * unsigned integer.
 * @returns {Boolean} - Returns if the string in questions is an 8 bit unsigned
 * integer or not.
 */
const is8BitUnsignedInteger = (data) =>
	Number.isInteger(Number(data)) &&
	Number(data) <= Math.pow(2, 8) - 1 &&
	Number(data) >= 0;

/**
 * This function tells us if the string in question is a 64 bit unsigned integer
 * @param {string} data - The string which we are trying to determine if it's a 64 bit
 * unsigned integer.
 * @returns {Boolean} - Returns if the string in questions is a 64 bit unsigned
 * integer or not.
 */
const is64BitUnsignedInteger = (data) =>
	Number.isInteger(Number(data)) &&
	Number(data) <= Math.pow(2, 64) - 1 &&
	Number(data) >= 0;

module.exports = Validation;
