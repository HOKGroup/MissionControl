'use strict'

banner = '/*!\n * @module <%= pkg.name %>\n' +
  ' * @description <%= pkg.description %>\n' +
  ' * @version v<%= pkg.version %>\n' +
  ' * @link <%= pkg.homepage %>\n' +
  ' * @licence MIT License, https://opensource.org/licenses/MIT\n' +
  ' */\n\n';

module.exports = (grunt) ->
  require('load-grunt-tasks')(grunt)

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    coffeelintr:
      options:
        configFile: 'coffeelint.json'
      source: ['src/angularjs-toast.coffee', 'Gruntfile.coffee']

    eslint:
      target: ['docs/**/*.js', 'scripts/**/*.js']

    coffee:
      compileJoined:
        options:
          join: true
        files:
          'dist/angularjs-toast.js': ['src/angularjs-toast.coffee']

    sass:
      options:
        sourcemap: 'none'
        style: 'expanded'
      demo:
        files:
          'docs/style.css': 'docs/style.scss'
      dist:
        files:
          'dist/angularjs-toast.css': 'src/angularjs-toast.scss'

    cssmin:
      options:
        sourceMap: true
      target:
        files:
          'dist/angularjs-toast.min.css': 'dist/angularjs-toast.css'

    concat:
      options:
        stripBanners: true
        banner: banner
      dist:
        files:
          'dist/angularjs-toast.js': ['dist/angularjs-toast.js']
          'dist/angularjs-toast.css': ['dist/angularjs-toast.css']

    uglify:
      options:
        sourceMap: true
        output:
          comments: '/^!/'
      target:
        files:
          'dist/angularjs-toast.min.js': ['dist/angularjs-toast.js']

    ngAnnotate:
      options:
        singleQuotes: true

      angularjsToast:
        files:
          'dist/angularjs-toast.js': ['dist/angularjs-toast.js']

    connect:
      server:
        options:
          base: './'
          hostname: 'localhost'
          open: true
          keepalive: true
          livereload: true

    watch:
      coffeescript:
        files: ['src/*.coffee']
        tasks: ['default']
      scripts:
        files: ['docs/**/*.js', 'dist/**/*.js']
        options:
          livereload: true
      sass:
        files: ['src/**/*.scss', 'docs/**/*.scss']
        tasks: ['sass']
      css:
        files: ['docs/**/*.css', 'dist/**/*.css']
        options:
          livereload: true
      html:
        files: ['docs/**/*.html']
        options:
          livereload: true


  # Grunt task(s).
  grunt.registerTask 'default', ['coffeelintr', 'coffee', 'ngAnnotate']
  grunt.registerTask 'serve', ['connect']
  grunt.registerTask 'lint', ['coffeelintr', 'eslint']
  grunt.registerTask 'develop', ['default', 'watch']
  grunt.registerTask 'build', ['default', 'ngAnnotate', 'sass', 'concat', 'uglify', 'cssmin']

  return
