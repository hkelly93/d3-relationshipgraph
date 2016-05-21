/* global module, grunt, initConfig */
module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        uglify: {
            options: {
                mangle: false
            },
            target: {
                files: {
                    'dest/d3.relationshipgraph.min.js': 'src/*.js'
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

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-mocha');

    grunt.registerTask('default', ['jshint', 'jscs', 'uglify', 'csslint', 'cssmin']);
    grunt.registerTask('test', ['jshint', 'jscs', 'uglify', 'csslint', 'cssmin', 'mocha']);

};
