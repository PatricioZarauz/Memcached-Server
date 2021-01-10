const NodeRBT = require("./nodeRBT");

/**
 * RBT (Red Black Tree) is the structure responsable of storing and managing the users that last
 * visited or modified a memcached node.
 * @param {NodeRBT} RBT.root - The root node of the Red Black Tree.
 * @param {Number} RBT.size - The current size of the Red Black Tree.
 */
class RBT {
	constructor() {
		this.root = null;
		this.size = 0;
	}

	/**
	 * This function determines wheter a NodeRBT is red or not.
	 * @param {NodeRBT} node - The node whose colour is in question.
	 * @returns {Boolean} - Returns true if the node is red, otherwise returns false.
	 */
	isRed(node) {
		if (node != null) {
			return node.colour;
		} else {
			return false;
		}
	}

	/**
	 * This function left rotates the given node.
	 * @param {NodeRBT} node - The node which a left rotation will be applied.
	 * @returns {NodeRBT} - Returns the node to the right of the given node.
	 */
	leftRotate(node) {
		let tmpNode = node.right;
		node.right = tmpNode.left;
		tmpNode.left = node;
		tmpNode.colour = node.colour;
		node.colour = true;
		return tmpNode;
	}

	/**
	 * This function right rotates the given node.
	 * @param {NodeRBT} node - The node which a right rotation will be applied.
	 * @returns {NodeRBT} - Returns the node to the left of the given node.
	 */
	rightRotate(node) {
		let tmpNode = node.left;
		node.left = tmpNode.right;
		tmpNode.right = node;
		tmpNode.colour = node.colour;
		node.colour = true;
		return tmpNode;
	}

	/**
	 * This function flips the colours of the given node and it's 2 children. After this funciton,
	 * the given node will be red and it's children black.
	 * @param {NodeRBT} node - The node whose colours will be flipped.
	 */
	flipColours(node) {
		node.colour = true;
		node.left = false;
		node.right = false;
	}

	/**
	 * This function adds a node, with the given key and value, to the tree.
	 * @param {Number} key - The key of the node to be added
	 * @param {Boolean} value - The value of the node to be added
	 */
	add(key, value) {
		this.root = this.addRoot(this.root, key, value);
		this.root.colour = false;
	}

	/**
	 * This function adds the root node of the tree.
	 * Please note, that this a recursive function.
	 * @param {NodeRBT} node - The current root node of the tree
	 * @param {Number} key - The key of the root node to be added
	 * @param {Boolean} value - The value of the root node to be added
	 */
	addRoot(node, key, value) {
		if (node === null) {
			this.size++;
			return new NodeRBT(key, value);
		}

		if (key < node.key) {
			node.left = this.addRoot(node.left, key, value);
		} else if (key > node.key) {
			node.right = this.addRoot(node.right, key, value);
		} else {
			node.value = value;
		}

		if (this.isRed(node.right) && !this.isRed(node.left)) {
			node = this.leftRotate(node);
		}
		if (this.isRed(node.left) && this.isRed(node.left.left)) {
			node = this.rightRotate(node);
		}
		if (this.isRed(node.left) && this.isRed(node.right)) {
			this.flipColours(node);
		}
		return node;
	}

	/**
	 * This function determines if the tree is empty
	 * @returns {Boolean} - Returns true if the tree is empty, otherwise returns false
	 */
	isEmpty() {
		return this.size === 0;
	}

	/**
	 * This function determines the size of the tree
	 * @returns {Number} - Returns the size of the tree
	 */
	getSize() {
		return this.size;
	}

	/**
	 * This function determines if a key is contained in the tree.
	 * @param {Number} key - The key of the node in question
	 * @returns {NodeRBT} - Returns the node which was saved under the given key, if it's
	 * contained in the tree, otherwise returns null
	 */
	contains(key) {
		return this.#getNode(this.root, key);
	}

	/**
	 * This function returns the node saved under the given key.
	 * Please note, that this a private function which is recursive.
	 * @param {NodeRBT} node - The current node of the tree
	 * @param {Number} key - The key of the node that's being looked for
	 * @returns {NodeRBT} - Returns the node which was saved under the given key, if it's
	 * contained in the tree, otherwise returns null
	 */
	#getNode(node, key) {
		if (node === null || key === node.key) {
			return node;
		} else if (key > node.key) {
			return this.#getNode(node.right, key);
		} else {
			return this.#getNode(node.left, key);
		}
	}

	/**
	 * This function empties the tree, by removing the root node and reseting the tree size
	 */
	flush() {
		this.root = null;
		this.size = 0;
	}
}

module.exports = RBT;
