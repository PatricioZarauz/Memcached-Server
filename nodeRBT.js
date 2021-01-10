/**
 * NodeRBT is the class being stored in the RBT.
 * @param {Number} NodeRBT.key - The key of the node.
 * @param {Boolean} NodeRBT.value - The value of the node.
 * @param {NodeRBT} NodeRBT.left - The right child of the node.
 * @param {NodeRBT} NodeRBT.right - The left child of the node.
 * @param {Boolean} NodeRBT.colour - The colour of the node.
 *                                      Black = false
 *                                      Red   = true
 */
class NodeRBT {
	constructor(key, value) {
		this.key = key;
		this.value = value;
		this.left = null;
		this.right = null;
		this.colour = true;
	}
}

module.exports = NodeRBT;
