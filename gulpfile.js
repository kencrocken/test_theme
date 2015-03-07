// npm install gulp-util gulp-ruby-sass gulp-autoprefixer gulp-jshint gulp-uglify gulp-image-optimization gulp-rename gulp-concat gulp-notify gulp-connect imagemin-pngquant del browser-sync --save-dev

var gulp         = require('gulp'),
    gutil        = require('gulp-util'),
    sass         = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint       = require('gulp-jshint'),
    uglify       = require('gulp-uglify'),
    imageop      = require('gulp-image-optimization');
    rename       = require('gulp-rename'),
    concat       = require('gulp-concat'),
    notify       = require('gulp-notify'),
    pngquant     = require('imagemin-pngquant'),
    del          = require('del'),
    browserSync  = require('browser-sync'),
    connect      = require('gulp-connect');

var format = ['./src/img/**/*.png','./src/img/**/*.jpg','./src/img/**/*.gif','./src/img/**/*.jpeg'],
    reload = browserSync.reload;


// SASS
gulp.task('sass', function () {
  return sass ('./src/styles/main.scss',
    {
            style: 'expanded',
             loadPath: [
                 './bower_components/bourbon/dist',
                './bower_components/neat/app/assets/stylesheets'
             ]
         }) 
            .on("error", notify.onError(function (error) {
                 return "Error: " + error.message;
             }))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('./dest/styles'))
    .pipe(notify({
      message: "You just got super Sassy!"
    }));;
});


// UGLIFY
gulp.task('js', function() {
  // main app js file
  gulp.src(['./src/scripts/**/*.js' ])
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default'))
  .pipe(concat("main.js"))

  .pipe(gulp.dest('./dest/scripts'))

  // create 1 vendor.js file from all vendor plugin code
    gulp.src([
        './bower_components/jquery/dist/jquery.js',  
        './bower_components/classie/classie.js'    
        ])
    .pipe(concat("vendor.js"))

    .pipe(gulp.dest('./dest/scripts'))
    .pipe( notify({ message: "Javascript is now ugly!"}));
});

//ICONS
gulp.task('icons', function() { 
    return gulp.src('./src/styles/font/**.*') 
        .pipe(gulp.dest('./dest/styles/fonts'))
        .pipe( notify({ message: "You got fonts."}));
});

// IMAGES
gulp.task('images', function(cb) {
    gulp.src(format)
    .pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })
      .on("error", notify.onError(function (error) {
                 return "Error: " + error.message;
        }))) 
    .pipe(gulp.dest('./dest/img')).on('end', cb).on('error', cb)
    .pipe(notify({ message: 'Images task complete' }));
});

// HTML
gulp.task('views', function(){
    gulp.src('./src/*.html')
    .pipe(gulp.dest('./dest'));
});

// SERVER
gulp.task('serve', function(){
    connect.server({ root: 'dest' });
});

// BROWSERSYNC
gulp.task('browser-sync', function(){
    browserSync({
        //proxy
        proxy: "http://localhost:8080",
        //delay
        reloadDelay: 1000
    });
});

// BUILD
gulp.task('build', ['sass', 'js', 'images', 'icons', 'views'],function(){});

// CLEAN
gulp.task('clean', function(cb) {
    del(['./dest/img', './dest/scripts', './dest/styles'], cb)
});

// BUILD and RELOAD
gulp.task('site-reload', ['build'], function(){
    gulp.start(reload);
});

// WATCH - on change; complie, build, reload
gulp.task('watch', function() {

  // Watch .scss files
    gulp.watch('./src/styles/**/*.scss', ['sass', 'site-reload']);

  // Watch .js files
    gulp.watch('./src/scripts/**/*.js', ['js', 'site-reload']);

  // Watch image files
    gulp.watch('./src/images/**/*', ['images', 'site-reload']);

  // Watch view files
    gulp.watch('./src/*.html', ['views','site-reload']);

});

// DEFAULT
gulp.task('default', ['clean'], function() {
    gulp.start('build');
    gulp.start('serve');
    gulp.start('browser-sync', 'watch');
});
