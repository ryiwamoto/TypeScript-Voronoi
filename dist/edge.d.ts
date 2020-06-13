import { Site } from './site';
import { Vertex } from './vertex';
export declare class Edge {
    lSite: Site;
    rSite: Site;
    va: Vertex;
    vb: Vertex;
    constructor(lSite: any, rSite: Site);
}
