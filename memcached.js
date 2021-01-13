const Node = require("./node");

/**
 * The structures used to the represent the Memcached were a Least Recently Used (LRU) Map for
 * storing the items in the cache and a Red Black Tree for storing the items casIds.
 * A LRU Map was used because in the modern javascript (which node.js is based on) the Map allows
 * us to get O(1) for the insert, delete and search operations. Combining it with an LRU it
 * enables us to recreate a memcached since when the cache it's full, it needs to remove the
 * least recently used item.
 * A Red Black Tree structure was used for storing the casIds since it allows us to have O(log n)
 * for the insert and search operations (in the worst case) as well as being able to flush (empty)
 * the tree in O(1) which was crucial, since the flush operation is used frecuently. The AVL tree
 * structure was dismissed since it has a higher cost for inserting a node, given that it requires
 * more rotations to balance out the tree.
 */
class Memcached {
	/**
	 * Memcached is the class responsable of storing all the Nodes.
	 * @param {Number} limit - The limit of Nodes to be stored, by default the limit is 100 items.
	 * @param {Node} head - Last used node.
	 * @param {Node} tail - Least used node.
	 * @param {Map<String, Node>} cache - It is where the Nodes are stored.
	 */
	constructor(limit = 100) {
		this.limit = limit;
		this.head = null;
		this.tail = null;
		/**
		 * @type {Map<String, Node>} It is where the Nodes are stored.
		 */
		this.cache = new Map();
	}

	/**
	 * This function allows us to update or add a Node to the memcached.
	 * @param {string} key - Key of the node to set to the memcached.
	 * @param {Number} flags - Flags of the node to set to the memcached.
	 * @param {Number} exptime - Expiration time of the node to set to the memcached, this is
	 * measured in seconds.
	 * @param {Number} bytes - Byte of the node to set to the memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Data of the node that's being set to memcached.
	 * @param {Number} casId - Number that identifies the user that's setting the node.
	 * @returns {string} - Reply message after setting the node.
	 */
	set(key, flags, exptime, bytes, datablock, casId, noreply = false) {
		if (
			this.add(key, flags, exptime, bytes, datablock, casId, false) ===
			"STORED\r\n"
		) {
			if (noreply) {
				return null;
			} else {
				return "STORED\r\n";
			}
		} else {
			return this.replace(
				key,
				flags,
				exptime,
				bytes,
				datablock,
				casId,
				noreply
			);
		}
	}

	/**
	 * This function allows to add a Node to the memcached that is not currently in the
	 * memcached.
	 * @param {string} key - Key of the node to add to the memcached.
	 * @param {Number} flags - Flags of the node to add to the memcached.
	 * @param {Number} exptime - Expiration time of the node to add to the memcached, this is
	 * measured in seconds.
	 * @param {Number} bytes - Amount of bytes of the datablock of the node to add to the
	 * memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Data of the node that's beining set to memcached.
	 * @param {Number} casId - Number that identifies the user that's adding the node.
	 * @returns {string} - Reply message after adding the node.
	 */
	add(key, flags, exptime, bytes, datablock, casId, noreply = false) {
		if (this.cache.get(key) != null || exptime < 0) {
			if (noreply) {
				return null;
			} else {
				return "NOT_STORED\r\n";
			}
		} else {
			this.ensureLimit();

			if (this.head != null) {
				const node = new Node(
					key,
					flags,
					exptime,
					bytes,
					datablock,
					casId,
					this.head
				);
				this.head.prev = node;
				this.head = node;
			} else {
				this.head = this.tail = new Node(
					key,
					flags,
					exptime,
					bytes,
					datablock,
					casId
				);
			}

			this.cache.set(this.head.key, this.head);

			if (this.head.exptime > 0) {
				this.head.timeOut = setTimeout(
					this.deleteNode,
					exptime * 1000,
					key,
					this
				);
			}

			if (noreply) {
				return null;
			} else {
				return "STORED\r\n";
			}
		}
	}

	/**
	 * This function allows us to replace a Node of the memcached.
	 * @param {string} key - Key of the node to replace to the memcached.
	 * @param {Number} flags - Flags of the node to replace to the memcached.
	 * @param {Number} exptime - Expiration time of the node to update of the memcached, this
	 * is measured in seconds.
	 * @param {Number} bytes - Amount of bytes of the datablock of the node to replace in the
	 * memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Data of the node that's beining replaced at the memcached.
	 * @param {Number} casId - Number that identifies the user that's replacing the node.
	 * @returns {string} - Reply message after replacing the node.
	 */
	replace(key, flags, exptime, bytes, datablock, casId, noreply = false) {
		if (this.updateNode(key, flags, exptime, bytes, datablock, casId)) {
			if (noreply) {
				return null;
			} else {
				return "STORED\r\n";
			}
		} else {
			if (noreply) {
				return null;
			} else {
				return "NOT_STORED\r\n";
			}
		}
	}

	/**
	 * This function allows us to concatenate, at the end of the datablock of the desired node
	 * (that already exists in the memcached) the datablock desired.
	 * @param {string} key - Key of the node to concatenate the datablock to.
	 * @param {Number} flags - Flags of the node to concatenate the datablock to.
	 * @param {Number} exptime - New expiration time of the node having it's datablock
	 * concatenated, this is measured in seconds.
	 * @param {Number} bytes - Amount of bytes of the new datablock of the node to append
	 * to the memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Datablock of the node to contatenate at the end of the
	 * original datablock stored in the memcached.
	 * @param {Number} casId - Number that identifies the user that's appending the node.
	 * @returns {string} - Reply message after appending the datablock to the node.
	 */
	append(key, flags, exptime, bytes, datablock, casId, noreply = false) {
		if (
			this.updateNode(
				key,
				flags,
				exptime,
				bytes,
				datablock,
				casId,
				"append"
			)
		) {
			if (noreply) {
				return null;
			} else {
				return "STORED\r\n";
			}
		} else {
			if (noreply) {
				return null;
			} else {
				return "NOT_STORED\r\n";
			}
		}
	}

	/**
	 * This function allows us to concatenate at the begining of the datablock of the desired node
	 * (that already exists in the memcached) the datablock desired.
	 * @param {string} key - Key of the node to concatenate the datablock to.
	 * @param {Number} flags - Flags of the node to concatenate the datablock to.
	 * @param {Number} exptime - New expiration time of the node having it's datablock
	 * concatenated, this is measured in seconds.
	 * @param {Number} bytes - Amount of bytes of the new datablock of the node to prepend to
	 * the memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Datablock of the node to contatenate at the begining of
	 * the original datablock stored in the memcached.
	 * @param {Number} casId - Number that identifies the user that's prepending the node.
	 * @returns {string} - Reply message after prepending the datablock to the node.
	 */
	prepend(key, flags, exptime, bytes, datablock, casId, noreply = false) {
		if (
			this.updateNode(
				key,
				flags,
				exptime,
				bytes,
				datablock,
				casId,
				"prepend"
			)
		) {
			if (noreply) {
				return null;
			} else {
				return "STORED\r\n";
			}
		} else {
			if (noreply) {
				return null;
			} else {
				return "NOT_STORED\r\n";
			}
		}
	}

	/**
	 * This function allows us to set a Node only if it exists in the memcached and it wasn't
	 * updated since the current casId last added, updated or fetched it.
	 * @param {string} key - Key of the node to update in the  memcached.
	 * @param {Number} flags - Flags of the node to update in the memcached.
	 * @param {Number} exptime - Expiration time of the node to update in the memcached, this
	 * is measured in seconds.
	 * @param {Number} bytes - Amount of bytes of the datablock of the node to update in the
	 * memcached.
	 * @param {Boolean} noreply - Boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - Data of the node that's beining updated in the memcached.
	 * @param {Number} casId - Number that identifies the user that's updating the node.
	 * @returns {string} - Reply message after replacing the node.
	 */
	cas(key, flags, exptime, bytes, datablock, casId, noreply = false) {
		const node = this.cache.get(key);
		if (node != null) {
			if (node.casIds.contains(casId) != null) {
				return this.set(
					key,
					flags,
					exptime,
					bytes,
					datablock,
					casId,
					noreply
				);
			} else {
				if (noreply) {
					return null;
				} else {
					return "EXISTS\r\n";
				}
			}
		} else {
			if (noreply) {
				return null;
			} else {
				return "NOT_FOUND\r\n";
			}
		}
	}

	/**
	 * This function allows us to retrieve the value of one or more keys stored in the memcached.
	 * @param {[string]} keys - Key(s) of the node(s) to retrieve from memcached.
	 * @param {Number} casId - Number that identifies the user that's trying to read the node.
	 * @returns {[string]} - Value(s) of the key(s) of retrieved node(s).
	 */
	get(keys, casId) {
		let results = [];
		keys.forEach((key) => {
			let node = this.cache.get(key);
			if (node != null) {
				this.reorganizeCache(node);
				node.casIds.add(casId, true);
				this.cache.set(node.key, node);
				results.push(
					`VALUE ${node.key} ${node.flags} ${node.bytes}\r\n`
				);
				results.push(`${node.datablock}\r\n`);
			}
		});
		results.push("END\r\n");
		return results;
	}

	/**
	 * This function allows us to retrieve the value, with it's casId, of one or more keys stored
	 * in the memcached.
	 * @param {[string]} keys - Key(s) of the node(s) to retrieve of memcached.
	 * @param {Number} casId - Number that identifies the user that's trying to read the node.
	 * @returns {[string]} - Value(s) of the key(s) of retrieved node(s), with their
	 * respective casId.
	 */
	gets(keys, casId) {
		let results = [];
		keys.forEach((key) => {
			let node = this.cache.get(key);
			if (node != null) {
				this.reorganizeCache(node);
				node.casIds.add(casId, true);
				this.cache.set(node.key, node);
				results.push(
					`VALUE ${node.key} ${node.flags} ${node.bytes} ${casId}\r\n`
				);
				results.push(`${node.datablock}\r\n`);
			}
		});
		results.push("END\r\n");
		return results;
	}

	/**
	 * This function makes sure that the limit of the memcached is being respected; if it's about
	 * to be passed, it deletes the least used node of the memcached.
	 */
	ensureLimit() {
		if (this.cache.size === this.limit) {
			this.deleteNode(this.tail.key);
		}
	}

	/**
	 * Node which is passed through the arguments will be updated.
	 * @param {string} key - Key of the node that will be updated.
	 * @param {Number} flags - Updated flags of the node.
	 * @param {Number} exptime - Updated expiration time of the node.
	 * @param {Number} bytes - Updated bytes of the node.
	 * @param {string} datablock - Updated datablock of the node.
	 * @param {string} apOrPrePend - The string tells us if we need to append, prepend or if the
	 * data just needs to be updated.
	 * @param {Number} casId - Number that identifies the user that's updating the node.
	 * @returns {Boolean} - It tells us if the node of the given key was updated or not.
	 */
	updateNode(
		key,
		flags,
		exptime,
		bytes,
		datablock,
		casId,
		apOrPrePend = null
	) {
		const node = this.cache.get(key);
		if (node != null) {
			node.flags = flags;
			if (apOrPrePend === "append") {
				node.datablock = node.datablock + datablock;
				node.bytes = node.bytes + bytes;
			} else if (apOrPrePend === "prepend") {
				node.datablock = datablock + node.datablock;
				node.bytes = bytes + node.bytes;
			} else {
				node.datablock = datablock;
				node.bytes = bytes;
			}
			node.exptime = exptime;

			this.reorganizeCache(node);

			node.casIds.flush();
			node.casIds.add(casId, true);

			this.cache.set(node.key, node);
			if (node.exptime > 0) {
				node.timeOut = setTimeout(
					this.deleteNode,
					exptime * 1000,
					key,
					this
				);
			} else if (node.exptime === 0) {
				if (node.timeOut != null) {
					clearTimeout(node.timeOut);
				}
			} else {
				this.deleteNode(key);
				return false;
			}
			return true;
		} else {
			return false;
		}
	}

	/**
	 * This function allows us to reorganize the cache of the memcached, by moving the desired node
	 * to the head of the LRU.
	 * @param {Node} node - Key(s) of the node(s) to retrieve from memcached.
	 */
	reorganizeCache(node) {
		if (node.prev != null) {
			node.prev.next = node.next;
		}
		if (node.next != null) {
			node.next.prev = node.prev;
			node.next = this.head;
		}
		node.prev = null;
		this.head = node;
	}

	/**
	 * Deletes the Node with the key given from the memcached.
	 * @param {Number} key - Key of the node that will be deleted.
	 * @param {Memcached} memcached - Memcached where we are working on.
	 * @returns {Boolean} - Returns if the node was deleted or not.
	 */
	deleteNode(key, memcached = this) {
		const node = memcached.cache.get(key);
		if (node != null) {
			if (node.prev != null) {
				node.prev.next = node.next;
			} else {
				this.head = node.next;
			}

			if (node.next != null) {
				node.next.prev = node.prev;
			} else {
				this.tail = node.prev;
			}

			if (node.timeOut) {
				clearTimeout(node.timeOut);
			}

			node.casIds.flush();
			memcached.cache.delete(key);
			return true;
		} else {
			return false;
		}
	}
}

module.exports = Memcached;
