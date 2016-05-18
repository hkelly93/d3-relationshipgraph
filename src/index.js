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
 *
 * d3.relationshipgraph - 1.3.0
 */

(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define('d3.relationshipGraph', ['d3'], factory);
    } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory(require('d3'));
    } else if (typeof exports === 'object') {
        exports.d3.relationshipGraph = factory(require('d3'));
    } else {
        root.d3.relationshipGraph = factory(root.d3);
    }
})(this, function (d3) {
    'use strict';

    /**
     * Checks if the object contains the key.
     * @param obj {object} The object to check in.
     * @param key {string} They key to check for.
     * @returns {boolean}
     */
    var containsKey = function (obj, key) {
        return Object.keys(obj).indexOf(key) > -1;
    };

    /**
     * Checks whether or not the key is in the array.
     * @param obj {object} The object to check in.
     * @param key {string} The key to check for.
     * @returns {boolean}
     */
    var contains = function (obj, key) {
        return obj.indexOf(key) > -1;
    };

    /**
     * Truncate a string to 25 characters plus an ellipses.
     * @param {string} str The string to truncate.
     * @param cap {number} The number to cap the string at before it gets truncated.
     * @returns {string}
     */
    var truncate = function (str, cap) {
        if (cap === 0) {
            return str;
        }

        return (str.length >= cap) ? str.substring(0, cap) + '...' : str;
    };

    /**
     * Noop function.
     */
    var noop = function () {
    };

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

    /**
     * Add relationshipGraph to d3.selection.enter
     * @returns {RelationshipGraph} RelationshipGraph object.
     */
    d3.selection.enter.prototype.relationshipGraph = function () {
        return this.graph;
    };

    /**
     *
     * @param selection {d3.selection} The ID of the element containing the graph.
     * @param userConfig {Object} Configuration for graph.
     * @constructor
     */
    var RelationshipGraph = function (selection, userConfig) {
        // Verify that the user config contains the thresholds.
        if (userConfig.thresholds === undefined || typeof userConfig.thresholds !== 'object') {
            throw 'Thresholds must be an Object.';
        }

        /**
         * Contains the configuration for the graph.
         * @type {{blockSize: number, maxWidth: number, maxHeight: number, selection: d3.selection, showTooltips: (*|boolean),
         * maxChildCount: (*|number), onClick: (*|noop), showKeys: (*|boolean), thresholds: (*|Array), colors: (*|Array|string[]),
         * transitionTime: (*|number)}}
         */
        this.config = {
            blockSize: 24,  // The block size for each child.
            selection: selection,  // The ID for the graph.
            showTooltips: userConfig.showTooltips || true,  // Whether or not to show the tooltips on hover.
            maxChildCount: userConfig.maxChildCount || 0,  // The maximum amount of children to show per row before wrapping.
            onClick: userConfig.onClick || noop,  // The callback function to call when a child is clicked. This function gets passed the JSON for the child.
            showKeys: userConfig.showKeys || true,  // Whether or not to show the keys in the tooltip.
            thresholds: userConfig.thresholds,  // Thresholds to determine the colors of the child blocks with.
            colors: userConfig.colors || ['#c4f1be', '#a2c3a4', '#869d96', '#525b76', '#201e50',
                '#485447', '#5b7f77', '#6474ad', '#b9c6cb', '#c0d6c1',
                '#754668', '#587d71', '#4daa57', '#b5dda4', '#f9eccc',
                '#0e7c7b', '#17bebb', '#d4f4dd', '#d62246', '#4b1d3f',
                '#cf4799', '#c42583', '#731451', '#f3d1bf', '#c77745'
            ],  // Colors to use for blocks.
            transitionTime: userConfig.transitionTime || 1500,  // Time for a transition to start and complete (in milliseconds).
            truncate: userConfig.truncate || 25  // Maximum length of a parent label before it gets truncated. Use 0 to turn off truncation.
        };

        // Create a canvas to measure the pixel width of the parent labels.
        this.ctx = document.createElement('canvas').getContext('2d');
        this.ctx.font = '10pt Helvetica';

        /**
         * Function to create the tooltip.
         * @returns {d3.tip} the tip object.
         */
        var createTooltip = function (self) {
            var hiddenKeys = ['ROW', 'INDEX', 'COLOR', 'PARENTCOLOR', 'PARENT'],
                showKeys = self.config.showKeys;

            return d3.tip().attr('class', 'relationshipGraph-tip')
                .offset([-8, -10])
                .html(function (obj) {
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
                                key.innerHTML = element.charAt(0).toUpperCase() + element.substring(1);
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

                    self.tip.direction('n');
                    return table.outerHTML;
                });
        };

        if (this.config.showTooltips) {
            this.tip = createTooltip(this);
        }
        else {
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
     * Verify that the JSON passed in is correct.
     * @param json {Array} The array of JSON objects to verify.
     */
    RelationshipGraph.prototype.verifyJson = function (json) {
        if (json === undefined || typeof JSON !== 'object' || json.length === 0) {
            throw 'JSON has to be a JavaScript object that is not empty.';
        }

        var length = json.length;

        while (length--) {
            var element = json[length],
                keys = Object.keys(element),
                keyLength = keys.length;

            if (element.parent === undefined) {
                throw 'Child does not have a parent.';
            }
            else if (element.parentColor !== undefined && (element.parentColor > 4 || element.parentColor < 0)) {
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
    };

    /**
     * Generate the graph
     * @param json {Array} The array of JSON to feed to the graph.
     * @return {RelationshipGraph} The RelationshipGraph object to keep d3's chaining functionality.
     */
    RelationshipGraph.prototype.data = function (json) {
        if (this.verifyJson(json)) {
            var row = 1,
                index = 1,
                previousParent = null,
                parents = [],
                parentSizes = {},
                previousParentSizes = 0,
                that = this,
                parent,
                i,
                maxWidth,
                maxHeight;

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

            // Loop through all of the childrenNodes in the JSON array and determine the amount of childrenNodes per parent. This will also
            // calculate the row and index for each block and truncate the parent names to 25 characters.
            for (i = 0; i < json.length; i++) {
                parent = json[i].parent;

                if (containsKey(parentSizes, parent)) {
                    parentSizes[parent]++;
                } else {
                    parentSizes[parent] = 1;
                    parents.push(truncate(parent, this.config.truncate));
                }
            }

            // Determine the longest parent name to calculate how far from the left the child blocks should start.
            var longest = '',
                parentNames = Object.keys(parentSizes);

            for (i = 0; i < parents.length; i++) {
                var current = parents[i] + ' ( ' + parentSizes[parentNames[i]] + ') ';

                if (current.length > longest.length) {
                    longest = current;
                }
            }

            // Calculate the row and column for each child block.
            var longestWidth = this.ctx.measureText(longest).width,
                parentDiv = this.config.selection[0][0],
                calculatedMaxChildren = (this.config.maxChildCount === 0) ?
                    Math.floor((parentDiv.parentElement.clientWidth - 15 - longestWidth) / this.config.blockSize) :
                    this.config.maxChildCount;

            for (i = 0; i < json.length; i++) {
                var element = json[i];
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

                // Figure out the color based on the threshold.
                var value,
                    compare;

                if (typeof that.config.thresholds[0] === 'string') {
                    value = element.value;
                    compare = function (value, threshold) {
                        return value == threshold;
                    };
                } else {
                    value = parseInt(element.value.replace(/\D/g, ''));
                    compare = function (value, threshold) {
                        return value < threshold;
                    };
                }

                for (var thresholdIndex = 0; thresholdIndex < that.config.thresholds.length; thresholdIndex++) {
                    if (compare(value, that.config.thresholds[thresholdIndex])) {
                        element.color = thresholdIndex;
                        break;
                    }
                }
            }

            // Set the max width and height.
            maxHeight = row * this.config.blockSize;
            maxWidth = longestWidth + (calculatedMaxChildren * this.config.blockSize);

            // Select all of the parent nodes.
            var parentNodes = this.svg.selectAll('.relationshipGraph-Text')
                .data(parents);

            // Add new parent nodes.
            parentNodes.enter().append('text')
                .text(function (obj, index) {
                    return obj + ' (' + parentSizes[Object.keys(parentSizes)[index]] + ')';
                })
                .attr('x', 0)
                .attr('y', function (obj, index) {
                    if (index === 0) {
                        return 0;
                    }

                    // Determine the Y coordinate by determining the Y coordinate of all of the parents before.
                    var y = Math.ceil(previousParentSizes / calculatedMaxChildren) * that.config.blockSize;
                    previousParentSizes += y;

                    return y;
                })
                .style('text-anchor', 'start')
                .style('fill', function (obj) {
                    return (obj.parentColor !== undefined) ? that.config.colors[obj.parentColor] : '#000000';
                })
                .attr('class', 'relationshipGraph-Text')
                .attr('transform', 'translate(-6, ' + this.config.blockSize / 1.5 + ')');

            // Update existing parent nodes.
            parentNodes
                .text(function (obj, index) {
                    return obj + ' (' + parentSizes[Object.keys(parentSizes)[index]] + ')';
                })
                .attr('y', function (obj, index) {
                    if (index === 0) {
                        return 0;
                    }

                    // Determine the Y coordinate by determining the Y coordinate of all of the parents before. This has to be calculated completely
                    // because it is an update and can occur anywhere.
                    var previousParentSize = 0,
                        i = index - 1;

                    while (i > -1) {
                        previousParentSize += Math.ceil(parentSizes[Object.keys(parentSizes)[i]] / calculatedMaxChildren) * calculatedMaxChildren;
                        i--;
                    }

                    return Math.ceil(previousParentSize / calculatedMaxChildren) * that.config.blockSize;
                })
                .style('fill', function (obj) {
                    return (obj.parentColor !== undefined) ? that.config.colors[obj.parentColor] : '#000000';
                });

            // Remove deleted parent nodes.
            parentNodes.exit().remove();

            // Select all of the children nodes.
            var childrenNodes = this.svg.selectAll('.relationshipGraph-block')
                .data(json);

            // Add new child nodes.
            childrenNodes.enter()
                .append('rect')
                .attr('x', function (obj) {
                    return longestWidth + ((obj.index - 1) * that.config.blockSize);
                })
                .attr('y', function (obj) {
                    return (obj.row - 1) * that.config.blockSize;
                })
                .attr('rx', 4)
                .attr('ry', 4)
                .attr('class', 'relationshipGraph-block')
                .attr('width', that.config.blockSize)
                .attr('height', that.config.blockSize)
                .style('fill', function (obj) {
                    return that.config.colors[obj.color % that.config.colors.length] || that.config.colors[0];
                })
                .on('mouseover', that.tip ? that.tip.show : noop)
                .on('mouseout', that.tip ? that.tip.hide : noop)
                .on('click', function (obj) {
                    that.tip.hide();
                    that.config.onClick(obj);
                });

            // Update existing child nodes.
            childrenNodes.transition(that.config.transitionTime)
                .attr('x', function (obj) {
                    return longestWidth + ((obj.index - 1) * that.config.blockSize);
                })
                .attr('y', function (obj) {
                    return (obj.row - 1) * that.config.blockSize;
                })
                .style('fill', function (obj) {
                    return that.config.colors[obj.color % that.config.colors.length] || that.config.colors[0];
                });

            // Delete removed child nodes.
            childrenNodes.exit().transition(that.config.transitionTime).remove();

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
