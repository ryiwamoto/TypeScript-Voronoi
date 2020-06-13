import { Site } from './site';
import { Edge } from './edge';
export declare class RBTree {
    root: RBTreeNode;
    constructor();
    insertSuccessor(node: RBTreeNode, successor: RBTreeNode): void;
    removeNode(node: RBTreeNode): void;
    rotateLeft(node: RBTreeNode): void;
    rotateRight(node: RBTreeNode): void;
    first(node: RBTreeNode): RBTreeNode;
    last(node: RBTreeNode): RBTreeNode;
}
export declare class RBTreeNode {
    parent: RBTreeNode;
    prev: RBTreeNode;
    next: RBTreeNode;
    right: RBTreeNode;
    left: RBTreeNode;
    red: boolean;
    site: Site;
    edge: Edge;
    arc: RBTreeNode;
    circleEvent: RBTreeNode;
    x: number;
    y: number;
    ycenter: number;
}
