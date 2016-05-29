/* global module, grunt, initConfig */
module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        concat: {
            options: {
                separator: ' '
            },
            dist: {
                src: ['src/d3-tip.js', 'src/index.js'],
                dest: 'dest/d3.relationshipgraph.js'
            }
        },
        babel: {
            options: {
                presets: ['es2015']
            },
            dist: {
                files: {
                    'dest/d3.relationshipgraph.js': 'dest/d3.relationshipgraph.js'
                }
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            target: {
                files: {
                    'dest/d3.relationshipgraph.min.js': 'dest/d3.relationshipgraph.js'
                }
            }
        },
        cssmin: {
            target: {
                files: {
                    'dest/d3.relationshipgraph.min.css': 'src/RelationshipGraph.css'
                }
            }
        },
        jshint: {
            all: {
                'src': 'src/index.js',
                options: {
                    jshintrc: '.jshintrc'
                }
            }
        },
        jscs: {
            src: 'src/index.js',
            options: {
                config: '.jscsrc'
            }
        },
        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            src: ['src/RelationshipGraph.css']
        },
        mocha: {
            test: {
                src: ['test/**/*.html']
            },
            options: {
                log: true,
                logErrors: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-mocha');

    grunt.registerTask('default', ['jshint', 'jscs', 'concat', 'babel', 'uglify', 'csslint', 'cssmin']);
    grunt.registerTask('test', ['jshint', 'jscs', 'concat', 'babel', 'uglify', 'csslint', 'cssmin', 'mocha']);
};
