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