const NodeRBT = require("./nodeRBT");
const RBT = require("./rbt");

class Node {
	/**
	 * Node is the class being stored as the value in the memcached cache.
	 * @param {string} key - The key of the node.
	 * @param {Number} flags - The flags of the node.
	 * @param {Number} exptime - The expiration time of the node.
	 * @param {Number} bytes - The bytes of the node.
	 * @param {string} datablock - The datablock of the node.
	 * @param {Number} timeout - The timeout id of the node.
	 * @param {Number} user - The number that identifies the user that created the node.
	 * @param {NodeRBT} users - A tree of users that visited or last modified the node.
	 * @param {Node} next - The following node, inorder to form an LRU.
	 * @param {Node} prev - The previous node, inorder to form an LRU.
	 */
	constructor(
		key,
		flags,
		exptime,
		bytes,
		datablock,
		user,
		next = null,
		prev = null
	) {
		this.key = key;
		this.flags = flags;
		this.exptime = exptime;
		this.bytes = bytes;
		this.datablock = datablock;
		this.timeOut = null;

		this.users = new RBT();
		this.users.add(user, true);

		this.next = next;
		this.prev = prev;
	}
}

module.exports = Node;
