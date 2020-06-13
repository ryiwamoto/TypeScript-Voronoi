"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Halfedge = (function () {
    function Halfedge(edge, lSite, rSite) {
        this.site = lSite;
        this.edge = edge;
        if (rSite) {
            this.angle = Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x);
        }
        else {
            var va = edge.va;
            var vb = edge.vb;
            this.angle = edge.lSite === lSite ?
                Math.atan2(vb.x - va.x, va.y - vb.y) :
                Math.atan2(va.x - vb.x, vb.y - va.y);
        }
    }
    Halfedge.prototype.getStartpoint = function () {
        return this.edge.lSite === this.site ? this.edge.va : this.edge.vb;
    };
    ;
    Halfedge.prototype.getEndpoint = function () {
        return this.edge.lSite === this.site ? this.edge.vb : this.edge.va;
    };
    ;
    return Halfedge;
}());
exports.Halfedge = Halfedge;
//# sourceMappingURL=halfedge.js.map