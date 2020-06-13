"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cell = (function () {
    function Cell(site) {
        this.site = site;
        this.halfedges = [];
        this.closeMe = false;
    }
    Cell.prototype.init = function (site) {
        this.site = site;
        this.halfedges = [];
        this.closeMe = false;
        return this;
    };
    Cell.prototype.prepareHalfedges = function () {
        var halfedges = this.halfedges;
        var iHalfedge = halfedges.length;
        var edge;
        while (iHalfedge--) {
            edge = halfedges[iHalfedge].edge;
            if (!edge.vb || !edge.va) {
                halfedges.splice(iHalfedge, 1);
            }
        }
        halfedges.sort(function (a, b) {
            return b.angle - a.angle;
        });
        return halfedges.length;
    };
    Cell.prototype.getNeighborIds = function () {
        var neighbors = [];
        var iHalfedge = this.halfedges.length;
        var edge;
        while (iHalfedge--) {
            edge = this.halfedges[iHalfedge].edge;
            if (edge.lSite !== null && edge.lSite.id != this.site.id) {
                neighbors.push(edge.lSite.id);
            }
            else if (edge.rSite !== null && edge.rSite.id != this.site.id) {
                neighbors.push(edge.rSite.id);
            }
        }
        return neighbors;
    };
    ;
    Cell.prototype.getBbox = function () {
        var halfedges = this.halfedges;
        var iHalfedge = halfedges.length;
        var xmin = Infinity;
        var ymin = Infinity;
        var xmax = -Infinity;
        var ymax = -Infinity;
        var v, vx, vy;
        while (iHalfedge--) {
            v = halfedges[iHalfedge].getStartpoint();
            vx = v.x;
            vy = v.y;
            if (vx < xmin) {
                xmin = vx;
            }
            if (vy < ymin) {
                ymin = vy;
            }
            if (vx > xmax) {
                xmax = vx;
            }
            if (vy > ymax) {
                ymax = vy;
            }
        }
        return {
            x: xmin,
            y: ymin,
            width: xmax - xmin,
            height: ymax - ymin
        };
    };
    Cell.prototype.pointIntersection = function (x, y) {
        var halfedges = this.halfedges;
        var iHalfedge = halfedges.length;
        var halfedge;
        var p0, p1;
        var r;
        while (iHalfedge--) {
            halfedge = halfedges[iHalfedge];
            p0 = halfedge.getStartpoint();
            p1 = halfedge.getEndpoint();
            r = (y - p0.y) * (p1.x - p0.x) - (x - p0.x) * (p1.y - p0.y);
            if (!r) {
                return 0;
            }
            if (r > 0) {
                return -1;
            }
        }
        return 1;
    };
    return Cell;
}());
exports.Cell = Cell;
//# sourceMappingURL=cell.js.map