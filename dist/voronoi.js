"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rbtree_1 = require("./rbtree");
var vertex_1 = require("./vertex");
var edge_1 = require("./edge");
var cell_1 = require("./cell");
var diagram_1 = require("./diagram");
var halfedge_1 = require("./halfedge");
var Voronoi = (function () {
    function Voronoi() {
        this.vertices = null;
        this.edges = null;
        this.cells = null;
        this.toRecycle = null;
        this.beachsectionJunkyard = [];
        this.circleEventJunkyard = [];
        this.vertexJunkyard = [];
        this.edgeJunkyard = [];
        this.cellJunkyard = [];
    }
    Voronoi.prototype.compute = function (sites, bbox) {
        var startTime = new Date();
        this.reset();
        if (this.toRecycle) {
            this.vertexJunkyard = this.vertexJunkyard.concat(this.toRecycle.vertices);
            this.edgeJunkyard = this.edgeJunkyard.concat(this.toRecycle.edges);
            this.cellJunkyard = this.cellJunkyard.concat(this.toRecycle.cells);
            this.toRecycle = null;
        }
        var siteEvents = sites.slice(0);
        siteEvents.sort(function (a, b) {
            var r = b.y - a.y;
            if (r) {
                return r;
            }
            return b.x - a.x;
        });
        var site = siteEvents.pop(), siteid = 0, xsitex, xsitey, cells = this.cells, circle;
        for (;;) {
            circle = this.firstCircleEvent;
            if (site && (!circle || site.y < circle.y || (site.y === circle.y && site.x < circle.x))) {
                if (site.x !== xsitex || site.y !== xsitey) {
                    cells[siteid] = this.createCell(site);
                    site.id = siteid++;
                    this.addBeachsection(site);
                    xsitey = site.y;
                    xsitex = site.x;
                }
                site = siteEvents.pop();
            }
            else if (circle) {
                this.removeBeachsection(circle.arc);
            }
            else {
                break;
            }
        }
        this.clipEdges(bbox);
        this.closeCells(bbox);
        var stopTime = new Date();
        var diagram = new diagram_1.Diagram();
        diagram.cells = this.cells;
        diagram.edges = this.edges;
        diagram.vertices = this.vertices;
        diagram.execTime = stopTime.getTime() - startTime.getTime();
        this.reset();
        return diagram;
    };
    Voronoi.prototype.sqrt = function (x) {
        return Math.sqrt(x);
    };
    Voronoi.prototype.abs = function (x) {
        return Math.abs(x);
    };
    Voronoi.prototype.eps = function () {
        return 1e-9;
    };
    Voronoi.prototype.inveps = function () {
        return 1.0 / this.eps();
    };
    Voronoi.prototype.equalWithEpsilon = function (a, b) {
        return this.abs(a - b) < this.eps();
    };
    Voronoi.prototype.greaterThanWithEpsilon = function (a, b) {
        return (a - b) > this.eps();
    };
    ;
    Voronoi.prototype.greaterThanOrEqualWithEpsilon = function (a, b) {
        return (b - a) < this.eps();
    };
    Voronoi.prototype.lessThanWithEpsilon = function (a, b) {
        return (b - a) > this.eps();
    };
    Voronoi.prototype.lessThanOrEqualWithEpsilon = function (a, b) {
        return (a - b) < this.eps();
    };
    Voronoi.prototype.quantizeSites = function (sites) {
        var eps = this.eps(), n = sites.length, site;
        while (n--) {
            site = sites[n];
            site.x = Math.floor(site.x / eps) * eps;
            site.y = Math.floor(site.y / eps) * eps;
        }
    };
    Voronoi.prototype.recycle = function (diagram) {
        if (diagram) {
            if (diagram instanceof diagram_1.Diagram) {
                this.toRecycle = diagram;
            }
            else {
                throw 'Voronoi.recycleDiagram() > Need a Diagram object.';
            }
        }
    };
    Voronoi.prototype.reset = function () {
        if (!this.beachline) {
            this.beachline = new rbtree_1.RBTree();
        }
        if (this.beachline.root) {
            var beachsection = this.beachline.first(this.beachline.root);
            while (beachsection) {
                this.beachsectionJunkyard.push(beachsection);
                beachsection = beachsection.next;
            }
        }
        this.beachline.root = null;
        if (!this.circleEvents) {
            this.circleEvents = new rbtree_1.RBTree();
        }
        this.circleEvents.root = this.firstCircleEvent = null;
        this.vertices = [];
        this.edges = [];
        this.cells = [];
    };
    Voronoi.prototype.createCell = function (site) {
        var cell = this.cellJunkyard.pop();
        if (cell) {
            cell.init(site);
            return cell.init(site);
        }
        return new cell_1.Cell(site);
    };
    ;
    Voronoi.prototype.createHalfedge = function (edge, lSite, rSite) {
        return new halfedge_1.Halfedge(edge, lSite, rSite);
    };
    ;
    Voronoi.prototype.createVertex = function (x, y) {
        var v = this.vertexJunkyard.pop();
        if (!v) {
            v = new vertex_1.Vertex(x, y);
        }
        else {
            v.x = x;
            v.y = y;
        }
        this.vertices.push(v);
        return v;
    };
    Voronoi.prototype.createEdge = function (lSite, rSite, va, vb) {
        if (va === void 0) { va = null; }
        if (vb === void 0) { vb = null; }
        var edge = this.edgeJunkyard.pop();
        if (!edge) {
            edge = new edge_1.Edge(lSite, rSite);
        }
        else {
            edge.lSite = lSite;
            edge.rSite = rSite;
            edge.va = edge.vb = null;
        }
        this.edges.push(edge);
        if (va) {
            this.setEdgeStartpoint(edge, lSite, rSite, va);
        }
        if (vb) {
            this.setEdgeEndpoint(edge, lSite, rSite, vb);
        }
        this.cells[lSite.id].halfedges.push(this.createHalfedge(edge, lSite, rSite));
        this.cells[rSite.id].halfedges.push(this.createHalfedge(edge, rSite, lSite));
        return edge;
    };
    Voronoi.prototype.createBorderEdge = function (lSite, va, vb) {
        var edge = this.edgeJunkyard.pop();
        if (!edge) {
            edge = new edge_1.Edge(lSite, null);
        }
        else {
            edge.lSite = lSite;
            edge.rSite = null;
        }
        edge.va = va;
        edge.vb = vb;
        this.edges.push(edge);
        return edge;
    };
    ;
    Voronoi.prototype.setEdgeStartpoint = function (edge, lSite, rSite, vertex) {
        if (!edge.va && !edge.vb) {
            edge.va = vertex;
            edge.lSite = lSite;
            edge.rSite = rSite;
        }
        else if (edge.lSite === rSite) {
            edge.vb = vertex;
        }
        else {
            edge.va = vertex;
        }
    };
    Voronoi.prototype.setEdgeEndpoint = function (edge, lSite, rSite, vertex) {
        this.setEdgeStartpoint(edge, rSite, lSite, vertex);
    };
    Voronoi.prototype.createBeachsection = function (site) {
        var beachsection = this.beachsectionJunkyard.pop();
        if (!beachsection) {
            beachsection = new rbtree_1.RBTreeNode();
        }
        beachsection.site = site;
        return beachsection;
    };
    Voronoi.prototype.leftBreakPoint = function (arc, directrix) {
        var site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
        if (!pby2) {
            return rfocx;
        }
        var lArc = arc.prev;
        if (!lArc) {
            return -Infinity;
        }
        site = lArc.site;
        var lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
        if (!plby2) {
            return lfocx;
        }
        var hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
        if (aby2) {
            return (-b + this.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
        }
        return (rfocx + lfocx) / 2;
    };
    Voronoi.prototype.rightBreakPoint = function (arc, directrix) {
        var rArc = arc.next;
        if (rArc) {
            return this.leftBreakPoint(rArc, directrix);
        }
        var site = arc.site;
        return site.y === directrix ? site.x : Infinity;
    };
    Voronoi.prototype.detachBeachsection = function (beachsection) {
        this.detachCircleEvent(beachsection);
        this.beachline.removeNode(beachsection);
        this.beachsectionJunkyard.push(beachsection);
    };
    Voronoi.prototype.removeBeachsection = function (beachsection) {
        var circle = beachsection.circleEvent, x = circle.x, y = circle.ycenter, vertex = this.createVertex(x, y), previous = beachsection.prev, next = beachsection.next, disappearingTransitions = [beachsection], abs_fn = Math.abs;
        this.detachBeachsection(beachsection);
        var lArc = previous;
        while (lArc.circleEvent &&
            abs_fn(x - lArc.circleEvent.x) < this.eps() &&
            abs_fn(y - lArc.circleEvent.ycenter) < this.eps()) {
            previous = lArc.prev;
            disappearingTransitions.unshift(lArc);
            this.detachBeachsection(lArc);
            lArc = previous;
        }
        disappearingTransitions.unshift(lArc);
        this.detachCircleEvent(lArc);
        var rArc = next;
        while (rArc.circleEvent &&
            abs_fn(x - rArc.circleEvent.x) < this.eps() &&
            abs_fn(y - rArc.circleEvent.ycenter) < this.eps()) {
            next = rArc.next;
            disappearingTransitions.push(rArc);
            this.detachBeachsection(rArc);
            rArc = next;
        }
        disappearingTransitions.push(rArc);
        this.detachCircleEvent(rArc);
        var nArcs = disappearingTransitions.length, iArc;
        for (iArc = 1; iArc < nArcs; iArc++) {
            rArc = disappearingTransitions[iArc];
            lArc = disappearingTransitions[iArc - 1];
            this.setEdgeStartpoint(rArc.edge, lArc.site, rArc.site, vertex);
        }
        lArc = disappearingTransitions[0];
        rArc = disappearingTransitions[nArcs - 1];
        rArc.edge = this.createEdge(lArc.site, rArc.site, undefined, vertex);
        this.attachCircleEvent(lArc);
        this.attachCircleEvent(rArc);
    };
    Voronoi.prototype.addBeachsection = function (site) {
        var x = site.x, directrix = site.y;
        var lArc, rArc, dxl, dxr, node = this.beachline.root;
        while (node) {
            dxl = this.leftBreakPoint(node, directrix) - x;
            if (dxl > this.eps()) {
                node = node.left;
            }
            else {
                dxr = x - this.rightBreakPoint(node, directrix);
                if (dxr > this.eps()) {
                    if (!node.right) {
                        lArc = node;
                        break;
                    }
                    node = node.right;
                }
                else {
                    if (dxl > -this.eps()) {
                        lArc = node.prev;
                        rArc = node;
                    }
                    else if (dxr > -this.eps()) {
                        lArc = node;
                        rArc = node.next;
                    }
                    else {
                        lArc = rArc = node;
                    }
                    break;
                }
            }
        }
        var newArc = this.createBeachsection(site);
        this.beachline.insertSuccessor(lArc, newArc);
        if (!lArc && !rArc) {
            return;
        }
        if (lArc === rArc) {
            this.detachCircleEvent(lArc);
            rArc = this.createBeachsection(lArc.site);
            this.beachline.insertSuccessor(newArc, rArc);
            newArc.edge = rArc.edge = this.createEdge(lArc.site, newArc.site);
            this.attachCircleEvent(lArc);
            this.attachCircleEvent(rArc);
            return;
        }
        if (lArc && !rArc) {
            newArc.edge = this.createEdge(lArc.site, newArc.site);
            return;
        }
        if (lArc !== rArc) {
            this.detachCircleEvent(lArc);
            this.detachCircleEvent(rArc);
            var lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay, rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx), hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = this.createVertex((cy * hb - by * hc) / d + ax, (bx * hc - cx * hb) / d + ay);
            this.setEdgeStartpoint(rArc.edge, lSite, rSite, vertex);
            newArc.edge = this.createEdge(lSite, site, undefined, vertex);
            rArc.edge = this.createEdge(site, rSite, undefined, vertex);
            this.attachCircleEvent(lArc);
            this.attachCircleEvent(rArc);
            return;
        }
    };
    Voronoi.prototype.attachCircleEvent = function (arc) {
        var lArc = arc.prev, rArc = arc.next;
        if (!lArc || !rArc) {
            return;
        }
        var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
        if (lSite === rSite) {
            return;
        }
        var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
        var d = 2 * (ax * cy - ay * cx);
        if (d >= -2e-12) {
            return;
        }
        var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, ycenter = y + by;
        var circleEvent = this.circleEventJunkyard.pop();
        if (!circleEvent) {
            circleEvent = new rbtree_1.RBTreeNode();
        }
        circleEvent.arc = arc;
        circleEvent.site = cSite;
        circleEvent.x = x + bx;
        circleEvent.y = ycenter + this.sqrt(x * x + y * y);
        circleEvent.ycenter = ycenter;
        arc.circleEvent = circleEvent;
        var predecessor = null, node = this.circleEvents.root;
        while (node) {
            if (circleEvent.y < node.y || (circleEvent.y === node.y && circleEvent.x <= node.x)) {
                if (node.left) {
                    node = node.left;
                }
                else {
                    predecessor = node.prev;
                    break;
                }
            }
            else {
                if (node.right) {
                    node = node.right;
                }
                else {
                    predecessor = node;
                    break;
                }
            }
        }
        this.circleEvents.insertSuccessor(predecessor, circleEvent);
        if (!predecessor) {
            this.firstCircleEvent = circleEvent;
        }
    };
    Voronoi.prototype.detachCircleEvent = function (arc) {
        var circleEvent = arc.circleEvent;
        if (circleEvent) {
            if (!circleEvent.prev) {
                this.firstCircleEvent = circleEvent.next;
            }
            this.circleEvents.removeNode(circleEvent);
            this.circleEventJunkyard.push(circleEvent);
            arc.circleEvent = null;
        }
    };
    Voronoi.prototype.connectEdge = function (edge, bbox) {
        var vb = edge.vb;
        if (!!vb) {
            return true;
        }
        var va = edge.va, xl = bbox.xl, xr = bbox.xr, yt = bbox.yt, yb = bbox.yb, lSite = edge.lSite, rSite = edge.rSite, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y, fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
        this.cells[lSite.id].closeMe = true;
        this.cells[rSite.id].closeMe = true;
        if (ry !== ly) {
            fm = (lx - rx) / (ry - ly);
            fb = fy - fm * fx;
        }
        if (fm === undefined) {
            if (fx < xl || fx >= xr) {
                return false;
            }
            if (lx > rx) {
                if (!va || va.y < yt) {
                    va = this.createVertex(fx, yt);
                }
                else if (va.y >= yb) {
                    return false;
                }
                vb = this.createVertex(fx, yb);
            }
            else {
                if (!va || va.y > yb) {
                    va = this.createVertex(fx, yb);
                }
                else if (va.y < yt) {
                    return false;
                }
                vb = this.createVertex(fx, yt);
            }
        }
        else if (fm < -1 || fm > 1) {
            if (lx > rx) {
                if (!va || va.y < yt) {
                    va = this.createVertex((yt - fb) / fm, yt);
                }
                else if (va.y >= yb) {
                    return false;
                }
                vb = this.createVertex((yb - fb) / fm, yb);
            }
            else {
                if (!va || va.y > yb) {
                    va = this.createVertex((yb - fb) / fm, yb);
                }
                else if (va.y < yt) {
                    return false;
                }
                vb = this.createVertex((yt - fb) / fm, yt);
            }
        }
        else {
            if (ly < ry) {
                if (!va || va.x < xl) {
                    va = this.createVertex(xl, fm * xl + fb);
                }
                else if (va.x >= xr) {
                    return false;
                }
                vb = this.createVertex(xr, fm * xr + fb);
            }
            else {
                if (!va || va.x > xr) {
                    va = this.createVertex(xr, fm * xr + fb);
                }
                else if (va.x < xl) {
                    return false;
                }
                vb = this.createVertex(xl, fm * xl + fb);
            }
        }
        edge.va = va;
        edge.vb = vb;
        return true;
    };
    Voronoi.prototype.clipEdge = function (edge, bbox) {
        var ax = edge.va.x, ay = edge.va.y, bx = edge.vb.x, by = edge.vb.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay;
        var q = ax - bbox.xl;
        if (dx === 0 && q < 0) {
            return false;
        }
        var r = -q / dx;
        if (dx < 0) {
            if (r < t0) {
                return false;
            }
            if (r < t1) {
                t1 = r;
            }
        }
        else if (dx > 0) {
            if (r > t1) {
                return false;
            }
            if (r > t0) {
                t0 = r;
            }
        }
        q = bbox.xr - ax;
        if (dx === 0 && q < 0) {
            return false;
        }
        r = q / dx;
        if (dx < 0) {
            if (r > t1) {
                return false;
            }
            if (r > t0) {
                t0 = r;
            }
        }
        else if (dx > 0) {
            if (r < t0) {
                return false;
            }
            if (r < t1) {
                t1 = r;
            }
        }
        q = ay - bbox.yt;
        if (dy === 0 && q < 0) {
            return false;
        }
        r = -q / dy;
        if (dy < 0) {
            if (r < t0) {
                return false;
            }
            if (r < t1) {
                t1 = r;
            }
        }
        else if (dy > 0) {
            if (r > t1) {
                return false;
            }
            if (r > t0) {
                t0 = r;
            }
        }
        q = bbox.yb - ay;
        if (dy === 0 && q < 0) {
            return false;
        }
        r = q / dy;
        if (dy < 0) {
            if (r > t1) {
                return false;
            }
            if (r > t0) {
                t0 = r;
            }
        }
        else if (dy > 0) {
            if (r < t0) {
                return false;
            }
            if (r < t1) {
                t1 = r;
            }
        }
        if (t0 > 0) {
            edge.va = this.createVertex(ax + t0 * dx, ay + t0 * dy);
        }
        if (t1 < 1) {
            edge.vb = this.createVertex(ax + t1 * dx, ay + t1 * dy);
        }
        if (t0 > 0 || t1 < 1) {
            this.cells[edge.lSite.id].closeMe = true;
            this.cells[edge.rSite.id].closeMe = true;
        }
        return true;
    };
    Voronoi.prototype.clipEdges = function (bbox) {
        var edges = this.edges, iEdge = edges.length, edge, abs_fn = Math.abs;
        while (iEdge--) {
            edge = edges[iEdge];
            if (!this.connectEdge(edge, bbox) ||
                !this.clipEdge(edge, bbox) ||
                (abs_fn(edge.va.x - edge.vb.x) < this.eps() && abs_fn(edge.va.y - edge.vb.y) < this.eps())) {
                edge.va = edge.vb = null;
                edges.splice(iEdge, 1);
            }
        }
    };
    Voronoi.prototype.closeCells = function (bbox) {
        var xl = bbox.xl, xr = bbox.xr, yt = bbox.yt, yb = bbox.yb, cells = this.cells, iCell = cells.length, cell, iLeft, halfedges, nHalfedges, edge, va, vb, vz, lastBorderSegment, abs_fn = Math.abs;
        while (iCell--) {
            cell = cells[iCell];
            if (!cell.prepareHalfedges()) {
                continue;
            }
            if (!cell.closeMe) {
                continue;
            }
            halfedges = cell.halfedges;
            nHalfedges = halfedges.length;
            iLeft = 0;
            while (iLeft < nHalfedges) {
                va = halfedges[iLeft].getEndpoint();
                vz = halfedges[(iLeft + 1) % nHalfedges].getStartpoint();
                if (abs_fn(va.x - vz.x) >= this.eps() || abs_fn(va.y - vz.y) >= this.eps()) {
                    switch (true) {
                        case this.equalWithEpsilon(va.x, xl) && this.lessThanWithEpsilon(va.y, yb):
                            lastBorderSegment = this.equalWithEpsilon(vz.x, xl);
                            vb = this.createVertex(xl, lastBorderSegment ? vz.y : yb);
                            edge = this.createBorderEdge(cell.site, va, vb);
                            iLeft++;
                            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                            nHalfedges++;
                            if (lastBorderSegment) {
                                break;
                            }
                            va = vb;
                        case this.equalWithEpsilon(va.y, yb) && this.lessThanWithEpsilon(va.x, xr):
                            lastBorderSegment = this.equalWithEpsilon(vz.y, yb);
                            vb = this.createVertex(lastBorderSegment ? vz.x : xr, yb);
                            edge = this.createBorderEdge(cell.site, va, vb);
                            iLeft++;
                            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                            nHalfedges++;
                            if (lastBorderSegment) {
                                break;
                            }
                            va = vb;
                        case this.equalWithEpsilon(va.x, xr) && this.greaterThanWithEpsilon(va.y, yt):
                            lastBorderSegment = this.equalWithEpsilon(vz.x, xr);
                            vb = this.createVertex(xr, lastBorderSegment ? vz.y : yt);
                            edge = this.createBorderEdge(cell.site, va, vb);
                            iLeft++;
                            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                            nHalfedges++;
                            if (lastBorderSegment) {
                                break;
                            }
                            va = vb;
                        case this.equalWithEpsilon(va.y, yt) && this.greaterThanWithEpsilon(va.x, xl):
                            lastBorderSegment = this.equalWithEpsilon(vz.y, yt);
                            vb = this.createVertex(lastBorderSegment ? vz.x : xl, yt);
                            edge = this.createBorderEdge(cell.site, va, vb);
                            iLeft++;
                            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                            nHalfedges++;
                            if (lastBorderSegment) {
                                break;
                            }
                            va = vb;
                            lastBorderSegment = this.equalWithEpsilon(vz.x, xl);
                            vb = this.createVertex(xl, lastBorderSegment ? vz.y : yb);
                            edge = this.createBorderEdge(cell.site, va, vb);
                            iLeft++;
                            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                            nHalfedges++;
                            if (lastBorderSegment) {
                                break;
                            }
                            va = vb;
                            lastBorderSegment = this.equalWithEpsilon(vz.y, yb);
                            vb = this.createVertex(lastBorderSegment ? vz.x : xr, yb);
                            edge = this.createBorderEdge(cell.site, va, vb);
                            iLeft++;
                            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                            nHalfedges++;
                            if (lastBorderSegment) {
                                break;
                            }
                            va = vb;
                            lastBorderSegment = this.equalWithEpsilon(vz.x, xr);
                            vb = this.createVertex(xr, lastBorderSegment ? vz.y : yt);
                            edge = this.createBorderEdge(cell.site, va, vb);
                            iLeft++;
                            halfedges.splice(iLeft, 0, this.createHalfedge(edge, cell.site, null));
                            nHalfedges++;
                            if (lastBorderSegment) {
                                break;
                            }
                        default:
                            throw "Voronoi.closeCells() > this makes no sense!";
                    }
                }
                iLeft++;
            }
            cell.closeMe = false;
        }
    };
    return Voronoi;
}());
exports.Voronoi = Voronoi;
//# sourceMappingURL=voronoi.js.map