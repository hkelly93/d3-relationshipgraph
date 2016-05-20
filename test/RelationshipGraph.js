/* global describe, it, d3, chai */
describe('RelationshipGraph', function() {
    'use strict';

    describe('#ValidateAddedToD3()', function () {
        it('Should be added to d3.', function () {
            chai.expect(d3.relationshipGraph).to.not.equal(undefined);
            chai.expect(d3.selection.prototype.relationshipGraph).to.not.equal(undefined);
            chai.expect(d3.selection.enter.prototype.relationshipGraph).to.not.equal(undefined);
        });
    });

    describe('#ValidateRelationshipGraph()', function() {
        it('Should return a RelationshipGraph object.', function() {
            var graph = d3.select('#test1').relationshipGraph({
                'thresholds': [200]
            });

            chai.expect(typeof graph).to.equal('object');
            chai.expect(typeof graph.verifyJson).to.equal('function');
            chai.expect(typeof graph.data).to.equal('function');
        });
    });

    describe('#ValidateThresholdSorting()', function() {
        it('Should be sorted.', function() {
            var thresholds = [500, 400, 300, 200, 100],
                expected = [100, 200, 300, 400, 500];

            var graph = d3.select('#test1').relationshipGraph({
                'thresholds': thresholds
            });

            for (var i = 0; i < expected.length; i++) {
                chai.expect(graph.config.thresholds[i]).to.equal(expected[i]);
            }
        });

        it('Should be the same', function() {
            var thresholds = ['test1', 'test2', 'test'];

            var graph = d3.select('#test1').relationshipGraph({
                'thresholds': thresholds
            });

            for (var i = 0; i < thresholds.length; i++) {
                chai.expect(graph.config.thresholds[i]).to.equal(thresholds[i]);
            }
        });
    });

    describe('#ValidateIncorrectThresholds()', function() {
        it('Should throw an exception', function() {
            // Test undefined.
            chai.expect(d3.select('#test').relationshipGraph).to.throw('undefined is not an object');
            // Test string.
            chai.expect(d3.select('#test').relationshipGraph.bind(
                d3.select('#test').relationshipGraph, {'thresholds': '15'})).to.throw('Thresholds must be an Object.');
            // Test number.
            chai.expect(d3.select('#test').relationshipGraph.bind(
                d3.select('#test').relationshipGraph, {'thresholds': 15})).to.throw('Thresholds must be an Object.');
            // Test null.
            chai.expect(d3.select('#test').relationshipGraph.bind(
                d3.select('#test').relationshipGraph, {'thresholds': null})).to.throw('null is not an object');
        });
    });
    
    describe('#ValidateContext()', function() {
        it('Should exist', function() {
            var graph = d3.select('#test2').relationshipGraph({
                'thresholds': [200]
            });
            
            chai.expect(typeof graph.ctx).to.equal('object');

            chai.expect(graph.ctx.font).to.equal('13px Helvetica');
        });
    });

    describe('#ValidateShowTooltips()', function() {
        it('Should be false', function() {
            var graph = d3.select('#test3').relationshipGraph({
                'thresholds': [200],
                'showTooltips': false
            });

            chai.expect(graph.config.showTooltips).to.equal(false);
            chai.expect(graph.tip).to.equal(null);
        });
        it('Should be true', function () {
            var graph = d3.select('#test3').relationshipGraph({
                'thresholds': [200],
                'showTooltips': true
            });

            chai.expect(graph.config.showTooltips).to.equal(true);
            chai.expect(typeof graph.tip).to.equal('function');
        });
        it('Should be true', function () {
            var graph = d3.select('#test3').relationshipGraph({
                'thresholds': [200]
            });

            chai.expect(graph.config.showTooltips).to.equal(true);
            chai.expect(typeof graph.tip).to.equal('function');
        });
    });

    describe('#ValidateShowKeys()', function() {
        it('Should be false', function() {
            var graph = d3.select('#test3').relationshipGraph({
                'thresholds': [200],
                'showKeys': false
            });

            chai.expect(graph.config.showKeys).to.equal(false);
        });
        it('Should be true', function () {
            var graph = d3.select('#test3').relationshipGraph({
                'thresholds': [200],
                'showKeys': true
            });

            chai.expect(graph.config.showKeys).to.equal(true);
            chai.expect(typeof graph.tip).to.equal('function');
        });
        it('Should be true', function () {
            var graph = d3.select('#test3').relationshipGraph({
                'thresholds': [200]
            });

            chai.expect(graph.config.showKeys).to.equal(true);
            chai.expect(typeof graph.tip).to.equal('function');
        });
    });

    describe('#ValidateVerifyJSON()' , function() {
        var graph = d3.select('#test2').relationshipGraph({
            'thresholds': [200]
        });

        it('Should be an empty object', function() {
            // Test undefined
            chai.expect(graph.verifyJson.bind(graph.verifyJson, undefined)).to.throw('JSON has to be an Array of JavaScript objects that is not empty.');
            // Test number
            chai.expect(graph.verifyJson.bind(graph.verifyJson, 5)).to.throw('JSON has to be an Array of JavaScript objects that is not empty.');
            // Test string
            chai.expect(graph.verifyJson.bind(graph.verifyJson, '5')).to.throw('JSON has to be an Array of JavaScript objects that is not empty.');
            // Test null
            chai.expect(graph.verifyJson.bind(graph.verifyJson, null)).to.throw('JSON has to be an Array of JavaScript objects that is not empty.');
        });
        it('Should not have a parent', function () {
            // Test no parent
            var json = [{
                'test': 15
            }];

            chai.expect(graph.verifyJson.bind(graph.verifyJson, json)).to.throw('Child does not have a parent.');
        })
    });

    describe('#ValidateConfigurations()', function() {
       it('Should be the same.', function() {
           var config = config = {
               showTooltips: true,
               maxChildCount: 10,
               onClick: function(obj) {},
               showKeys: true,
               thresholds: [100, 200, 300],
               colors: ['red', 'green', 'blue'],
               transitionTime: 1000,
               truncate: 25
           };

           var graph = d3.select('#test2').relationshipGraph(config);

           chai.expect(graph.config.showTooltips).to.equal(config.showTooltips);
           chai.expect(graph.config.maxChildCount).to.equal(config.maxChildCount);
           chai.expect(graph.config.onClick).to.equal(config.onClick);
           chai.expect(graph.config.showKeys).to.equal(config.showKeys);

           for (var i = 0; i < config.thresholds.length; i++) {
               chai.expect(graph.config.thresholds[i]).to.equal(config.thresholds[i]);
           }

           for (i = 0; i < config.colors.length; i++) {
               chai.expect(graph.config.colors[i]).to.equal(config.colors[i]);
           }

           chai.expect(graph.config.transitionTime).to.equal(config.transitionTime);
           chai.expect(graph.config.truncate).to.equal(config.truncate);
       })
    });


    describe('#ValidateContainsKey()', function() {
        var containsKey = function(obj, key) {
            return Object.keys(obj).indexOf(key) > -1;
        };

        it('Should contain the key', function() {
            chai.expect(containsKey({'test': 15}, 'test')).to.equal(true);
        });

        it('Should not contain the key', function() {
            chai.expect(containsKey({'test': 15}, 'test2')).to.equal(false);
        })
    });

    describe('#ValidateContains()', function() {
        var contains = function(arr, key) {
            return arr.indexOf(key) > -1;
        };

        it('Should contain the key', function() {
            chai.expect(contains([15, 22], 22)).to.equal(true);
        });

        it('Should not contain the key', function() {
            chai.expect(contains([15, 22], 30)).to.equal(false);
        });
    });

    describe('#ValidateTruncate()', function() {
        var truncate = function(str, cap) {
            if (cap === 0) {
                return str;
            }

            return (str.length > cap) ? str.substring(0, cap) + '...' : str;
        };

        it('Should be truncated', function() {
            chai.expect(truncate('teststring', 5).length).to.equal(8);  // This includes the ellipses
        });

        it('Should not be truncated', function() {
            chai.expect(truncate('teststring', 10).length).to.equal(10);
            chai.expect(truncate('teststring', 0).length).to.equal(10);
        })
    });

    describe('#ValidateIsArray()', function() {
        var isArray = function(arr) {
            return Object.prototype.toString.call(arr) == '[object Array]';
        };

        it('Should be false', function() {
            chai.expect(isArray(7)).to.equal(false);
        });

        it('Should be true', function() {
            chai.expect(isArray([1, 2, 3])).to.equal(true);
            chai.expect(isArray([
                {'test': 22},
                {'test': 45}
            ])).to.equal(true);
        });
    });

    describe('#ValidateCreation()', function() {
        var graph = d3.select('#graph').relationshipGraph({
            'showTooltips': true,
            'maxChildCount': 10,
            'showKeys': false,
            'thresholds': [1000000000, 2000000000, 3000000000]
        });

        it('Should exist', function() {
            var graph = document.getElementById('graph'),
                svg = graph.children[0];

            chai.expect(graph.tagName.toUpperCase()).to.equal('DIV');
            chai.expect(svg.tagName.toUpperCase()).to.equal('SVG');
        });
    });
});
