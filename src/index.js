/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Harrison Kelly
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
 */

// TODO: Add ability to pass in colors.
(function () {
    'use strict';

    /**
     * Add a relationshipGraph function to d3 that returns a RelationshipGraph object.
     */
    d3.relationshipGraph = function () {
        return RelationshipGraph.extend.apply(RelationshipGraph, arguments);
    };

    /**
     * Add relationshipGraph to d3.selection.
     * @param userConfig {Object} Configuration for graph.
     */
    d3.selection.prototype.relationshipGraph = function (userConfig) {
        return new RelationshipGraph(this, userConfig);
    };

    d3.selection.enter.prototype.relationshipGraph = function () {
        return this.graph;
    };

})();


var RelationshipGraph = (function () {
    'use strict';

    /**
     * Checks if the object contains the key.
     * @param key {string} They key to check for.
     * @returns {boolean}
     */
    Object.prototype.containsKey = function (key) {
        return Object.keys(this).indexOf(key) > -1;
    };

    /**
     * Checks whether or not the key is in the array.
     * @param key
     * @returns {boolean}
     */
    Array.prototype.contains = function (key) {
        return this.indexOf(key) > -1;
    };

    /**
     * Abbreviate a string to 25 characters plus an ellipses.
     * @returns {string}
     */
    String.prototype.abbreviate = function () {
        return (this.length >= 25) ? this.substring(0, 25) + '...' : this;
    };

    /**
     * Noop function.
     */
    var noop = function () {
    };

    /**
     *
     * @param selection {d3.selection} The ID of the element containing the graph.
     * @param userConfig {Object} Configuration for graph.
     * @constructor
     */
    function RelationshipGraph(selection, userConfig) {
        // Verify that the user config contains the thresholds.
        if (userConfig.thresholds === undefined || typeof userConfig.thresholds != 'object') {
            throw "Thresholds must be an Object.";
        }

        /**
         * Contains the configuration for the graph.
         * @type {{blockSize: number, selection: d3.selection, showTooltips: (*|boolean), maxChildCount: (*|number),
         *          onClick: (*|noop), showKeys: (*|boolean), thresholds: (*|Array), colors: (*|Array)}}
         */
        this.config = {
            blockSize: 24,  // The block size for each child.
            selection: selection,  // The ID for the graph.
            showTooltips: userConfig.showTooltips || true,  // Whether or not to show the tooltips on hover.
            maxChildCount: userConfig.maxChildCount || 0,  // The maximum amount of children to show per row before wrapping.
            onClick: userConfig.onClick || noop,  // The callback function to call when a child is clicked. This function gets passed the JSON for the child.
            showKeys: userConfig.showKeys || true,  // Whether or not to show the keys in the tooltip.
            thresholds: userConfig.thresholds,  // Thresholds to determine the colors of the child blocks with.
            colors: userConfig.colors  // Colors to use for blocks.
        };

        /**
         * The allowed directions for the tooltip.
         * @type {string[]}
         */
        this.allowedDirections = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

        // Create a canvas to measure the pixel width of the parent labels.
        this.ctx = document.createElement('canvas').getContext('2d');
        this.ctx.font = '100% Helvetica';

        /**
         * Function to create the tooltip.
         * @param {RelationshipGraph} that The RelationshipGraph instance to allow this function to be private.
         * @returns {d3.tip} the tip object.
         */
        var createTooltip = function (that) {
            var self = that;

            return d3.tip().attr('class', 'relationshipGraph-tip')
                .offset([-8, -10])
                .html(function (obj) {
                    var keys = Object.keys(obj),
                        table = document.createElement('table'),
                        hiddenKeys = ['ROW', 'INDEX', 'COLOR', 'PARENTCOLOR', 'PARENT'];

                    // Loop through the keys in the object and only show values self are not in the hiddenKeys array.
                    keys.forEach(function (element) {
                        var upperCaseKey = element.toUpperCase();

                        if (!hiddenKeys.contains(upperCaseKey)) {
                            var row = document.createElement('tr'),
                                key = self.graph.config.showKeys ? document.createElement('td') : null,
                                value = document.createElement('td');

                            if (self.graph.config.showKeys) {
                                key.innerHTML = element.charAt(0).toUpperCase() + element.substring(1);
                                row.appendChild(key);
                            }

                            value.innerHTML = obj[element];

                            value.style.fontWeight = 'normal';

                            row.appendChild(value);
                            table.appendChild(row);
                        }
                    });

                    return table.outerHTML;
                });
        };

        if (this.config.showTooltips) {
            this.tip = createTooltip(this);
            this.setTooltipPlacement('w');
        }
        else {
            this.tip = null;
        }

        // Create the svg element that will contain the graph.
        this.svg = this.config.selection
            .append('svg')
            .attr('width', '500')
            .attr('height', '500')
            .attr('style', 'display: block')
            .append('g')
            .attr('transform', 'translate(10, 0)');

        this.graph = this;
    }

    /**
     * Change the placement of the tooltip with respect to the child block.
     * @param position {string} The placement of the tooltip with respect to the child block. Available placements are: n, ne, e, se, s, sw, w, nw.
     */
    RelationshipGraph.prototype.setTooltipPlacement = function (position) {
        if (this.allowedDirections.contains(position) && this.tip !== undefined) {
            this.tip.direction(position);
        }
    };

    /**
     * Verify that the JSON passed in is correct.
     * @param json {Array} The array of JSON objects to verify.
     */
    RelationshipGraph.prototype.verifyJson = function (json) {
        if (json === undefined || json.length === 0) {
            throw 'JSON cannot be empty.';
        }

        json.forEach(function (element) {
            if (element.parent === undefined) {
                throw 'Child does not have a parent.';
            }
            else if (element.parentColor === undefined || element.parentColor > 4 || element.parentColor < 0) {
                throw 'Parent color is unsupported.';
            }
        });

        return true;
    };

    /**
     * Generate the graph
     * @param json {Array} The array of JSON to feed to the graph.
     */
    RelationshipGraph.prototype.data = function (json) {
        if (this.verifyJson(json)) {
            var row = 1,
                index = 1,
                previousParent = null,
                parents = [],
                parentSizes = {},
                colors = this.config.colors || ['#c4f1be', '#a2c3a4', '#869d96', '#525b76', '#201e50',
                        '#485447', '#5b7f77', '#6474ad', '#b9c6cb', '#c0d6c1',
                        '#754668', '#587d71', '#4daa57', '#b5dda4', '#f9eccc',
                        '#0e7c7b', '#17bebb', '#d4f4dd', '#d62246', '#4b1d3f',
                        '#cf4799', '#c42583', '#731451', '#f3d1bf', '#c77745'
                    ],
                maxWidth = 0,
                maxHeight = 0,
                that = this;

            // Ensure that the JSON is sorted by parent.
            json.sort(function (child1, child2) {
                if (child1.parent < child2.parent) {
                    return -1;
                } else if (child1.parent > child2.parent) {
                    return 1;
                } else {
                    return 0;
                }
            });

            // Loop through all of the children in the JSON array and determine the amount of children per parent. This will also
            // calculate the row and index for each block and truncate the parent names to 25 characters.
            json.forEach(function (element) {
                var parent = element.parent;

                if (parentSizes.containsKey(parent)) {
                    parentSizes[parent]++;
                } else {
                    parentSizes[parent] = 1;
                    parents.push(parent.abbreviate());
                }
            });

            // Determine the longest parent name to calculate how far from the left the child blocks should start.
            var longest = '';

            parents.forEach(function (element, index) {
                var current = element + '   (' + parentSizes[Object.keys(parentSizes)[index]] + ')   ';

                if (current.length > longest.length) {
                    longest = current;
                }
            });

            // Calculate the row and column for each child block.
            var parentDiv = this.config.selection[0][0],
                calculatedMaxChildren = (this.config.maxChildCount === 0) ?
                    Math.floor((parentDiv.parentElement.clientWidth - 75) / this.config.blockSize) :
                    this.config.maxChildCount;

            json.forEach(function (element) {
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

                // Figure out the color based on the threshold.
                var value;

                for (var thresholdIndex = 0; thresholdIndex < that.config.thresholds.length; thresholdIndex++) {
                    if (typeof that.config.thresholds[0] === String) {
                        value = element.value;

                        if (value == that.config.thresholds[thresholdIndex]) {
                            element.color = thresholdIndex;
                            break;
                        }
                    } else {
                        value = element.value.replace(/\D/g, '');

                        if (value < that.config.thresholds[thresholdIndex]) {
                            element.color = thresholdIndex;
                            break;
                        }
                    }
                }
            });

            this.svg.selectAll('.row')
                .data(parents)
                .enter().append('text')
                .text(function (obj, index) {
                    return obj + ' (' + parentSizes[Object.keys(parentSizes)[index]] + ')';
                })
                .attr('x', 0)
                .attr('y', function (obj, index) {
                    if (index === 0) {
                        return 0;
                    }

                    // Determine the Y coordinate by determining the Y coordinate of all of the parents before.
                    var previousParentSize = 0;

                    for (var i = index - 1; i > -1; i--) {
                        previousParentSize += Math.ceil(parentSizes[Object.keys(parentSizes)[i]] / calculatedMaxChildren) * calculatedMaxChildren;
                    }

                    var y = Math.ceil(previousParentSize / calculatedMaxChildren) * that.config.blockSize;

                    maxHeight = (y > maxHeight) ? y : maxHeight;

                    return y;
                })
                .style('text-anchor', 'start')
                .style('fill', function (obj) {
                    return '#000000'; //colors[obj.parentColor] || colors[4];
                })
                .attr('class', 'relationshipGraph-Text')
                .attr('transform', 'translate(-6, ' + this.config.blockSize / 1.5 + ')');

            var width = this.ctx.measureText(longest + '    ').width;

            var children = this.svg.selectAll('.child')
                .data(json);

            children.enter().append('rect')
                .attr('x', function (obj) {
                    var x = width + ((obj.index - 1) * that.config.blockSize) + 25;
                    maxWidth += ((x + that.config.blockSize) > maxWidth) ? (x + that.config.blockSize) : 0;
                    return x;
                })
                .attr('y', function (obj) {
                    var y = (obj.row - 1) * that.config.blockSize;
                    maxHeight += ((y + that.config.blockSize) > maxHeight) ? (y + that.config.blockSize) : 0;
                    return y;
                })
                .attr('rx', 4)
                .attr('ry', 4)
                .attr('class', 'relationshipGraph-block')
                .attr('width', that.config.blockSize)
                .attr('height', that.config.blockSize)
                .style('fill', function (obj) {
                    return colors[obj.color % colors.length] || colors[0];
                })
                .on('mouseover', that.tip ? that.tip.show : noop)
                .on('mouseout', that.tip ? that.tip.hide : noop)
                .on('click', function (obj) {
                    that.tip.hide();
                    that.config.onClick(obj);
                });

            children.exit().remove();

            if (this.config.showTooltips) {
                d3.select('.d3-tip').remove();
                this.svg.call(this.tip);
            }

            var parentNode = this.svg[0][0].parentNode;

            // Resize the SVG to fit the graph
            parentNode.setAttribute('width', maxWidth + 15);
            parentNode.setAttribute('height', maxHeight + 15);
        }
    };

    return RelationshipGraph;
})();
