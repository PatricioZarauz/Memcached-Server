const Node = require('./node');

/**
 * Memcached is the class responsable of storing all the Nodes.
 * @param {Number} Memcached.limit - The limit of Nodes to be stored.
 * @param {Node} Memcached.head - The last used node.
 * @param {Node} Memcached.tail - The least used node.
 * @param {Map<string, number>} Memcached.cache - The Node stored.
 */
class Memcached {
    constructor (limit = 100){
        this.limit = limit
        this.head = null
        this.tail = null
        this.cache = new Map()
    }
    /**
     * Node is the class being stored as the value in the memcached cache.
     * @param {string} key - The key of the node to add to the memcached.
     * @param {Number} flags - The flags of the node to add to the memcached.
     * @param {Number} exptime - The expiration time of the node to add to the memcached, this is measured in seconds.
     * @param {Number} bytes - The byte of the node to add to the memcached.
     * @param {string} noreply - The key of the node to add to the memcached.
     * @param {string} datablock - The key of the node to add to the memcached.
     * @returns {string} - The result of setting the node.
     */
    set(key, flags, exptime, bytes, noreply = false, datablock) {

        const oldNode = this.cache.get(key);

        if (oldNode){
            this.updateNode(oldNode, flags, exptime, bytes, datablock, this);
            if (!noreply){
                return "STORED\r\n";
            }
        }
        else{
            this.ensureLimit();

            if (!this.head){
                this.head = this.tail = new Node(key, flags, exptime, bytes, datablock);
            }
            else{
                const node = new Node(key, flags, exptime, bytes, datablock, this.head);
                this.head.prev = node;
                this.head = node
            }

            this.cache.set(this.head.key, this.head);

            if (!noreply){
                return "STORED\r\n";
            }
        }

    }

    ensureLimit(){
        if (this.cache.size === this.limit){
            this.remove(this.tail.key);
        }
    }

    /**
     * Node which is passed through the arguments will be updated.
     * @param {Node} node - The node that will be updated.
     * @param {Number} flags - The updated flags of the node.
     * @param {Number} exptime - The updated expiration time of the node.
     * @param {Number} bytes - The updated bytes of the node.
     * @param {string} datablock - The updated datablock of the node.
     * @param {Memcached} memcached - The memcached we are working on.
     */
    updateNode(node, flags, exptime, bytes, datablock, memcached){
        node.flags = flags;
        node.exptime = exptime;
        node.bytes = bytes;
        node.datablock = datablock;
        if (memcached.cache.size > 1){
            node.prev.next = node.next;
            node.prev = null;
            node.next = memcached.head;
            memcached.head = node;
        }
        memcached.cache.set(node.key, node);
    }
}

module.exports = Memcached;