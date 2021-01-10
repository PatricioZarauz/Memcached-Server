const Memcached = require("../memcached");

test("Add a node when the memcached is empty", () => {
	const memcached = new Memcached();

	expect(memcached.add("hola", 13, 0, 4, "HOLA", 1)).toEqual("STORED\r\n");

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("hola");
});

test("Add a node when the memcached already has a node", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);

	expect(memcached.add("hola", 13, 0, 4, "HOLA", 1)).toEqual("STORED\r\n");

	expect(memcached.cache.size).toEqual(2);
	expect(memcached.head.key).toEqual("hola");
});

test("Add a node that's already in the memcached", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "HOLA", 1);

	expect(memcached.add("hola", 13, 0, 4, "LAST", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.datablock).toEqual("HOLA");
});

test("Add a node when the memcached is empty, with noreply", () => {
	const memcached = new Memcached();

	expect(memcached.add("hola", 13, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("hola");
});

test("Add a node that's already in the memcached, with noreply", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "HOLA", 1);

	expect(memcached.add("hola", 13, 0, 4, "LAST", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.datablock).toEqual("HOLA");
});

test("Add a node when the memcached already has an node, with noreply", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);

	expect(memcached.add("hola", 13, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(2);
	expect(memcached.head.key).toEqual("hola");
});

test("Replace a node when the memcached is empty", () => {
	const memcached = new Memcached();

	expect(memcached.replace("hola", 13, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(memcached.cache.size).toEqual(0);
});

test("Replace a node that's not in the memcached that's not empty", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);

	expect(memcached.replace("hola", 13, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("last");
});

test("Replace a node that's in the memcached", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "LAST", 1);

	expect(memcached.replace("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"STORED\r\n"
	);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("hola");
});

test("Replace a node when the memcached is empty, with noreply", () => {
	const memcached = new Memcached();

	expect(memcached.replace("hola", 13, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(0);
});

test("Replace a node that's not in the memcached which it's not empty, with noreply", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);

	expect(memcached.replace("hola", 13, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("last");
});

test("Replace a node that's in the memcached, with noreply", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "LAST", 1);

	expect(memcached.replace("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("hola");
});

test("Append a string to a node with an empty memcached", () => {
	const memcached = new Memcached();

	expect(memcached.append("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(memcached.cache.size).toEqual(0);
	expect(memcached.head).toEqual(null);
});

test("Append a string to a node without the desired node in the memcached", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(memcached.append("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("last");
});

test("Append a string to a desired node in the memcached", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "LAST", 1);
	expect(memcached.append("hola", 15, 0, 4, "HOLA", 1)).toEqual("STORED\r\n");

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.datablock).toEqual("LASTHOLA");
	expect(memcached.head.bytes).toEqual(8);
});

test("Append a string to a node with an empty memcached, with noreply", () => {
	const memcached = new Memcached();

	expect(memcached.append("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(0);
	expect(memcached.head).toEqual(null);
});

test("Append a string to a node without the desired node in the memcached, with noreply", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(memcached.append("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("last");
});

test("Append a string to a desired node in the memcached, with noreply", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "LAST", 1);
	expect(memcached.append("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.datablock).toEqual("LASTHOLA");
	expect(memcached.head.bytes).toEqual(8);
});

test("Prepend a string to a node with an empty memcached", () => {
	const memcached = new Memcached();

	expect(memcached.prepend("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(memcached.cache.size).toEqual(0);
	expect(memcached.head).toEqual(null);
});

test("Prepend a string to a node without the desired node in the memcached", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(memcached.prepend("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("last");
});

test("Prepend a string to a desired node in the memcached", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "LAST", 1);
	expect(memcached.prepend("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"STORED\r\n"
	);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.datablock).toEqual("HOLALAST");
	expect(memcached.head.bytes).toEqual(8);
});

test("Prepend a string to a node with an empty memcached, with noreply", () => {
	const memcached = new Memcached();

	expect(memcached.prepend("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(0);
	expect(memcached.head).toEqual(null);
});

test("Prepend a string to a node without the desired node in the memcached, with noreply", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(memcached.prepend("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("last");
});

test("Prepend a string to a desired node in the memcached, with noreply", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "LAST", 1);
	expect(memcached.prepend("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.datablock).toEqual("HOLALAST");
	expect(memcached.head.bytes).toEqual(8);
});

test("Get the value and information of a desired node when the memcached is empty", () => {
	const memcached = new Memcached();

	expect(memcached.get(["hola"])).toEqual(["END\r\n"]);

	expect(memcached.cache.size).toEqual(0);
	expect(memcached.head).toEqual(null);
});

test(
	"Get the value and information of one or more desired nodes when the " +
		"memcached is empty",
	() => {
		const memcached = new Memcached();

		expect(memcached.get(["hola", "test"])).toEqual(["END\r\n"]);

		expect(memcached.cache.size).toEqual(0);
		expect(memcached.head).toEqual(null);
	}
);

test("Get the value and information of a desired node, when the memcached contains it", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "LAST", 1);
	expect(memcached.get(["hola"])).toEqual([
		"VALUE hola 15 4\r\n",
		"LAST\r\n",
		"END\r\n",
	]);
});

test(
	"Get the value and information of one or more desired nodes, when the memcached doesn't " +
		"contain every node.",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "LAST", 1);
		expect(memcached.get(["hola", "test"])).toEqual([
			"VALUE hola 15 4\r\n",
			"LAST\r\n",
			"END\r\n",
		]);
	}
);

test(
	"Get the value and information of one or more desired nodes, when the memcached contains " +
		"every node.",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "HOLA", 1);
		memcached.add("last", 16, 0, 4, "LAST", 1);
		expect(memcached.get(["hola", "last"])).toEqual([
			"VALUE hola 15 4\r\n",
			"HOLA\r\n",
			"VALUE last 16 4\r\n",
			"LAST\r\n",
			"END\r\n",
		]);
	}
);

test("Set a node when the memcached is empty", () => {
	const memcached = new Memcached();

	expect(memcached.set("hola", 15, 0, 4, "HOLA", 1)).toEqual("STORED\r\n");

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("hola");
});

test("Set a node when the memcached already contains it", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(memcached.set("hola", 15, 0, 5, "HOLAX", 1)).toEqual("STORED\r\n");

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("hola");
	expect(memcached.head.datablock).toEqual("HOLAX");
});

test("Set a node when the memcached has nodes, but doesn't contains the desired one", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(memcached.set("last", 15, 0, 4, "LAST", 1)).toEqual("STORED\r\n");

	expect(memcached.cache.size).toEqual(2);
	expect(memcached.head.key).toEqual("last");
	expect(memcached.head.datablock).toEqual("LAST");
});

test("Set a node when the memcached is empty, with noreply", () => {
	const memcached = new Memcached();

	expect(memcached.set("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("hola");
});

test("Set a node when the memcached already contains it, with noreply", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(memcached.set("hola", 15, 0, 5, "HOLAX", 1, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("hola");
	expect(memcached.head.datablock).toEqual("HOLAX");
});

test(
	"Set a node when the memcached has nodes, but doesn't contains the desired one, " +
		"with noreply",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "HOLA", 1);
		expect(memcached.set("last", 15, 0, 4, "LAST", 1, true)).toEqual(null);

		expect(memcached.cache.size).toEqual(2);
		expect(memcached.head.key).toEqual("last");
		expect(memcached.head.datablock).toEqual("LAST");
	}
);

test("Update a node when the memcached only contains that node", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(memcached.updateNode("hola", 15, 0, 4, "CHAU", 1)).toEqual(true);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("hola");
	expect(memcached.head.datablock).toEqual("CHAU");
});

test("Update a node when the memcached doesn't contains it, but it isn't empty", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(memcached.updateNode("hola", 15, 0, 4, "CHAU", 1)).toEqual(false);

	expect(memcached.cache.size).toEqual(1);
	expect("last").toEqual(memcached.head.key);
	expect("LAST").toEqual(memcached.head.datablock);
});

test("Update a node when the memcached is empty", () => {
	const memcached = new Memcached();

	expect(memcached.updateNode("hola", 15, 0, 4, "CHAU", 1)).toEqual(false);

	expect(memcached.cache.size).toEqual(0);
});

test("Update a node that's in the middle of the memcached LRU", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);
	memcached.add("mid", 14, 0, 6, "MIDDLE", 1);
	memcached.add("first", 14, 0, 5, "FIRST", 1);

	expect(memcached.updateNode("mid", 15, 0, 4, "HOLA", 1)).toEqual(true);

	expect(memcached.cache.size).toEqual(3);
	expect(memcached.head.key).toEqual("mid");
	expect(memcached.head.datablock).toEqual("HOLA");
	expect(memcached.head.next.key).toEqual("first");
	expect(memcached.tail.key).toEqual("last");
	expect(memcached.tail.prev.key).toEqual("first");
});

test("Update a node that's the tail of the memcached LRU", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);
	memcached.add("hola", 15, 0, 4, "HOLA", 1);

	expect(memcached.updateNode("last", 15, 0, 5, "FIRST", 1)).toEqual(true);

	expect(2).toEqual(memcached.cache.size);
	expect("last").toEqual(memcached.head.key);
	expect("FIRST").toEqual(memcached.head.datablock);
});

test("Gets - Get the value and information of a desired node when the memcached is empty", () => {
	const memcached = new Memcached();

	expect(memcached.gets(["hola"], 1)).toEqual(["END\r\n"]);

	expect(memcached.cache.size).toEqual(0);
	expect(memcached.head).toEqual(null);
});

test(
	"Gets - Get the value and information of one or more desired nodes when the memcached " +
		"is empty",
	() => {
		const memcached = new Memcached();

		expect(memcached.gets(["hola", "test"], 1)).toEqual(["END\r\n"]);

		expect(memcached.cache.size).toEqual(0);
		expect(memcached.head).toEqual(null);
	}
);

test(
	"Gets - Get the value and information of a desired node, when the memcached contains " +
		"it and the same user added it",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "LAST", 1);
		expect(memcached.gets(["hola"], 1)).toEqual([
			"VALUE hola 15 4 1\r\n",
			"LAST\r\n",
			"END\r\n",
		]);

		expect(memcached.head.users.contains(1).key).toEqual(1);
	}
);

test(
	"Gets - Get the value and information of a desired node, which another user added it " +
		"to the memcached",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "LAST", 1);
		expect(memcached.gets(["hola"], 2)).toEqual([
			"VALUE hola 15 4 2\r\n",
			"LAST\r\n",
			"END\r\n",
		]);

		expect(memcached.head.users.contains(2).key).toEqual(2);
	}
);

test(
	"Gets - Get the value and information of one or more desired nodes, when the memcached " +
		"doesn't contain every node.",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "LAST", 1);
		expect(memcached.gets(["hola", "test"], 1)).toEqual([
			"VALUE hola 15 4 1\r\n",
			"LAST\r\n",
			"END\r\n",
		]);

		expect(memcached.head.users.contains(1).key).toEqual(1);
	}
);

test(
	"Gets - Get the value and information of one or more desired nodes, when the memcached " +
		"contains every node, which may not be added by the same user.",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "HOLA", 1);
		memcached.add("last", 16, 0, 4, "LAST", 2);
		expect(memcached.gets(["hola", "last"], 1)).toEqual([
			"VALUE hola 15 4 1\r\n",
			"HOLA\r\n",
			"VALUE last 16 4 1\r\n",
			"LAST\r\n",
			"END\r\n",
		]);

		expect(memcached.head.users.contains(1).key).toEqual(1);
		expect(memcached.tail.users.contains(1).key).toEqual(1);
	}
);

test("Cas - Set the value of a node on an empty memcached.", () => {
	const memcached = new Memcached();

	expect(memcached.cas("last", 16, 0, 4, "LAST", 2)).toEqual("NOT_FOUND\r\n");

	expect(memcached.cache.size).toEqual(0);
});

test("Cas - Set the value of a missing node in a memcached that's not empty.", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(memcached.cas("last", 16, 0, 4, "LAST", 2)).toEqual("NOT_FOUND\r\n");

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("hola");
	expect(memcached.head.datablock).toEqual("HOLA");
});

test(
	"Cas - Set the value of a node that exists in the memcached, but the user hasn't fetched " +
		"it or updated it.",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "HOLA", 1);
		expect(memcached.cas("hola", 15, 0, 4, "LAST", 2)).toEqual(
			"EXISTS\r\n"
		);

		expect(memcached.cache.size).toEqual(1);
		expect(memcached.head.key).toEqual("hola");
		expect(memcached.head.datablock).toEqual("HOLA");
	}
);

test(
	"Cas - Set the value of a node that exists in the memcached, which the user fetched " +
		"it before.",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "HOLA", 1);
		memcached.get(["hola"], 2);
		expect(memcached.cas("hola", 15, 0, 4, "LAST", 2)).toEqual(
			"STORED\r\n"
		);

		expect(memcached.cache.size).toEqual(1);
		expect(memcached.head.key).toEqual("hola");
		expect(memcached.head.datablock).toEqual("LAST");
	}
);

test(
	"Cas - Set the value of a node that exists in the memcached, which the user " +
		"updated it before.",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "HOLA", 1);
		memcached.replace("hola", 15, 0, 4, "CHAU", 2);
		expect(memcached.cas("hola", 15, 0, 4, "LAST", 2)).toEqual(
			"STORED\r\n"
		);

		expect(memcached.cache.size).toEqual(1);
		expect(memcached.head.key).toEqual("hola");
		expect(memcached.head.datablock).toEqual("LAST");
		expect(memcached.head.users.contains(1)).toEqual(null);
	}
);

test("Cas - Set the value of a node on an empty memcached, with noreply.", () => {
	const memcached = new Memcached();

	expect(memcached.cas("last", 16, 0, 4, "LAST", 2, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(0);
});

test("Cas - Set the value of a missing node in a memcached that's not empty, with noreply", () => {
	const memcached = new Memcached();

	memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(memcached.cas("last", 16, 0, 4, "LAST", 2, true)).toEqual(null);

	expect(memcached.cache.size).toEqual(1);
	expect(memcached.head.key).toEqual("hola");
	expect(memcached.head.datablock).toEqual("HOLA");
});

test(
	"Cas - Set the value of a node that exists in the memcached, but the user hasn't fetched it " +
		"or updated it, with noreply.",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "HOLA", 1);
		expect(memcached.cas("hola", 15, 0, 4, "LAST", 2, true)).toEqual(null);

		expect(memcached.cache.size).toEqual(1);
		expect(memcached.head.key).toEqual("hola");
		expect(memcached.head.datablock).toEqual("HOLA");
	}
);

test(
	"Cas - Set the value of a node that exists in the memcached, which the user fetched it " +
		"before, with noreply.",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "HOLA", 1);
		memcached.get(["hola"], 2);
		expect(memcached.cas("hola", 15, 0, 4, "LAST", 2, true)).toEqual(null);

		expect(memcached.cache.size).toEqual(1);
		expect(memcached.head.key).toEqual("hola");
		expect(memcached.head.datablock).toEqual("LAST");
	}
);

test(
	"Cas - Set the value of a node that exists in the memcached, which the user updated it " +
		"before, with noreply.",
	() => {
		const memcached = new Memcached();

		memcached.add("hola", 15, 0, 4, "HOLA", 1);
		memcached.replace("hola", 15, 0, 4, "CHAU", 2);
		expect(memcached.cas("hola", 15, 0, 4, "LAST", 2, true)).toEqual(null);

		expect(memcached.cache.size).toEqual(1);
		expect(memcached.head.key).toEqual("hola");
		expect(memcached.head.datablock).toEqual("LAST");
		expect(memcached.head.users.contains(1)).toEqual(null);
	}
);

test("Delete a node, when the memcached is empty", () => {
	const memcached = new Memcached();

	expect(memcached.deleteNode("hola", memcached)).toEqual(false);

	expect(memcached.cache.size).toEqual(0);
});

test("Delete a node, when the memcached only contains that node", () => {
	const memcached = new Memcached();

	memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(memcached.deleteNode("last", memcached)).toEqual(true);

	expect(memcached.cache.size).toEqual(0);
	expect(memcached.head).toEqual(null);
	expect(memcached.tail).toEqual(null);
});

test(
	"Delete a node, when the memcached contains 3 or more nodes, and the one beining deleted" +
		" it's in the middle",
	() => {
		const memcached = new Memcached();

		memcached.add("last", 15, 0, 4, "LAST", 1);
		memcached.add("mid", 14, 0, 6, "MIDDLE", 1);
		memcached.add("first", 14, 0, 5, "FIRST", 1);
		expect(memcached.deleteNode("mid", memcached)).toEqual(true);

		expect(memcached.cache.size).toEqual(2);
		expect(memcached.head.key).toEqual("first");
		expect(memcached.tail.key).toEqual("last");
		expect(memcached.head.next.key).toEqual("last");
		expect(memcached.tail.prev.key).toEqual("first");
		expect(memcached.head.prev).toEqual(null);
		expect(memcached.tail.next).toEqual(null);
	}
);
