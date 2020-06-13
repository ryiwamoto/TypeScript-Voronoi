import { RBTree, RBTreeNode } from './rbtree';
import { Vertex } from './vertex';
import { Edge } from './edge';
import { Cell } from './cell';
import { Site } from './site';
import { Diagram } from './diagram';
import { BoundingBox } from './bounding_box';
export declare class Voronoi {
    vertices: Vertex[];
    edges: Edge[];
    cells: Cell[];
    toRecycle: Diagram;
    beachline: RBTree;
    beachsectionJunkyard: RBTreeNode[];
    circleEvents: RBTree;
    firstCircleEvent: RBTreeNode;
    firstCircleEventJunkyard: RBTreeNode[];
    circleEventJunkyard: RBTreeNode[];
    vertexJunkyard: Vertex[];
    edgeJunkyard: Edge[];
    cellJunkyard: Cell[];
    constructor();
    compute(sites: Site[], bbox: BoundingBox): Diagram;
    private sqrt;
    private abs;
    private eps;
    private inveps;
    private equalWithEpsilon;
    private greaterThanWithEpsilon;
    private greaterThanOrEqualWithEpsilon;
    private lessThanWithEpsilon;
    private lessThanOrEqualWithEpsilon;
    private quantizeSites;
    recycle(diagram: Diagram): void;
    private reset;
    private createCell;
    private createHalfedge;
    private createVertex;
    private createEdge;
    private createBorderEdge;
    private setEdgeStartpoint;
    private setEdgeEndpoint;
    private createBeachsection;
    private leftBreakPoint;
    private rightBreakPoint;
    private detachBeachsection;
    private removeBeachsection;
    private addBeachsection;
    private attachCircleEvent;
    private detachCircleEvent;
    private connectEdge;
    private clipEdge;
    private clipEdges;
    private closeCells;
}
