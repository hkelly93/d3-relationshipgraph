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
});
