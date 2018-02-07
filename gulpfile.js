var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('build', function () {
    return browserify({
        entries: './src/app.ts'
    }).plugin('tsify')
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('./build/js'));
});