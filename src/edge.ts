import { Site } from './site';
import { Vertex } from './vertex';

export class Edge {
  lSite: Site;
  rSite: Site;
  va: Vertex;
  vb: Vertex;

  constructor(lSite, rSite: Site) {
    this.lSite = lSite;
    this.rSite = rSite;
    this.va = this.vb = null;
  }
}

