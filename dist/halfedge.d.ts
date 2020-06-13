import { Vertex } from './vertex';
import { Site } from './site';
import { Edge } from './edge';
export declare class Halfedge {
    site: Site;
    edge: Edge;
    angle: number;
    constructor(edge: Edge, lSite: any, rSite: Site);
    getStartpoint(): Vertex;
    getEndpoint(): Vertex;
}
