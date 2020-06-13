import { Site } from './site';
import { Halfedge } from './halfedge';
export declare class Cell {
    site: Site;
    halfedges: Halfedge[];
    closeMe: boolean;
    constructor(site: Site);
    init(site: Site): Cell;
    prepareHalfedges(): number;
    getNeighborIds(): any[];
    getBbox(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    pointIntersection(x: any, y: number): number;
}
