class NodeRBT {
	/**
	 * NodeRBT is the class being stored in the RBT.
	 * @param {Number} key - Key of the node.
	 * @param {Boolean} value - Value of the node.
	 * @param {Boolean} colour - Colour of the node.
	 *                                      Black = false
	 *                                      Red   = true
	 * @param {NodeRBT} parent - Parent of the node.
	 * @param {NodeRBT} left - Right child of the node.
	 * @param {NodeRBT} right - Left child of the node.
	 */
	constructor(key, value) {
		this.key = key;
		this.value = value;
		/**
		 * @type {NodeRBT} - Parent of the node.
		 */
		this.parent = null;
		/**
		 * @type {NodeRBT} - Left child of the node.
		 */
		this.left = null;
		/**
		 * @type {NodeRBT} - Right child of the node.
		 */
		this.right = null;
		this.colour = true;
	}
}

module.exports = NodeRBT;
