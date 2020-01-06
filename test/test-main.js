
// Get a list of all the test files to include
var tests = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/Spec\.js$/.test(file)) {
            tests.push(file);
        }
    }
}

require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base/',

    // example of using a couple of path translations (paths), to allow us to refer to different library dependencies, without using relative paths
    paths: {
        'PicSure': 'src',
    },

    // example of using a shim, to load non AMD libraries (such as underscore)
    shim: {},

    // dynamically load all test files
    deps: tests,

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});
