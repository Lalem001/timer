/*jshint strict:false*/
/*global module:false, require: false */
module.exports = function(grunt) {
    require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        meta: {
            banner:
                '/**\n' +
                ' * <%= meta.pkg.name %> v<%= meta.pkg.version %>\n' +
                ' * Copyright (c) 2013, <%= grunt.template.today("yyyy") %> <%= meta.pkg.author %>\n' +
                ' */\n',
            pkg: grunt.file.readJSON('package.json'),
        },

        /**********************
         * Task Configuration *
         **********************/

        bower: {
            install: {
                options: {
                    copy: false
                }
            }
        }
    });

    grunt.registerTask('default', []);
};
