"use strict";

const gulp = require("gulp");
const { series, parallel } = require("gulp");
const plumber = require("gulp-plumber");
const del = require("del");
const eslint = require("gulp-eslint");

// const uglify = require("gulp-uglify");
const rename = require("gulp-rename");

//const sourcemaps = require("gulp-sourcemaps");
//const transpile  = require('gulp-es6-module-transpiler');

// const webpack = require("webpack");
// const webpackconfig = require("./webpack.config.Adapters");
// const webpackstream = require("webpack-stream");

const Server = require("karma").Server;



/**
 * Run test once and exit
 */
function test(cb) {
    new Server({
        configFile: __dirname + "/karma.conf.js",
        singleRun: true
    }, cb).start();
}

/**
 * Watch for file changes and re-run tests on each change
 */
function tdd(cb) {
    new Server({
        configFile: __dirname + "/karma.conf.js"
    }, cb).start();
}


function clean() {
    return del(["./dist/*"]);
}


// Lint scripts
function scriptsLint() {
    return gulp
        .src(["./src/Adaptors/HPDS/**/*.js", "./gulpfile.js"])
        .pipe(plumber())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

// Transpile, concatenate and minify scripts
function scripts(cb) { cb(); }



function jsGetDep_requirejs() {
    return (
        gulp
            .src(["./node_modules/requirejs/require.js"])
            .pipe(gulp.dest("./dist/lib/RequireJS"))
    );
}


function jsGetDep_jquery() {
    return (
        gulp
            .src(["./node_modules/jquery/dist/*"])
            .pipe(gulp.dest("./dist/lib/jQuery"))
    );
}

function jsBuildLibrary() {
    return (
        gulp
            .src(["./src/**/*.js"])
//            .pipe(uglify())
            .pipe(rename(
                (path) => {
                    return {
                        dirname: "",
                        basename: path.basename,
                        extname: ".js"
                    };
                }
            ))
            .pipe(gulp.dest("./dist/PIC-SURE/HPDS/"))
    );

}


exports.build = series(
    clean,
    series(scriptsLint, jsBuildLibrary),
    parallel(jsGetDep_jquery, jsGetDep_requirejs),
);

const myjs = gulp.series(scriptsLint, scripts);


exports.clean = clean;
exports.default = tdd;
exports.scripts = myjs;
exports.dependentscripts = gulp.parallel(jsGetDep_jquery, jsGetDep_requirejs);
exports.test = test;
