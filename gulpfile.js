'use strict';

const { series, parallel, src, dest, watch } = require('gulp');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const del = require('del');

function styles() {
  return src('./scss/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: ['last 2 version']}),
    ]))
    .pipe(sourcemaps.write('/'))
    .pipe(dest('./css/'))
    .pipe(browserSync.stream());
}
exports.styles = styles;

function clean() {
  return del('./css')
}

function serve() {
  browserSync.init({
    server: './',
    startPath: 'index.html',
    open: false,
    port: 8080,
  });
  watch([
    './scss/*.scss',
    './scss/blocks/*.scss',
  ], { delay: 100 }, styles);
  watch('./*.html').on('change', browserSync.reload);
  watch('./js/*.js').on('change', browserSync.reload);
}

exports.default = series(clean, styles, serve);
