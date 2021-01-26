const Memcached = require("../memcached");

test("Add a node when the memcached is empty", () => {
	expect(Memcached.add("hola", 13, 0, 4, "HOLA", 1)).toEqual("STORED\r\n");

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("hola");

	Memcached.flush();
});

test("Add a node when the memcached already has a node", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);

	expect(Memcached.add("hola", 13, 0, 4, "HOLA", 1)).toEqual("STORED\r\n");

	expect(Memcached.cache.size).toEqual(2);
	expect(Memcached.head.key).toEqual("hola");

	Memcached.flush();
});

test("Add a node that's already in the memcached", () => {
	Memcached.add("hola", 15, 0, 4, "HOLA", 1);

	expect(Memcached.add("hola", 13, 0, 4, "LAST", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.datablock).toEqual("HOLA");

	Memcached.flush();
});

test("Add a node when the memcached is empty, with noreply", () => {
	expect(Memcached.add("hola", 13, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("hola");

	Memcached.flush();
});

test("Add a node that's already in the memcached, with noreply", () => {
	Memcached.add("hola", 15, 0, 4, "HOLA", 1);

	expect(Memcached.add("hola", 13, 0, 4, "LAST", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.datablock).toEqual("HOLA");

	Memcached.flush();
});

test("Add a node when the memcached already has an node, with noreply", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);

	expect(Memcached.add("hola", 13, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(2);
	expect(Memcached.head.key).toEqual("hola");

	Memcached.flush();
});

test("Replace a node when the memcached is empty", () => {
	expect(Memcached.replace("hola", 13, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(Memcached.cache.size).toEqual(0);

	Memcached.flush();
});

test("Replace a node that's not in the memcached that's not empty", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);

	expect(Memcached.replace("hola", 13, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("last");

	Memcached.flush();
});

test("Replace a node that's in the memcached", () => {
	Memcached.add("hola", 15, 0, 4, "LAST", 1);

	expect(Memcached.replace("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"STORED\r\n"
	);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("hola");

	Memcached.flush();
});

test("Replace a node when the memcached is empty, with noreply", () => {
	expect(Memcached.replace("hola", 13, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(0);

	Memcached.flush();
});

test("Replace a node that's not in the memcached which it's not empty, with noreply", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);

	expect(Memcached.replace("hola", 13, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("last");

	Memcached.flush();
});

test("Replace a node that's in the memcached, with noreply", () => {
	Memcached.add("hola", 15, 0, 4, "LAST", 1);

	expect(Memcached.replace("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("hola");

	Memcached.flush();
});

test("Append a string to a node with an empty memcached", () => {
	expect(Memcached.append("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(Memcached.cache.size).toEqual(0);
	expect(Memcached.head).toEqual(null);

	Memcached.flush();
});

test("Append a string to a node without the desired node in the memcached", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(Memcached.append("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("last");

	Memcached.flush();
});

test("Append a string to a desired node in the memcached", () => {
	Memcached.add("hola", 15, 0, 4, "LAST", 1);
	expect(Memcached.append("hola", 15, 0, 4, "HOLA", 1)).toEqual("STORED\r\n");

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.datablock).toEqual("LASTHOLA");
	expect(Memcached.head.bytes).toEqual(8);

	Memcached.flush();
});

test("Append a string to a node with an empty memcached, with noreply", () => {
	expect(Memcached.append("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(0);
	expect(Memcached.head).toEqual(null);

	Memcached.flush();
});

test("Append a string to a node without the desired node in the memcached, with noreply", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(Memcached.append("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("last");

	Memcached.flush();
});

test("Append a string to a desired node in the memcached, with noreply", () => {
	Memcached.add("hola", 15, 0, 4, "LAST", 1);
	expect(Memcached.append("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.datablock).toEqual("LASTHOLA");
	expect(Memcached.head.bytes).toEqual(8);

	Memcached.flush();
});

test("Prepend a string to a node with an empty memcached", () => {
	expect(Memcached.prepend("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(Memcached.cache.size).toEqual(0);
	expect(Memcached.head).toEqual(null);

	Memcached.flush();
});

test("Prepend a string to a node without the desired node in the memcached", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(Memcached.prepend("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"NOT_STORED\r\n"
	);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("last");

	Memcached.flush();
});

test("Prepend a string to a desired node in the memcached", () => {
	Memcached.add("hola", 15, 0, 4, "LAST", 1);
	expect(Memcached.prepend("hola", 15, 0, 4, "HOLA", 1)).toEqual(
		"STORED\r\n"
	);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.datablock).toEqual("HOLALAST");
	expect(Memcached.head.bytes).toEqual(8);

	Memcached.flush();
});

test("Prepend a string to a node with an empty memcached, with noreply", () => {
	expect(Memcached.prepend("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(0);
	expect(Memcached.head).toEqual(null);

	Memcached.flush();
});

test("Prepend a string to a node without the desired node in the memcached, with noreply", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(Memcached.prepend("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("last");

	Memcached.flush();
});

test("Prepend a string to a desired node in the memcached, with noreply", () => {
	Memcached.add("hola", 15, 0, 4, "LAST", 1);
	expect(Memcached.prepend("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.datablock).toEqual("HOLALAST");
	expect(Memcached.head.bytes).toEqual(8);

	Memcached.flush();
});

test("Get the value and information of a desired node when the memcached is empty", () => {
	expect(Memcached.get(["hola"], 1)).toEqual(["END\r\n"]);

	expect(Memcached.cache.size).toEqual(0);
	expect(Memcached.head).toEqual(null);

	Memcached.flush();
});

test(
	"Get the value and information of one or more desired nodes when the " +
		"memcached is empty",
	() => {
		expect(Memcached.get(["hola", "test"], 1)).toEqual(["END\r\n"]);

		expect(Memcached.cache.size).toEqual(0);
		expect(Memcached.head).toEqual(null);
		Memcached.flush();
	}
);

test("Get the value and information of a desired node, when the memcached contains it", () => {
	Memcached.add("hola", 15, 0, 4, "LAST", 1);
	expect(Memcached.get(["hola"], 1)).toEqual([
		"VALUE hola 15 4\r\n",
		"LAST\r\n",
		"END\r\n",
	]);

	Memcached.flush();
});

test(
	"Get the value and information of one or more desired nodes, when the memcached doesn't " +
		"contain every node.",
	() => {
		Memcached.add("hola", 15, 0, 4, "LAST", 1);
		expect(Memcached.get(["hola", "test"], 1)).toEqual([
			"VALUE hola 15 4\r\n",
			"LAST\r\n",
			"END\r\n",
		]);
		Memcached.flush();
	}
);

test(
	"Get the value and information of one or more desired nodes, when the memcached contains " +
		"every node.",
	() => {
		Memcached.add("hola", 15, 0, 4, "HOLA", 1);
		Memcached.add("last", 16, 0, 4, "LAST", 1);
		expect(Memcached.get(["hola", "last"], 1)).toEqual([
			"VALUE hola 15 4\r\n",
			"HOLA\r\n",
			"VALUE last 16 4\r\n",
			"LAST\r\n",
			"END\r\n",
		]);
		Memcached.flush();
	}
);

test("Set a node when the memcached is empty", () => {
	expect(Memcached.set("hola", 15, 0, 4, "HOLA", 1)).toEqual("STORED\r\n");

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("hola");

	Memcached.flush();
});

test("Set a node when the memcached already contains it", () => {
	Memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(Memcached.set("hola", 15, 0, 5, "HOLAX", 1)).toEqual("STORED\r\n");

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("hola");
	expect(Memcached.head.datablock).toEqual("HOLAX");

	Memcached.flush();
});

test("Set a node when the memcached has nodes, but doesn't contains the desired one", () => {
	Memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(Memcached.set("last", 15, 0, 4, "LAST", 1)).toEqual("STORED\r\n");

	expect(Memcached.cache.size).toEqual(2);
	expect(Memcached.head.key).toEqual("last");
	expect(Memcached.head.datablock).toEqual("LAST");

	Memcached.flush();
});

test("Set a node when the memcached is empty, with noreply", () => {
	expect(Memcached.set("hola", 15, 0, 4, "HOLA", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("hola");

	Memcached.flush();
});

test("Set a node when the memcached already contains it, with noreply", () => {
	Memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(Memcached.set("hola", 15, 0, 5, "HOLAX", 1, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("hola");
	expect(Memcached.head.datablock).toEqual("HOLAX");

	Memcached.flush();
});

test(
	"Set a node when the memcached has nodes, but doesn't contains the desired one, " +
		"with noreply",
	() => {
		Memcached.add("hola", 15, 0, 4, "HOLA", 1);
		expect(Memcached.set("last", 15, 0, 4, "LAST", 1, true)).toEqual(null);

		expect(Memcached.cache.size).toEqual(2);
		expect(Memcached.head.key).toEqual("last");
		expect(Memcached.head.datablock).toEqual("LAST");
		Memcached.flush();
	}
);

test("Update a node when the memcached only contains that node", () => {
	Memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(Memcached.updateNode("hola", 15, 0, 4, "CHAU", 1)).toEqual(true);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("hola");
	expect(Memcached.head.datablock).toEqual("CHAU");

	Memcached.flush();
});

test("Update a node when the memcached doesn't contains it, but it isn't empty", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(Memcached.updateNode("hola", 15, 0, 4, "CHAU", 1)).toEqual(false);

	expect(Memcached.cache.size).toEqual(1);
	expect("last").toEqual(Memcached.head.key);
	expect("LAST").toEqual(Memcached.head.datablock);

	Memcached.flush();
});

test("Update a node when the memcached is empty", () => {
	expect(Memcached.updateNode("hola", 15, 0, 4, "CHAU", 1)).toEqual(false);

	expect(Memcached.cache.size).toEqual(0);

	Memcached.flush();
});

test("Update a node that's in the middle of the memcached LRU", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);
	Memcached.add("mid", 14, 0, 6, "MIDDLE", 1);
	Memcached.add("first", 14, 0, 5, "FIRST", 1);

	expect(Memcached.updateNode("mid", 15, 0, 4, "HOLA", 1)).toEqual(true);

	expect(Memcached.cache.size).toEqual(3);
	expect(Memcached.head.key).toEqual("mid");
	expect(Memcached.head.datablock).toEqual("HOLA");
	expect(Memcached.head.next.key).toEqual("first");
	expect(Memcached.tail.key).toEqual("last");
	expect(Memcached.tail.prev.key).toEqual("first");

	Memcached.flush();
});

test("Update a node that's the tail of the memcached LRU", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);
	Memcached.add("hola", 15, 0, 4, "HOLA", 1);

	expect(Memcached.updateNode("last", 15, 0, 5, "FIRST", 1)).toEqual(true);

	expect(2).toEqual(Memcached.cache.size);
	expect("last").toEqual(Memcached.head.key);
	expect("FIRST").toEqual(Memcached.head.datablock);

	Memcached.flush();
});

test("Gets - Get the value and information of a desired node when the memcached is empty", () => {
	expect(Memcached.gets(["hola"], 1)).toEqual(["END\r\n"]);

	expect(Memcached.cache.size).toEqual(0);
	expect(Memcached.head).toEqual(null);

	Memcached.flush();
});

test(
	"Gets - Get the value and information of one or more desired nodes when the memcached " +
		"is empty",
	() => {
		expect(Memcached.gets(["hola", "test"], 1)).toEqual(["END\r\n"]);

		expect(Memcached.cache.size).toEqual(0);
		expect(Memcached.head).toEqual(null);
		Memcached.flush();
	}
);

test(
	"Gets - Get the value and information of a desired node, when the memcached contains " +
		"it and the same user added it",
	() => {
		Memcached.add("hola", 15, 0, 4, "LAST", 1);
		expect(Memcached.gets(["hola"], 1)).toEqual([
			"VALUE hola 15 4 1\r\n",
			"LAST\r\n",
			"END\r\n",
		]);

		expect(Memcached.head.casIds.contains(1).key).toEqual(1);
		Memcached.flush();
	}
);

test(
	"Gets - Get the value and information of a desired node, which another user added it " +
		"to the memcached",
	() => {
		Memcached.add("hola", 15, 0, 4, "LAST", 1);
		expect(Memcached.gets(["hola"], 2)).toEqual([
			"VALUE hola 15 4 2\r\n",
			"LAST\r\n",
			"END\r\n",
		]);

		expect(Memcached.head.casIds.contains(2).key).toEqual(2);
		Memcached.flush();
	}
);

test(
	"Gets - Get the value and information of one or more desired nodes, when the memcached " +
		"doesn't contain every node.",
	() => {
		Memcached.add("hola", 15, 0, 4, "LAST", 1);
		expect(Memcached.gets(["hola", "test"], 1)).toEqual([
			"VALUE hola 15 4 1\r\n",
			"LAST\r\n",
			"END\r\n",
		]);

		expect(Memcached.head.casIds.contains(1).key).toEqual(1);
		Memcached.flush();
	}
);

test(
	"Gets - Get the value and information of one or more desired nodes, when the memcached " +
		"contains every node, which may not be added by the same user.",
	() => {
		Memcached.add("hola", 15, 0, 4, "HOLA", 1);
		Memcached.add("last", 16, 0, 4, "LAST", 2);
		expect(Memcached.gets(["hola", "last"], 1)).toEqual([
			"VALUE hola 15 4 1\r\n",
			"HOLA\r\n",
			"VALUE last 16 4 1\r\n",
			"LAST\r\n",
			"END\r\n",
		]);

		expect(Memcached.head.casIds.contains(1).key).toEqual(1);
		expect(Memcached.tail.casIds.contains(1).key).toEqual(1);
		Memcached.flush();
	}
);

test("Cas - Set the value of a node on an empty memcached.", () => {
	expect(Memcached.cas("last", 16, 0, 4, "LAST", 2)).toEqual("NOT_FOUND\r\n");

	expect(Memcached.cache.size).toEqual(0);

	Memcached.flush();
});

test("Cas - Set the value of a missing node in a memcached that's not empty.", () => {
	Memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(Memcached.cas("last", 16, 0, 4, "LAST", 2)).toEqual("NOT_FOUND\r\n");

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("hola");
	expect(Memcached.head.datablock).toEqual("HOLA");

	Memcached.flush();
});

test(
	"Cas - Set the value of a node that exists in the memcached, but the user hasn't fetched " +
		"it or updated it.",
	() => {
		Memcached.add("hola", 15, 0, 4, "HOLA", 1);
		expect(Memcached.cas("hola", 15, 0, 4, "LAST", 2)).toEqual(
			"EXISTS\r\n"
		);

		expect(Memcached.cache.size).toEqual(1);
		expect(Memcached.head.key).toEqual("hola");
		expect(Memcached.head.datablock).toEqual("HOLA");
		Memcached.flush();
	}
);

test(
	"Cas - Set the value of a node that exists in the memcached, which the user fetched " +
		"it before.",
	() => {
		Memcached.add("hola", 15, 0, 4, "HOLA", 1);
		Memcached.get(["hola"], 2);
		expect(Memcached.cas("hola", 15, 0, 4, "LAST", 2)).toEqual(
			"STORED\r\n"
		);

		expect(Memcached.cache.size).toEqual(1);
		expect(Memcached.head.key).toEqual("hola");
		expect(Memcached.head.datablock).toEqual("LAST");
		Memcached.flush();
	}
);

test(
	"Cas - Set the value of a node that exists in the memcached, which the user " +
		"updated it before.",
	() => {
		Memcached.add("hola", 15, 0, 4, "HOLA", 1);
		Memcached.replace("hola", 15, 0, 4, "CHAU", 2);
		expect(Memcached.cas("hola", 15, 0, 4, "LAST", 2)).toEqual(
			"STORED\r\n"
		);

		expect(Memcached.cache.size).toEqual(1);
		expect(Memcached.head.key).toEqual("hola");
		expect(Memcached.head.datablock).toEqual("LAST");
		expect(Memcached.head.casIds.contains(1)).toEqual(null);
		Memcached.flush();
	}
);

test("Cas - Set the value of a node on an empty memcached, with noreply.", () => {
	expect(Memcached.cas("last", 16, 0, 4, "LAST", 2, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(0);

	Memcached.flush();
});

test("Cas - Set the value of a missing node in a memcached that's not empty, with noreply", () => {
	Memcached.add("hola", 15, 0, 4, "HOLA", 1);
	expect(Memcached.cas("last", 16, 0, 4, "LAST", 2, true)).toEqual(null);

	expect(Memcached.cache.size).toEqual(1);
	expect(Memcached.head.key).toEqual("hola");
	expect(Memcached.head.datablock).toEqual("HOLA");

	Memcached.flush();
});

test(
	"Cas - Set the value of a node that exists in the memcached, but the user hasn't fetched it " +
		"or updated it, with noreply.",
	() => {
		Memcached.add("hola", 15, 0, 4, "HOLA", 1);
		expect(Memcached.cas("hola", 15, 0, 4, "LAST", 2, true)).toEqual(null);

		expect(Memcached.cache.size).toEqual(1);
		expect(Memcached.head.key).toEqual("hola");
		expect(Memcached.head.datablock).toEqual("HOLA");
		Memcached.flush();
	}
);

test(
	"Cas - Set the value of a node that exists in the memcached, which the user fetched it " +
		"before, with noreply.",
	() => {
		Memcached.add("hola", 15, 0, 4, "HOLA", 1);
		Memcached.get(["hola"], 2);
		expect(Memcached.cas("hola", 15, 0, 4, "LAST", 2, true)).toEqual(null);

		expect(Memcached.cache.size).toEqual(1);
		expect(Memcached.head.key).toEqual("hola");
		expect(Memcached.head.datablock).toEqual("LAST");
		Memcached.flush();
	}
);

test(
	"Cas - Set the value of a node that exists in the memcached, which the user updated it " +
		"before, with noreply.",
	() => {
		Memcached.add("hola", 15, 0, 4, "HOLA", 1);
		Memcached.replace("hola", 15, 0, 4, "CHAU", 2);
		expect(Memcached.cas("hola", 15, 0, 4, "LAST", 2, true)).toEqual(null);

		expect(Memcached.cache.size).toEqual(1);
		expect(Memcached.head.key).toEqual("hola");
		expect(Memcached.head.datablock).toEqual("LAST");
		expect(Memcached.head.casIds.contains(1)).toEqual(null);
		Memcached.flush();
	}
);

test("Delete a node, when the memcached is empty", () => {
	expect(Memcached.deleteNode("hola")).toEqual(false);

	expect(Memcached.cache.size).toEqual(0);

	Memcached.flush();
});

test("Delete a node, when the memcached only contains that node", () => {
	Memcached.add("last", 15, 0, 4, "LAST", 1);
	expect(Memcached.deleteNode("last")).toEqual(true);

	expect(Memcached.cache.size).toEqual(0);
	expect(Memcached.head).toEqual(null);
	expect(Memcached.tail).toEqual(null);

	Memcached.flush();
});

test(
	"Delete a node, when the memcached contains 3 or more nodes, and the one beining deleted" +
		" it's in the middle",
	() => {
		Memcached.add("last", 15, 0, 4, "LAST", 1);
		Memcached.add("mid", 14, 0, 6, "MIDDLE", 1);
		Memcached.add("first", 14, 0, 5, "FIRST", 1);
		expect(Memcached.deleteNode("mid")).toEqual(true);

		expect(Memcached.cache.size).toEqual(2);
		expect(Memcached.head.key).toEqual("first");
		expect(Memcached.tail.key).toEqual("last");
		expect(Memcached.head.next.key).toEqual("last");
		expect(Memcached.tail.prev.key).toEqual("first");
		expect(Memcached.head.prev).toEqual(null);
		expect(Memcached.tail.next).toEqual(null);
		Memcached.flush();
	}
);
