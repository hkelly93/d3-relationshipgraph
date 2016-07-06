// d3.tip
// Copyright (c) 2013 Justin Palmer
//
// Tooltips for d3.js SVG visualizations
//
// Updated by Harrison kelly.

/* global define, module, SVGElement */
(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module with d3 as a dependency.
        define(['d3'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = function (d3) {
            d3.tip = factory(d3);
            return d3.tip;
        };
    } else {
        // Browser global.
        window.d3.tip = factory(d3);
    }
}(this, function (d3) {
    'use strict';

    /**
     * Constructs a new tooltip
     *
     * @return a tip.
     * @public
     */
    return () => {
        const d3TipDirection = () => {
            return 'n';
        };

        const d3TipOffset = () => {
            return [0, 0];
        };

        const d3TipHtml = () => {
            return ' ';
        };

        const initNode = () => {
            const node = d3.select(document.createElement('div'));
            node
                .style('position', 'absolute')
                .style('top', 0)
                .style('opacity', 0)
                .style('pointer-events', 'none')
                .style('box-sizing', 'border-box');

            return node.node();
        };

        const getNodeEl = () => {
            if (node === null) {
                node = initNode();
                // re-add node to DOM
                document.body.appendChild(node);
            }

            return d3.select(node);
        };

        /**
         * Given a shape on the screen, will return an SVGPoint for the directions:
         *     north, south, east, west, northeast, southeast, northwest, southwest
         *
         *     +-+-+
         *     |   |
         *     +   |
         *     |   |
         *     +-+-+
         *
         * @returns {{}} an Object {n, s, e, w, nw, sw, ne, se}
         * @private
         */
        const getScreenBBox = () => {
            let targetel = target || d3.event.target;

            while ('undefined' === typeof targetel.getScreenCTM && 'undefined' === targetel.parentNode) {
                targetel = targetel.parentNode;
            }

            const bbox = {},
                matrix = targetel.getScreenCTM(),
                tbbox = targetel.getBBox(),
                width = tbbox.width,
                height = tbbox.height,
                x = tbbox.x,
                y = tbbox.y;

            point.x = x;
            point.y = y;
            bbox.nw = point.matrixTransform(matrix);
            point.x += width;
            bbox.ne = point.matrixTransform(matrix);
            point.y += height;
            bbox.se = point.matrixTransform(matrix);
            point.x -= width;
            bbox.sw = point.matrixTransform(matrix);
            point.y -= height / 2;
            bbox.w = point.matrixTransform(matrix);
            point.x += width;
            bbox.e = point.matrixTransform(matrix);
            point.x -= width / 2;
            point.y -= height / 2;
            bbox.n = point.matrixTransform(matrix);
            point.y += height;
            bbox.s = point.matrixTransform(matrix);

            return bbox;
        };

        var direction = d3TipDirection,
            offset = d3TipOffset,
            html = d3TipHtml,
            node = initNode(),
            svg = null,
            point = null,
            target = null;

        /**
         * http://stackoverflow.com/a/7611054
         * @param el
         * @returns {{left: number, top: number}}
         */
        const getPageTopLeft = (el) => {
            const rect = el.getBoundingClientRect(),
                docEl = document.documentElement;

            return {
                top: rect.top + (window.pageYOffset || docEl.scrollTop || 0),
                right: rect.right + (window.pageXOffset || 0),
                bottom: rect.bottom + (window.pageYOffset || 0),
                left: rect.left + (window.pageXOffset || docEl.scrollLeft || 0)
            };
        };

        const functor = (val) => {
            return typeof val === 'function' ? val : () => {
                return val;
            };
        };

        const directionN = () => {
            const bbox = getScreenBBox();
            return {
                top: bbox.n.y - node.offsetHeight,
                left: bbox.n.x - node.offsetWidth / 2
            };
        };

        const directionS = () => {
            const bbox = getScreenBBox();
            return {
                top: bbox.s.y,
                left: bbox.s.x - node.offsetWidth / 2
            };
        };

        const directionE = () => {
            const bbox = getScreenBBox();
            return {
                top: bbox.e.y - node.offsetHeight / 2,
                left: bbox.e.x
            };
        };

        const directionW = () => {
            const bbox = getScreenBBox();
            return {
                top: bbox.w.y - node.offsetHeight / 2,
                left: bbox.w.x - node.offsetWidth
            };
        };

        const directionNW = () => {
            const bbox = getScreenBBox();
            return {
                top: bbox.nw.y - node.offsetHeight,
                left: bbox.nw.x - node.offsetWidth
            };
        };

        const directionNE = () => {
            const bbox = getScreenBBox();
            return {
                top: bbox.ne.y - node.offsetHeight,
                left: bbox.ne.x
            };
        };

        const directionSW = () => {
            const bbox = getScreenBBox();
            return {
                top: bbox.sw.y,
                left: bbox.sw.x - node.offsetWidth
            };
        };

        const directionSE = () => {
            const bbox = getScreenBBox();
            return {
                top: bbox.se.y,
                left: bbox.e.x
            };
        };

        const direction_callbacks = d3.map({
                n: directionN,
                s: directionS,
                e: directionE,
                w: directionW,
                nw: directionNW,
                ne: directionNE,
                sw: directionSW,
                se: directionSE
            }),

            directions = direction_callbacks.keys();

        const getSVGNode = (el) => {
            el = el.node();

            if (el.tagName.toLowerCase() === 'svg') {
                return el;
            }

            return el.ownerSVGElement;
        };

        const tip = (vis) => {
            svg = getSVGNode(vis);
            point = svg.createSVGPoint();
            document.body.appendChild(node);
        };

        /**
         * Show the tooltip on the screen.
         *
         * @returns {function()} a tip
         * @public
         */
        tip.show = function () {
            const args = Array.prototype.slice.call(arguments);
            if (args[args.length - 1] instanceof SVGElement) {
                target = args.pop();
            }

            const content = html.apply(this, args),
                poffset = offset.apply(this, args),
                nodel = getNodeEl(),
                scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
                scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

            let coords,
                dir = direction.apply(this, args),
                i = directions.length;

            nodel.html(content)
                .style('position', 'absolute')
                .style('opacity', 1)
                .style('pointer-events', 'all');

            // Figure out the correct direction.
            const node = nodel._groups[0][0],
                nodeWidth = node.clientWidth,
                nodeHeight = node.clientHeight,
                windowWidth = window.innerWidth,
                windowHeight = window.innerHeight,
                elementCoords = getPageTopLeft(this),
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
            }

            direction(dir);

            while (i--) {
                nodel.classed(directions[i], false);
            }

            coords = direction_callbacks.get(dir).apply(this);
            nodel.classed(dir, true)
                .style('top', (coords.top + poffset[0]) + scrollTop + 'px')
                .style('left', (coords.left + poffset[1]) + scrollLeft + 'px');

            return tip;
        };

        /**
         * Hide the tooltip
         *
         * @returns {function()} a tup
         * @public
         */
        tip.hide = function () {
            const nodel = getNodeEl();

            nodel
                .style('opacity', 0)
                .style('pointer-events', 'none');

            return tip;
        };

        /**
         * Proxy attr calls to the d3 tip container. Sets or gets attribute value.
         *
         * @param n {String} The name of the attribute
         * @returns {*} The tip or attribute value
         * @public
         */
        tip.attr = function (n) {
            if (arguments.length < 2 && typeof n === 'string') {
                return getNodeEl().attr(n);
            } else {
                const args = Array.prototype.slice.call(arguments);
                d3.selection.prototype.attr.apply(getNodeEl(), args);
            }

            return tip;
        };

        /**
         * Proxy style calls to the d3 tip container. Sets or gets a style value.
         *
         * @param n {String} name of the property.
         * @returns {*} The tip or style property value
         * @public
         */
        tip.style = function (n) {
            if (arguments.length < 2 && typeof n === 'string') {
                return getNodeEl().style(n);
            } else {
                const args = Array.prototype.slice.call(arguments);

                if (args.length === 1) {
                    const styles = args[0],
                        keys = Object.keys(styles);

                    for (let key = 0; key < keys.length; key++) {
                        d3.selection.prototype.style.apply(getNodeEl(), styles[key]);
                    }
                }
            }

            return tip;
        };

        /**
         * Set or get the direction of the tooltip
         *
         * @param v {String} One of: n, s, e, w, nw, sw, ne, se.
         * @returns {function()} The tip or the direction
         * @public
         */
        tip.direction = function (v) {
            if (!arguments.length) {
                return direction;
            }

            direction = v == null ? v : functor(v);

            return tip;
        };

        /**
         * Sets or gets the offset of the tip
         *
         * @param v {Array} Array of [x, y,] offset
         * @returns {function()} The offset or the tip.
         * @public
         */
        tip.offset = function (v) {
            if (!arguments.length) {
                return offset;
            }

            offset = v == null ? v : functor(v);

            return tip;
        };

        /**
         * Sets or gets the html value of the tooltip.
         *
         * @param v {String} Thes tring value of the tip
         * @returns {function()} The html value or the tip.
         * @public
         */
        tip.html = function (v) {
            if (!arguments.length) {
                return html;
            }

            html = v == null ? v : functor(v);

            return tip;
        };

        /**
         * Destroys the tooltip and removes it from the DOM.
         *
         * @returns {function()} A tip.
         * @public
         */
        tip.destroy = function () {
            if (node) {
                getNodeEl().remove();
                node = null;
            }

            return tip;
        };

        return tip;
    };

}));
