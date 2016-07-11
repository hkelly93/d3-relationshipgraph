'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
        // CommonJS
        module.exports = function (d3) {
            d3.tip = factory(d3);
            return d3.tip;
        };
    } else {
        // Browser global.
        window.d3.tip = factory(d3);
    }
})(undefined, function (d3) {
    'use strict';

    /**
     * Constructs a new tooltip
     *
     * @return a tip.
     * @public
     */

    return function () {
        var d3TipDirection = function d3TipDirection() {
            return 'n';
        };

        var d3TipOffset = function d3TipOffset() {
            return [0, 0];
        };

        var d3TipHtml = function d3TipHtml() {
            return ' ';
        };

        var initNode = function initNode() {
            var node = d3.select(document.createElement('div'));
            node.style('position', 'absolute').style('top', 0).style('opacity', 0).style('pointer-events', 'none').style('box-sizing', 'border-box');

            return node.node();
        };

        var getNodeEl = function getNodeEl() {
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
        var getScreenBBox = function getScreenBBox() {
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
        var getPageTopLeft = function getPageTopLeft(el) {
            var rect = el.getBoundingClientRect(),
                docEl = document.documentElement;

            return {
                top: rect.top + (window.pageYOffset || docEl.scrollTop || 0),
                right: rect.right + (window.pageXOffset || 0),
                bottom: rect.bottom + (window.pageYOffset || 0),
                left: rect.left + (window.pageXOffset || docEl.scrollLeft || 0)
            };
        };

        var functor = function functor(val) {
            return typeof val === 'function' ? val : function () {
                return val;
            };
        };

        var directionN = function directionN() {
            var bbox = getScreenBBox();
            return {
                top: bbox.n.y - node.offsetHeight,
                left: bbox.n.x - node.offsetWidth / 2
            };
        };

        var directionS = function directionS() {
            var bbox = getScreenBBox();
            return {
                top: bbox.s.y,
                left: bbox.s.x - node.offsetWidth / 2
            };
        };

        var directionE = function directionE() {
            var bbox = getScreenBBox();
            return {
                top: bbox.e.y - node.offsetHeight / 2,
                left: bbox.e.x
            };
        };

        var directionW = function directionW() {
            var bbox = getScreenBBox();
            return {
                top: bbox.w.y - node.offsetHeight / 2,
                left: bbox.w.x - node.offsetWidth
            };
        };

        var directionNW = function directionNW() {
            var bbox = getScreenBBox();
            return {
                top: bbox.nw.y - node.offsetHeight,
                left: bbox.nw.x - node.offsetWidth
            };
        };

        var directionNE = function directionNE() {
            var bbox = getScreenBBox();
            return {
                top: bbox.ne.y - node.offsetHeight,
                left: bbox.ne.x
            };
        };

        var directionSW = function directionSW() {
            var bbox = getScreenBBox();
            return {
                top: bbox.sw.y,
                left: bbox.sw.x - node.offsetWidth
            };
        };

        var directionSE = function directionSE() {
            var bbox = getScreenBBox();
            return {
                top: bbox.se.y,
                left: bbox.e.x
            };
        };

        var direction_callbacks = d3.map({
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

        var getSVGNode = function getSVGNode(el) {
            el = el.node();

            if (el.tagName.toLowerCase() === 'svg') {
                return el;
            }

            return el.ownerSVGElement;
        };

        var tip = function tip(vis) {
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
            var args = Array.prototype.slice.call(arguments);
            if (args[args.length - 1] instanceof SVGElement) {
                target = args.pop();
            }

            var content = html.apply(this, args),
                poffset = offset.apply(this, args),
                nodel = getNodeEl(),
                scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
                scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

            var coords = void 0,
                dir = direction.apply(this, args),
                i = directions.length;

            nodel.html(content).style('position', 'absolute').style('opacity', 1).style('pointer-events', 'all');

            // Figure out the correct direction.
            var node = nodel._groups[0][0],
                nodeWidth = node.clientWidth,
                nodeHeight = node.clientHeight,
                windowWidth = window.innerWidth,
                windowHeight = window.innerHeight,
                elementCoords = getPageTopLeft(this),
                breaksTop = elementCoords.top - nodeHeight < 0,
                breaksLeft = elementCoords.left - nodeWidth < 0,
                breaksRight = elementCoords.right + nodeHeight > windowWidth,
                breaksBottom = elementCoords.bottom + nodeHeight > windowHeight;

            if (breaksTop && !breaksRight && !breaksBottom && breaksLeft) {
                // Case 1: NW
                dir = 'e';
            } else if (breaksTop && !breaksRight && !breaksBottom && !breaksLeft) {
                // Case 2: N
                dir = 's';
            } else if (breaksTop && breaksRight && !breaksBottom && !breaksLeft) {
                // Case 3: NE
                dir = 'w';
            } else if (!breaksTop && !breaksRight && !breaksBottom && breaksLeft) {
                // Case 4: W
                dir = 'e';
            } else if (!breaksTop && !breaksRight && breaksBottom && breaksLeft) {
                // Case 5: SW
                dir = 'e';
            } else if (!breaksTop && !breaksRight && breaksBottom && !breaksLeft) {
                // Case 6: S
                dir = 'e';
            } else if (!breaksTop && breaksRight && breaksBottom && !breaksLeft) {
                // Case 7: SE
                dir = 'n';
            } else if (!breaksTop && breaksRight && !breaksBottom && !breaksLeft) {
                // Case 8: E
                dir = 'w';
            }

            direction(dir);

            while (i--) {
                nodel.classed(directions[i], false);
            }

            coords = direction_callbacks.get(dir).apply(this);
            nodel.classed(dir, true).style('top', coords.top + poffset[0] + scrollTop + 'px').style('left', coords.left + poffset[1] + scrollLeft + 'px');

            return tip;
        };

        /**
         * Hide the tooltip
         *
         * @returns {function()} a tup
         * @public
         */
        tip.hide = function () {
            var nodel = getNodeEl();

            nodel.style('opacity', 0).style('pointer-events', 'none');

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
                var args = Array.prototype.slice.call(arguments);
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
                var args = Array.prototype.slice.call(arguments);

                if (args.length === 1) {
                    var styles = args[0],
                        keys = Object.keys(styles);

                    for (var key = 0; key < keys.length; key++) {
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
});
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
* D3-relationshipgraph - 2.0.0
*/

var RelationshipGraph = function () {

    /**
     *
     * @param {d3.selection} selection The ID of the element containing the graph.
     * @param {Object} userConfig Configuration for graph.
     * @constructor
     */

    function RelationshipGraph(selection) {
        var userConfig = arguments.length <= 1 || arguments[1] === undefined ? { showTooltips: true, maxChildCount: 0, thresholds: [] } : arguments[1];

        _classCallCheck(this, RelationshipGraph);

        // Verify that the user config contains the thresholds.
        if (!userConfig.thresholds) {
            userConfig.thresholds = [];
        } else if (_typeof(userConfig.thresholds) !== 'object') {
            throw 'Thresholds must be an Object.';
        }

        if (userConfig.onClick !== undefined) {
            this.parentPointer = userConfig.onClick.parent !== undefined;
            this.childPointer = userConfig.onClick.child !== undefined;
        } else {
            this.parentPointer = false;
            this.childPointer = false;
        }

        var defaultOnClick = { parent: RelationshipGraph.noop, child: RelationshipGraph.noop };

        /**
         * Contains the configuration for the graph.
         *
         * @type {{blockSize: number, selection: d3.selection, showTooltips: boolean, maxChildCount: number,
         * onClick: (RelationshipGraph.noop|*), showKeys: (*|boolean), thresholds: Array,
         * colors: (*|Array|boolean|string[]), transitionTime: (*|number),
         * truncate: (RelationshipGraph.truncate|*|number)}}
         */
        this.configuration = {
            blockSize: 24, // The block size for each child.
            selection: selection, // The ID for the graph.
            showTooltips: userConfig.showTooltips, // Whether or not to show the tooltips on hover.
            maxChildCount: userConfig.maxChildCount || 0, // The maximum amount of children to show per row.
            onClick: userConfig.onClick || defaultOnClick, // The callback function to call.
            showKeys: userConfig.showKeys, // Whether or not to show the keys in the tooltip.
            thresholds: userConfig.thresholds, // Thresholds to determine the colors of the child blocks with.
            colors: userConfig.colors || RelationshipGraph.getColors(), // Colors to use for blocks.
            transitionTime: userConfig.transitionTime || 1500, // Time for a transition to start and complete.
            truncate: userConfig.truncate || 0, // Maximum length of a parent label. Use 0 to turn off truncation.
            sortFunction: userConfig.sortFunction || RelationshipGraph.sortJson, // A custom sort function
            valueKeyName: userConfig.valueKeyName // Set a custom key in the tooltip.
        };

        if (this.configuration.showTooltips === undefined) {
            this.configuration.showTooltips = true;
        }

        if (this.configuration.showKeys === undefined) {
            this.configuration.showKeys = true;
        }

        if (this.configuration.keyValueName === undefined) {
            this.configuration.keyValueName = 'value';
        }

        // If the threshold array is made up of numbers, make sure that it is sorted.
        if (this.configuration.thresholds.length > 0 && typeof this.configuration.thresholds[0] == 'number') {
            this.configuration.thresholds.sort();
        }

        /**
         * Used for measuring text widths.
         * @type {Element}
         */
        this.measurementDiv = document.createElement('div');
        this.measurementDiv.className = 'relationshipGraph-measurement';
        document.body.appendChild(this.measurementDiv);

        /**
         * Used for caching measurements.
         * @type {{}}
         */
        this.measuredCache = {};

        /**
         * Function to create the tooltip.
         *
         * @param {RelationshipGraph} self The RelationshipGraph instance.
         * @returns {d3.tooltip} the tip object.
         */
        var createTooltip = function createTooltip(self) {
            var hiddenKeys = ['ROW', 'INDEX', 'COLOR', 'PARENTCOLOR', 'PARENT', '_PRIVATE_'],
                showKeys = self.configuration.showKeys;

            return d3.tip().attr('class', 'relationshipGraph-tip').offset([-8, -10]).html(function (obj) {
                var keys = Object.keys(obj),
                    table = document.createElement('table'),
                    count = keys.length,
                    rows = [];

                // Loop through the keys in the object and only show values self are not in the hiddenKeys array.
                while (count--) {
                    var element = keys[count],
                        upperCaseKey = element.toUpperCase();

                    if (!RelationshipGraph.contains(hiddenKeys, upperCaseKey)) {
                        var row = document.createElement('tr'),
                            key = showKeys ? document.createElement('td') : null,
                            value = document.createElement('td');

                        if (showKeys) {
                            key.innerHTML = element.charAt(0).toUpperCase() + element.substring(1);
                            row.appendChild(key);
                        }

                        if (upperCaseKey == 'VALUE' && !self.configuration.valueKeyName) {
                            continue;
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

        if (this.configuration.showTooltips) {
            this.tooltip = createTooltip(this);
            this.tooltip.direction('n');
        } else {
            this.tooltip = null;
        }

        // Check if this selection already has a graph.
        this.svg = this.configuration.selection.select('svg').select('g');

        if (this.svg.empty()) {
            // Create the svg element that will contain the graph.
            this.svg = this.configuration.selection.append('svg').attr('width', '500').attr('height', '500').attr('style', 'display: block').append('g').attr('transform', 'translate(10, 0)');
        }

        this.graph = this;
    }

    /**
     * Generate the basic set of colors.
     *
     * @returns {string[]} List of HEX colors.
     */


    _createClass(RelationshipGraph, [{
        key: 'getPixelLength',


        /**
         * Returns the pixel length of the string based on the font size.
         *
         * @param {string} str The string to get the length of.
         * @returns {Number} The pixel length of the string.
         * @public
         */
        value: function getPixelLength(str) {
            if (RelationshipGraph.containsKey(this.measuredCache, str)) {
                return this.measuredCache[str];
            }

            var text = document.createTextNode(str);
            this.measurementDiv.appendChild(text);

            var width = this.measurementDiv.offsetWidth;
            this.measurementDiv.removeChild(text);

            this.measuredCache[str] = width;

            return width;
        }

        /**
         * Assign the index and row to each of the children in the Array of Objects.
         *
         * @param json {Array} The array of Objects to loop through.
         * @param parentSizes {Object} The parent sizes determined.
         * @param parents {Array} The parent label names.
         * @returns {Array} Object containing the longest width, the calculated max children per row, and the maximum amount
         *  of rows.
         */

    }, {
        key: 'assignIndexAndRow',
        value: function assignIndexAndRow(json, parentSizes, parents) {
            // Determine the longest parent name to calculate how far from the left the child blocks should start.
            var longest = '';
            var parentNames = Object.keys(parentSizes);
            var i = void 0;
            var index = 0;
            var row = 0;
            var previousParent = '';
            var parentLength = parents.length;
            var configuration = this.configuration;
            var blockSize = configuration.blockSize;


            for (i = 0; i < parentLength; i++) {
                var current = parents[i] + ' ( ' + parentSizes[parentNames[i]] + ') ';

                if (current.length > longest.length) {
                    longest = current;
                }
            }

            // Calculate the row and column for each child block.
            var longestWidth = this.getPixelLength(longest);
            var parentDiv = configuration.selection._groups[0][0];
            var calculatedMaxChildren = configuration.maxChildCount === 0 ? Math.floor((parentDiv.parentElement.clientWidth - blockSize - longestWidth) / blockSize) : configuration.maxChildCount;
            var jsonLength = json.length;
            var thresholds = configuration.thresholds;


            for (i = 0; i < jsonLength; i++) {
                var element = json[i];
                var parent = element.parent;


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
                    var value = void 0,
                        compare = void 0;

                    if (typeof thresholds[0] === 'string') {
                        value = element.value;
                        compare = RelationshipGraph.stringCompare;
                    } else {
                        var elementValue = element.value;

                        value = typeof elementValue == 'number' ? elementValue : parseFloat(elementValue.replace(/[^0-9-.]+/g, ''));

                        compare = RelationshipGraph.numericCompare;
                    }

                    var thresholdIndex = compare(value, thresholds);

                    element.color = thresholdIndex === -1 ? 0 : thresholdIndex;
                }
            }

            return [longestWidth, calculatedMaxChildren, row];
        }

        /**
         * Verify that the JSON passed in is correct.
         *
         * @param json {Array} The array of JSON objects to verify.
         */

    }, {
        key: 'createParents',


        /**
         * Creates the parent labels.
         *
         * @param {d3.selection} parentNodes The parentNodes.
         * @param {Object} parentSizes The child count for each parent.
         * @param {number} longestWidth The longest width of a parent node.
         * @param {number} calculatedMaxChildren The maxiumum amount of children nodes per row.
         * @private
         */
        value: function createParents(parentNodes, parentSizes, longestWidth, calculatedMaxChildren) {
            var parentSizesKeys = Object.keys(parentSizes),
                _this = this;

            parentNodes.enter().append('text').text(function (obj, index) {
                return obj + ' (' + parentSizes[parentSizesKeys[index]] + ')';
            }).attr('x', function (obj, index) {
                var width = _this.getPixelLength(obj + ' (' + parentSizes[parentSizesKeys[index]] + ')');
                return longestWidth - width;
            }).attr('y', function (obj, index) {
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
                    previousParentSize += Math.ceil(parentSizes[parentSizesKeys[i]] / calculatedMaxChildren) * calculatedMaxChildren;
                    i--;
                }

                return Math.ceil(previousParentSize / calculatedMaxChildren) * _this.configuration.blockSize;
            }).style('text-anchor', 'start').style('fill', function (obj) {
                return obj.parentColor !== undefined ? _this.configuration.colors[obj.parentColor] : '#000000';
            }).style('cursor', this.parentPointer ? 'pointer' : 'default').attr('class', 'relationshipGraph-Text').attr('transform', 'translate(-6, ' + _this.configuration.blockSize / 1.5 + ')').on('click', function (obj) {
                _this.configuration.onClick.parent(obj);
            });
        }

        /**
         * Updates the existing parent nodes with new data.
         *
         * @param {d3.selection} parentNodes The parentNodes.
         * @param {Object} parentSizes The child count for each parent.
         * @param {number} longestWidth The longest width of a parent node.
         * @param {number} calculatedMaxChildren The maxiumum amount of children nodes per row.
         * @private
         */

    }, {
        key: 'updateParents',
        value: function updateParents(parentNodes, parentSizes, longestWidth, calculatedMaxChildren) {
            var parentSizesKeys = Object.keys(parentSizes),
                _this = this;

            // noinspection JSUnresolvedFunction
            parentNodes.text(function (obj, index) {
                return obj + ' (' + parentSizes[parentSizesKeys[index]] + ')';
            }).attr('x', function (obj, index) {
                var width = _this.getPixelLength(obj + ' (' + parentSizes[parentSizesKeys[index]] + ')');
                return longestWidth - width;
            }).attr('y', function (obj, index) {
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
                    previousParentSize += Math.ceil(parentSizes[parentSizesKeys[i]] / calculatedMaxChildren) * calculatedMaxChildren;
                    i--;
                }

                return Math.ceil(previousParentSize / calculatedMaxChildren) * _this.configuration.blockSize;
            }).style('fill', function (obj) {
                return obj.parentColor !== undefined ? _this.configuration.colors[obj.parentColor] : '#000000';
            }).style('cursor', _this.parentPointer ? 'pointer' : 'default');
        }

        /**
         * Creates new children nodes.
         *
         * @param {d3.selection} childrenNodes The children nodes.
         * @param {number} longestWidth The longest width of a parent node.
         * @private
         */

    }, {
        key: 'createChildren',
        value: function createChildren(childrenNodes, longestWidth) {
            var _this = this;

            childrenNodes.enter().append('rect').attr('x', function (obj) {
                return longestWidth + (obj.index - 1) * _this.configuration.blockSize + 5;
            }).attr('y', function (obj) {
                return (obj.row - 1) * _this.configuration.blockSize;
            }).attr('rx', 4).attr('ry', 4).attr('class', 'relationshipGraph-block').attr('width', _this.configuration.blockSize).attr('height', _this.configuration.blockSize).style('fill', function (obj) {
                return _this.configuration.colors[obj.color % _this.configuration.colors.length] || _this.configuration.colors[0];
            }).style('cursor', _this.childPointer ? 'pointer' : 'default').on('mouseover', _this.tooltip ? _this.tooltip.show : RelationshipGraph.noop).on('mouseout', _this.tooltip ? _this.tooltip.hide : RelationshipGraph.noop).on('click', function (obj) {
                _this.tooltip.hide();
                _this.configuration.onClick.child(obj);
            });
        }

        /**
         * Updates the existing children nodes with new data.
         *
         * @param {d3.selection} childrenNodes The children nodes.
         * @param {number} longestWidth The longest width of a parent node.
         * @private
         */

    }, {
        key: 'updateChildren',
        value: function updateChildren(childrenNodes, longestWidth) {
            var blockSize = this.configuration.blockSize;
            var colors = this.configuration.colors;
            var colorsLength = colors.length;

            // noinspection JSUnresolvedFunction
            childrenNodes.transition(this.configuration.transitionTime).attr('x', function (obj) {
                return longestWidth + (obj.index - 1) * blockSize + 5;
            }).attr('y', function (obj) {
                return (obj.row - 1) * blockSize;
            }).style('fill', function (obj) {
                return colors[obj.color % colorsLength] || colors[0];
            });
        }

        /**
         * Removes nodes that no longer exist.
         *
         * @param {d3.selection} nodes The nodes.
         * @private
         */

    }, {
        key: 'removeNodes',
        value: function removeNodes(nodes) {
            // noinspection JSUnresolvedFunction
            nodes.exit().transition(this.configuration.transitionTime).remove();
        }

        /**
         * Generate the graph.
         *
         * @param {Array} json The array of JSON to feed to the graph.
         * @return {RelationshipGraph} The RelationshipGraph object to keep d3's chaining functionality.
         * @public
         */

    }, {
        key: 'data',
        value: function data(json) {
            if (RelationshipGraph.verifyJson(json)) {
                var parents = [];
                var parentSizes = {};
                var configuration = this.configuration;


                var row = 0,
                    parent = void 0,
                    i = void 0,
                    maxWidth = void 0,
                    maxHeight = void 0,
                    calculatedMaxChildren = 0,
                    longestWidth = 0;

                // Ensure that the JSON is sorted by parent.
                configuration.sortFunction(json);

                /**
                 * Loop through all of the childrenNodes in the JSON array and determine the amount of childrenNodes per
                 * parent. This will also calculate the row and index for each block and truncate the parent names to 25
                 * characters.
                 */
                var jsonLength = json.length;

                for (i = 0; i < jsonLength; i++) {
                    parent = json[i].parent;

                    if (RelationshipGraph.containsKey(parentSizes, parent)) {
                        parentSizes[parent]++;
                    } else {
                        parentSizes[parent] = 1;
                        parents.push(RelationshipGraph.truncate(parent, configuration.truncate));
                    }
                }

                /**
                 * Assign the indexes and rows to each child. This method also calculates the maximum amount of children
                 * per row, the longest row width, and how many rows there are.
                 */


                // Set the max width and height.

                var _assignIndexAndRow = this.assignIndexAndRow(json, parentSizes, parents);

                var _assignIndexAndRow2 = _slicedToArray(_assignIndexAndRow, 3);

                longestWidth = _assignIndexAndRow2[0];
                calculatedMaxChildren = _assignIndexAndRow2[1];
                row = _assignIndexAndRow2[2];
                maxHeight = row * configuration.blockSize;
                maxWidth = longestWidth + calculatedMaxChildren * configuration.blockSize;

                // Select all of the parent nodes.
                var parentNodes = this.svg.selectAll('.relationshipGraph-Text').data(parents);

                // Add new parent nodes.
                this.createParents(parentNodes, parentSizes, longestWidth, calculatedMaxChildren);

                // Update existing parent nodes.
                this.updateParents(parentNodes, parentSizes, longestWidth, calculatedMaxChildren);

                // Remove deleted parent nodes.
                this.removeNodes(parentNodes);

                // Select all of the children nodes.
                var childrenNodes = this.svg.selectAll('.relationshipGraph-block').data(json);

                // Add new child nodes.
                this.createChildren(childrenNodes, longestWidth);

                // Update existing child nodes.
                this.updateChildren(childrenNodes, longestWidth);

                // Delete removed child nodes.
                this.removeNodes(childrenNodes);

                if (this.configuration.showTooltips) {
                    d3.select('.d3-tip').remove();
                    this.svg.call(this.tooltip);
                }

                this.configuration.selection.select('svg').attr('width', Math.abs(maxWidth + 15)).attr('height', Math.abs(maxHeight + 15));
            }

            return this;
        }
    }], [{
        key: 'getColors',
        value: function getColors() {
            return ['#c4f1be', '#a2c3a4', '#869d96', '#525b76', '#201e50', '#485447', '#5b7f77', '#6474ad', '#b9c6cb', '#c0d6c1', '#754668', '#587d71', '#4daa57', '#b5dda4', '#f9eccc', '#0e7c7b', '#17bebb', '#d4f4dd', '#d62246', '#4b1d3f', '#cf4799', '#c42583', '#731451', '#f3d1bf', '#c77745'];
        }

        /**
         * Checks if the object contains the key.
         *
         * @param {object} obj The object to check in.
         * @param {string} key They key to check for.
         * @returns {boolean} Whether or not the object contains the key.
         */

    }, {
        key: 'containsKey',
        value: function containsKey(obj, key) {
            return Object.keys(obj).indexOf(key) > -1;
        }

        /**
         * Checks whether or not the key is in the array.
         *
         * @param {*[]} arr The array to check in.
         * @param {string} key The key to check for.
         * @returns {boolean} Whether or not the key exists in the array.
         */

    }, {
        key: 'contains',
        value: function contains(arr, key) {
            return arr.indexOf(key) > -1;
        }

        /**
         * Truncate a string to 25 characters plus an ellipses.
         *
         * @param {string} str The string to truncate.
         * @param {number} cap The number to cap the string at before it gets truncated.
         * @returns {string} The string truncated (if necessary).
         */

    }, {
        key: 'truncate',
        value: function truncate(str, cap) {
            if (!cap || !str) {
                return str;
            }

            return str.length > cap ? str.substring(0, cap) + '...' : str;
        }

        /**
         * Determines if the array passed in is an Array object.
         *
         * @param arr {Array} The array object to check.
         * @returns {boolean} Whether or not the array is actually an array object.
         */

    }, {
        key: 'isArray',
        value: function isArray(arr) {
            return Object.prototype.toString.call(arr) == '[object Array]';
        }

        /**
         * Noop function.
         */

    }, {
        key: 'noop',
        value: function noop() {}

        /**
         * Returns a sorted Array.
         *
         * @param json {Array} The Array to be sorted.
         */

    }, {
        key: 'sortJson',
        value: function sortJson(json) {
            json.sort(function (child1, child2) {
                var parent1 = child1.parent.toLowerCase(),
                    parent2 = child2.parent.toLowerCase();

                return parent1 > parent2 ? 1 : parent1 < parent2 ? -1 : 0;
            });
        }

        /**
         * Go through all of the thresholds and find the one that is equal to the value.
         *
         * @param {String} value The value from the JSON.
         * @param {Array} thresholds The thresholds from the JSON.
         * @returns {number} The index of the threshold that is equal to the value or -1 if the value doesn't equal any
         *  thresholds.
         * @private
         */

    }, {
        key: 'stringCompare',
        value: function stringCompare(value, thresholds) {
            if (typeof value !== 'string') {
                throw 'Cannot make value comparison between a string and a ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + '.';
            }

            var thresholdsLength = thresholds.length;

            for (var i = 0; i < thresholdsLength; i++) {
                if (value == thresholds[i]) {
                    return i;
                }
            }

            return -1;
        }

        /**
         * Go through all of the thresholds and find the smallest number that is greater than the value.
         *
         * @param {number} value The value from the JSON.
         * @param {Array} thresholds The thresholds from the JSON.
         * @returns {number} The index of the threshold that is the smallest number that is greater than the value or -1 if
         *  the value isn't between any thresholds.
         * @private
         */

    }, {
        key: 'numericCompare',
        value: function numericCompare(value, thresholds) {
            if (typeof value !== 'number') {
                throw 'Cannot make value comparison between a number and a ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + '.';
            }

            var length = thresholds.length;

            for (var i = 0; i < length; i++) {
                if (value <= thresholds[i]) {
                    return i;
                }
            }

            return -1;
        }
    }, {
        key: 'verifyJson',
        value: function verifyJson(json) {
            if (!RelationshipGraph.isArray(json) || json.length < 0 || _typeof(json[0]) !== 'object') {
                throw 'JSON has to be an Array of JavaScript objects that is not empty.';
            }

            var length = json.length;

            while (length--) {
                var element = json[length];
                var keys = Object.keys(element);
                var keyLength = keys.length;
                var parentColor = element.parentColor;


                if (element.parent === undefined) {
                    throw 'Child does not have a parent.';
                } else if (parentColor !== undefined && (parentColor > 4 || parentColor < 0)) {
                    throw 'Parent color is unsupported.';
                }

                while (keyLength--) {
                    if (keys[keyLength].toUpperCase() == 'VALUE') {
                        if (keys[keyLength] != 'value') {
                            json[length].value = json[length][keys[keyLength]];
                            delete json[length][keys[keyLength]];
                        }
                        break;
                    }
                }
            }

            return true;
        }
    }]);

    return RelationshipGraph;
}();

/**
 * Add a relationshipGraph function to d3 that returns a RelationshipGraph object.
 */


d3.relationshipGraph = function () {
    'use strict';

    return RelationshipGraph.extend.apply(RelationshipGraph, arguments);
};

/**
 * Add relationshipGraph to selection.
 *
 * @param {Object} userConfig Configuration for graph.
 * @return {Object} Returns a new RelationshipGraph object.
 */
d3.selection.prototype.relationshipGraph = function (userConfig) {
    'use strict';

    return new RelationshipGraph(this, userConfig);
};
