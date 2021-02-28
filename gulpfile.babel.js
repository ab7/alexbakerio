import gulp from 'gulp';
import server from 'gulp-server-livereload';
import clean from 'gulp-clean';
import sass from 'gulp-sass';
import rev from 'gulp-rev';
import nunjucksRender from 'gulp-nunjucks-render';
import markdown from 'gulp-markdown';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import gap from 'gulp-append-prepend';
import htmlmin from 'gulp-htmlmin';
import cleanCSS from 'gulp-clean-css';
import replace from 'gulp-replace';
import shell from 'gulp-shell';
import sitemap from 'gulp-sitemap';
import imagemin from 'gulp-imagemin';
import ext_replace from 'gulp-ext-replace';
import foreach from 'gulp-foreach';
import webp from 'gulp-webp';

import {deployCommands} from './lib/deploy';
import {devPageFallback, disqusIdentifiers} from './lib/helpers';
import {getAssetFileNames, getPostData, getNavLinks} from './lib/main';


const srcPaths  = {
        'root': 'src/',
        'templates': 'src/templates/**/*.html',
        'pagesDir': 'src/pages/',
        'pages': 'src/pages/**/*.html',
        'postsDir': 'src/posts/',
        'assets': 'src/assets/',
        'sass': 'src/assets/scss/',
        'js': 'src/assets/js/',
        'images': 'src/assets/images/',
        'fonts': 'src/assets/fonts/'
      },
      buildPaths = {
        'root': 'build/',
        'assets': 'build/assets/',
        'images': 'build/assets/images/',
        'fonts': 'build/assets/fonts/'
      },
      distPaths = {
        'root': 'dist/',
        'assets': 'dist/assets/',
        'images': 'dist/assets/images',
        'fonts': 'dist/assets/fonts/'
      };

//
// Build tasks
// -------------------------------------------------------------
gulp.task('build-clean', () => {
  return gulp.src(buildPaths.root + '*')
    .pipe(clean());
});

gulp.task('build-sass', ['build-clean'], () => {
  return gulp.src(srcPaths.sass + 'main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.', {includeContent: true}))
    .pipe(gulp.dest(buildPaths.assets))
});

gulp.task('build-js', ['build-clean'], () => {
  return gulp.src([srcPaths.js + 'vendor/**/*.js', srcPaths.js + 'main.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write('.', {includeContent: true}))
    .pipe(gulp.dest(buildPaths.assets))
});

gulp.task('build-images', ['build-clean'], () => {
  return gulp.src(srcPaths.images + '*.{png,gif,jpg,svg}')
    .pipe(gulp.dest(buildPaths.images));
});

gulp.task('build-favicon', ['build-clean'], () => {
  return gulp.src(srcPaths.images + 'favicon.ico')
    .pipe(gulp.dest(buildPaths.root));
});

gulp.task('build-fonts', ['build-clean'], () => {
  return gulp.src(srcPaths.fonts +'*.{woff,woff2,ttf,eot,svg}')
    .pipe(gulp.dest(buildPaths.fonts));
});

gulp.task('build-templates', ['build-clean'], () => {
  return getPostData(srcPaths.postsDir, (data) => {
    data.navLinks = getNavLinks(srcPaths.pagesDir);
    gulp.src(srcPaths.pages)
      .pipe(nunjucksRender({data: data}))
      .pipe(gulp.dest(buildPaths.root));
  });
});

gulp.task('build-posts', ['build-clean'], () => {
  return getPostData(srcPaths.postsDir, (data) => {
    data.navLinks = getNavLinks(srcPaths.pagesDir);
    gulp.src(data.livePosts)
      .pipe(markdown())
      .pipe(gap.prependText('{% extends "src/templates/post.html" %}{% block post %}'))
      .pipe(gap.appendText('{% endblock %}'))
      .pipe(nunjucksRender({data: data}))
      .pipe(foreach(disqusIdentifiers))
      .pipe(gulp.dest(buildPaths.root));
  });
});

//
// Dist tasks
// -------------------------------------------------------------
gulp.task('dist-clean', () => {
  return gulp.src(distPaths.root + '*', {read: false})
    .pipe(clean());
});

gulp.task('dist-css', ['dist-clean'], () => {
  return gulp.src(buildPaths.assets + '**/*.css')
    .pipe(cleanCSS())
    .pipe(rev())
    .pipe(gulp.dest(distPaths.assets))
    .pipe(rev.manifest('css-manifest.json'))
    .pipe(gulp.dest(distPaths.assets));
});

gulp.task('dist-js', ['dist-clean'], () => {
  return gulp.src(buildPaths.assets + '**/*.js')
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(distPaths.assets))
    .pipe(rev.manifest('js-manifest.json'))
    .pipe(gulp.dest(distPaths.assets));
});

gulp.task('dist-images', ['dist-clean', 'dist-js'], () => {
  return gulp.src(buildPaths.images +'*.{png,gif,jpg,svg}')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ], {
      verbose: true
    }))
    .pipe(webp())
    .pipe(gulp.dest(distPaths.images));
});

gulp.task('dist-favicon', ['dist-clean'], () => {
  return gulp.src(buildPaths.root + 'favicon.ico')
    .pipe(gulp.dest(distPaths.root));
});

gulp.task('dist-fonts', ['dist-clean'], () => {
  return gulp.src(buildPaths.fonts +'*.{woff,woff2,ttf,eot,svg}')
    .pipe(gulp.dest(distPaths.fonts));
});

gulp.task('dist-html', ['dist-clean', 'dist-css', 'dist-js'], () => {
  let assets = getAssetFileNames(distPaths.assets);
  return gulp.src(buildPaths.root + '*.html')
    .pipe(replace('main.js', assets.jsFile))
    .pipe(replace('main.css', assets.cssFile))
    .pipe(ext_replace(''))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest(distPaths.root))
    .pipe(sitemap({
      siteUrl: 'https://alexbaker.io'
    }))
    .pipe(gulp.dest(distPaths.root));
});

gulp.task('dist-deploy', shell.task(deployCommands()));

//
// Main tasks
// -------------------------------------------------------------
gulp.task('dev', ['build'], () => {
  gulp.watch(srcPaths.root + '**/*', ['build']);
  gulp.src('build')
    .pipe(server({
      'fallback': 'index.html',
      'fallbackLogic': devPageFallback,
    }));
});

gulp.task('build', [
  'build-templates',
  'build-posts',
  'build-favicon',
  'build-images',
  'build-js',
  'build-sass',
  'build-fonts'
]);

gulp.task('dist', [
  'dist-html',
  'dist-favicon',
  'dist-images',
  'dist-fonts'
]);
