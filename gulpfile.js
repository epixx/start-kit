'use strict';

const dir =  {
  src: './src/',
  build: './build/',
};

const { series, parallel, src, dest, watch } = require('gulp');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const del = require('del');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const fileinclude = require('gulp-file-include');

function compileHTML() {
  return src(dir.src + '*.html')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true,
    }))
    .pipe(dest(dir.build));
}
exports.compileHTML = compileHTML;

function compileStyles() {
  return src(dir.src + 'scss/style.scss')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
    ]))
    .pipe(sourcemaps.write('/'))
    .pipe(dest(dir.build + 'css/'))
    .pipe(browserSync.stream());
}
exports.compileStyles = compileStyles;

function processJs() {
  return src(dir.src + 'js/script.js')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('script.min.js'))
    .pipe(dest(dir.build + 'js/'))
}
exports.processJs = processJs;

function copyJsVendors() {
  return src([
      'node_modules/svg4everybody/dist/svg4everybody.min.js'
    ])
    .pipe(concat('vendors.min.js'))
    .pipe(dest(dir.build + 'js/'))
}

function copyImages() {
  return src(dir.src + 'img/*.{jpg,jpeg,png,svg,webp,gif}')
    .pipe(dest(dir.build + 'img/'));
}
exports.copyImages = copyImages;

function copyFonts() {
  return src(dir.src + 'fonts/*.{ttf,eot,svg,woff,woff2}')
    .pipe(dest(dir.build + 'fonts/'));
}
exports.copyFonts = copyFonts;

function clean() {
  return del(dir.build)
}
exports.clean = clean;

function serve() {
  browserSync.init({
    server: dir.build,
    startPath: 'index.html',
    open: false,
    port: 8080,
  });
  watch([
    dir.src + 'scss/*.scss',
    dir.src + 'scss/blocks/*.scss',
  ], compileStyles);
  watch([
    dir.src + '*.html',
    dir.src + 'includes/*.html',
  ], compileHTML);
  watch(dir.src + 'js/*.js', processJs);
  watch(dir.src + 'img/*.{jpg,jpeg,png,svg,webp,gif}', copyImages);
  watch([
    dir.build + '*.html',
    dir.build + 'js/*.js',
    dir.build + 'img/*.{jpg,jpeg,png,svg,webp,gif}',
  ]).on('change', browserSync.reload);
}

exports.default = series(
  clean,
  parallel(compileStyles, compileHTML, processJs, copyJsVendors, copyImages, copyFonts),
  serve
);
