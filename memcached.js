const Node = require('./node');

/**
 * Memcached is the class responsable of storing all the Nodes.
 * @param {Number} Memcached.limit - The limit of Nodes to be stored.
 * @param {Node} Memcached.head - The last used node.
 * @param {Node} Memcached.tail - The least used node.
 * @param {Map<string, Node>} Memcached.cache - Where the Nodes are stored.
 */
class Memcached {
    constructor (limit = 100){
        this.limit = limit
        this.head = null
        this.tail = null
        this.cache = new Map()
    }
    /**
     * This function allows us to update or add a Node to the memcached.
     * @param {string} key - The key of the node to add to the memcached.
     * @param {Number} flags - The flags of the node to add to the memcached.
     * @param {Number} exptime - The expiration time of the node to add to the memcached, this is measured in seconds.
     * @param {Number} bytes - The byte of the node to add to the memcached.
     * @param {string} noreply - The key of the node to add to the memcached.
     * @param {string} datablock - The key of the node to add to the memcached.
     * @returns {string} - The result of setting the node.
     */
    set(key, flags, exptime, bytes, noreply = false, datablock) {
        let addRes = this.add(key, flags, exptime, bytes, noreply, datablock);

        if (addRes === "NOT_STORED\r\n"){
            let replaceRes = this.replace(key, flags, exptime, bytes, noreply, datablock);
            if (replaceRes === "STORED\r\n"){
                return replaceRes;
            }
            else {
                return null;
            }
        }
        else {
            return addRes;
        }
    }

    /**
     * This function allows us to add a Node to the memcached that is not currently in the memcached.
     * @param {string} key - The key of the node to add to the memcached.
     * @param {Number} flags - The flags of the node to add to the memcached.
     * @param {Number} exptime - The expiration time of the node to add to the memcached, this is measured in seconds.
     * @param {Number} bytes - The amount of bytes of the datablock of the node to add to the memcached.
     * @param {string} noreply - A boolean flag that says if the client wants a reply of the operation
     * @param {string} datablock - The datablock of the node to add to the memcached.
     * @returns {string} - The result of setting the node.
     */
    add(key, flags, exptime, bytes, noreply = false, datablock){
        const oldNode = this.cache.get(key);
        if (!oldNode){
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
            else{
                return null;
            }
        }
        else {
            if (!noreply){
                return "NOT_STORED\r\n";
            }
            else{
                return null;
            }
        }
    }

    /**
     * This function allows us to replace a Node of the memcached.
     * @param {string} key - The key of the node to replace to the memcached.
     * @param {Number} flags - The flags of the node to replace to the memcached.
     * @param {Number} exptime - The expiration time of the node to update of the memcached, this is measured in seconds.
     * @param {Number} bytes - The amount of bytes of the datablock of the node to add to the memcached.
     * @param {string} noreply - A boolean flag that says if the client wants a reply of the operation.
     * @param {string} datablock - The datablock of the node to add to the memcached.
     * @returns {string} - The result of setting the node.
     */
    replace(key, flags, exptime, bytes, noreply = false, datablock){
        const oldNode = this.cache.get(key);

        if (oldNode){
            this.updateNode(oldNode, flags, exptime, bytes, datablock, this);
            if (!noreply){
                return "STORED\r\n";
            }
            else {
                return null;
            }
        }
        else {
            return "NOT_STORED\r\n";
        }
    }

    /**
     * This function allows us to concatenate at the end of the datablock of the desired node (that already exists in the memcached) the datablock desired.
     * @param {string} key - The key of the node to concatenate the datablock to.
     * @param {Number} flags - The flags of the node to concatenate the datablock to.
     * @param {Number} exptime - The new expiration time of the node having it's datablock concatenated, this is measured in seconds.
     * @param {Number} bytes - The amount of bytes of the new datablock of the node to add to the memcached.
     * @param {string} noreply - A boolean flag that says if the client wants a reply of the operation.
     * @param {string} datablock - The datablock of the node to contatenate at the end of the original datablock stored in the memcached.
     * @returns {string} - The result if the node was updated or not.
     */
    append(key, flags, exptime, bytes, noreply = false, datablock){
        const oldNode = this.cache.get(key);

        if (oldNode){
            this.updateNode(oldNode, flags, exptime, oldNode.bytes + bytes, oldNode.datablock + datablock, this);
            if (!noreply){
                return "STORED\r\n";
            }
            else {
                return null;
            }
        }
        else {
            if (!noreply){
                return "NOT_STORED\r\n";
            }
            else {
                return null;
            }
        }
    }

    /**
     * This function allows us to concatenate at the begining of the datablock of the desired node (that already exists in the memcached) the datablock desired.
     * @param {string} key - The key of the node to concatenate the datablock to.
     * @param {Number} flags - The flags of the node to concatenate the datablock to.
     * @param {Number} exptime - The new expiration time of the node having it's datablock concatenated, this is measured in seconds.
     * @param {Number} bytes - The amount of bytes of the new datablock of the node to add to the memcached.
     * @param {string} noreply - A boolean flag that says if the client wants a reply of the operation.
     * @param {string} datablock - The datablock of the node to contatenate at the begining of the original datablock stored in the memcached.
     * @returns {string} - The result if the node was updated or not.
     */
    prepend(key, flags, exptime, bytes, noreply = false, datablock){
        const oldNode = this.cache.get(key);

        if (oldNode){
            this.updateNode(oldNode, flags, exptime, oldNode.bytes + bytes, datablock + oldNode.datablock, this);
            if (!noreply){
                return "STORED\r\n";
            }
            else {
                return null;
            }
        }
        else {
            if (!noreply){
                return "NOT_STORED\r\n";
            }
            else {
                return null;
            }
        }
    }

    /**
     * This function allows us to retrieve the value of one or more keys stored in the memcached.
     * @param {[string]} keys - The key(s) of the node(s) to retrive of memcached.
     * @returns {[string]} - The value(s) of the key(s) of retrived node(s).
     */
    get(keys){
        let results = [];
        keys.forEach(key => {
            let node = this.cache.get(key);
            if (node){
                results.push(`VALUE ${node.key} ${node.flags} ${node.bytes}\r\n`);
                results.push(`${node.datablock}\r\n`);
            }
        });
        results.push("END\r\n");
        return results;
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