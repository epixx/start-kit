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
const ghPages = require('gh-pages');
const path = require('path');

function html() {
  return src(dir.src + '*.html')
    .pipe(plumber())
    .pipe(dest(dir.build));
}
exports.html = html;

function styles() {
  return src(dir.src + 'scss/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: ['last 2 version']}),
    ]))
    .pipe(sourcemaps.write('/'))
    .pipe(dest(dir.build + 'css/'))
    .pipe(browserSync.stream());
}
exports.styles = styles;

function script() {
  return src(dir.src + 'js/*.js')
    .pipe(plumber())
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('script.min.js'))
    .pipe(dest(dir.build + 'js/'))
}
exports.script = script;

function scriptsVendors() {
  return src([
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/slick-carousel/slick/slick.min.js',
      'node_modules/svg4everybody/dist/svg4everybody.min.js'
    ])
    .pipe(concat('vendors.min.js'))
    .pipe(dest(dir.build + 'js/'))
}

function images() {
  return src(dir.src + 'img/*.{jpg,jpeg,png,svg,webp,gif}')
    .pipe(dest(dir.build + 'img/'));
}
exports.images = images;

function fonts() {
  return src(dir.src + 'fonts/*.{ttf,eot,svg,woff,woff2}')
    .pipe(dest(dir.build + 'fonts/'));
}
exports.fonts = fonts;

function clean() {
  return del(dir.build)
}
exports.clean = clean;

function deploy(cb) {
  ghPages.publish(path.join(process.cwd(), './build'), cb);
}
exports.deploy = deploy;

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
  ], styles);
  watch(dir.src + '*.html', html);
  watch(dir.src + '*js/*.js', script);
  watch(dir.src + 'img/*.{jpg,jpeg,png,svg,webp,gif}', images);
  watch([
    dir.build + '*.html',
    dir.build + 'js/*.js',
    dir.build + 'img/*.{jpg,jpeg,png,svg,webp,gif}',
  ]).on('change', browserSync.reload);
}

exports.default = series(
  clean,
  parallel(styles, html, script, scriptsVendors, images, fonts),
  serve
);
