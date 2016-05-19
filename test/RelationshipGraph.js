/* global describe, it, d3, chai */

describe('RelationshipGraph', function() {
    'use strict';

    describe('#AddedToD3()', function () {
        it('Should be added to d3.', function () {
            chai.expect(d3.relationshipGraph).to.not.equal(undefined);
            chai.expect(d3.selection.prototype.relationshipGraph).to.not.equal(undefined);
            chai.expect(d3.selection.enter.prototype.relationshipGraph).to.not.equal(undefined);
        });
    });

    describe('#RelationshipGraph()', function() {
        it('Should return a RelationshipGraph object.', function() {
            var graph = d3.select('#test1').relationshipGraph({
                'thresholds': [200]
            });

            chai.expect(typeof graph).to.equal('object');
            chai.expect(typeof graph.verifyJson).to.equal('function');
            chai.expect(typeof graph.data).to.equal('function');
        });
    });

    describe('#CheckThresholdSorting()', function() {
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
        it('Should be null', function() {
            var graph = d3.select('#test3').relationshipGraph({
                'thresholds': [200],
                'showTooltips': false
            });

            chai.expect(graph.config.showTooltips).to.equal(false);
            chai.expect(graph.tip).to.equal(null);

            graph = d3.select('#test3').relationshipGraph({
                'thresholds': [200],
                'showTooltips': true
            });

            chai.expect(graph.config.showTooltips).to.equal(true);
            chai.expect(typeof graph.tip).to.equal('function');
        });
    });

    describe('#VerifyJSON()' , function() {
        it('Should be verified correctly', function() {
            var graph = d3.select('#test2').relationshipGraph({
                'thresholds': [200]
            });

            // Test undefined
            chai.expect(graph.verifyJson.bind(graph.verifyJson, undefined)).to.throw('JSON has to be a JavaScript object that is not empty.');
            // Test number
            chai.expect(graph.verifyJson.bind(graph.verifyJson, 5)).to.throw('JSON has to be a JavaScript object that is not empty.');
            // Test string
            chai.expect(graph.verifyJson.bind(graph.verifyJson, '5')).to.throw('JSON has to be a JavaScript object that is not empty.');
            // Test null
            chai.expect(graph.verifyJson.bind(graph.verifyJson, null)).to.throw('JSON has to be a JavaScript object that is not empty.');

            // Test no parent
            var json = [{
                'test': 15
            }];

            chai.expect(graph.verifyJson.bind(graph.verifyJson, json)).to.throw('Child does not have a parent.');
        })
    })

});
