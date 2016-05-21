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

        var json = [
            {
                "Movie Title": "Avatar",
                "parent": "20th Century Fox",
                "value": "$2,787,965,087",
                "Year": "2009"
            },
            {
                "Movie Title": "Titanic",
                "parent": "20th Century Fox",
                "value": "$2,186,772,302",
                "Year": "1997"
            },
            {
                "Movie Title": "Star Wars: The Force Awakens",
                "parent": "Walt Disney Studios",
                "value": "$2,066,247,462",
                "Year": "2015"
            },
            {
                "Movie Title": "Jurassic World",
                "parent": "Universal Pictures",
                "value": "$1,670,400,637",
                "Year": "2015"
            },
            {
                "Movie Title": "The Avengers",
                "parent": "Walt Disney Studios",
                "value": "$1,519,557,910",
                "Year": "2012"
            },
            {
                "Movie Title": "Furious 7",
                "parent": "Universal Pictures",
                "value": "$1,516,045,911",
                "Year": "2015"
            },
            {
                "Movie Title": "Avengers: Age of Ultron",
                "parent": "Walt Disney Studios",
                "value": "$1,405,413,868",
                "Year": "2015"
            },
            {
                "Movie Title": "Harry Potter and the Deathly Hallows -- Part 2",
                "parent": "Warner Bros. Pictures",
                "value": "$1,341,511,219",
                "Year": "2011"
            },
            {
                "Movie Title": "Frozen",
                "parent": "Walt Disney Studios",
                "value": "$1,287,000,000",
                "Year": "2013"
            },
            {
                "Movie Title": "Iron Man 3",
                "parent": "Walt Disney Studios",
                "value": "$1,215,439,994",
                "Year": "2013"
            },
            {
                "Movie Title": "Minions",
                "parent": "Universal Pictures",
                "value": "$1,159,398,397",
                "Year": "2015"
            },
            {
                "Movie Title": "Transformers: Dark of the Moon",
                "parent": "Paramount Pictures",
                "value": "$1,123,794,079",
                "Year": "2011"
            },
            {
                "Movie Title": "The Lord of the Rings: The Return of the King",
                "parent": "New Line Cinema",
                "value": "$1,119,929,521",
                "Year": "2003"
            },
            {
                "Movie Title": "Skyfall",
                "parent": "Columbia Pictures",
                "value": "$1,108,561,013",
                "Year": "2012"
            },
            {
                "Movie Title": "Transformers: Age of Extinction",
                "parent": "Universal Pictures",
                "value": "$1,104,054,072",
                "Year": "2014"
            },
            {
                "Movie Title": "The Dark Knight Rises",
                "parent": "Warner Bros. Pictures",
                "value": "$1,084,939,099",
                "Year": "2012"
            },
            {
                "Movie Title": "Pirates of the Caribbean: Dead Man's Chest",
                "parent": "Walt Disney Studios",
                "value": "$1,066,179,725",
                "Year": "2006"
            },
            {
                "Movie Title": "Toy Story 3",
                "parent": "Walt Disney Studios",
                "value": "$1,063,171,911",
                "Year": "2010"
            },
            {
                "Movie Title": "Pirates of the Caribbean: On Stranger Ties",
                "parent": "Walt Disney Studios",
                "value": "$1,045,713,802",
                "Year": "2011"
            },
            {
                "Movie Title": "Jurassic Park",
                "parent": "Universal Pictures",
                "value": "$1,029,939,903",
                "Year": "1993"
            },
            {
                "Movie Title": "Star Wars: Episode I -- The Phantom Menace",
                "parent": "20th Century Fox",
                "value": "$1,027,044,677",
                "Year": "1999"
            },
            {
                "Movie Title": "Alice in Wonderland",
                "parent": "Walt Disney Studios",
                "value": "$1,025,467,110",
                "Year": "2010"
            },
            {
                "Movie Title": "The Hobbit: An Unexpected Journey",
                "parent": "Warner Bros. Pictures",
                "value": "$1,021,103,568",
                "Year": "2012"
            },
            {
                "Movie Title": "The Dark Knight",
                "parent": "Warner Bros. Pictures",
                "value": "$1,004,558,444",
                "Year": "2008"
            },
            {
                "Movie Title": "The Lion King",
                "parent": "Walt Disney Studios",
                "value": "$987,483,777",
                "Year": "1994"
            },
            {
                "Movie Title": "Harry Potter and the Philosopher's Stone",
                "parent": "Warner Bros. Pictures",
                "value": "$974,755,371",
                "Year": "2001"
            },
            {
                "Movie Title": "Despicable Me 2",
                "parent": "Universal Pictures",
                "value": "$970,761,885",
                "Year": "2013"
            },
            {
                "Movie Title": "Zootopia",
                "parent": "Walt Disney Studios",
                "value": "$969,831,439",
                "Year": "2016"
            },
            {
                "Movie Title": "Pirates of the Caribbean: At World's End",
                "parent": "Walt Disney Studios",
                "value": "$963,420,425",
                "Year": "2007"
            },
            {
                "Movie Title": "Harry Potter and the Deathly Hallows -- Part 1",
                "parent": "Warner Bros. Pictures",
                "value": "$960,283,305",
                "Year": "2010"
            },
            {
                "Movie Title": "The Hobbit: The Desolation of Smaug",
                "parent": "Warner Bros. Pictures",
                "value": "$958,366,855",
                "Year": "2013"
            }
            ,
            {
                "Movie Title": "The Hobbit: The Battle of the Five Armies",
                "parent": "Warner Bros. Pictures",
                "value": "$956,892,078",
                "Year": "2014"
            },
            {
                "Movie Title": "Captain America: Civil War",
                "parent": "Walt Disney Studios",
                "value": "$940,892,078",
                "Year": "2016"
            },
            {
                "Movie Title": "Harry Potter and the Order of the Phoenix",
                "parent": "Warner Bros. Pictures",
                "value": "$939,885,929",
                "Year": "2007"
            },
            {
                "Movie Title": "Finding Nemo",
                "parent": "Walt Disney Studios",
                "value": "$936,743,261",
                "Year": "2003"
            },
            {
                "Movie Title": "Harry Potter and the Half-Blood Prince",
                "parent": "Warner Bros. Pictures",
                "value": "$934,416,487",
                "Year": "2009"
            },
            {
                "Movie Title": "The Lord of the Rings: The Two Towers",
                "parent": "New Line Cinema",
                "value": "$926,047,111",
                "Year": "2002"
            },
            {
                "Movie Title": "Shrek 2",
                "parent": "Walt Disney Studios",
                "value": "$919,838,758",
                "Year": "2004"
            },
            {
                "Movie Title": "Harry Potter and the Goblet of Fire",
                "parent": "Warner Bros. Pictures",
                "value": "$896,911,078",
                "Year": "2005"
            },
            {
                "Movie Title": "Spider-Man 3",
                "parent": "Columbia Pictures",
                "value": "$890,871,626",
                "Year": "2007"
            },
            {
                "Movie Title": "Ice Age: dawn of the Dinosaurs",
                "parent": "20th Century Fox",
                "value": "$886,686,817",
                "Year": "2009"
            },
            {
                "Movie Title": "Spectre",
                "parent": "Columbia Pictures",
                "value": "$880,674,609",
                "Year": "2015"
            },
            {
                "Movie Title": "Harry Potter and the Chamber of Secrets",
                "parent": "Warner Bros. Pictures",
                "value": "$878,979,634",
                "Year": "2002"
            },
            {
                "Movie Title": "Ice Age: Continental Drift",
                "parent": "20th Century Fox",
                "value": "$877,244,782",
                "Year": "2012"
            },
            {
                "Movie Title": "The Lord of the Rings: The Fellowship of the Rings",
                "parent": "New Line Cinema",
                "value": "$871,530,324",
                "Year": "2001"
            },
            {
                "Movie Title": "Batman v Superman: Dawn of Justice",
                "parent": "Warner Bros. Pictures",
                "value": "$868,814,243",
                "Year": "2016"
            },
            {
                "Movie Title": "The Hunger Games: Catching Fire",
                "parent": "Lionsgate Films",
                "value": "$865,011,746",
                "Year": "2013"
            },
            {
                "Movie Title": "Inside Out",
                "parent": "Walt Disney Studios",
                "value": "$857,427,711",
                "Year": "2015"
            },
            {
                "Movie Title": "Star Wars: Episode III -- Revenge of the Sith",
                "parent": "20th Century Fox",
                "value": "$848,754,768",
                "Year": "2005"
            },
            {
                "Movie Title": "Transformers: Revenge of the Fallen",
                "parent": "Universal Pictures",
                "value": "$836,303,693",
                "Year": "2009"
            }
        ];

        // Ensure that the JSON is sorted by parent.
        json.sort(function(child1, child2) {
            var parent1 = child1.parent.toLowerCase(),
                parent2 = child2.parent.toLowerCase(),
                r = ((parent1 > parent2) ? 1 : (parent1 < parent2) ? -1 : 0);

            if (r === 0) {
                var keys = Object.keys(child1);

                for (var i = 0; i < keys.length; i++) {
                    if (keys[i] == 'parent') {
                        continue;
                    }

                    var val1 = child1[keys[i]],
                        val2 = child2[keys[i]];

                    r = ((val1 > val2) ? 1 : (val1 < val2) ? -1 : 0);

                    if (r !== 0) {
                        return r;
                    }
                }
            }

            return r;
        });

        it('Should exist', function() {
            var graphElement = document.getElementById('graph'),
                svg = graphElement.children[0];

            chai.expect(graphElement.tagName.toUpperCase()).to.equal('DIV');
            chai.expect(svg.tagName.toUpperCase()).to.equal('SVG');
        });

        it('Should be created correctly', function() {
            graph.data(json);

            var graphElement = document.getElementById('graph'),
                svg = graphElement.children[0],
                text = document.getElementsByClassName('relationshipGraph-Text');

            var expectedText = ['20th Century Fox (6)', 'Columbia Pictures (3)', 'Lionsgate Films (1)', 'New Line Cinema (3)',
                'Paramount Pictures (1)', 'Universal Pictures (7)', 'Walt Disney Studios (16)', 'Warner Bros. Pictures (13)'],
                expectedY = [0, 24, 48, 72, 96, 120, 144, 192];

            chai.expect(text.length).to.equal(expectedText.length);

            for (var i = 0; i < text.length; i++) {
                var element = text[i],
                    elementText = element.firstChild.textContent;

                chai.expect(element).to.not.equal(undefined);
                chai.expect(parseInt(element.getAttribute('x'))).to.equal(0);
                chai.expect(parseInt(element.getAttribute('y'))).to.equal(expectedY[i]);
                chai.expect(elementText).to.equal(expectedText[i]);
            }

            var expectedX = [160, 184, 208, 232, 256, 280, 160, 184, 208, 160, 160, 184, 208, 160, 160, 184, 208, 232,
                    256, 280, 304, 160, 184, 208, 232, 256, 280, 304, 328, 352, 376, 160, 184, 208, 232, 256, 280, 160,
                    184, 208, 232, 256, 280, 304, 328, 352, 376, 160, 184, 208],
                rects = document.getElementsByClassName('relationshipGraph-block');

            expectedY = [0, 0, 0, 0, 0, 0, 24, 24, 24, 48, 72, 72, 72, 96, 120, 120, 120, 120, 120, 120, 120, 144,
                144, 144, 144, 144, 144, 144, 144, 144, 144, 168, 168, 168, 168, 168, 168, 192, 192, 192, 192, 192,
                192, 192, 192, 192, 192, 216, 216, 216, 216];

            chai.expect(rects.length).to.equal(expectedX.length);

            for (var j = 0; j < rects.length; j++) {
                var block = rects[j];

                console.log(j);

                chai.expect(parseInt(block.getAttribute('x'))).to.equal(expectedX[j]);
                chai.expect(parseInt(block.getAttribute('y'))).to.equal(expectedY[j]);
                chai.expect(parseInt(block.getAttribute('rx'))).to.equal(4);
                chai.expect(parseInt(block.getAttribute('ry'))).to.equal(4);
                chai.expect(parseInt(block.getAttribute('width'))).to.equal(graph.config.blockSize);
                chai.expect(parseInt(block.getAttribute('height'))).to.equal(graph.config.blockSize);
            }
        });
    });
});
