const Message = require("./message");
const Node = require("./node");

/**
 * The structures used to the represent the Memcached were a Least Recently Used (LRU) Map for
 * storing the items in the cache and a Red Black Tree for storing the items casIds.
 * A LRU Map was used because in the modern javascript (which node.js is based on) the Map allows
 * us to get O(1) for the insert, delete and search operations. Combining it with an LRU it
 * enables us to recreate a memcached since when the cache it's full, it needs to remove the
 * least recently used item.
 * A Red Black Tree structure was used for storing the casIds since it allows us to have O(log n)
 * for the insert and search operations (in the worst case) as well as being able to flush (empty)
 * the tree in O(1) which was crucial, since the flush operation is used frecuently. The AVL tree
 * structure was dismissed since it has a higher cost for inserting a node, given that it requires
 * more rotations to balance out the tree.
 */
class Memcached {
	/**
	 * Memcached is the class responsable of storing all the Nodes.
	 */

	/**
	 * @type {Number} The limit of Nodes to be stored, by default the limit is 100 items.
	 */
	static limit = 100;

	/**
	 * @type {Node} Last used node.
	 */
	static head = null;

	/**
	 * @type {Node} Least used node.
	 */
	static tail = null;

	/**
	 * @type {Map<String, Node>} It is where the Nodes are stored.
	 */
	static cache = new Map();

	/**
	 * This function allows us to update or add a Node to the memcached.
	 * @param {string} key - Key of the node to set to the memcached.
	 * @param {Number} flags - Flags of the node to set to the memcached.
	 * @param {Number} exptime - Expiration time of the node to set to the memcached, this is
	 * measured in seconds.
	 * @param {Number} bytes - Byte of the node to set to the memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Data of the node that's being set to memcached.
	 * @param {Number} casId - Number that identifies the user that's setting the node.
	 * @returns {string} - Reply message after setting the node.
	 */
	static set = (
		key,
		flags,
		exptime,
		bytes,
		datablock,
		casId,
		noreply = false
	) => {
		if (
			Memcached.add(
				key,
				flags,
				exptime,
				bytes,
				datablock,
				casId,
				false
			) === Message.stored
		)
			return noreply ? null : Message.stored;
		else
			return Memcached.replace(
				key,
				flags,
				exptime,
				bytes,
				datablock,
				casId,
				noreply
			);
	};

	/**
	 * This function allows to add a Node to the memcached that is not currently in the
	 * memcached.
	 * @param {string} key - Key of the node to add to the memcached.
	 * @param {Number} flags - Flags of the node to add to the memcached.
	 * @param {Number} exptime - Expiration time of the node to add to the memcached, this is
	 * measured in seconds.
	 * @param {Number} bytes - Amount of bytes of the datablock of the node to add to the
	 * memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Data of the node that's beining set to memcached.
	 * @param {Number} casId - Number that identifies the user that's adding the node.
	 * @returns {string} - Reply message after adding the node.
	 */
	static add = (
		key,
		flags,
		exptime,
		bytes,
		datablock,
		casId,
		noreply = false
	) => {
		if (Memcached.cache.get(key) != null || exptime < 0)
			return noreply ? null : Message.notStored;
		else {
			ensureLimit();

			if (Memcached.head != null) {
				const node = new Node(
					key,
					flags,
					exptime,
					bytes,
					datablock,
					casId,
					Memcached.head
				);
				Memcached.head.prev = node;
				Memcached.head = node;
			} else
				Memcached.head = Memcached.tail = new Node(
					key,
					flags,
					exptime,
					bytes,
					datablock,
					casId
				);

			Memcached.cache.set(Memcached.head.key, Memcached.head);

			if (Memcached.head.exptime > 0)
				Memcached.head.timeOut = setTimeout(
					this.deleteNode,
					exptime * 1000,
					key
				);

			return noreply ? null : Message.stored;
		}
	};

	/**
	 * This function allows us to replace a Node of the memcached.
	 * @param {string} key - Key of the node to replace to the memcached.
	 * @param {Number} flags - Flags of the node to replace to the memcached.
	 * @param {Number} exptime - Expiration time of the node to update of the memcached, this
	 * is measured in seconds.
	 * @param {Number} bytes - Amount of bytes of the datablock of the node to replace in the
	 * memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Data of the node that's beining replaced at the memcached.
	 * @param {Number} casId - Number that identifies the user that's replacing the node.
	 * @returns {string} - Reply message after replacing the node.
	 */
	static replace = (
		key,
		flags,
		exptime,
		bytes,
		datablock,
		casId,
		noreply = false
	) => {
		if (Memcached.updateNode(key, flags, exptime, bytes, datablock, casId))
			return noreply ? null : Message.stored;
		else return noreply ? null : Message.notStored;
	};

	/**
	 * This function allows us to concatenate, at the end of the datablock of the desired node
	 * (that already exists in the memcached) the datablock desired.
	 * @param {string} key - Key of the node to concatenate the datablock to.
	 * @param {Number} flags - Flags of the node to concatenate the datablock to.
	 * @param {Number} exptime - New expiration time of the node having it's datablock
	 * concatenated, this is measured in seconds.
	 * @param {Number} bytes - Amount of bytes of the new datablock of the node to append
	 * to the memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Datablock of the node to contatenate at the end of the
	 * original datablock stored in the memcached.
	 * @param {Number} casId - Number that identifies the user that's appending the node.
	 * @returns {string} - Reply message after appending the datablock to the node.
	 */
	static append = (
		key,
		flags,
		exptime,
		bytes,
		datablock,
		casId,
		noreply = false
	) => {
		if (
			Memcached.updateNode(
				key,
				flags,
				exptime,
				bytes,
				datablock,
				casId,
				"append"
			)
		)
			return noreply ? null : Message.stored;
		else return noreply ? null : Message.notStored;
	};

	/**
	 * This function allows us to concatenate at the begining of the datablock of the desired node
	 * (that already exists in the memcached) the datablock desired.
	 * @param {string} key - Key of the node to concatenate the datablock to.
	 * @param {Number} flags - Flags of the node to concatenate the datablock to.
	 * @param {Number} exptime - New expiration time of the node having it's datablock
	 * concatenated, this is measured in seconds.
	 * @param {Number} bytes - Amount of bytes of the new datablock of the node to prepend to
	 * the memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Datablock of the node to contatenate at the begining of
	 * the original datablock stored in the memcached.
	 * @param {Number} casId - Number that identifies the user that's prepending the node.
	 * @returns {string} - Reply message after prepending the datablock to the node.
	 */
	static prepend = (
		key,
		flags,
		exptime,
		bytes,
		datablock,
		casId,
		noreply = false
	) => {
		if (
			Memcached.updateNode(
				key,
				flags,
				exptime,
				bytes,
				datablock,
				casId,
				"prepend"
			)
		)
			return noreply ? null : Message.stored;
		else return noreply ? null : Message.notStored;
	};

	/**
	 * This function allows us to set a Node only if it exists in the memcached and it wasn't
	 * updated since the current casId last added, updated or fetched it.
	 * @param {string} key - Key of the node to update in the  memcached.
	 * @param {Number} flags - Flags of the node to update in the memcached.
	 * @param {Number} exptime - Expiration time of the node to update in the memcached, this
	 * is measured in seconds.
	 * @param {Number} bytes - Amount of bytes of the datablock of the node to update in the
	 * memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Data of the node that's beining updated in the memcached.
	 * @param {Number} casId - Number that identifies the user that's updating the node.
	 * @returns {string} - Reply message after replacing the node.
	 */
	static cas = (
		key,
		flags,
		exptime,
		bytes,
		datablock,
		casId,
		noreply = false
	) => {
		const node = Memcached.cache.get(key);
		if (node != null) {
			if (node.casIds.contains(casId) != null)
				return Memcached.set(
					key,
					flags,
					exptime,
					bytes,
					datablock,
					casId,
					noreply
				);
			else return noreply ? null : Message.exists;
		} else return noreply ? null : Message.notFound;
	};

	/**
	 * This function allows us to retrieve the value of one or more keys stored in the memcached.
	 * @param {[string]} keys - Key(s) of the node(s) to retrieve from memcached.
	 * @param {Number} casId - Number that identifies the user that's trying to read the node.
	 * @returns {[string]} - Value(s) of the key(s) of retrieved node(s).
	 */
	static get = (keys, casId) => getValuesOfKeys(keys, casId, false);

	/**
	 * This function allows us to retrieve the value, with it's casId, of one or more keys stored
	 * in the memcached.
	 * @param {[string]} keys - Key(s) of the node(s) to retrieve of memcached.
	 * @param {Number} casId - Number that identifies the user that's trying to read the node.
	 * @returns {[string]} - Value(s) of the key(s) of retrieved node(s), with their
	 * respective casId.
	 */
	static gets = (keys, casId) => getValuesOfKeys(keys, casId, true);

	/**
	 * This function sets the initial size of the memcached server.
	 * @param {Number} size - The size of the memcached server
	 */
	static start = (size = 100) => (Memcached.limit = size);

	/**
	 * Deletes the Node with the key given from the memcached.
	 * @param {Number} key - Key of the node that will be deleted.
	 * @returns {Boolean} - Returns if the node was deleted or not.
	 */
	static deleteNode = (key) => {
		const node = Memcached.cache.get(key);
		if (node != null) {
			node.prev != null
				? (node.prev.next = node.next)
				: (Memcached.head = node.next);

			node.next != null
				? (node.next.prev = node.prev)
				: (Memcached.tail = node.prev);

			if (node.timeOut) clearTimeout(node.timeOut);

			node.casIds.flush();
			Memcached.cache.delete(key);
			return true;
		} else return false;
	};

	/**
	 * This function empties the memcached
	 */
	static flush = () => {
		Memcached.head = Memcached.tail = null;
		Memcached.cache.clear();
	};

	/**
	 * Node which is passed through the arguments will be updated.
	 * @param {string} key - Key of the node that will be updated.
	 * @param {Number} flags - Updated flags of the node.
	 * @param {Number} exptime - Updated expiration time of the node.
	 * @param {Number} bytes - Updated bytes of the node.
	 * @param {string} datablock - Updated datablock of the node.
	 * @param {string} apOrPrePend - The string tells us if we need to append, prepend or if the
	 * data just needs to be updated.
	 * @param {Number} casId - Number that identifies the user that's updating the node.
	 * @returns {Boolean} - It tells us if the node of the given key was updated or not.
	 */
	static updateNode = (
		key,
		flags,
		exptime,
		bytes,
		datablock,
		casId,
		apOrPrePend = null
	) => {
		const node = Memcached.cache.get(key);
		if (node != null) {
			node.flags = flags;

			determineHowToAssignDataBlockAndBytes(
				apOrPrePend,
				node,
				datablock,
				bytes
			);

			node.exptime = exptime;

			reorganizeCache(node);

			node.casIds.flush();
			node.casIds.add(casId, true);

			Memcached.cache.set(node.key, node);

			if (node.exptime > 0)
				node.timeOut = setTimeout(this.deleteNode, exptime * 1000, key);
			else if (node.exptime === 0) {
				if (node.timeOut != null) clearTimeout(node.timeOut);
			} else {
				deleteNode(key);
				return false;
			}
			return true;
		} else return false;
	};
}

/**
 * This function allows us to retrieve the value of one or more keys stored in the memcached.
 * @param {[string]} keys - Key(s) of the node(s) to retrieve from memcached.
 * @param {Number} casId - Number that identifies the user that's trying to read the node.
 * @param {Boolean} showCas - Determines wheter the casId will be included in the returning string
 * or not.
 * @returns {[string]} - Value(s) of the key(s) of retrieved node(s).
 */
const getValuesOfKeys = (keys, casId, showCas) => {
	let results = [];
	keys.forEach((key) => {
		let node = Memcached.cache.get(key);
		if (node != null) {
			reorganizeCache(node);
			node.casIds.add(casId, true);
			Memcached.cache.set(node.key, node);
			showCas
				? results.push(
						`VALUE ${node.key} ${node.flags} ${node.bytes} ${casId}\r\n`
				  )
				: results.push(
						`VALUE ${node.key} ${node.flags} ${node.bytes}\r\n`
				  );
			results.push(`${node.datablock}\r\n`);
		}
	});
	results.push(Message.end);
	return results;
};

/**
 * This function determines how to assign dataBlock and bytes of the node depending of the option.
 * @param {string} option - append, prepend or replace the datablock
 * @param {Node} node - The node that will we updated.
 * @param {string} datablock - The new data that will be append, prepend or replaced.
 * @param {Number} bytes - The byte size of the new datablock.
 */
const determineHowToAssignDataBlockAndBytes = (
	option,
	node,
	datablock,
	bytes
) => {
	const itsAppend = (node, datablock, bytes) => {
		node.datablock = node.datablock + datablock;
		node.bytes = node.bytes + bytes;
	};
	const itsPrepend = (node, datablock, bytes) => {
		node.datablock = datablock + node.datablock;
		node.bytes = bytes + node.bytes;
	};
	const dataBlockAndBytesAreReAssigned = (node, datablock, bytes) => {
		node.datablock = datablock;
		node.bytes = bytes;
	};

	const options = {
		append: itsAppend,
		prepend: itsPrepend,
		default: dataBlockAndBytesAreReAssigned,
	};
	return (options[option] || options.default)(node, datablock, bytes);
};

/**
 * This function allows us to reorganize the cache of the memcached, by moving the desired node
 * to the head of the LRU.
 * @param {Node} node - Key(s) of the node(s) to retrieve from memcached.
 */
const reorganizeCache = (node) => {
	if (node.prev != null) node.prev.next = node.next;

	if (node.next != null) {
		node.next.prev = node.prev;
		node.next = Memcached.head;
	}
	node.prev = null;
	Memcached.head = node;
};

/**
 * This function makes sure that the limit of the memcached is being respected; if it's about
 * to be passed, it deletes the least used node of the memcached.
 */
const ensureLimit = () => {
	if (Memcached.cache.size === Memcached.limit)
		deleteNode(Memcached.tail.key);
};

module.exports = Memcached;
