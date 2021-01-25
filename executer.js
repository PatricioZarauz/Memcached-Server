const Memcached = require("./memcached");

class Executer {
	/**
	 * This function allows us to execute the correct memcached function depending on the
	 * parameters saved.
	 * @param {[string | Number | Boolean]} parameters - The paramaters that will be given
	 * to the corresponding function of the memcached.
	 * @param {Number} casID - The number that uniquely identifies the client
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

	static memcachedGet = (keys, { userId }) => {
		return Memcached.get(keys, userId);
	};

	static memcachedGets = (keys, { userId }) => {
		return Memcached.gets(keys, userId);
	};
}

module.exports = Executer;
