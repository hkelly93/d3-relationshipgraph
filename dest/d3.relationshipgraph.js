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
        root.d3.tip = factory(root.d3);
    }
}(this, function (d3) {
    'use strict';

    // Public - contructs a new tooltip
    //
    // Returns a tip
    return function () {

        var direction = d3_tip_direction,
            offset = d3_tip_offset,
            html = d3_tip_html,
            node = initNode(),
            svg = null,
            point = null,
            target = null;

        /**
         * http://stackoverflow.com/a/7611054
         * @param el
         * @returns {{left: number, top: number}}
         */
        var getPageTopLeft = function (el) {
            var rect = el.getBoundingClientRect();
            var docEl = document.documentElement;
            return {
                top: rect.top + (window.pageYOffset || docEl.scrollTop || 0),
                right: rect.right + (window.pageXOffset || 0),
                bottom: rect.bottom + (window.pageYOffset || 0),
                left: rect.left + (window.pageXOffset || docEl.scrollLeft || 0)
            };
        };

        function tip(vis) {
            svg = getSVGNode(vis);
            point = svg.createSVGPoint();
            document.body.appendChild(node);
        }

        // Public - show the tooltip on the screen
        //
        // Returns a tip
        tip.show = function () {
            var args = Array.prototype.slice.call(arguments);
            if (args[args.length - 1] instanceof SVGElement) {
                target = args.pop();
            }

            var content = html.apply(this, args),
                poffset = offset.apply(this, args),
                dir = direction.apply(this, args),
                nodel = getNodeEl(),
                i = directions.length,
                coords,
                scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
                scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

            nodel.html(content)
                .style({opacity: 1, 'pointer-events': 'all'});

            // Figure out the correct direction.
            var node = nodel[0][0],
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
            nodel.classed(dir, true).style({
                top: (coords.top + poffset[0]) + scrollTop + 'px',
                left: (coords.left + poffset[1]) + scrollLeft + 'px'
            });

            return tip;
        };

        // Public - hide the tooltip
        //
        // Returns a tip
        tip.hide = function () {
            var nodel = getNodeEl();
            nodel.style({opacity: 0, 'pointer-events': 'none'});
            return tip;
        };

        // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
        //
        // n - name of the attribute
        // v - value of the attribute
        //
        // Returns tip or attribute value
        tip.attr = function (n) {
            if (arguments.length < 2 && typeof n === 'string') {
                return getNodeEl().attr(n);
            } else {
                var args = Array.prototype.slice.call(arguments);
                d3.selection.prototype.attr.apply(getNodeEl(), args);
            }

            return tip;
        };

        // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
        //
        // n - name of the property
        // v - value of the property
        //
        // Returns tip or style property value
        tip.style = function (n, v) {
            if (arguments.length < 2 && typeof n === 'string') {
                return getNodeEl().style(n);
            } else {
                var args = Array.prototype.slice.call(arguments);
                d3.selection.prototype.style.apply(getNodeEl(), args);
            }

            return tip;
        };

        // Public: Set or get the direction of the tooltip
        //
        // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
        //     sw(southwest), ne(northeast) or se(southeast)
        //
        // Returns tip or direction
        tip.direction = function (v) {
            if (!arguments.length) {
                return direction;
            }

            direction = v == null ? v : d3.functor(v);

            return tip;
        };

        // Public: Sets or gets the offset of the tip
        //
        // v - Array of [x, y] offset
        //
        // Returns offset or
        tip.offset = function (v) {
            if (!arguments.length) {
                return offset;
            }

            offset = v == null ? v : d3.functor(v);

            return tip;
        };

        // Public: sets or gets the html value of the tooltip
        //
        // v - String value of the tip
        //
        // Returns html value or tip
        tip.html = function (v) {
            if (!arguments.length) {
                return html;
            }

            html = v == null ? v : d3.functor(v);

            return tip;
        };

        // Public: destroys the tooltip and removes it from the DOM
        //
        // Returns a tip
        tip.destroy = function () {
            if (node) {
                getNodeEl().remove();
                node = null;
            }

            return tip;
        };

        function d3_tip_direction() {
            return 'n';
        }

        function d3_tip_offset() {
            return [0, 0];
        }

        function d3_tip_html() {
            return ' ';
        }

        var direction_callbacks = d3.map({
                n: direction_n,
                s: direction_s,
                e: direction_e,
                w: direction_w,
                nw: direction_nw,
                ne: direction_ne,
                sw: direction_sw,
                se: direction_se
            }),

            directions = direction_callbacks.keys();

        function direction_n() {
            var bbox = getScreenBBox();
            return {
                top: bbox.n.y - node.offsetHeight,
                left: bbox.n.x - node.offsetWidth / 2
            };
        }

        function direction_s() {
            var bbox = getScreenBBox();
            return {
                top: bbox.s.y,
                left: bbox.s.x - node.offsetWidth / 2
            };
        }

        function direction_e() {
            var bbox = getScreenBBox();
            return {
                top: bbox.e.y - node.offsetHeight / 2,
                left: bbox.e.x
            };
        }

        function direction_w() {
            var bbox = getScreenBBox();
            return {
                top: bbox.w.y - node.offsetHeight / 2,
                left: bbox.w.x - node.offsetWidth
            };
        }

        function direction_nw() {
            var bbox = getScreenBBox();
            return {
                top: bbox.nw.y - node.offsetHeight,
                left: bbox.nw.x - node.offsetWidth
            };
        }

        function direction_ne() {
            var bbox = getScreenBBox();
            return {
                top: bbox.ne.y - node.offsetHeight,
                left: bbox.ne.x
            };
        }

        function direction_sw() {
            var bbox = getScreenBBox();
            return {
                top: bbox.sw.y,
                left: bbox.sw.x - node.offsetWidth
            };
        }

        function direction_se() {
            var bbox = getScreenBBox();
            return {
                top: bbox.se.y,
                left: bbox.e.x
            };
        }

        function initNode() {
            var node = d3.select(document.createElement('div'));
            node.style({
                position: 'absolute',
                top: 0,
                opacity: 0,
                'pointer-events': 'none',
                'box-sizing': 'border-box'
            });

            return node.node();
        }

        function getSVGNode(el) {
            el = el.node();
            if (el.tagName.toLowerCase() === 'svg') {
                return el;
            }

            return el.ownerSVGElement;
        }

        function getNodeEl() {
            if (node === null) {
                node = initNode();
                // re-add node to DOM
                document.body.appendChild(node);
            }

            return d3.select(node);
        }

        // Private - gets the screen coordinates of a shape
        //
        // Given a shape on the screen, will return an SVGPoint for the directions
        // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
        // sw(southwest).
        //
        //    +-+-+
        //    |   |
        //    +   +
        //    |   |
        //    +-+-+
        //
        // Returns an Object {n, s, e, w, nw, sw, ne, se}
        function getScreenBBox() {
            var targetel = target || d3.event.target;

            while ('undefined' === typeof targetel.getScreenCTM && 'undefined' === targetel.parentNode) {
                targetel = targetel.parentNode;
            }

            var bbox = {},
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
        }

        return tip;
    };

}));
 /**
 * The MIT License (MIT).
 *
 * Copyright (c) 2016 Harrison Kelly.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * D3-relationshipgraph - 1.4.2
 */

/**
 * Determine if AMD or CommonJS are being used.
 *
 * @param {object} root The window object.
 * @param {object} factory The factory object.
 */
(function(root, factory) {  // jshint ignore:line
    'use strict';

    /* jshint ignore:start */
    if (typeof define === 'function' && define.amd) {
        define('d3.relationshipGraph', ['d3'], factory);
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory(require('d3'));
    } else if (typeof exports === 'object') {
        exports.d3.relationshipGraph = factory(require('d3'));
    } else {
        root.d3.relationshipGraph = factory(root.d3);
    }
    /* jshint ignore:end */
})(this, function(d3) {
    'use strict';

    /**
     * Add a relationshipGraph function to d3 that returns a RelationshipGraph object.
     */
    d3.relationshipGraph = function() {
        return RelationshipGraph.extend.apply(RelationshipGraph, arguments);
    };

    /**
     * Add relationshipGraph to selection.
     *
     * @param {Object} userConfig Configuration for graph.
     * @return {Object} Returns a new RelationshipGraph object.
     */
    d3.selection.prototype.relationshipGraph = function(userConfig) {
        return new RelationshipGraph(this, userConfig);
    };

    /**
     * Add relationshipGraph to enter.
     *
     * @returns {RelationshipGraph} RelationshipGraph object.
     */
    d3.selection.enter.prototype.relationshipGraph = function() {
        return this.graph;
    };

    /**
     *
     * @param {d3.selection} selection The ID of the element containing the graph.
     * @param {Object} userConfig Configuration for graph.
     * @constructor
     */
    var RelationshipGraph = function(selection, userConfig) {
        if (userConfig === undefined) {
            userConfig = {
                showTooltips: true,
                maxChildCount: 0,
                onClick: noop,
                thresholds: []
            };
        } else {
            // Verify that the user config contains the thresholds.
            if (userConfig.thresholds === undefined) {
                userConfig.thresholds = [];
            } else if (typeof userConfig.thresholds !== 'object') {
                throw 'Thresholds must be an Object.';
            }
        }

        /**
         * Contains the configuration for the graph.
         *
         * @type {{blockSize: number, selection: d3.selection, showTooltips: boolean, maxChildCount: number,
         * onClick: function, showKeys: (*|boolean|*|boolean), thresholds: Array, colors: Array, transitionTime: number,
         * truncate: (*|number), sortFunction: (*|sortJson)}}
         */
        this.config = {
            blockSize: 24,  // The block size for each child.
            selection: selection,  // The ID for the graph.
            showTooltips: userConfig.showTooltips,  // Whether or not to show the tooltips on hover.
            maxChildCount: userConfig.maxChildCount || 0,  // The maximum amount of children to show before wrapping.
            onClick: userConfig.onClick || noop,  // The callback function to call when a child is clicked.
            showKeys: userConfig.showKeys,  // Whether or not to show the keys in the tooltip.
            thresholds: userConfig.thresholds,  // Thresholds to determine the colors of the child blocks with.
            colors: userConfig.colors || ['#c4f1be', '#a2c3a4', '#869d96', '#525b76', '#201e50',
                '#485447', '#5b7f77', '#6474ad', '#b9c6cb', '#c0d6c1',
                '#754668', '#587d71', '#4daa57', '#b5dda4', '#f9eccc',
                '#0e7c7b', '#17bebb', '#d4f4dd', '#d62246', '#4b1d3f',
                '#cf4799', '#c42583', '#731451', '#f3d1bf', '#c77745'
            ],  // Colors to use for blocks.
            transitionTime: userConfig.transitionTime || 1500,  // Time for a transition to start and complete.
            truncate: userConfig.truncate || 25,  // Maximum length of a parent label before it gets truncated.
            sortFunction: userConfig.sortFunction || sortJson,  // A custom sort function.
            valueKeyName: userConfig.valueKeyName || 'value'  // Set a custom key value in the tooltip.
        };

        if (this.config.showTooltips === undefined) {
            this.config.showTooltips = true;
        }

        if (this.config.showKeys === undefined) {
            this.config.showKeys = true;
        }

        // If the threshold array is made up of numbers, make sure that it is sorted.
        if (this.config.thresholds.length > 0 && (typeof this.config.thresholds[0]) == 'number') {
            this.config.thresholds.sort();
        }

        /**
         * Used for measuring text widths.
         * @type {Element}
         */
        this.measurementDiv = document.createElement('div');

        /**
         * Used for caching measurements.
         * @type {{}}
         */
        this.measuredCache = {};

        var measurementStyle = this.measurementDiv.style;
        measurementStyle.fontFamily = 'Helvetica';
        measurementStyle.fontSize = '13px';
        measurementStyle.position = 'absolute';
        measurementStyle.width = 'auto';
        measurementStyle.height = 'auto';
        measurementStyle.left = '-100%';
        measurementStyle.top = '-100%';

        document.body.appendChild(this.measurementDiv);

        /**
         * Function that turns a string into title case.
         *
         * @param {string} str The string to convert.
         * @returns {string} A title cased string.
         * @private
         */
        var toTitleCase = function(str) {
            return str.toLowerCase().split(' ').map(function(part) {
                return part.charAt(0).toUpperCase() + part.substring(1).toLowerCase();
            }).join(' ');
        };

        /**
         * Function to create the tooltip.
         *
         * @param {RelationshipGraph} self The RelationshipGraph instance.
         * @returns {d3.tip} the tip object.
         * @private
         */
        var createTooltip = function(self) {
            var hiddenKeys = ['ROW', 'INDEX', 'COLOR', 'PARENTCOLOR', 'PARENT'],
                showKeys = self.config.showKeys;

            return d3.tip().attr('class', 'relationshipGraph-tip')
                .offset([-8, -10])
                .html(function(obj) {
                    var keys = Object.keys(obj),
                        table = document.createElement('table'),
                        count = keys.length,
                        rows = [];

                    // Loop through the keys in the object and only show values self are not in the hiddenKeys array.
                    while (count--) {
                        var element = keys[count],
                            upperCaseKey = element.toUpperCase();

                        if (!contains(hiddenKeys, upperCaseKey)) {
                            var row = document.createElement('tr'),
                                key = showKeys ? document.createElement('td') : null,
                                value = document.createElement('td');

                            if (showKeys) {
                                key.innerHTML = (upperCaseKey == 'VALUE') ?
                                    toTitleCase(self.config.valueKeyName) : toTitleCase(element);
                                row.appendChild(key);
                            }

                            value.innerHTML = obj[element];
                            value.style.fontWeight = 'normal';

                            row.appendChild(value);
                            rows.push(row);
                        }

                    }

                    var rowCount = rows.length;

                    while (rowCount--) {
                        table.appendChild(rows[rowCount]);
                    }

                    return table.outerHTML;
                });
        };

        if (this.config.showTooltips) {
            this.tip = createTooltip(this);
            this.tip.direction('n');
        } else {
            this.tip = null;
        }

        // Check if this selection already has a graph.
        this.svg = this.config.selection.select('svg').select('g');

        if (this.svg.empty()) {
            // Create the svg element that will contain the graph.
            this.svg = this.config.selection
                .append('svg')
                .attr('width', '500')
                .attr('height', '500')
                .attr('style', 'display: block')
                .append('g')
                .attr('transform', 'translate(10, 0)');
        }

        this.graph = this;
    };

    /**
     * Checks if the object contains the key.
     *
     * @param {object} obj The object to check in.
     * @param {string} key They key to check for.
     * @returns {boolean} Whether or not the object contains the key.
     * @private
     */
    var containsKey = function(obj, key) {
        return Object.keys(obj).indexOf(key) > -1;
    };

    /**
     * Checks whether or not the key is in the array.
     *
     * @param {*[]} arr The array to check in.
     * @param {string} key The key to check for.
     * @returns {boolean} Whether or not the key exists in the array.
     * @private
     */
    var contains = function(arr, key) {
        return arr.indexOf(key) > -1;
    };

    /**
     * Truncate a string to 25 characters plus an ellipses.
     *
     * @param {string} str The string to truncate.
     * @param {number} cap The number to cap the string at before it gets truncated.
     * @returns {string} The string truncated (if necessary).
     * @private
     */
    var truncate = function(str, cap) {
        if (cap === 0) {
            return str;
        }

        return (str.length > cap) ? str.substring(0, cap) + '...' : str;
    };

    /**
     * Determines if the array passed in is an Array object.
     *
     * @param {Array} arr The array object to check.
     * @returns {boolean} Whether or not the array is actually an array object.
     * @private
     */
    var isArray = function(arr) {
        return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Noop function.
     *
     * @private
     */
    var noop = function() { };

    /**
     * Returns a sorted Array.
     *
     * @param {Array} json The Array to be sorted.
     * @private
     */
    var sortJson = function(json) {
        json.sort(function(child1, child2) {
            var parent1 = child1.parent.toLowerCase(),
                parent2 = child2.parent.toLowerCase();

            return (parent1 > parent2) ? 1 : (parent1 < parent2) ? -1 : 0;
        });
    };

    /**
     * Go through all of the thresholds and find the one that is equal to the value.
     *
     * @param {String} value The value from the JSON.
     * @param {Array} thresholds The thresholds from the JSON.
     * @returns {number} The index of the threshold that is equal to the value or -1 if the value doesn't equal any
     *  thresholds.
     * @private
     */
    var stringCompare = function (value, thresholds) {
        if (typeof value !== 'string') {
            throw 'Cannot make value comparison between a string and a ' + (typeof value) + '.';
        }

        var thresholdsLength = thresholds.length;

        for (var i = 0; i < thresholdsLength; i++) {
            if (value == thresholds[i]) {
                return i;
            }
        }

        return -1;
    };

    /**
     * Go through all of the thresholds and find the smallest number that is greater than the value.
     *
     * @param {number} value The value from the JSON.
     * @param {Array} thresholds The thresholds from the JSON.
     * @returns {number} The index of the threshold that is the smallest number that is greater than the value or -1 if
     *  the value isn't between any thresholds.
     * @private
     */
    var numericCompare = function (value, thresholds) {
        if (typeof value !== 'number') {
            throw 'Cannot make value comparison between a number and a ' + (typeof value) + '.';
        }

        var length = thresholds.length;

        for (var i = 0; i < length; i++) {
            if (value < thresholds[i]) {
                return i;
            }
        }

        return -1;
    };

    /**
     * Assign the index and row to each of the children in the Array of Objects.
     *
     * @param {RelationshipGraph} that The relationship graph object.
     * @param {Array} json The array of Objects to loop through.
     * @param {Object} parentSizes The parent sizes determined.
     * @param {Array} parents The parent label names.
     * @returns {Object} Object containing the longest width, the calculated max children per row, and the maximum
     *  amount of rows.
     * @private
     */
    var assignIndexAndRow = function(that, json, parentSizes, parents) {
        // Determine the longest parent name to calculate how far from the left the child blocks should start.
        var longest = '',
            parentNames = Object.keys(parentSizes),
            i,
            index = 0,
            row = 0,
            previousParent = '',
            parentLength = parents.length,
            config = that.config,
            blockSize = config.blockSize;

        for (i = 0; i < parentLength; i++) {
            var current = parents[i] + ' ( ' + parentSizes[parentNames[i]] + ') ';

            if (current.length > longest.length) {
                longest = current;
            }
        }

        // Calculate the row and column for each child block.
        var longestWidth = that.getPixelLength(longest),
            parentDiv = config.selection[0][0],
            calculatedMaxChildren = (config.maxChildCount === 0) ?
                Math.floor((parentDiv.parentElement.clientWidth - blockSize - longestWidth) / blockSize) :
                config.maxChildCount,
            jsonLength = json.length,
            thresholds = config.thresholds;

        for (i = 0; i < jsonLength; i++) {
            var element = json[i],
                parent = element.parent;

            if (previousParent !== null && previousParent !== parent) {
                element.row = row + 1;
                element.index = 1;

                index = 2;
                row++;
            } else {
                if (index === calculatedMaxChildren + 1) {
                    index = 1;
                    row++;
                }

                element.row = row;
                element.index = index;

                index++;
            }

            previousParent = parent;

            if (thresholds.length === 0) {
                element.color = 0;
            } else {
                // Figure out the color based on the threshold.
                var value,
                    compare;

                if (typeof thresholds[0] === 'string') {
                    value = element.value;
                    compare = stringCompare;
                } else {
                    var elementValue = element.value;

                    value = (typeof elementValue == 'number') ?
                        elementValue : parseFloat(elementValue.replace(/[^0-9-\.]+/g, ''));

                    compare = numericCompare;
                }

                var thresholdIndex = compare(value, thresholds);

                element.color = (thresholdIndex === -1) ? 0 : thresholdIndex;
            }
        }

        return {
            longestWidth: longestWidth,
            calculatedMaxChildren: calculatedMaxChildren,
            maxRow: row
        };
    };

    /**
     * Returns the pixel length of the string based on the font size.
     *
     * @param {string} str The string to get the length of.
     * @returns {Number} The pixel length of the string.
     * @public
     */
    RelationshipGraph.prototype.getPixelLength = function(str) {
        if (containsKey(this.measuredCache, str)) {
            return this.measuredCache[str];
        }

        var text = document.createTextNode(str);
        this.measurementDiv.appendChild(text);

        var width = this.measurementDiv.offsetWidth;
        this.measurementDiv.removeChild(text);

        this.measuredCache[str] = width;

        return width;
    };

    /**
     * Verify that the JSON passed in is correct.
     *
     * @param {Array} json The array of JSON objects to verify.
     * @public
     */
    RelationshipGraph.prototype.verifyJson = function(json) {
        if (!(isArray(json)) || (json.length < 0) || (typeof json[0] !== 'object')) {
            throw 'JSON has to be an Array of JavaScript objects that is not empty.';
        }

        var length = json.length;

        while (length--) {
            var element = json[length],
                keys = Object.keys(element),
                keyLength = keys.length,
                parentColor = element.parentColor;

            if (element.parent === undefined) {
                throw 'Child does not have a parent.';
            } else if (parentColor !== undefined && (parentColor > 4 || parentColor < 0)) {
                throw 'Parent color is unsupported.';
            }

            while (keyLength--) {
                var currentObj = json[length];

                if (keys[keyLength].toUpperCase() == 'VALUE') {
                    if (keys[keyLength] != 'value') {
                        currentObj.value = currentObj[keys[keyLength]];
                        delete currentObj[keys[keyLength]];
                    }
                    break;
                }
            }
        }

        return true;
    };

    /**
     * Generate the graph.
     *
     * @param {Array} json The array of JSON to feed to the graph.
     * @return {RelationshipGraph} The RelationshipGraph object to keep d3's chaining functionality.
     * @public
     */
    RelationshipGraph.prototype.data = function(json) {
        if (this.verifyJson(json)) {
            var row,
                parents = [],
                parentSizes = {},
                previousParentSizes = 0,
                _this = this,
                parent,
                i,
                maxWidth,
                maxHeight,
                calculatedMaxChildren,
                longestWidth,
                config = this.config;

            // Ensure that the JSON is sorted by parent.
            config.sortFunction(json);

            /**
             * Loop through all of the childrenNodes in the JSON array and determine the amount of childrenNodes per
             * parent. This will also calculate the row and index for each block and truncate the parent names to 25
             * characters.
             */
            var jsonLength = json.length;

            for (i = 0; i < jsonLength; i++) {
                parent = json[i].parent;

                if (containsKey(parentSizes, parent)) {
                    parentSizes[parent]++;
                } else {
                    parentSizes[parent] = 1;
                    parents.push(truncate(parent, config.truncate));
                }
            }

            /**
             * Assign the indexes and rows to each child. This method also calculates the maximum amount of children
             * per row, the longest row width, and how many rows there are.
             */
            var calculatedResults = assignIndexAndRow(this, json, parentSizes, parents),
                parentSizesKeys = Object.keys(parentSizes);

            calculatedMaxChildren = calculatedResults.calculatedMaxChildren;
            longestWidth = calculatedResults.longestWidth;
            row = calculatedResults.maxRow;

            // Set the max width and height.
            maxHeight = row * config.blockSize;
            maxWidth = longestWidth + (calculatedMaxChildren * config.blockSize);

            // Select all of the parent nodes.
            var parentNodes = this.svg.selectAll('.relationshipGraph-Text')
                .data(parents);

            // Add new parent nodes.
            parentNodes.enter().append('text')
                .text(function(obj, index) {
                    return obj + ' (' + parentSizes[parentSizesKeys[index]] + ')';
                })
                .attr('x', function(obj, index) {
                    var width = _this.getPixelLength(obj + ' (' + parentSizes[parentSizesKeys[index]] + ')');
                    return longestWidth - width;
                })
                .attr('y', function(obj, index) {
                    if (index === 0) {
                        return 0;
                    }

                    // Determine the Y coordinate by determining the Y coordinate of all of the parents before.
                    var y = Math.ceil(previousParentSizes / calculatedMaxChildren) * _this.config.blockSize;
                    previousParentSizes += y;

                    return y;
                })
                .style('text-anchor', 'start')
                .style('fill', function(obj) {
                    return (obj.parentColor !== undefined) ? _this.config.colors[obj.parentColor] : '#000000';
                })
                .attr('class', 'relationshipGraph-Text')
                .attr('transform', 'translate(-6, ' + this.config.blockSize / 1.5 + ')');

            // Update existing parent nodes.
            parentNodes
                .text(function(obj, index) {
                    return obj + ' (' + parentSizes[parentSizesKeys[index]] + ')';
                })
                .attr('x', function(obj, index) {
                    var width = _this.getPixelLength(obj + ' (' + parentSizes[parentSizesKeys[index]] + ')');
                    return longestWidth - width;
                })
                .attr('y', function(obj, index) {
                    if (index === 0) {
                        return 0;
                    }

                    /**
                     * Determine the Y coordinate by determining the Y coordinate of all of the parents before. This
                     * has to be calculated completely because it is an update and can occur anywhere.
                     */
                    var previousParentSize = 0,
                        i = index - 1;

                    while (i > -1) {
                        previousParentSize += Math.ceil(parentSizes[parentSizesKeys[i]] / calculatedMaxChildren) *
                            calculatedMaxChildren;
                        i--;
                    }

                    return Math.ceil(previousParentSize / calculatedMaxChildren) * _this.config.blockSize;
                })
                .style('fill', function(obj) {
                    return (obj.parentColor !== undefined) ? _this.config.colors[obj.parentColor] : '#000000';
                });

            // Remove deleted parent nodes.
            parentNodes.exit().remove();

            // Select all of the children nodes.
            var childrenNodes = this.svg.selectAll('.relationshipGraph-block')
                .data(json);

            // Add new child nodes.
            childrenNodes.enter()
                .append('rect')
                .attr('x', function(obj) {
                    return longestWidth + ((obj.index - 1) * _this.config.blockSize) + 5;
                })
                .attr('y', function(obj) {
                    return (obj.row - 1) * _this.config.blockSize;
                })
                .attr('rx', 4)
                .attr('ry', 4)
                .attr('class', 'relationshipGraph-block')
                .attr('width', _this.config.blockSize)
                .attr('height', _this.config.blockSize)
                .style('fill', function(obj) {
                    return _this.config.colors[obj.color % _this.config.colors.length] || _this.config.colors[0];
                })
                .on('mouseover', _this.tip ? _this.tip.show : noop)
                .on('mouseout', _this.tip ? _this.tip.hide : noop)
                .on('click', function(obj) {
                    _this.tip.hide();
                    _this.config.onClick(obj);
                });

            // Update existing child nodes.
            childrenNodes.transition(_this.config.transitionTime)
                .attr('x', function(obj) {
                    return longestWidth + ((obj.index - 1) * _this.config.blockSize) + 5;
                })
                .attr('y', function(obj) {
                    return (obj.row - 1) * _this.config.blockSize;
                })
                .style('fill', function(obj) {
                    return _this.config.colors[obj.color % _this.config.colors.length] || _this.config.colors[0];
                });

            // Delete removed child nodes.
            childrenNodes.exit().transition(_this.config.transitionTime).remove();

            if (this.config.showTooltips) {
                d3.select('.d3-tip').remove();
                this.svg.call(this.tip);
            }

            this.config.selection.select('svg')
                .attr('width', maxWidth + 15)
                .attr('height', maxHeight + 15);
        }

        return this;
    };

    return RelationshipGraph;
});
