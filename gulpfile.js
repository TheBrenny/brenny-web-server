require("dotenv").config();
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const nodemon = require('gulp-nodemon');

const host = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || 80);

gulp.task("sass", function () {
    return gulp.src("app/assets/scss/**/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("app/assets/css/"));
});

gulp.task("browserSync", function (cb) {
    return browserSync.init({
        injectChanges: true,
        proxy: "http://" + host + "/",
        open: false,
        port: port + 1,
        snippetOptions: {
            rule: {
                match: /<\/head>/i,
                fn: function (snippet, match) {
                    return snippet.replace('id=', `nonce="browsersync" id=`) + match;
                }
            }
        }
    }, cb);
});

gulp.task("nodemon", function (cb) {
    var started = false;

    nodemon({
        script: 'server.js',
        exec: "node --trace-warnings --inspect=9229",
        env: {
            "NODE_ENV": 'development',
            "HOST": host,
            "PORT": port
        },
        watch: ["*.js", "app/routes/"],
        ignore: ["app/assets/js/", "gulpfile.js"]
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if(!started) {
            started = true;
            console.log("Nodemon started.");
            setTimeout(cb, 3000);
        }
    }).on('restart', function (...args) {
        setTimeout(() => browserSync.reload({}), 3000);
    }).on("error", (e) => cb("Server failed to start. " + e.message));
});

gulp.task("watch", gulp.series("sass", function (cb) {
    gulp.watch("app/assets/scss/**/*.scss", gulp.series("sass"));

    // Catch and stream changes
    gulp.watch(["app/assets/**/*.*", "!**/*.map", "!app/assets/scss/**"]).on("all", streamFileChanges);
    gulp.watch(["app/views/**/*.*"]).on("all", browserSync.reload);
    cb();
}));

function streamFileChanges(event, path) {
    gulp.src(path).pipe(browserSync.stream());
}

gulp.task("default", gulp.series("nodemon", "browserSync", "watch"));