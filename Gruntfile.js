/*global module*/

module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    autoprefixer: {
      options: {
        cascade: false
      },
      single_file: {
        src: 'dist/static/main.min.css',
        dest: 'dist/static/main.min.css'
      }
    },
    concat: {
      js: {
        src: ['src/static/js/modules/*.js', 'src/static/js/main.js'],
        dest: 'dist/static/main.min.js'
      },
      css: {
        src: ['src/static/styles/main.css'],
        dest: 'dist/static/main.min.css'
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            flatten: true,
            src: 'src/static/img/*',
            dest: 'dist/static/img',
            filter: 'isFile'
          },
          {
            expand: true,
            flatten: true,
            src: 'src/static/fonts/*',
            dest: 'dist/static/fonts',
            filter: 'isFile'
          }
        ]
      }
    },
    cssmin : {
      css: {
        src: 'dist/static/main.min.css',
        dest: 'dist/static/main.min.css'
      }
    },
    jinja: {
      dev: {
        options: {
          contextRoot: 'src/templates/context/dev',
          templateDirs: ['src/templates']
        },
        files: [{
          expand: true,
          dest: 'src/',
          cwd: 'src/templates/',
          src: ['**/!(_)*.html']
        }]
      },
      pro: {
        options: {
          contextRoot: 'src/templates/context/pro',
          templateDirs: ['src/templates']
        },
        files: [{
          expand: true,
          dest: 'dist/',
          cwd: 'src/templates/',
          src: ['**/!(_)*.html']
        }]
      }
    },
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'src/static/styles/main.css': 'src/static/styles/sass/main.scss'
        }
      }
    },
    uglify : {
      my_target: {
        files: {
          'dist/static/main.min.js' : ['dist/static/main.min.js']
        }
      }
    },
    watch: {
      css: {
        files: ['src/static/styles/sass/main.scss', 'src/static/styles/sass/**/*.scss'],
        tasks: ['sass'],
        options: {
          livereload: true
        }
      },
      js: {
        files: ['src/static/js/main.js', 'src/static/js/modules/*.js'],
        options: {
          livereload: true
        }
      },
      html: {
        files: ['src/templates/*.html'],
        tasks: ['jinja:dev'],
        options: {
          livereload: true
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-jinja');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // custom tasks
  grunt.registerTask('checkJS', function () {
    var jsFile = grunt.file.read('dist/static/main.min.js');
    if (jsFile === "") {
      grunt.file.delete('dist/static/main.min.js');
    }
  });

  // main tasks
  grunt.registerTask('dev', [
    'sass',
    'jinja:dev',
    'watch'
  ]);
  grunt.registerTask('pro', [
    'sass',
    'concat',
    'autoprefixer',
    'cssmin',
    'uglify',
    'copy',
    'checkJS',
    'jinja:pro'
  ]);
};
