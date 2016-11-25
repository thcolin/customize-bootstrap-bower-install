var gulp      = require('gulp');

var bower     = require('main-bower-files');
var merge     = require('merge2');
var filter    = require('gulp-filter');

var importify = require('gulp-less-import');
var less      = require('gulp-less');

var print     = require('gulp-print');
var plumber   = require('gulp-plumber');

gulp.task('bootstrap', function(){
  return merge(
      gulp.src(bower({group: 'bootstrap'}))
        // We filter to only get bootstrap less file defined in our overrides
        .pipe(filter('**/*.less')),
      // The path to the variables.less depend on your app structure
      gulp.src('./assets/style/variables.less')
    )
    .pipe(print())
    .pipe(plumber())
    .pipe(importify('bootstrap.css'))
    .pipe(less())
    // Set the destination you want !
    .pipe(gulp.dest('./dist/style'));
});
