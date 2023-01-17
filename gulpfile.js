require("dotenv").config();
const gulp = require('gulp');
const sassModule = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const browserSyncModule = require('browser-sync').create();
const nodemonModule = require('gulp-nodemon');

const host = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || 80);

function sass() {
    return gulp.src("app/assets/scss/**/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sassModule().on("error", sassModule.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("app/assets/css/"));
};

function browsersync(cb) {
    return browserSyncModule.init({
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
};

function nodemon(cb) {
    var started = false;

    nodemonModule({
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
        setTimeout(() => browserSyncModule.reload({}), 3000);
    }).on("error", (e) => cb("Server failed to start. " + e.message));
};

const watch = gulp.series(sass, function (cb) {
    gulp.watch("app/assets/scss/**/*.scss", sass);

    // Catch and stream changes
    gulp.watch(["app/assets/**/*.*", "!**/*.map", "!app/assets/scss/**"]).on("all", streamFileChanges);
    gulp.watch(["app/views/**/*.*"]).on("all", browserSyncModule.reload);
    cb();
});

function streamFileChanges(event, path) {
    gulp.src(path).pipe(browserSyncModule.stream());
}

module.exports = {
    sass,
    browsersync,
    nodemon,
    watchTask: watch,
    default: gulp.series(nodemon, browsersync, watch)
}