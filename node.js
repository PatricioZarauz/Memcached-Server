const NodeRBT = require("./nodeRBT");
const RBT = require("./rbt");

class Node {
	/**
	 * Node is the class being stored as the value in the memcached cache.
	 * @param {string} key - Key of the node.
	 * @param {Number} flags - Flags of the node.
	 * @param {Number} exptime - Expiration time of the node.
	 * @param {Number} bytes - Bytes of the node.
	 * @param {string} datablock - Datablock of the node.
	 * @param {Number} timeout - Timeout id of the node.
	 * @param {Number} casId - Number that identifies the user that created the node.
	 * @param {NodeRBT} casIds - Tree of casIds of users that visited or last modified the node.
	 * @param {Node} next - The following node, inorder to form an LRU.
	 * @param {Node} prev - The previous node, inorder to form an LRU.
	 */
	constructor(
		key,
		flags,
		exptime,
		bytes,
		datablock,
		casId,
		next = null,
		prev = null
	) {
		this.key = key;
		this.flags = flags;
		this.exptime = exptime;
		this.bytes = bytes;
		this.datablock = datablock;
		this.timeOut = null;

		this.casIds = new RBT();
		this.casIds.add(casId, true);

		this.next = next;
		this.prev = prev;
	}
}

module.exports = Node;
