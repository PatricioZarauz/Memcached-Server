const Message = require("./message");

class Validation {
	static casVerification = ({ casUnique }) => {
		return is64BitUnsignedInteger(casUnique);
	};

	static basicVerification = ({ flags, expTime, bytes, noReply }) => {
		return (
			is16BitUnsignedInteger(flags) &&
			Number.isInteger(Number(expTime)) &&
			is8BitUnsignedInteger(bytes) &&
			(noReply === "noreply" || noReply == null)
		);
	};

	static verifyAmmountOfParameters = (parameters, input) => {
		return areTheSameSize(parameters, input)
			? null
			: parameters.length < input.length
			? Message.fewArgumentsError
			: Message.manyArgumentsError;
	};

	/**
	 * This function tells us if the Bytes argument and DataBlock size matches.
	 * @param {Number} bytes - Byte size of the datablock.
	 * @param {string} dataBlock - Datablock sent by the client.
	 * @returns {Boolean} - Arguments and command name of the memcached function to execute.
	 */
	static bytesAndDataBlockMatches = (bytes, dataBlock) => {
		return bytes === dataBlock.length;
	};
}
/**
 * This function
 * @param {[string]} parameters -
 * @param {[string]} input -
 * @returns {Boolean} -
 */
const areTheSameSize = (parameters, input) => {
	const [, ...init] = [...parameters].reverse();
	return parameters.length === input.length || init.length === input.length;
};

/**
 * This function tells us if the string in question is a 16 bit unsigned integer
 * @param {string} data - String which we are trying to determining if it's a 16 bit
 * unsigned integer.
 * @returns {Boolean} - The result of whether the string in questions is a 16 bit unsigned
 * integer or not.
 */
const is16BitUnsignedInteger = (data) => {
	return (
		Number.isInteger(Number(data)) &&
		Number(data) <= Math.pow(2, 16) - 1 &&
		Number(data) >= 0
	);
};

/**
 * This function tells us if the string in question is a 8 bit unsigned integer
 * @param {string} data - String which we are trying to determine if it's a 8 bit
 * unsigned integer.
 * @returns {Boolean} - Returns if the string in questions is a 8 bit unsigned
 * integer or not.
 */
const is8BitUnsignedInteger = (data) => {
	return (
		Number.isInteger(Number(data)) &&
		Number(data) <= Math.pow(2, 8) - 1 &&
		Number(data) >= 0
	);
};

/**
 * This function tells us if the string in question is a 64 bit unsigned integer
 * @param {string} data - The string which we are trying to determine if it's a 64 bit
 * unsigned integer.
 * @returns {Boolean} - Returns if the string in questions is a 64 bit unsigned
 * integer or not.
 */
const is64BitUnsignedInteger = (data) => {
	return (
		Number.isInteger(Number(data)) &&
		Number(data) <= Math.pow(2, 64) - 1 &&
		Number(data) >= 0
	);
};

module.exports = Validation;
