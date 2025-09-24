const { src, dest, watch, parallel } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const avif = require('gulp-avif');
const webp = require('gulp-webp'); // конвертирует картинки в webp
const imagemin = require('gulp-imagemin'); // минимизирует картинки

function styles() {
    return src('app/scss/style.scss')
        .pipe(concat('style.min.css'))
        .pipe(scss({
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

// конвертация картинок
function images() {
    return src(['app/images/src/**/*.*', '!app/images/src/*.svg'])
    .pipe(newer('app/images'))
    .pipe(avif({quality : 50}))

    .pipe(src('app/images/src/**/*.*')) // путь к орегиналам, чтобы не пытался перевести с avif в webp
    .pipe(newer('app/images'))
    .pipe(webp())

    .pipe(src('app/images/src/**/*.*')) // тут тоже нужны оригиналы
    .pipe(newer('app/images')) 
    .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
  ])) 

    .pipe(dest('app/images'))
} 

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream());
}

function htmlInclude() {
    return src('app/html/pages/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest('app'))
        .pipe(browserSync.stream());
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        notify: false
    })
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch('app/html/**/*.html', htmlInclude);
}

exports.styles = styles
exports.scripts = scripts
exports.watching = watching
exports.browsersync = browsersync
exports.htmlInclude = htmlInclude
exports.default = parallel(styles, scripts, watching, browsersync, htmlInclude)
