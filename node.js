const NodeRBT = require("./nodeRBT");
const RBT = require("./rbt");
/**
 * Node is the class being stored as the value in the memcached cache.
 * @param {string} Node.key - The key of the node.
 * @param {string} Node.flags - The flags of the node.
 * @param {string} Node.exptime - The expiration time of the node.
 * @param {string} Node.bytes - The bytes of the node.
 * @param {string} Node.datablock - The datablock of the node.
 * @param {Number} Node.timeout - The timeout id of the node.
 * @param {nodeRBT} Node.users - A tree of users that visited or last modified the node.
 * @param {Node} Node.next - The following node, inorder to form an LRU.
 * @param {Node} Node.prev - The previous node, inorder to form an LRU.
 */
class Node {
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
