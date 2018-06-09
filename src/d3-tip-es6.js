// /////////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2011-2016, Plexxi Inc. and its licensors.
//
// All rights reserved.
//
// Use and duplication of this software is subject to a separate license
// agreement between the user and Plexxi or its licensor.
//
// /////////////////////////////////////////////////////////////////////////

/**
 * @author harrisonkelly
 */
class d3Tip {
    constructor(vis) {
        this.tipDirection = d3Tip.d3TipDirection();
        this.tipOffset = d3Tip.d3TipOffset();
        this.tipHtml = d3Tip.d3TipHtml();
        this.node = d3Tip.initNode();

        this.generateTip(vis);

        this.target = null;

        this.directionN = this.directionN.bind(this);
        this.directionS = this.directionS.bind(this);
        this.directionE = this.directionE.bind(this);
        this.directionW = this.directionW.bind(this);
        this.directionNW = this.directionNW.bind(this);
        this.directionNE = this.directionNE.bind(this);
        this.directionSW = this.directionSW.bind(this);
        this.directionSE = this.directionSE.bind(this);

        this.directionCallbacks = d3Map({
            n: this.directionN,
            s: this.directionS,
            e: this.directionE,
            w: this.directionW,
            nw: this.directionNW,
            ne: this.directionNE,
            sw: this.directionSW,
            se: this.directionSE
        });

        this.directions = this.directionCallbacks.keys();

        this.generateTip = this.generateTip.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    generateTip(vis) {
        this.svg = d3Tip.getSVGNode(vis);
        this.point = this.svg.createSVGPoint();
        document.body.appendChild(this.node);
    }

    static d3TipDirection() {
        return 'n';
    }

    static d3TipOffset() {
        return [0, 0];
    }

    static d3TipHtml() {
        return ' ';
    }

    static initNode() {
        const node = select(document.createElement('div'));
        node.style('position', 'absolute')
            .style('top', 0)
            .style('opacity', 0)
            .style('pointer-events', 'none')
            .style('box-sizing', 'border-box');

        return node.node();
    }

    getNode() {
        if (this.node === null) {
            this.node = d3Tip.initNode();
            document.body.appendChild(this.node);
        }

        return select(this.node);
    }

    getScreenBBox() {
        let targetEl = this.target || event.target;

        while (typeof targetEl.getScreenCTM === 'undefined' && targetEl.parentNode === 'undefined') {
            targetEl = targetEl.parentNode;
        }

        const bbox = {},
            matrix = targetEl.getScreenCTM(),
            tbbox = targetEl.getBBox(),
            width = tbbox.width,
            height = tbbox.height,
            x = tbbox.x,
            y = tbbox.y;

        this.point.x = x;
        this.point.y = y;

        bbox.nw = this.point.matrixTransform(matrix);
        this.point.x += width;

        bbox.ne = this.point.matrixTransform(matrix);
        this.point.y += height;

        bbox.se = this.point.matrixTransform(matrix);
        this.point.x -= width;

        bbox.sw = this.point.matrixTransform(matrix);
        this.point.y -= height / 2;

        bbox.w = this.point.matrixTransform(matrix);
        this.point.x += width;

        bbox.e = this.point.matrixTransform(matrix);
        this.point.x -= width / 2;
        this.point.y -= height / 2;

        bbox.n = this.point.matrixTransform(matrix);
        this.point.y += height;

        bbox.s = this.point.matrixTransform(matrix);

        return bbox;
    }

    static getPageTopLeft(el) {
        const rect = el.getBoundingClientRect(),
            docEl = document.documentElement;

        return {
            top: rect.top + (window.pageYOffset || docEl.scrollTop || 0),
            right: rect.right + (window.pageXOffset || 0),
            bottom: rect.bottom + (window.pageYOffset | 0),
            left: rect.left + (window.pageXOffset || docEl.scrollLeft || 0)
        };
    }

    static functor(val) {
        return typeof val === 'function' ? val : () => {
            return val;
        };
    }

    directionN() {
        const bbox = this.getScreenBBox();
        return {
            top: bbox.n.y - this.node.offsetHeight,
            left: bbox.n.x - this.node.offsetWidth / 2
        };
    }

    directionS() {
        const bbox = this.getScreenBBox();
        return {
            top: bbox.s.y,
            left: bbox.s.x - this.node.offsetWidth / 2
        };
    }

    directionE() {
        const bbox = this.getScreenBBox();
        return {
            top: bbox.e.y - this.node.offsetHeight / 2,
            left: bbox.e.x
        };
    }

    directionW() {
        const bbox = this.getScreenBBox();
        return {
            top: bbox.w.y - this.node.offsetHeight / 2,
            left: bbox.w.x - this.node.offsetWidth
        };
    }

    directionNW() {
        const bbox = this.getScreenBBox();
        return {
            top: bbox.nw.y - this.node.offsetHeight,
            left: bbox.nw.x - this.node.offsetWidth
        };
    }

    directionNE() {
        const bbox = this.getScreenBBox();
        return {
            top: bbox.nw.y - this.node.offsetHeight,
            left: bbox.nw.x - this.node.offsetWidth
        };
    }

    directionSW() {
        const bbox = this.getScreenBBox();
        return {
            top: bbox.sw.y,
            left: bbox.sw.x - this.node.offsetWidth
        };
    }

    directionSE() {
        const bbox = this.getScreenBBox();
        return {
            top: bbox.se.y,
            left: bbox.e.x
        };
    }

    static getSVGNode(el) {
        el = el.node();

        if (el.tagName.toLowerCase() === 'svg') {
            return el;
        }

        return el.ownerSVGElement;
    }

    show() {
        const args = Array.prototype.slice.call(arguments);

        if (args[args.length - 1] instanceof SVGElement) {
            this.target = args.pop();
        }

        const content = this.tipHtml(args[0]),
            pOffset = this.tipOffset(),
            nodel = this.getNode(),
            scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
            scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

        let coords,
            dir = this.direction.apply(this, args),
            i = this.directions.length;

        nodel.html(content)
            .style('position', 'absolute')
            .style('opacity', 1)
            .style('pointer-events', 'all');

        const node = nodel._groups ? nodel._groups[0][0] : nodel[0][0],
            nodeWidth = node.clientWidth,
            nodeHeight = node.clientHeight,
            windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            elementCoords = d3Tip.getPageTopLeft(args[2][args[1]]),
            breaksTop = (elementCoords.top - nodeHeight < 0),
            breaksLeft = (elementCoords.left - nodeWidth < 0),
            breaksRight = (elementCoords.right + nodeHeight > windowWidth),
            breaksBottom = (elementCoords.bottom + nodeHeight > windowHeight);

        if (breaksTop && !breaksRight && !breaksBottom && breaksLeft) {  // Case 1: NW
            dir = 'e';
        } else if (breaksTop && !breaksRight && !breaksBottom && !breaksLeft) {  // Case 2: N
            dir = 's';
        } else if (breaksTop && breaksRight && !breaksBottom && !breaksLeft) {  // Case 3: NE
            dir = 'w';
        } else if (!breaksTop && !breaksRight && !breaksBottom && breaksLeft) {  // Case 4: W
            dir = 'e';
        } else if (!breaksTop && !breaksRight && breaksBottom && breaksLeft) {  // Case 5: SW
            dir = 'e';
        } else if (!breaksTop && !breaksRight && breaksBottom && !breaksLeft) {  // Case 6: S
            dir = 'e';
        } else if (!breaksTop && breaksRight && breaksBottom && !breaksLeft) {  // Case 7: SE
            dir = 'n';
        } else if (!breaksTop && breaksRight && !breaksBottom && !breaksLeft) {  // Case 8: E
            dir = 'w';
        } else {
            dir = 's';
        }

        this.direction(dir);

        while (i--) {
            nodel.classed(this.directions[i], false);
        }

        coords = this.directionCallbacks.get(dir)();

        nodel.classed(dir, true)
            .style('top', (coords.top + pOffset[0]) + scrollTop + 'px')
            .style('left', (coords.left + pOffset[1]) + scrollLeft + 'px');

        return this;
    }

    hide() {
        const nodel = this.getNode();

        nodel.style('opacity', 0)
            .style('pointer-events', 'none');

        return this;
    }

    attr(n) {
        if (arguments.length < 2 && typeof n === 'string') {
            return this.getNode().attr(n);
        } else {
            const args = Array.prototype.slice.call(arguments);
            d3Selection.prototype.attr.apply(this.getNode(), args);
        }

        return this;
    }


    style(n) {
        if (arguments.length < 2 && typeof n === 'string') {
            return this.getNode().style(n);
        } else {
            const args = Array.prototype.slice.call(arguments);

            if (args.length === 1) {
                const styles = args[0],
                    keys = Object.keys(styles);

                for (let key = 0; key < keys.length; key++) {
                    d3Selection.prototype.style.apply(this.getNode(), styles[key]);
                }
            }
        }

        return this;
    }

    direction(v) {
        if (!arguments.length) {
            return this.tipDirection;
        }

        this.tipDirection = v == null ? v : d3Tip.functor(v);

        return this;
    }

    offset(v) {
        if (!arguments.length) {
            return this.tipOffset;
        }

        this.tipOffset = v == null ? v : d3Tip.functor(v);

        return this;
    }

    html(v) {
        if (!arguments.length) {
            return this.tipHtml;
        }

        this.tipHtml = v == null ? v : d3Tip.functor(v);

        return this;
    }

    destroy() {
        if (this.node) {
            this.getNode().remove();
            this.node = null;
        }

        return this;
    }
}
