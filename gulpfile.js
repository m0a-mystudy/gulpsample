var gulp      = require('gulp');
var util       = require('gulp-util');


/* Application server */
var server = null;

/* ----------------------------------------------------------------------------
 * Overrides
 * ------------------------------------------------------------------------- */

/*
 * Override gulp.src() for nicer error handling.
 */
var src = gulp.src;
gulp.src = function() {
  return src.apply(gulp, arguments)
    .pipe(plumber(function(error) {
      util.log(util.colors.red(
        'Error (' + error.plugin + '): ' + error.message
      ));
      notifier.notify({
        title: 'Error (' + error.plugin + ')',
        message: error.message.split('\n')[0]
      });
      this.emit('end');
    })
  );
};


/* ----------------------------------------------------------------------------
 * Application server
 * ------------------------------------------------------------------------- */

/*
 * Build application server.
 */
gulp.task('server:build', function() {
  var build = child.spawnSync('go', ['build','-o','serverbin']);
  if (build.stderr.length) {
    var lines = build.stderr.toString()
      .split('\n').filter(function(line) {
        return line.length
      });
    for (var l in lines)
      util.log(util.colors.red(
        'Error (go build): ' + lines[l]
      ));
    notifier.notify({
      title: 'Error (go build)',
      message: lines
    });
  }
  return build;
});



/*
 * Build application server.
 */
gulp.task('server:build', function() {
  var build = child.spawnSync('go', ['build','-o','serverbin']);
  if (build.stderr.length) {
    var lines = build.stderr.toString()
      .split('\n').filter(function(line) {
        return line.length
      });
    for (var l in lines)
      util.log(util.colors.red(
        'Error (go build): ' + lines[l]
      ));
    notifier.notify({
      title: 'Error (go build)',
      message: lines
    });
  }
  return build;
});

/*
 * Restart application server.
 */
gulp.task('server:spawn', function() {
  if (server)
    server.kill();

  /* Spawn application server */
  server = child.spawn('./serverbin');

  /* Trigger reload upon server start */
  server.stdout.once('data', function() {
    reload.reload('/');
  });

  /* Pretty print server log output */
  server.stdout.on('data', function(data) {
    var lines = data.toString().split('\n')
    for (var l in lines)
      if (lines[l].length)
        util.log(lines[l]);
  });

  /* Print errors to stdout */
  server.stderr.on('data', function(data) {
    process.stdout.write(data.toString());
  });
});

/*
 * Watch source for changes and restart application server.
 */
gulp.task('server:watch', function() {

  /* Restart application server */
  // gulp.watch([
  //   '.views/**/*.tmpl',
  //   'locales/*.json'
  // ], ['server:spawn']);
  //
  /* Rebuild and restart application server */
  gulp.watch([
    '*.go',
  ], sync([
    'server:build',
    'server:spawn'
  ], 'server'));
});

/* ----------------------------------------------------------------------------
 * Interface
 * ------------------------------------------------------------------------- */

/*
 * Build assets and application server.
 */
gulp.task('build', [
  // 'assets:build',
  'server:build'
]);

/*
 * Start asset and server watchdogs and initialize livereload.
 */
gulp.task('watch', [
  // 'assets:build',
  'server:build'
], function() {
  reload.listen();
  return gulp.start([
    // 'assets:watch',
    'server:watch',
    'server:spawn'
  ]);
});

/*
 * Build assets by default.
 */
gulp.task('default', ['build']);
