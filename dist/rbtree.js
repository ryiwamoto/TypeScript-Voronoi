"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RBTree = (function () {
    function RBTree() {
        this.root = null;
    }
    RBTree.prototype.insertSuccessor = function (node, successor) {
        var parent;
        if (node) {
            successor.prev = node;
            successor.next = node.next;
            if (node.next) {
                node.next.prev = successor;
            }
            node.next = successor;
            if (node.right) {
                node = node.right;
                while (node.left) {
                    node = node.left;
                }
                node.left = successor;
            }
            else {
                node.right = successor;
            }
            parent = node;
        }
        else if (this.root) {
            node = this.first(this.root);
            successor.prev = null;
            successor.next = node;
            node.prev = successor;
            node.left = successor;
            parent = node;
        }
        else {
            successor.prev = successor.next = null;
            this.root = successor;
            parent = null;
        }
        successor.left = successor.right = null;
        successor.parent = parent;
        successor.red = true;
        var grandpa, uncle;
        node = successor;
        while (parent && parent.red) {
            grandpa = parent.parent;
            if (parent === grandpa.left) {
                uncle = grandpa.right;
                if (uncle && uncle.red) {
                    parent.red = uncle.red = false;
                    grandpa.red = true;
                    node = grandpa;
                }
                else {
                    if (node === parent.right) {
                        this.rotateLeft(parent);
                        node = parent;
                        parent = node.parent;
                    }
                    parent.red = false;
                    grandpa.red = true;
                    this.rotateRight(grandpa);
                }
            }
            else {
                uncle = grandpa.left;
                if (uncle && uncle.red) {
                    parent.red = uncle.red = false;
                    grandpa.red = true;
                    node = grandpa;
                }
                else {
                    if (node === parent.left) {
                        this.rotateRight(parent);
                        node = parent;
                        parent = node.parent;
                    }
                    parent.red = false;
                    grandpa.red = true;
                    this.rotateLeft(grandpa);
                }
            }
            parent = node.parent;
        }
        this.root.red = false;
    };
    RBTree.prototype.removeNode = function (node) {
        if (node.next) {
            node.next.prev = node.prev;
        }
        if (node.prev) {
            node.prev.next = node.next;
        }
        node.next = node.prev = null;
        var parent = node.parent;
        var left = node.left;
        var right = node.right;
        var next = null;
        if (!left) {
            next = right;
        }
        else if (!right) {
            next = left;
        }
        else {
            next = this.first(right);
        }
        if (parent) {
            if (parent.left === node) {
                parent.left = next;
            }
            else {
                parent.right = next;
            }
        }
        else {
            this.root = next;
        }
        var isRed;
        if (left && right) {
            isRed = next.red;
            next.red = node.red;
            next.left = left;
            left.parent = next;
            if (next !== right) {
                parent = next.parent;
                next.parent = node.parent;
                node = next.right;
                parent.left = node;
                next.right = right;
                right.parent = next;
            }
            else {
                next.parent = parent;
                parent = next;
                node = next.right;
            }
        }
        else {
            isRed = node.red;
            node = next;
        }
        if (node) {
            node.parent = parent;
        }
        if (isRed) {
            return;
        }
        if (node && node.red) {
            node.red = false;
            return;
        }
        var sibling;
        do {
            if (node === this.root) {
                break;
            }
            if (node === parent.left) {
                sibling = parent.right;
                if (sibling.red) {
                    sibling.red = false;
                    parent.red = true;
                    this.rotateLeft(parent);
                    sibling = parent.right;
                }
                if ((sibling.left && sibling.left.red) || (sibling.right && sibling.right.red)) {
                    if (!sibling.right || !sibling.right.red) {
                        sibling.left.red = false;
                        sibling.red = true;
                        this.rotateRight(sibling);
                        sibling = parent.right;
                    }
                    sibling.red = parent.red;
                    parent.red = sibling.right.red = false;
                    this.rotateLeft(parent);
                    node = this.root;
                    break;
                }
            }
            else {
                sibling = parent.left;
                if (sibling.red) {
                    sibling.red = false;
                    parent.red = true;
                    this.rotateRight(parent);
                    sibling = parent.left;
                }
                if ((sibling.left && sibling.left.red) || (sibling.right && sibling.right.red)) {
                    if (!sibling.left || !sibling.left.red) {
                        sibling.right.red = false;
                        sibling.red = true;
                        this.rotateLeft(sibling);
                        sibling = parent.left;
                    }
                    sibling.red = parent.red;
                    parent.red = sibling.left.red = false;
                    this.rotateRight(parent);
                    node = this.root;
                    break;
                }
            }
            sibling.red = true;
            node = parent;
            parent = parent.parent;
        } while (!node.red);
        if (node) {
            node.red = false;
        }
    };
    RBTree.prototype.rotateLeft = function (node) {
        var p = node;
        var q = node.right;
        var parent = p.parent;
        if (parent) {
            if (parent.left === p) {
                parent.left = q;
            }
            else {
                parent.right = q;
            }
        }
        else {
            this.root = q;
        }
        q.parent = parent;
        p.parent = q;
        p.right = q.left;
        if (p.right) {
            p.right.parent = p;
        }
        q.left = p;
    };
    RBTree.prototype.rotateRight = function (node) {
        var p = node;
        var q = node.left;
        var parent = p.parent;
        if (parent) {
            if (parent.left === p) {
                parent.left = q;
            }
            else {
                parent.right = q;
            }
        }
        else {
            this.root = q;
        }
        q.parent = parent;
        p.parent = q;
        p.left = q.right;
        if (p.left) {
            p.left.parent = p;
        }
        q.right = p;
    };
    RBTree.prototype.first = function (node) {
        while (node.left) {
            node = node.left;
        }
        return node;
    };
    RBTree.prototype.last = function (node) {
        while (node.right) {
            node = node.right;
        }
        return node;
    };
    return RBTree;
}());
exports.RBTree = RBTree;
var RBTreeNode = (function () {
    function RBTreeNode() {
    }
    return RBTreeNode;
}());
exports.RBTreeNode = RBTreeNode;
//# sourceMappingURL=rbtree.js.map