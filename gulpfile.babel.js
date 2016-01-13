/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import gulp from 'gulp';
import gutil from 'gulp-util';
import browserify from 'browserify';
import babelify from 'babelify';
import watchify from 'watchify';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import autoprefixer from 'gulp-autoprefixer';
import less from 'gulp-less';
import runSequence from 'run-sequence';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import envify from 'envify/custom';

const path = {
  src: {
    styles: 'src/less/styles.less',
    less: 'src/less/**/*.less',
    scripts: 'src/scripts/**/.js',
    scriptsDir: 'src/scripts/',
    html: 'src/*.html',
    images: 'src/images/**/*.*',
    parts: 'src/parts/**/*.html'
  },
  dist: {
    dir: 'public/',
    html: 'public/*.html',
    images: 'public/images/',
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

function buildScript(file, shouldWatch) {
  var debugBuild = (process.env.NODE_ENV !== 'production');

  var props = {
    entries: [path.src.scriptsDir + file],
    debug: debugBuild,
    cache: {}, packageCache: {},
    fullPaths: debugBuild, // Requirement of watchify
    transform: [
      babelify.configure({
        stage: 0,
        compact: true,
        optional: ['runtime', 'es7.functionBind', 'es7.classProperties', 'es7.decorators'],
        sourceMaps: true
      }),
      envify(process.env)
    ]
  };

  // watchify() if watch requested, otherwise run browserify() once
  var bundler = shouldWatch ? watchify(browserify(props)) : browserify(props);

  function rebundle() {
    var stream = bundler
      .bundle()
      .on('error', handleErrors)
      .pipe(source(file));

    if (!shouldWatch && !debugBuild) {
      stream = stream
        .pipe(buffer())
        .pipe(uglify());
    }

    return stream
      .pipe(gulp.dest(path.dist.scripts));
  }

  // listen for an update and run rebundle
  bundler.on('update', () => {
    rebundle();
    gutil.log('Rebundle...');
  });

  // run it once the first time buildScript is called
  return rebundle();
}

// Scripts one build
gulp.task('scripts:once', () => {
  return buildScript('app.js', false);
});

// Scripts - watch
gulp.task('scripts', () => {
  return buildScript('app.js', true);
});

// Fonts
gulp.task('fonts', () => {
  return gulp.src([
    'node_modules/font-awesome/fonts/*.*'
  ])
    .pipe(gulp.dest(path.dist.fonts));
});

// Images
gulp.task('images', () => {
  return gulp.src(path.src.images)
    .pipe(gulp.dest(path.dist.images));
});

// Pages
gulp.task('html', () => {
  return gulp.src(path.dist.html);
});

// Styles
gulp.task('styles', () => {
  return gulp.src(path.src.styles)
    .pipe(plumber())
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(concat('styles.css'))
    .pipe(gulp.dest(path.dist.styles));
});

// Default task
gulp.task('default', (cb) => {
  runSequence(['styles', 'html', 'images', 'scripts', 'fonts'], ['watch'], cb);
});

gulp.task('set-prod-node-env', () => {
    return process.env.NODE_ENV = 'production';
});

gulp.task('build', ['styles', 'html', 'images', 'scripts:once', 'fonts']);

// production task
gulp.task('production', (cb) => {
  runSequence(['set-prod-node-env'],  ['styles', 'html', 'images', 'scripts:once', 'fonts'], cb);
});

// Watch
gulp.task('watch', () => {
  gulp.watch(path.src.less, ['styles']);
  gulp.watch(path.dist.html, ['html']);
  gulp.watch(path.src.images, ['images']);
});
