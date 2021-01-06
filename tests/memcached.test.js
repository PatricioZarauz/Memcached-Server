const { TestScheduler } = require('jest');
const Memcached = require('../memcached');

test('Add a node when the memcached is empty', () =>{
    const memcached = new Memcached();

    expect(memcached.add("hola", 13, 0, 4, "HOLA")).toEqual("STORED\r\n");

    expect(1).toEqual(memcached.cache.size);
    expect("hola").toEqual(memcached.head.key);
})

test('Add a node when the memcached already has an node', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");

    expect(memcached.add("hola", 13, 0, 4, "HOLA")).toEqual("STORED\r\n");


    expect(2).toEqual(memcached.cache.size);
    expect("hola").toEqual(memcached.head.key);
})

test('Add a node that\'s already in the memcached', () =>{
    const memcached = new Memcached();

    memcached.add("hola", 15, 0, 4, "HOLA");

    expect(memcached.add("hola", 13, 0, 4, "LAST")).toEqual("NOT_STORED\r\n");

    expect(1).toEqual(memcached.cache.size);
    expect("HOLA").toEqual(memcached.head.datablock);
})

test('Add a node when the memcached is empty, with noreply', () =>{
    const memcached = new Memcached();

    expect(memcached.add("hola", 13, 0, 4, "HOLA",true)).toEqual(null);

    expect(1).toEqual(memcached.cache.size);
    expect("hola").toEqual(memcached.head.key);
})

test('Add a node that\'s already in the memcached, with noreply', () =>{
    const memcached = new Memcached();

    memcached.add("hola", 15, 0, 4, "HOLA");

    expect(memcached.add("hola", 13, 0, 4, "LAST", true)).toEqual(null);

    expect(1).toEqual(memcached.cache.size);
    expect("HOLA").toEqual(memcached.head.datablock);
})

test('Add a node when the memcached already has an node, with noreply', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");

    expect(memcached.add("hola", 13, 0, 4, "HOLA", true)).toEqual(null);


    expect(2).toEqual(memcached.cache.size);
    expect("hola").toEqual(memcached.head.key);
})

test('Replace a node when the memcached is empty', () =>{
    const memcached = new Memcached();

    expect(memcached.replace("hola", 13, 0, 4, "HOLA")).toEqual("NOT_STORED\r\n");

    expect(0).toEqual(memcached.cache.size);
})

test('Replace a node that\'s not in the memcached that\'s not empty', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");

    expect(memcached.replace("hola", 13, 0, 4, "HOLA")).toEqual("NOT_STORED\r\n");


    expect(1).toEqual(memcached.cache.size);
    expect("last").toEqual(memcached.head.key);
})

test('Replace a node that\'s in the memcached', () =>{
    const memcached = new Memcached();

    memcached.add("hola", 15, 0, 4, "LAST");

    expect(memcached.replace("hola", 15, 0, 4, "HOLA")).toEqual("STORED\r\n");


    expect(1).toEqual(memcached.cache.size);
    expect("hola").toEqual(memcached.head.key);
})

test('Replace a node that\'s the tail of the memcached LRU', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");
    memcached.add("hola", 15, 0, 4, "HOLA");

    expect(memcached.replace("last", 15, 0, 5, "FIRST")).toEqual("STORED\r\n");


    expect(2).toEqual(memcached.cache.size);
    expect("last").toEqual(memcached.head.key);
    expect("FIRST").toEqual(memcached.head.datablock);
})

test('Replace a node that\'s in the middle of the memcached LRU', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");
    memcached.add("mid", 14, 0, 6, "MIDDLE");
    memcached.add("first", 14, 0, 5, "FIRST");

    expect(memcached.replace("mid", 15, 0, 4, "HOLA")).toEqual("STORED\r\n");


    expect(memcached.cache.size).toEqual(3);
    expect(memcached.head.key).toEqual("mid");
    expect(memcached.head.datablock).toEqual("HOLA");
    expect(memcached.head.next.key).toEqual("first");
    expect(memcached.tail.key).toEqual("last");
    expect(memcached.tail.prev.key).toEqual("first");
})

test('Replace a node when the memcached is empty, with noreply', () =>{
    const memcached = new Memcached();

    expect(memcached.replace("hola", 13, 0, 4, "HOLA", true)).toEqual(null);

    expect(0).toEqual(memcached.cache.size);
})

test('Replace a node that\'s not in the memcached that\'s not empty, with noreply', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");

    expect(memcached.replace("hola", 13, 0, 4, "HOLA", true)).toEqual(null);


    expect(1).toEqual(memcached.cache.size);
    expect("last").toEqual(memcached.head.key);
})

test('Replace a node that\'s in the memcached, with noreply', () =>{
    const memcached = new Memcached();

    memcached.add("hola", 15, 0, 4, "LAST");

    expect(memcached.replace("hola", 15, 0, 4, "HOLA", true)).toEqual(null);


    expect(1).toEqual(memcached.cache.size);
    expect("hola").toEqual(memcached.head.key);
})

test('Replace a node that\'s the tail of the memcached LRU, with noreply', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");
    memcached.add("hola", 15, 0, 4, "HOLA");

    expect(memcached.replace("last", 15, 0, 5, "FIRST", true)).toEqual(null);


    expect(2).toEqual(memcached.cache.size);
    expect("last").toEqual(memcached.head.key);
    expect("FIRST").toEqual(memcached.head.datablock);
})

test('Replace a node that\'s in the middle of the memcached LRU, with noreply', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");
    memcached.add("mid", 14, 0, 6, "MIDDLE");
    memcached.add("first", 14, 0, 5, "FIRST");

    expect(memcached.replace("mid", 15, 0, 4, "HOLA", true)).toEqual(null);


    expect(memcached.cache.size).toEqual(3);
    expect(memcached.head.key).toEqual("mid");
    expect(memcached.head.datablock).toEqual("HOLA");
    expect(memcached.head.next.key).toEqual("first");
    expect(memcached.tail.key).toEqual("last");
    expect(memcached.tail.prev.key).toEqual("first");
})

test('Append a string to a node with an empty memcached', () =>{
    const memcached = new Memcached();

    expect(memcached.append("hola", 15, 0, 4, "HOLA")).toEqual("NOT_STORED\r\n");


    expect(memcached.cache.size).toEqual(0);
    expect(memcached.head).toEqual(null);
})

test('Append a string to a node without the desired node in the memcached', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");
    expect(memcached.append("hola", 15, 0, 4, "HOLA")).toEqual("NOT_STORED\r\n");


    expect(memcached.cache.size).toEqual(1);
    expect(memcached.head.key).toEqual("last");
})

test('Append a string to a desired node in the memcached', () =>{
    const memcached = new Memcached();

    memcached.add("hola", 15, 0, 4, "LAST");
    expect(memcached.append("hola", 15, 0, 4, "HOLA")).toEqual("STORED\r\n");


    expect(memcached.cache.size).toEqual(1);
    expect(memcached.head.datablock).toEqual("LASTHOLA");
    expect(memcached.head.bytes).toEqual(8);
})

test('Append a string to a node with an empty memcached, with noreply', () =>{
    const memcached = new Memcached();

    expect(memcached.append("hola", 15, 0, 4, "HOLA", true)).toEqual(null);


    expect(memcached.cache.size).toEqual(0);
    expect(memcached.head).toEqual(null);
})

test('Append a string to a node without the desired node in the memcached, with noreply', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");
    expect(memcached.append("hola", 15, 0, 4, "HOLA", true)).toEqual(null);


    expect(memcached.cache.size).toEqual(1);
    expect(memcached.head.key).toEqual("last");
})

test('Append a string to a desired node in the memcached, with noreply', () =>{
    const memcached = new Memcached();

    memcached.add("hola", 15, 0, 4, "LAST");
    expect(memcached.append("hola", 15, 0, 4, "HOLA", true)).toEqual(null);


    expect(memcached.cache.size).toEqual(1);
    expect(memcached.head.datablock).toEqual("LASTHOLA");
    expect(memcached.head.bytes).toEqual(8);
})

test('Prepend a string to a node with an empty memcached', () =>{
    const memcached = new Memcached();

    expect(memcached.prepend("hola", 15, 0, 4, "HOLA")).toEqual("NOT_STORED\r\n");


    expect(memcached.cache.size).toEqual(0);
    expect(memcached.head).toEqual(null);
})

test('Prepend a string to a node without the desired node in the memcached', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");
    expect(memcached.prepend("hola", 15, 0, 4, "HOLA")).toEqual("NOT_STORED\r\n");


    expect(memcached.cache.size).toEqual(1);
    expect(memcached.head.key).toEqual("last");
})

test('Prepend a string to a desired node in the memcached', () =>{
    const memcached = new Memcached();

    memcached.add("hola", 15, 0, 4, "LAST");
    expect(memcached.prepend("hola", 15, 0, 4, "HOLA")).toEqual("STORED\r\n");


    expect(memcached.cache.size).toEqual(1);
    expect(memcached.head.datablock).toEqual("HOLALAST");
    expect(memcached.head.bytes).toEqual(8);
})

test('Prepend a string to a node with an empty memcached, with noreply', () =>{
    const memcached = new Memcached();

    expect(memcached.prepend("hola", 15, 0, 4, "HOLA", true)).toEqual(null);


    expect(memcached.cache.size).toEqual(0);
    expect(memcached.head).toEqual(null);
})

test('Prepend a string to a node without the desired node in the memcached, with noreply', () =>{
    const memcached = new Memcached();

    memcached.add("last", 15, 0, 4, "LAST");
    expect(memcached.prepend("hola", 15, 0, 4, "HOLA", true)).toEqual(null);


    expect(memcached.cache.size).toEqual(1);
    expect(memcached.head.key).toEqual("last");
})

test('Prepend a string to a desired node in the memcached, with noreply', () =>{
    const memcached = new Memcached();

    memcached.add("hola", 15, 0, 4, "LAST");
    expect(memcached.prepend("hola", 15, 0, 4, "HOLA", true)).toEqual(null);


    expect(memcached.cache.size).toEqual(1);
    expect(memcached.head.datablock).toEqual("HOLALAST");
    expect(memcached.head.bytes).toEqual(8);
})

test('Get the value and information of a desired node when the memcached is empty', () =>{
    const memcached = new Memcached();

    expect(memcached.get(["hola"])).toEqual(["END\r\n"]);


    expect(memcached.cache.size).toEqual(0);
    expect(memcached.head).toEqual(null);
})

test('Get the value and information of one or more desired nodes when the memcached is empty', () =>{
    const memcached = new Memcached();

    expect(memcached.get(["hola", "test"])).toEqual(["END\r\n"]);


    expect(memcached.cache.size).toEqual(0);
    expect(memcached.head).toEqual(null);
})

test('Get the value and information of a desired node, when the memcached contains it', () =>{
    const memcached = new Memcached();

    memcached.add("hola", 15, 0, 4, "LAST");
    expect(memcached.get(["hola"])).toEqual(["VALUE hola 15 4\r\n", "LAST\r\n","END\r\n"]);
})

test('Get the value and information of one or more desired nodes, when the memcached doesn\'t contain every node.', () =>{
    const memcached = new Memcached();

    memcached.add("hola", 15, 0, 4, "LAST");
    expect(memcached.get(["hola", "test"])).toEqual(["VALUE hola 15 4\r\n", "LAST\r\n","END\r\n"]);
})

test('Get the value and information of one or more desired nodes, when the memcached contains every node.', () =>{
    const memcached = new Memcached();

    memcached.add("hola", 15, 0, 4, "HOLA");
    memcached.add("last", 16, 0, 4, "LAST");
    expect(memcached.get(["hola", "last"])).toEqual(["VALUE hola 15 4\r\n", "HOLA\r\n", "VALUE last 16 4\r\n", "LAST\r\n","END\r\n"]);
})