const Client = require("./client");
const Memcached = require("./memcached");

class Executer {
	/**
	 * This function allows us to execute the correct memcached function depending on the
	 * clients command.
	 * @param {Client} client - The client where the parameters of the function to execute are stored.
	 * @returns {string} The memcached response of the selected function.
	 */
	static memcachedFunction = ({
		command,
		key,
		flags,
		expTime,
		bytes,
		dataBlock,
		userId,
		noReply,
		casUnique,
	}) => {
		const itsSet = () =>
			Memcached.set(
				key,
				flags,
				expTime,
				bytes,
				dataBlock,
				userId,
				noReply
			);
		const itsAdd = () =>
			Memcached.add(
				key,
				flags,
				expTime,
				bytes,
				dataBlock,
				userId,
				noReply
			);
		const itsReplace = () =>
			Memcached.replace(
				key,
				flags,
				expTime,
				bytes,
				dataBlock,
				userId,
				noReply
			);
		const itsAppend = () =>
			Memcached.append(
				key,
				flags,
				expTime,
				bytes,
				dataBlock,
				userId,
				noReply
			);
		const itsPrepend = () =>
			Memcached.prepend(
				key,
				flags,
				expTime,
				bytes,
				dataBlock,
				userId,
				noReply
			);
		const itsCas = () =>
			Memcached.cas(
				key,
				flags,
				expTime,
				bytes,
				dataBlock,
				casUnique,
				noReply
			);

		const commands = {
			set: itsSet,
			add: itsAdd,
			replace: itsReplace,
			append: itsAppend,
			prepend: itsPrepend,
			cas: itsCas,
		};
		return commands[command]();
	};

	/**
	 * This function allows us to execute the memcached get function.
	 * @param {[string]} keys - The key(s) that want to be retrieved.
	 * @param {Client} client - The client where its userId is stored.
	 * @returns {string} The memcached response of the get function.
	 */
	static memcachedGet = (keys, { userId }) => Memcached.get(keys, userId);

	/**
	 * This function allows us to execute the memcached gets function.
	 * @param {[string]} keys - The key(s) that want to be retrieved.
	 * @param {Client} client - The client where its userId is stored.
	 * @returns {string} The memcached response of the gets function.
	 */
	static memcachedGets = (keys, { userId }) => Memcached.gets(keys, userId);
}

module.exports = Executer;
