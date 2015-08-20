var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var reactify = require('reactify');
var babelify = require('babelify');
var watchify = require('watchify');
var notify = require('gulp-notify');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var less = require('gulp-less');
var del = require('del');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var runSequence = require('run-sequence');
var concat = require('gulp-concat');
var gulpif = require('gulp-if');

var path = {
  src: {
    styles: 'src/less/styles.less',
    less: 'src/less/**/*.less',
    scripts: 'src/scripts/**/.js',
    scriptsDir: 'src/scripts/',
    html: 'src/*.html',
    parts: 'src/parts/**/*.html'
  },
  dist: {
    dir: 'public/',
    html: 'public/*.html',
    scripts: 'public/scripts/',
    styles: 'public/styles/',
    fonts: 'public/fonts/'
  }
};

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

function buildScript(file, watch) {
  var props = {
    entries: [path.src.scriptsDir + file],
    debug: true,
    transform: [babelify.configure({
      stage: 1,
      optional: ['runtime']
    }), reactify]
  };

  // watchify() if watch requested, otherwise run browserify() once
  var bundler = watch ? watchify(browserify(props)) : browserify(props);

  function rebundle() {
    var stream = bundler.bundle();
    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(gulp.dest(path.dist.scripts))
      .pipe(reload({stream: true}));
  }

  // listen for an update and run rebundle
  bundler.on('update', function () {
    rebundle();
    gutil.log('Rebundle...');
  });

  // run it once the first time buildScript is called
  return rebundle();
}

// Scripts one build
gulp.task('scripts:once', function () {
  return buildScript('app.js', false);
});

// Scripts - watch
gulp.task('scripts', function () {
  return buildScript('app.js', true);
});

// Fonts
gulp.task('fonts', function () {
  return gulp.src([
    'node_modules/font-awesome/fonts/*.*'
  ])
    .pipe(gulp.dest(path.dist.fonts))
    .pipe(reload({stream: true}));
});

// Pages
gulp.task('html', function () {
  return gulp.src(path.dist.html)
    .pipe(reload({stream: true}));
});

// Styles
gulp.task('styles', function () {
  return gulp.src(path.src.styles)
    .pipe(plumber())
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(concat('styles.css'))
    .pipe(gulp.dest(path.dist.styles))
    .pipe(reload({stream: true}));
});

// Static server
gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: path.dist.dir
    }
  });
});

// Default task
gulp.task('default', function (cb) {
  runSequence(['styles', 'html', 'scripts', 'fonts'], ['watch', 'browser-sync'], cb);
});

// public task
gulp.task('build', ['styles', 'html', 'scripts:once']);

// Watch
gulp.task('watch', function () {
  gulp.watch(path.src.less, ['styles']);
  gulp.watch(path.dist.html, ['html']);
});
