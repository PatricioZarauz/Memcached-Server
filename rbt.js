const NodeRBT = require('./nodeRBT');

class RBT {
    constructor(){
        this.root = null
        this.size = 0
    }

    isRed(node){
        if (node != null){
            return node.colour;
        }
        else{
            return false;
        }
    }

    leftRotate(node){
        let tmpNode = node.right;
        node.right = tmpNode.left;
        tmpNode.left = node;
        tmpNode.colour = node.colour;
        node.colour = true;
        return tmpNode;
    }

    rightRotate(node){
        let tmpNode = node.left;
        node.left = tmpNode.right;
        tmpNode.right = node;
        tmpNode.colour = node.colour;
        node.colour = true;
        return tmpNode;
    }

    flipColours(node){
        node.colour = true;
        node.left = false;
        node.right = false;
    }

    add(key, value){
        this.root = this.addRoot(this.root, key, value);
        this.root.colour = false;
    }

    addRoot(node, key, value){
        if (node === null){
            this.size++;
            return new NodeRBT(key, value);
        }

        if (key < node.key){
            node.left = this.addRoot(node.left, key, value);
        }
        else if (key > node.key){
            node.right = this.addRoot(node.right, key, value);
        }
        else{
            node.value = value;
        }

        if (this.isRed(node.right) && !this.isRed(node.left)){
            node = this.leftRotate(node);
        }
        if (this.isRed(node.left) && this.isRed(node.left.left)){
            node = this.rightRotate(node);
        }
        if (this.isRed(node.left) && this.isRed(node.right)){
            this.flipColours(node);
        }
        return node;
    }

    isEmpty(){
        return this.size === 0;
    }

    getSize(){
        return this.size;
    }

    contains(key){
        return this.#getNode(this.root, key);
    }

    #getNode(node, key){
        if (node === null || key === node.key){
            return node;
        }
        else if (key > node.key) {
            return this.#getNode(node.right, key);
        }
        else{
            return this.#getNode(node.left, key);
        }
    }

    flush(){
        this.root = null;
        this.size = 0;
    }
}

module.exports = RBT;