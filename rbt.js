const NodeRBT = require("./nodeRBT");

class RBT {
	/**
	 * RBT (Red Black Tree) is the structure responsible of storing and managing the users that last
	 * visited or modified a memcached node.
	 * @param {NodeRBT} root - Root node of the Red Black Tree.
	 * @param {Number} size - Current size of the Red Black Tree.
	 */
	constructor() {
		this.root = null;
		this.size = 0;
	}

	/**
	 * This function left rotates the given node.
	 * @param {NodeRBT} root - The trees's root node.
	 * @param {NodeRBT} node - The node which will be inserted to the tree.
	 */
	leftRotate(root, node) {
		let nodeRight = node.right;

		node.right = nodeRight.left;

		if (node.right != null) {
			node.right.parent = node;
		}

		nodeRight.parent = node.parent;

		if (node.parent === null) {
			root = nodeRight;
		} else if (node === node.parent.left) {
			node.parent.left = nodeRight;
		} else {
			node.parent.right = nodeRight;
		}

		nodeRight.left = node;
		node.parent = nodeRight;
	}

	/**
	 * This function right rotates the given node.
	 * @param {NodeRBT} root - Trees's root node.
	 * @param {NodeRBT} node - Node which will be inserted to the tree.
	 */
	rightRotate(root, node) {
		let nodeLeft = node.left;
		node.left = nodeLeft.right;

		if (node.left != null) {
			node.left.parent = node;
		}

		nodeLeft.parent = node.parent;

		if (node.parent === null) {
			root = nodeLeft;
		} else if (node === node.parent.left) {
			node.parent.left = nodeLeft;
		} else {
			node.parent.right = nodeLeft;
		}

		nodeLeft.right = node;
		node.parent = nodeLeft;
	}

	/**
	 * This function fixes the Red Black Tree violations caused by the Binary Search Tree Insertion
	 * @param {NodeRBT} root - Trees's root node.
	 * @param {NodeRBT} newNode - Node which was added to the tree and caused the RBT
	 * violations.
	 * @returns {NodeRBT} - Returns the tree's root node, with the updated tree.
	 */
	fixViolation(root, newNode) {
		while (
			newNode.key != root.key &&
			newNode.colour &&
			newNode.parent.colour
		) {
			let newNodeParent = newNode.parent;
			let newNodeGrandParent = newNode.parent.parent;

			//Case A: The parent of the newNode is the left child of newNodeGrandParent
			if (newNodeParent == newNodeGrandParent.left) {
				let newNodeUncle = newNodeGrandParent.right;

				//First Case: The newNodeUncle is also red.
				//It only requires recolouring.
				if (newNodeUncle != null && newNodeUncle.colour) {
					newNodeGrandParent.colour = true;
					newNodeParent.colour = false;
					newNodeUncle.colour = false;
					newNode = newNodeGrandParent;
				} else {
					//Second Case: The newNode is the right child of its parent.
					//A left rotation is required.
					if (newNode == newNodeParent.right) {
						this.leftRotate(newNode, newNodeParent);
						newNode = newNodeParent;
						newNodeParent = newNode.parent;
					}

					//Third Case: The newNode is the left child of its parent.
					//A right rotation is required.
					this.rightRotate(root, newNodeGrandParent);
					this.swapColours(newNodeParent, newNodeGrandParent);
					newNode = newNodeParent;
				}
			}

			//Case B: The parent of the newNode is the right child of the newNodeGrandParent
			else {
				let newNodeUncle = newNodeGrandParent.left;

				//First Case: The newNodeUncle is also red.
				//It only requires recolouring.
				if (newNodeUncle != null && newNodeUncle.colour) {
					newNodeGrandParent.colour = true;
					newNodeParent.colour = false;
					newNodeUncle.colour = false;
					newNode = newNodeGrandParent;
				} else {
					//Second Case: newNode is the left child of its parent.
					//A right rotation is required
					if (newNode == newNodeParent.left) {
						this.rightRotate(root, newNodeParent);
						newNode = newNodeParent;
						newNodeParent = newNode.parent;
					}

					//Third Case: The newNode is the right child of its parent.
					//A left rotation is required.
					this.leftRotate(root, newNodeGrandParent);
					this.swapColours(newNodeParent, newNodeGrandParent);
					newNode = newNodeParent;
				}
			}
		}
		let temp = root;
		while (temp.parent != null) {
			temp = temp.parent;
		}
		root = temp;
		root.colour = false;
		return root;
	}

	/**
	 * This function allows us to swap the colours of nodes a and b
	 * @param {NodeRBT} a - It's node colour will be swaped with b's
	 * @param {NodeRBT} b - It's node colour will be swaped with a's
	 */
	swapColours(a, b) {
		const aux = a.colour;
		a.colour = b.colour;
		b.colour = aux;
	}

	/**
	 * This function adds a NodeRBT to the RBT as if it was a Binary Search Tree, using the
	 * given key.
	 * @param {NodeRBT} root - Trees's root node.
	 * @param {NodeRBT} newNode - Node which will be inserted to the tree.
	 * @returns {NodeRBT} - Returns the tree's new root node.
	 */
	addBST(root, newNode) {
		//If the tree is empty, return the newNode
		if (root === null) {
			this.size++;
			return newNode;
		}

		//Otherwise recur down the tree.
		if (newNode.key < root.key) {
			root.left = this.addBST(root.left, newNode);
			root.left.parent = root;
		} else if (newNode.key > root.key) {
			root.right = this.addBST(root.right, newNode);
			root.right.parent = root;
		}

		//Returns the unchanged node
		return root;
	}

	/**
	 * This function adds a node, with the given key and value, to the tree.
	 * @param {Number} key - Key of the node to be added
	 * @param {Boolean} value - Value of the node to be added
	 */
	add(key, value) {
		const node = new NodeRBT(key, value);

		this.root = this.addBST(this.root, node);

		this.root = this.fixViolation(this.root, node);
	}

	/**
	 * This functions calls the levelOrderHelper function on the RBT root node.
	 * @returns {[string]} - Returns the RBT's level order traversal in a string array.
	 */
	levelOrder() {
		return this.levelOrderHelper(this.root);
	}

	/**
	 * This function creates a level order traversal of the tree, starting at the given root.
	 * @param {NodeRBT} root - Root of the tree which the level order traversal will
	 * be implemented.
	 * @returns {[string]} - Returns the tree's level order traversal in a string array.
	 */
	levelOrderHelper(root) {
		let result = [];
		if (root === null) {
			return result;
		}

		let q = [];
		q.push(root);

		while (q.length > 0) {
			//Removes the first element of the queue (q)
			let temp = q.shift();
			result.push(temp.key);

			if (temp.left != null) {
				q.push(temp.left);
			}

			if (temp.right != null) {
				q.push(temp.right);
			}
		}
		return result;
	}

	/**
	 * This function determines if the tree is empty
	 * @returns {Boolean} - Returns true if the tree is empty; otherwise, returns false
	 */ 0;
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
	 * @param {Number} key - Key of the node in question
	 * @returns {NodeRBT} - Returns the node which was saved under the given key, if it's
	 * contained in the tree; otherwise, returns null
	 */
	contains(key) {
		return this.#getNode(this.root, key);
	}

	/**
	 * This function returns the node saved under the given key.
	 * Please note, that this is a recursive private function.
	 * @param {NodeRBT} node - Current node of the tree
	 * @param {Number} key - Key of the node that's being looked for
	 * @returns {NodeRBT} - Returns the node which was saved under the given key, if it's
	 * contained in the tree; otherwise, returns null
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
