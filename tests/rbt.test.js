const NodeRBT = require("../nodeRBT");
const RBT = require("../rbt");

test("Add 3 nodes to an empty tree in ascending order", () => {
	const rbt = new RBT();

	rbt.add(1, true);
	rbt.add(2, true);
	rbt.add(3, true);

	expect(rbt.levelOrder()).toEqual([2, 1, 3]);

	expect(rbt.getSize()).toEqual(3);
});

test("Add 3 nodes to an empty tree in descending order", () => {
	const rbt = new RBT();

	rbt.add(3, true);
	rbt.add(2, true);
	rbt.add(1, true);

	expect(rbt.levelOrder()).toEqual([2, 1, 3]);

	expect(rbt.getSize()).toEqual(3);
});

test(
	"Add the first 3 nodes to an empty tree in descending order and add one that's only larger " +
		"than the smallest node",
	() => {
		const rbt = new RBT();

		rbt.add(30, true);
		rbt.add(20, true);
		rbt.add(10, true);
		rbt.add(15, true);

		expect(rbt.levelOrder()).toEqual([20, 10, 30, 15]);

		expect(rbt.contains(10).colour).toEqual(false);
		expect(rbt.contains(30).colour).toEqual(false);

		expect(rbt.getSize()).toEqual(4);
	}
);

test("Add a root, a left child and a right child to the left child.", () => {
	const rbt = new RBT();

	rbt.add(20, true);
	rbt.add(10, true);
	rbt.add(15, true);

	expect(rbt.levelOrder()).toEqual([15, 10, 20]);

	expect(rbt.contains(10).colour).toEqual(true);
	expect(rbt.contains(20).colour).toEqual(true);
	expect(rbt.contains(15).colour).toEqual(false);

	expect(rbt.getSize()).toEqual(3);
});

test("Add a root, a right child and a left child to the right child.", () => {
	const rbt = new RBT();

	rbt.add(20, true);
	rbt.add(30, true);
	rbt.add(25, true);

	expect(rbt.levelOrder()).toEqual([25, 20, 30]);

	expect(rbt.contains(30).colour).toEqual(true);
	expect(rbt.contains(20).colour).toEqual(true);
	expect(rbt.contains(25).colour).toEqual(false);

	expect(rbt.getSize()).toEqual(3);
});

test("In a balnaced 3 node tree, a new node is added", () => {
	const rbt = new RBT();

	rbt.add(20, true);
	rbt.add(30, true);
	rbt.add(25, true);

	expect(rbt.levelOrder()).toEqual([25, 20, 30]);

	expect(rbt.contains(30).colour).toEqual(true);
	expect(rbt.contains(20).colour).toEqual(true);
	expect(rbt.contains(25).colour).toEqual(false);

	expect(rbt.getSize()).toEqual(3);
});

test(
	"Uncle and parent of node is red, with the node itself being red and a right child. " +
		"With more than 4 nodes.",
	() => {
		const rbt = new RBT();

		rbt.add(1, true);
		rbt.add(2, true);
		rbt.add(3, true);
		rbt.add(4, true);
		rbt.add(5, true);
		rbt.add(6, true);
		rbt.add(7, true);
		rbt.add(8, true);

		expect(rbt.levelOrder()).toEqual([4, 2, 6, 1, 3, 5, 7, 8]);

		expect(rbt.contains(5).colour).toEqual(false);
		expect(rbt.contains(7).colour).toEqual(false);
		expect(rbt.contains(2).colour).toEqual(true);
		expect(rbt.contains(4).colour).toEqual(false);

		expect(rbt.getSize()).toEqual(8);
	}
);

test(
	"Uncle and parent of node is red, with the node itself being red and a left child. " +
		"With more than 4 nodes.",
	() => {
		const rbt = new RBT();

		rbt.add(8, true);
		rbt.add(7, true);
		rbt.add(6, true);
		rbt.add(5, true);
		rbt.add(4, true);
		rbt.add(3, true);
		rbt.add(2, true);
		rbt.add(1, true);

		expect(rbt.levelOrder()).toEqual([5, 3, 7, 2, 4, 6, 8, 1]);

		expect(rbt.contains(5).colour).toEqual(false);
		expect(rbt.contains(7).colour).toEqual(true);
		expect(rbt.contains(2).colour).toEqual(false);
		expect(rbt.contains(4).colour).toEqual(false);

		expect(rbt.getSize()).toEqual(8);
	}
);

test(
	"Uncle is black, parent is red and is the left child of grandparent. The added node is the " +
		"left child of the parent.",
	() => {
		const rbt = new RBT();

		let g = new NodeRBT(20, true);
		let p = new NodeRBT(15, true);
		let u = new NodeRBT(25, true);
		g.left = p;
		g.right = u;
		g.colour = false;
		p.parent = g;
		u.parent = g;
		u.colour = false;
		rbt.root = g;
		rbt.size = 3;
		rbt.add(10, true);

		expect(rbt.levelOrder()).toEqual([15, 10, 20, 25]);

		expect(rbt.contains(g.key).colour).toEqual(true);
		expect(rbt.contains(p.key).colour).toEqual(false);
		expect(rbt.contains(u.key).colour).toEqual(false);
		expect(rbt.contains(10).colour).toEqual(true);

		expect(rbt.getSize()).toEqual(4);
	}
);

test(
	"Uncle is black, parent is red and is the left child of grandparent. The added node is the " +
		"right child of the parent.",
	() => {
		const rbt = new RBT();

		let g = new NodeRBT(20, true);
		let p = new NodeRBT(15, true);
		let u = new NodeRBT(25, true);
		g.left = p;
		g.right = u;
		g.colour = false;
		p.parent = g;
		u.parent = g;
		u.colour = false;
		rbt.root = g;
		rbt.size = 3;
		rbt.add(17, true);

		expect(rbt.levelOrder()).toEqual([17, 15, 20, 25]);

		expect(rbt.contains(g.key).colour).toEqual(true);
		expect(rbt.contains(p.key).colour).toEqual(true);
		expect(rbt.contains(u.key).colour).toEqual(false);
		expect(rbt.contains(17).colour).toEqual(false);

		expect(rbt.getSize()).toEqual(4);
	}
);

test(
	"Uncle is black, parent is red and is the right child of grandparent. The added node is the " +
		"right child of the parent.",
	() => {
		const rbt = new RBT();

		let g = new NodeRBT(20, true);
		let p = new NodeRBT(25, true);
		let u = new NodeRBT(15, true);
		g.left = u;
		g.right = p;
		g.colour = false;
		p.parent = g;
		u.parent = g;
		u.colour = false;
		rbt.root = g;
		rbt.size = 3;
		rbt.add(27, true);

		expect(rbt.levelOrder()).toEqual([25, 20, 27, 15]);

		expect(rbt.contains(g.key).colour).toEqual(true);
		expect(rbt.contains(p.key).colour).toEqual(false);
		expect(rbt.contains(u.key).colour).toEqual(false);
		expect(rbt.contains(27).colour).toEqual(true);

		expect(rbt.getSize()).toEqual(4);
	}
);

test(
	"Uncle is black, parent is red and is the right child of grandparent. The added node is the " +
		"left child of the parent.",
	() => {
		const rbt = new RBT();

		let g = new NodeRBT(20, true);
		let p = new NodeRBT(25, true);
		let u = new NodeRBT(15, true);
		g.left = u;
		g.right = p;
		g.colour = false;
		p.parent = g;
		u.parent = g;
		u.colour = false;
		rbt.root = g;
		rbt.size = 3;
		rbt.add(22, true);

		expect(rbt.levelOrder()).toEqual([22, 20, 25, 15]);

		expect(rbt.contains(g.key).colour).toEqual(true);
		expect(rbt.contains(p.key).colour).toEqual(true);
		expect(rbt.contains(u.key).colour).toEqual(false);
		expect(rbt.contains(22).colour).toEqual(false);

		expect(rbt.getSize()).toEqual(4);
	}
);
