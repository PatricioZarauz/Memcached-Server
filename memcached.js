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
     * @param {Boolean} noreply - The key of the node to add to the memcached.
     * @param {string} datablock - The key of the node to add to the memcached.
     * @returns {string} - The result of setting the node.
     */
    set(key, flags, exptime, bytes, datablock, noreply = false,) {
        if (this.add(key, flags, exptime, bytes, datablock, false) === "STORED\r\n"){
            if (noreply){
                return null;
            }
            else{
                return "STORED\r\n";
            }
        }
        else {
            return this.replace(key, flags, exptime, bytes, datablock, noreply);
        }
    }

    /**
     * This function allows us to add a Node to the memcached that is not currently in the memcached.
     * @param {string} key - The key of the node to add to the memcached.
     * @param {Number} flags - The flags of the node to add to the memcached.
     * @param {Number} exptime - The expiration time of the node to add to the memcached, this is measured in seconds.
     * @param {Number} bytes - The amount of bytes of the datablock of the node to add to the memcached.
     * @param {Boolean} noreply - A boolean flag that says if the client wants a reply of the operation
     * @param {string} datablock - The datablock of the node to add to the memcached.
     * @returns {string} - The result of setting the node.
     */
    add(key, flags, exptime, bytes, datablock, noreply = false){
        if (this.cache.get(key) != null || exptime < 0){
            if (noreply){
                return null;
            }
            else{
                return "NOT_STORED\r\n";
            }
        }
        else{
            this.ensureLimit();

            if (this.head != null){
                const node = new Node(key, flags, exptime, bytes, datablock, this.head);
                this.head.prev = node;
                this.head = node
            }
            else{
                this.head = this.tail = new Node(key, flags, exptime, bytes, datablock);
            }

            this.cache.set(this.head.key, this.head);

            if (this.head.exptime > 0){
                this.head.timeOut = setTimeout(this.deleteNode, exptime * 1000, key);
            }

            if (noreply){
                return null;
            }
            else{
                return "STORED\r\n";
            }
        }
    }

    /**
     * This function allows us to replace a Node of the memcached.
     * @param {string} key - The key of the node to replace to the memcached.
     * @param {Number} flags - The flags of the node to replace to the memcached.
     * @param {Number} exptime - The expiration time of the node to update of the memcached, this is measured in seconds.
     * @param {Number} bytes - The amount of bytes of the datablock of the node to add to the memcached.
     * @param {Boolean} noreply - A boolean flag that says if the client wants a reply of the operation.
     * @param {string} datablock - The datablock of the node to add to the memcached.
     * @returns {string} - The result of setting the node.
     */
    replace(key, flags, exptime, bytes, datablock, noreply = false){
        if (this.updateNode(key, flags, exptime, bytes, datablock)){
            if (noreply){
                return null;
            }
            else {
                return "STORED\r\n";
            }
        }
        else {
            if (noreply){
                return null;
            }
            else{
                return "NOT_STORED\r\n";
            }
        }
    }

    /**
     * This function allows us to concatenate at the end of the datablock of the desired node (that already exists in the memcached) the datablock desired.
     * @param {string} key - The key of the node to concatenate the datablock to.
     * @param {Number} flags - The flags of the node to concatenate the datablock to.
     * @param {Number} exptime - The new expiration time of the node having it's datablock concatenated, this is measured in seconds.
     * @param {Number} bytes - The amount of bytes of the new datablock of the node to add to the memcached.
     * @param {Boolean} noreply - A boolean flag that says if the client wants a reply of the operation.
     * @param {string} datablock - The datablock of the node to contatenate at the end of the original datablock stored in the memcached.
     * @returns {string} - The result if the node was updated or not, depending on the noreply contidion.
     */
    append(key, flags, exptime, bytes, datablock, noreply = false){
        if (this.updateNode(key, flags, exptime, bytes, datablock, "append")){
            if (noreply){
                return null;
            }
            else {
                return "STORED\r\n";
            }
        }
        else {
            if (noreply){
                return null;
            }
            else {
                return "NOT_STORED\r\n";
            }
        }
    }

    /**
     * This function allows us to concatenate at the begining of the datablock of the desired node (that already exists in the memcached) the datablock desired.
     * @param {string} key - The key of the node to concatenate the datablock to.
     * @param {Number} flags - The flags of the node to concatenate the datablock to.
     * @param {Number} exptime - The new expiration time of the node having it's datablock concatenated, this is measured in seconds.
     * @param {Number} bytes - The amount of bytes of the new datablock of the node to add to the memcached.
     * @param {Boolean} noreply - A boolean flag that says if the client wants a reply of the operation.
     * @param {string} datablock - The datablock of the node to contatenate at the begining of the original datablock stored in the memcached.
     * @returns {string} - The result if the node was updated or not, depending on the noreply contidion.
     */
    prepend(key, flags, exptime, bytes, datablock, noreply = false){
        if (this.updateNode(key, flags, exptime, bytes, datablock, "prepend")){
            if (noreply){
                return null;
            }
            else {
                return "STORED\r\n";
            }
        }
        else {
            if (noreply){
                return null;
            }
            else {
                return "NOT_STORED\r\n";
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
            deleteNode(this.tail.key);
        }
    }

    /**
     * Node which is passed through the arguments will be updated.
     * @param {string} key - The key of the node that will be updated.
     * @param {Number} flags - The updated flags of the node.
     * @param {Number} exptime - The updated expiration time of the node.
     * @param {Number} bytes - The updated bytes of the node.
     * @param {string} datablock - The updated datablock of the node.
     * @param {string} apOrPrePend - The string tells us if we need to append, prepend or if the data just needs to be updated.
     * @returns {Boolean} - It tells us if the node of the given key was updated or not.
     */
    updateNode(key, flags, exptime, bytes, datablock, apOrPrePend = null){
        const node = this.cache.get(key);
        if (node != null){
            node.flags = flags;
            if (apOrPrePend === "append"){
                node.datablock = node.datablock + datablock;
                node.bytes = node.bytes + bytes;
            }
            else if (apOrPrePend === "prepend"){
                node.datablock = datablock + node.datablock;
                node.bytes = bytes + node.bytes;
            }
            else{
                node.datablock = datablock;
                node.bytes = bytes;
            }
            node.exptime = exptime;

            if (node.prev != null){
                node.prev.next = node.next;
            }
            if (node.next != null){
                node.next.prev = node.prev;
            }
            node.prev = null;
            node.next = this.head;
            this.head = node;

            this.cache.set(node.key, node);
            if (node.exptime > 0){
                node.timeOut = setTimeout(this.deleteNode, exptime * 1000, key);
            }
            else if (node.exptime === 0){
                if (node.timeOut != null){
                    clearTimeout(node.timeOut);
                }
            }
            else {
                this.deleteNode(key);
                return false;
            }
            return true;
        }
        else{
            return false;
        }

    }

    /**
     * Deletes the Node with the key given from the memcached.
     * @param {Number} key - The key of the node that will be deleted.
     * @returns {Boolean} - It returns whether if the node was deleted or not.
     */
    deleteNode(key){
        const node = this.cache.get(key);
        if (node != null){
            if (node.prev != null){
                node.prev.next = node.next;
            }
            else{
                this.head = node.next;
            }

            if (node.next != null){
                node.next.prev = node.prev;
            }
            else{
                this.tail = node.prev;
            }

            if (node.timeOut){
                clearTimeout(node.timeOut);
            }

            memcached.cache.delete(key);
            return true;
        }
        else{
            return false;
        }
    }
}

module.exports = Memcached;