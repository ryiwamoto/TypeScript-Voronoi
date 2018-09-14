import { Site } from './site';
import { Vertex } from './vertex';
import { Edge } from './edge';
import { Cell } from './cell';

export class Diagram {
  site: Site;
  vertices: Vertex[];
  edges: Edge[];
  cells: Cell[];
  execTime: number;

  constructor(site?: Site) {
    this.site = site;
  }
}
