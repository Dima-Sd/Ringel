const { src, dest, watch, parallel } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

// ===== СТИЛІ =====
function styles() {
    return src('app/scss/style.scss')
        .pipe(concat('style.min.css'))
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

// ===== HTML INCLUDE =====
function htmlInclude() {
    return src('app/html/pages/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest('app'))
        .pipe(browserSync.stream());
}

// ===== КАРТИНКИ =====

function imagesWebp() {
    return src(['app/images/**/*.*', '!app/images/*.svg'])
        .pipe(newer('app/images/webp'))
        .pipe(webp())
        .pipe(dest('app/images/'));
}

function imagesMin() {
    return src(['app/images/**/*.*', '!app/images/*.svg'])
        .pipe(newer('app/images'))
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('app/images'));
}

const images = parallel(imagesWebp, imagesMin);

// ===== BROWSERSYNC =====
function browsersync() {
    browserSync.init({
        server: { baseDir: 'app/' },
        notify: false
    });
}

// ===== WATCH =====
function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch('app/html/**/*.html', htmlInclude);
    watch('app/images/src/**/*.*', images);
}

// ===== ЕКСПОРТИ =====
exports.styles = styles;
exports.htmlInclude = htmlInclude;
exports.images = images;
exports.browsersync = browsersync;
exports.watching = watching;

exports.default = parallel(styles, htmlInclude, images, browsersync, watching);
