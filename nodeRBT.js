class NodeRBT {
	/**
	 * NodeRBT is the class being stored in the RBT.
	 * @param {Number} key - The key of the node.
	 * @param {Boolean} value - The value of the node.
	 * @param {Boolean} colour - The colour of the node.
	 *                                      Black = false
	 *                                      Red   = true
	 * @param {NodeRBT} left - The right child of the node.
	 * @param {NodeRBT} right - The left child of the node.
	 */
	constructor(key, value) {
		this.key = key;
		this.value = value;
		/**
		 * @type {NodeRBT} - The left child of the node.
		 */
		this.left = null;
		/**
		 * @type {NodeRBT} - The right child of the node.
		 */
		this.right = null;
		this.colour = true;
	}
}

module.exports = NodeRBT;
