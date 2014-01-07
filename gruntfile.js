/*jshint strict:false*/
/*global module:false, require: false */
module.exports = function(grunt) {
    require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            timer: ['timer.js']
        },
        qunit: {
            options: {
                coverage: {
                    src: ['timer.js'],
                    instrumentedFiles: 'report/temp/',
                    htmlReport: 'report/'
                }
            },
            all: ['tests/index.html']
        },
        uglify: {
            timer: {
                src: ['timer.js'],
                dest: 'timer.min.js'
            }
        }
    });

    grunt.registerTask('default', ['jshint', 'qunit', 'uglify']);
};
