const gulp = require('gulp');
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');
const jsonminify = require('gulp-jsonminify');

gulp.task('locale', function () {
  gulp
    .src('./res/locale/**/*.json', { base: './res' })
    .pipe(jsonminify())
    .pipe(gulp.dest('public/assets'));
});

gulp.task('build', function () {
  gulp.start([
    'locale'
  ]);
});

gulp.task('watch:locale', function () {
  gulp
    .src('./res/locale/**/*.json', { base: './res' })
    .pipe(watch('./res/**/*.json'))
    .pipe(plumber())
    .pipe(jsonminify())
    .pipe(gulp.dest('public/assets'));
});

gulp.task('watch', function () {
  gulp.start([
    'watch:locale'
  ]);
});
