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

class RelationshipGraph {

    /**
     *
     * @param {d3.selection} selection The ID of the element containing the graph.
     * @param {Object} userConfig Configuration for graph.
     * @constructor
     */
    constructor(selection, userConfig = {showTooltips: true, maxChildCount: 0, thresholds: []}) {
        // Verify that the user config contains the thresholds.
        if (!userConfig.thresholds) {
            userConfig.thresholds = [];
        } else if (typeof userConfig.thresholds !== 'object') {
            throw 'Thresholds must be an Object.';
        }

        if (userConfig.onClick !== undefined) {
            this.parentPointer = userConfig.onClick.parent !== undefined;
            this.childPointer = userConfig.onClick.child !== undefined;
        } else {
            this.parentPointer = false;
            this.childPointer = false;
        }

        const defaultOnClick = {parent: RelationshipGraph.noop, child: RelationshipGraph.noop};

        /**
         * Contains the configuration for the graph.
         *
         * @type {{blockSize: number, selection: d3.selection, showTooltips: boolean, maxChildCount: number,
         * onClick: (RelationshipGraph.noop|*), showKeys: (*|boolean), thresholds: Array,
         * colors: (*|Array|boolean|string[]), transitionTime: (*|number),
         * truncate: (RelationshipGraph.truncate|*|number)}}
         */
        this.configuration = {
            blockSize: 24,  // The block size for each child.
            selection,  // The ID for the graph.
            showTooltips: userConfig.showTooltips,  // Whether or not to show the tooltips on hover.
            maxChildCount: userConfig.maxChildCount || 0,  // The maximum amount of children to show per row.
            onClick: userConfig.onClick || defaultOnClick,  // The callback function to call.
            showKeys: userConfig.showKeys,  // Whether or not to show the keys in the tooltip.
            thresholds: userConfig.thresholds,  // Thresholds to determine the colors of the child blocks with.
            colors: userConfig.colors || RelationshipGraph.getColors(),  // Colors to use for blocks.
            transitionTime: userConfig.transitionTime || 1500,  // Time for a transition to start and complete.
            truncate: userConfig.truncate || 0,  // Maximum length of a parent label. Use 0 to turn off truncation.
            sortFunction: userConfig.sortFunction || RelationshipGraph.sortJson,  // A custom sort function
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
        if (this.configuration.thresholds.length > 0 && (typeof this.configuration.thresholds[0]) == 'number') {
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
        const createTooltip = self => {
            let hiddenKeys = ['ROW', 'INDEX', 'COLOR', 'PARENTCOLOR', 'PARENT', '_PRIVATE_', 'COLORVALUE',
                    'SETNODECOLOR', 'SETNODESTROKECOLOR'],
                showKeys = self.configuration.showKeys;

            return d3.tip().attr('class', 'relationshipGraph-tip')
                .offset([-8, -10])
                .html(function(obj) {
                    let keys = Object.keys(obj),
                        table = document.createElement('table'),
                        count = keys.length,
                        rows = [];

                    // Loop through the keys in the object and only show values self are not in the hiddenKeys array.
                    while (count--) {
                        let element = keys[count],
                            upperCaseKey = element.toUpperCase();

                        if (!RelationshipGraph.contains(hiddenKeys, upperCaseKey)) {
                            let row = document.createElement('tr'),
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

                    let rowCount = rows.length;

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
            this.svg = this.configuration.selection
                .append('svg')
                .attr('width', '500')
                .attr('height', '500')
                .attr('style', 'display: block')
                .append('g')
                .attr('transform', 'translate(10, 0)');
        }

        this.graph = this;
    }

    /**
     * Generate the basic set of colors.
     *
     * @returns {string[]} List of HEX colors.
     * @private
     */
    static getColors() {
        return ['#c4f1be', '#a2c3a4', '#869d96', '#525b76', '#201e50', '#485447', '#5b7f77', '#6474ad', '#b9c6cb',
            '#c0d6c1', '#754668', '#587d71', '#4daa57', '#b5dda4', '#f9eccc', '#0e7c7b', '#17bebb', '#d4f4dd',
            '#d62246', '#4b1d3f', '#cf4799', '#c42583', '#731451', '#f3d1bf', '#c77745'
        ];
    }

    /**
     * Checks if the object contains the key.
     *
     * @param {object} obj The object to check in.
     * @param {string} key They key to check for.
     * @returns {boolean} Whether or not the object contains the key.
     * @private
     */
    static containsKey(obj, key) {
        return Object.keys(obj).indexOf(key) > -1;
    }

    /**
     * Checks whether or not the key is in the array.
     *
     * @param {*[]} arr The array to check in.
     * @param {string} key The key to check for.
     * @returns {boolean} Whether or not the key exists in the array.
     * @private
     */
    static contains(arr, key) {
        return arr.indexOf(key) > -1;
    }

    /**
     * Truncate a string to 25 characters plus an ellipses.
     *
     * @param {string} str The string to truncate.
     * @param {number} cap The number to cap the string at before it gets truncated.
     * @returns {string} The string truncated (if necessary).
     * @private
     */
    static truncate(str, cap) {
        if (!cap || !str) {
            return str;
        }

        return (str.length > cap) ? str.substring(0, cap) + '...' : str;
    }

    /**
     * Determines if the array passed in is an Array object.
     *
     * @param arr {Array} The array object to check.
     * @returns {boolean} Whether or not the array is actually an array object.
     */
    static isArray(arr) {
        return Object.prototype.toString.call(arr) == '[object Array]';
    }

    /**
     * Noop function.
     *
     * @private
     */
    static noop() { }

    /**
     * Returns a sorted Array.
     *
     * @param json {Array} The Array to be sorted.
     */
    static sortJson(json) {
        json.sort(function(child1, child2) {
            let parent1 = child1.parent.toLowerCase(),
                parent2 = child2.parent.toLowerCase();

            return (parent1 > parent2) ? 1 : (parent1 < parent2) ? -1 : 0;
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
    static stringCompare(value, thresholds) {
        if (typeof value !== 'string') {
            throw 'Cannot make value comparison between a string and a ' + (typeof value) + '.';
        }

        const thresholdsLength = thresholds.length;

        for (let i = 0; i < thresholdsLength; i++) {
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
    static numericCompare(value, thresholds) {
        if (typeof value !== 'number') {
            throw 'Cannot make value comparison between a number and a ' + (typeof value) + '.';
        }

        const length = thresholds.length;

        for (let i = 0; i < length; i++) {
            if (value <= thresholds[i]) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Return the ID of the selection.
     *
     * @returns {string} The ID of the selection.
     * @private
     */
    getId() {
        return this.configuration.selection._groups[0][0].id;
    }

    /**
     * Returns the pixel length of the string based on the font size.
     *
     * @param {string} str The string to get the length of.
     * @returns {Number} The pixel length of the string.
     * @public
     */
    getPixelLength(str) {
        if (RelationshipGraph.containsKey(this.measuredCache, str)) {
            return this.measuredCache[str];
        }

        const text = document.createTextNode(str);
        this.measurementDiv.appendChild(text);

        const width = this.measurementDiv.offsetWidth;
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
    assignIndexAndRow(json, parentSizes, parents) {
        // Determine the longest parent name to calculate how far from the left the child blocks should start.
        let longest = '',
            parentNames = Object.keys(parentSizes),
            i,
            index = 0,
            row = 0,
            previousParent = '',
            parentLength = parents.length,
            {configuration} = this,
            {blockSize} = configuration;

        for (i = 0; i < parentLength; i++) {
            let current = parents[i] + ' ( ' + parentSizes[parentNames[i]] + ') ';

            if (current.length > longest.length) {
                longest = current;
            }
        }

        // Calculate the row and column for each child block.
        let longestWidth = this.getPixelLength(longest),
            parentDiv = configuration.selection._groups[0][0],
            calculatedMaxChildren = (configuration.maxChildCount === 0) ?
                Math.floor((parentDiv.parentElement.clientWidth - blockSize - longestWidth) / blockSize) :
                configuration.maxChildCount,
            jsonLength = json.length,
            {thresholds} = configuration;

        for (i = 0; i < jsonLength; i++) {
            let element = json[i],
                {parent} = element;

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
                let value,
                    compare;

                if (typeof thresholds[0] === 'string') {
                    value = element.value;
                    compare = RelationshipGraph.stringCompare;
                } else {
                    const elementValue = element.value;

                    value = (typeof elementValue == 'number') ?
                        elementValue : parseFloat(elementValue.replace(/[^0-9-.]+/g, ''));

                    compare = RelationshipGraph.numericCompare;
                }

                const thresholdIndex = compare(value, thresholds);

                element.color = (thresholdIndex === -1) ? 0 : thresholdIndex;
                element.colorValue = this.configuration.colors[element.color % this.configuration.colors.length];
            }

            // Add the interaction methods
            /**
             * Set the color of the node.
             *
             * @param {String} color The new color of the node to set.
             */
            element.setNodeColor = function(color) {
                const node = document.getElementById(this.getId() + '-child-node' + element.row + element.index);

                if (node) {
                    node.style.fill = color;
                }
            };

            /**
             * Set the color of the node's stroke.
             *
             * @param {String} color The color to set the stroke to. Set this to a falsy value to remove the stroke.
             */
            element.setNodeStrokeColor = function(color) {
                const node = document.getElementById(this.getId() + '-child-node' + element.row + element.index);

                if (node) {
                    node.style.strokeWidth = color ? '1px' : 0;
                    node.style.stroke = color ? color : '';
                }
            };
        }

        return [
            longestWidth,
            calculatedMaxChildren,
            row
        ];
    }

    /**
     * Verify that the JSON passed in is correct.
     *
     * @param json {Array} The array of JSON objects to verify.
     */
    static verifyJson(json) {
        if (!(RelationshipGraph.isArray(json)) || (json.length < 0) || (typeof json[0] !== 'object')) {
            throw 'JSON has to be an Array of JavaScript objects that is not empty.';
        }

        let length = json.length;

        while (length--) {
            let element = json[length],
                keys = Object.keys(element),
                keyLength = keys.length,
                {parentColor} = element;

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

    /**
     * Creates the parent labels.
     *
     * @param {d3.selection} parentNodes The parentNodes.
     * @param {Object} parentSizes The child count for each parent.
     * @param {number} longestWidth The longest width of a parent node.
     * @param {number} calculatedMaxChildren The maximum amount of children nodes per row.
     * @private
     */
    createParents(parentNodes, parentSizes, longestWidth, calculatedMaxChildren) {
        const parentSizesKeys = Object.keys(parentSizes),
            _this = this;

        parentNodes.enter().append('text')
            .text(function(obj, index) {
                return obj + ' (' + parentSizes[parentSizesKeys[index]] + ')';
            })
            .attr('x', function(obj, index) {
                const width = _this.getPixelLength(obj + ' (' + parentSizes[parentSizesKeys[index]] + ')');
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
                let previousParentSize = 0,
                    i = index - 1;

                while (i > -1) {
                    previousParentSize += Math.ceil(parentSizes[parentSizesKeys[i]] / calculatedMaxChildren) *
                        calculatedMaxChildren;
                    i--;
                }

                return Math.ceil(previousParentSize / calculatedMaxChildren) * _this.configuration.blockSize;
            })
            .style('text-anchor', 'start')
            .style('fill', function(obj) {
                return (obj.parentColor !== undefined) ? _this.configuration.colors[obj.parentColor] : '#000000';
            })
            .style('cursor', this.parentPointer ? 'pointer' : 'default')
            .attr('class', 'relationshipGraph-Text')
            .attr('transform', 'translate(-6, ' + _this.configuration.blockSize / 1.5 + ')')
            .on('click', function(obj) {
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
    updateParents(parentNodes, parentSizes, longestWidth, calculatedMaxChildren) {
        const parentSizesKeys = Object.keys(parentSizes),
            _this = this;

        // noinspection JSUnresolvedFunction
        parentNodes
            .text(function(obj, index) {
                return obj + ' (' + parentSizes[parentSizesKeys[index]] + ')';
            })
            .attr('x', function(obj, index) {
                const width = _this.getPixelLength(obj + ' (' + parentSizes[parentSizesKeys[index]] + ')');
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
                let previousParentSize = 0,
                    i = index - 1;

                while (i > -1) {
                    previousParentSize += Math.ceil(parentSizes[parentSizesKeys[i]] / calculatedMaxChildren) *
                        calculatedMaxChildren;
                    i--;
                }

                return Math.ceil(previousParentSize / calculatedMaxChildren) * _this.configuration.blockSize;
            })
            .style('fill', function(obj) {
                return (obj.parentColor !== undefined) ? _this.configuration.colors[obj.parentColor] : '#000000';
            })
            .style('cursor', _this.parentPointer ? 'pointer' : 'default');
    }

    /**
     * Creates new children nodes.
     *
     * @param {d3.selection} childrenNodes The children nodes.
     * @param {number} longestWidth The longest width of a parent node.
     * @private
     */
    createChildren(childrenNodes, longestWidth) {
        const _this = this;

        childrenNodes.enter()
            .append('rect')
            .attr('id', function(obj) {
                return _this.getId() + '-child-node' + obj.row + obj.index;
            })
            .attr('x', function(obj) {
                return longestWidth + ((obj.index - 1) * _this.configuration.blockSize) + 5;
            })
            .attr('y', function(obj) {
                return (obj.row - 1) * _this.configuration.blockSize;
            })
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('class', 'relationshipGraph-block')
            .attr('width', _this.configuration.blockSize)
            .attr('height', _this.configuration.blockSize)
            .style('fill', function(obj) {
                return obj.colorValue;
            })
            .style('cursor', _this.childPointer ? 'pointer' : 'default')
            .on('mouseover', _this.tooltip ? _this.tooltip.show : RelationshipGraph.noop)
            .on('mouseout', _this.tooltip ? _this.tooltip.hide : RelationshipGraph.noop)
            .on('click', function(obj) {
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
    updateChildren(childrenNodes, longestWidth) {
        const {blockSize} = this.configuration,
            _this = this;

        // noinspection JSUnresolvedFunction
        childrenNodes.transition(this.configuration.transitionTime)
            .attr('id', function(obj) {
                return _this.getId() + '-child-node' + obj.row + obj.index;
            })
            .attr('x', function(obj) {
                return longestWidth + ((obj.index - 1) * blockSize) + 5;
            })
            .attr('y', function(obj) {
                return (obj.row - 1) * blockSize;
            })
            .style('fill', function(obj) {
                return obj.colorValue;
            });
    }

    /**
     * Removes nodes that no longer exist.
     *
     * @param {d3.selection} nodes The nodes.
     * @private
     */
    removeNodes(nodes) {
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
    data(json) {
        if (RelationshipGraph.verifyJson(json)) {
            const parents = [],
                parentSizes = {},
                {configuration} = this;

            let row = 0,
                parent,
                i,
                maxWidth,
                maxHeight,
                calculatedMaxChildren = 0,
                longestWidth = 0;

            // Ensure that the JSON is sorted by parent.
            configuration.sortFunction(json);

            /**
             * Loop through all of the childrenNodes in the JSON array and determine the amount of childrenNodes per
             * parent. This will also calculate the row and index for each block and truncate the parent names to 25
             * characters.
             */
            const jsonLength = json.length;

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
            [longestWidth, calculatedMaxChildren, row] = this.assignIndexAndRow(json, parentSizes, parents);

            // Set the max width and height.
            maxHeight = row * configuration.blockSize;
            maxWidth = longestWidth + calculatedMaxChildren * configuration.blockSize;

            // Select all of the parent nodes.
            const parentNodes = this.svg.selectAll('.relationshipGraph-Text')
                .data(parents);

            // Add new parent nodes.
            this.createParents(parentNodes, parentSizes, longestWidth, calculatedMaxChildren);

            // Update existing parent nodes.
            this.updateParents(parentNodes, parentSizes, longestWidth, calculatedMaxChildren);

            // Remove deleted parent nodes.
            this.removeNodes(parentNodes);

            // Select all of the children nodes.
            const childrenNodes = this.svg.selectAll('.relationshipGraph-block')
                .data(json);

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

            this.configuration.selection.select('svg')
                .attr('width', Math.abs(maxWidth + 15))
                .attr('height', Math.abs(maxHeight + 15));
        }

        return this;
    }
}

/**
 * Add a relationshipGraph function to d3 that returns a RelationshipGraph object.
 */
d3.relationshipGraph = function() {
    'use strict';

    return RelationshipGraph.extend.apply(RelationshipGraph, arguments);
};

/**
 * Add relationshipGraph to selection.
 *
 * @param {Object} userConfig Configuration for graph.
 * @return {Object} Returns a new RelationshipGraph object.
 */
d3.selection.prototype.relationshipGraph = function(userConfig) {
    'use strict';

    return new RelationshipGraph(this, userConfig);
};
