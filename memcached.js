const Node = require("./node");

class Memcached {
	/**
	 * Memcached is the class responsable of storing all the Nodes.
	 * @param {Number} limit - The limit of Nodes to be stored.
	 * @param {Node} head - The last used node.
	 * @param {Node} tail - The least used node.
	 * @param {Map<String, Node>} cache - Where the Nodes are stored.
	 */
	constructor(limit = 100) {
		this.limit = limit;
		this.head = null;
		this.tail = null;
		/**
		 * @type {Map<String, Node>} Where the Nodes are stored.
		 */
		this.cache = new Map();
	}

	/**
	 * This function allows us to update or add a Node to the memcached.
	 * @param {string} key - The key of the node to set to the memcached.
	 * @param {Number} flags - The flags of the node to set to the memcached.
	 * @param {Number} exptime - The expiration time of the node to set to the memcached, this is
	 * measured in seconds.
	 * @param {Number} bytes - The byte of the node to set to the memcached.
	 * @param {Boolean} noreply - A boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - The data of the node that's beining set to memcached.
	 * @param {Number} user - The number that identifies the user that's setting the node.
	 * @returns {string} - The reply message after setting the node.
	 */
	set(key, flags, exptime, bytes, datablock, user, noreply = false) {
		if (
			this.add(key, flags, exptime, bytes, datablock, user, false) ===
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
				user,
				noreply
			);
		}
	}

	/**
	 * This function allows us to add a Node to the memcached that is not currently in the
	 * memcached.
	 * @param {string} key - The key of the node to add to the memcached.
	 * @param {Number} flags - The flags of the node to add to the memcached.
	 * @param {Number} exptime - The expiration time of the node to add to the memcached, this is
	 * measured in seconds.
	 * @param {Number} bytes - The amount of bytes of the datablock of the node to add to the
	 * memcached.
	 * @param {Boolean} noreply - A boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - The data of the node that's beining set to memcached.
	 * @param {Number} user - The number that identifies the user that's adding the node.
	 * @returns {string} - The reply message after adding the node.
	 */
	add(key, flags, exptime, bytes, datablock, user, noreply = false) {
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
					user,
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
					user
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
	 * @param {string} key - The key of the node to replace to the memcached.
	 * @param {Number} flags - The flags of the node to replace to the memcached.
	 * @param {Number} exptime - The expiration time of the node to update of the memcached, this
	 * is measured in seconds.
	 * @param {Number} bytes - The amount of bytes of the datablock of the node to replace in the
	 * memcached.
	 * @param {Boolean} noreply - A boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - The data of the node that's beining replaced at the memcached.
	 * @param {Number} user - The number that identifies the user that's replacing the node.
	 * @returns {string} - The reply message after replacing the node.
	 */
	replace(key, flags, exptime, bytes, datablock, user, noreply = false) {
		if (this.updateNode(key, flags, exptime, bytes, datablock, user)) {
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
	 * This function allows us to concatenate at the end of the datablock of the desired node
	 * (that already exists in the memcached) the datablock desired.
	 * @param {string} key - The key of the node to concatenate the datablock to.
	 * @param {Number} flags - The flags of the node to concatenate the datablock to.
	 * @param {Number} exptime - The new expiration time of the node having it's datablock
	 * concatenated, this is measured in seconds.
	 * @param {Number} bytes - The amount of bytes of the new datablock of the node to append
	 * to the memcached.
	 * @param {Boolean} noreply - A boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - The datablock of the node to contatenate at the end of the
	 * original datablock stored in the memcached.
	 * @param {Number} user - The number that identifies the user that's appending the node.
	 * @returns {string} - The reply message after appending the datablock to the node.
	 */
	append(key, flags, exptime, bytes, datablock, user, noreply = false) {
		if (
			this.updateNode(
				key,
				flags,
				exptime,
				bytes,
				datablock,
				user,
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
	 * @param {string} key - The key of the node to concatenate the datablock to.
	 * @param {Number} flags - The flags of the node to concatenate the datablock to.
	 * @param {Number} exptime - The new expiration time of the node having it's datablock
	 * concatenated, this is measured in seconds.
	 * @param {Number} bytes - The amount of bytes of the new datablock of the node to prepend to
	 * the memcached.
	 * @param {Boolean} noreply - A boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - The datablock of the node to contatenate at the begining of
	 * the original datablock stored in the memcached.
	 * @param {Number} user - The number that identifies the user that's prepending the node.
	 * @returns {string} - The reply message after prepending the datablock to the node.
	 */
	prepend(key, flags, exptime, bytes, datablock, user, noreply = false) {
		if (
			this.updateNode(
				key,
				flags,
				exptime,
				bytes,
				datablock,
				user,
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
	 * updated since the current user last added, updated or fetched it.
	 * @param {string} key - The key of the node to update in the  memcached.
	 * @param {Number} flags - The flags of the node to update in the memcached.
	 * @param {Number} exptime - The expiration time of the node to update in the memcached, this
	 * is measured in seconds.
	 * @param {Number} bytes - The amount of bytes of the datablock of the node to update in the
	 * memcached.
	 * @param {Boolean} noreply - A boolean flag that states whether the client wants a reply
	 * message or not.
	 * @param {string} datablock - The data of the node that's beining updated in the memcached.
	 * @param {Number} user - The number that identifies the user that's updating the node.
	 * @returns {string} - The reply message after replacing the node.
	 */
	cas(key, flags, exptime, bytes, datablock, casId, noreply = false) {
		const node = this.cache.get(key);
		if (node != null) {
			if (node.users.contains(casId) != null) {
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
	 * @param {[string]} keys - The key(s) of the node(s) to retrive of memcached.
	 * @param {Number} user - The number that identifies the user that's trying to read the node.
	 * @returns {[string]} - The value(s) of the key(s) of retrived node(s).
	 */
	get(keys, user) {
		let results = [];
		keys.forEach((key) => {
			let node = this.cache.get(key);
			if (node != null) {
				this.reorganizeCache(node);
				node.users.add(user, true);
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
	 * @param {[string]} keys - The key(s) of the node(s) to retrive of memcached.
	 * @param {Number} user - The number that identifies the user that's trying to read the node.
	 * @returns {[string]} - The value(s) of the key(s) of retrived node(s), with their
	 * respective casId.
	 */
	gets(keys, user) {
		let results = [];
		keys.forEach((key) => {
			let node = this.cache.get(key);
			if (node != null) {
				this.reorganizeCache(node);
				node.users.add(user, true);
				this.cache.set(node.key, node);
				results.push(
					`VALUE ${node.key} ${node.flags} ${node.bytes} ${user}\r\n`
				);
				results.push(`${node.datablock}\r\n`);
			}
		});
		results.push("END\r\n");
		return results;
	}

	/**
	 * This function makes sure that the limit of the memcached is being respected, if it's about
	 * to be passed, it deletes the least used node of the memcached.
	 */
	ensureLimit() {
		if (this.cache.size === this.limit) {
			this.deleteNode(this.tail.key);
		}
	}

	/**
	 * Node which is passed through the arguments will be updated.
	 * @param {string} key - The key of the node that will be updated.
	 * @param {Number} flags - The updated flags of the node.
	 * @param {Number} exptime - The updated expiration time of the node.
	 * @param {Number} bytes - The updated bytes of the node.
	 * @param {string} datablock - The updated datablock of the node.
	 * @param {string} apOrPrePend - The string tells us if we need to append, prepend or if the
	 * data just needs to be updated.
	 * @param {Number} user - The number that identifies the user that's updating the node.
	 * @returns {Boolean} - It tells us if the node of the given key was updated or not.
	 */
	updateNode(
		key,
		flags,
		exptime,
		bytes,
		datablock,
		user,
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

			node.users.flush();
			node.users.add(user, true);

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
	 * to head of the LRU.
	 * @param {Node} node - The key(s) of the node(s) to retrive of memcached.
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
	 * @param {Number} key - The key of the node that will be deleted.
	 * @param {Memcached} memcached - The memcached we are working on.
	 * @returns {Boolean} - It returns whether if the node was deleted or not.
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

			node.users.flush();
			memcached.cache.delete(key);
			return true;
		} else {
			return false;
		}
	}
}

module.exports = Memcached;
