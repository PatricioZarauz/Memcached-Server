/**
 * Node is the class being stored as the value in the memcached cache.
 * @param {string} Node.key - The key of the node.
 * @param {string} Node.flags - The flags of the node.
 * @param {string} Node.exptime - The expiration time of the node.
 * @param {string} Node.bytes - The bytes of the node.
 * @param {string} Node.datablock - The datablock of the node.
 * @param {Node} Node.next - The following node, inorder to form an LRU.
 * @param {Node} Node.prev - The previous node, inorder to form an LRU.
 */
class Node {
    constructor (key, flags, exptime, bytes, datablock, next= null, prev=null){
        this.key = key
        this.flags = flags
        this.exptime = exptime
        this.bytes = bytes
        this.datablock = datablock
        this.timeOut = null
        this.next = next
        this.prev = prev
    }
}

module.exports = Node;