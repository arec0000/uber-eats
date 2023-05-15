import fs from 'fs';
import gulp from 'gulp';
import clean from 'gulp-clean';
import concat from 'gulp-concat';
import newer from 'gulp-newer';
import BrowserSync from 'browser-sync';

import dartSass from 'sass';
import gulpScss from 'gulp-sass';
import autoPrefixer from 'gulp-autoprefixer';

import htmlmin from 'gulp-htmlmin';

import avif from 'gulp-avif';
import webp from 'gulp-webp';
import imagemin from 'gulp-imagemin';

import fonter from 'gulp-fonter';
import ttf2woff2 from 'gulp-ttf2woff2';

const { src, dest, watch, parallel, series } = gulp;
const scss = gulpScss(dartSass);
const browserSync = BrowserSync.create();

const cleanDist = () => {
  if (fs.existsSync('dist')) {
    return src('dist', { read: false }).pipe(clean());
  }
  return Promise.resolve();
}

const html = () => (
  src('src/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('dist'))
)

const styles = () => (
  src('src/scss/style.scss')
    .pipe(autoPrefixer({ overrideBrowserslist: ['last 10 version'] }))
    .pipe(concat('style.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream())
);

const images = () => (
  src(['src/images/**/*.*', '!src/images/**/*.svg'])
    .pipe(newer('dist/images'))
    .pipe(avif({ quality: 50 }))

    .pipe(src('src/images/**/*.*'))
    .pipe(newer('dist/images'))
    .pipe(webp())

    .pipe(src('src/images/**/*.*'))
    .pipe(newer('dist/images'))
    .pipe(imagemin())

    .pipe(dest('dist/images/'))
);

const fonts = () => (
  src('src/fonts/**/*.*')
    .pipe(fonter({
      formats: ['woff', 'ttf']
    }))

    .pipe(src('dist/fonts/**/*.*'))
    .pipe(ttf2woff2())

    .pipe(dest('dist/fonts'))
);

const watching = () => {
  browserSync.init({
    server: { baseDir: 'dist/' }
  });

  watch(['src/*.html'], html).on('change', browserSync.reload);
  watch(['src/images'], images);
  watch(['src/scss/*.scss'], styles);
  watch(['src/fonts/**/'], fonts);
}

export const dev = parallel(html, styles, images, fonts, watching);

export const build = series(cleanDist, html, styles, images, fonts);
