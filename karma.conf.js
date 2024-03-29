// Karma configuration
// Generated on Mon Dec 02 2019 13:07:50 GMT-0500 (Eastern Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine-jquery", "jasmine-ajax", "jasmine", "requirejs"],


    // list of files / patterns to load in the browser
    files: [
        {pattern: 'dist/lib/**/*.js', included: true},
        {pattern: 'src/Connector/*.js', included: false},
        {pattern: 'src/Adapters/HPDS/*.js', included: false},
        {pattern: 'test/tests/*.js', included: false},
        'test/test-main.js'
    ],

      // list of files / patterns to exclude
      exclude: [
          'dist/lib/RequireJS/*.js',
          'dist/lib/jQuery/*.js'
      ],


    plugins: [
        require('karma-jasmine-ajax'),
        require('karma-jasmine-jquery'),
        require('karma-jasmine'),
        require('karma-requirejs'),
        require('karma-chrome-launcher'),
        require('karma-edge-launcher'),
        require('karma-firefox-launcher'),
        require('karma-summary-reporter'),
        require('karma-notify-reporter')
    ],

    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress', 'notify', 'summary'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'summary'],
    summaryReporter: {
        // 'failed', 'skipped' or 'all'
        show: 'all',
        // Limit the spec label to this length
        specLength: 80,
        // Show an 'all' column as a summary
        overviewColumn: true
    },

    notifyReporter: {
        reportEachFailure: true, // Default: false, will notify on every failed sepc
        reportSuccess: true // Default: true, will notify when a suite was successful
    },

    notificationMode: 'always',


    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing build whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox'],
    // browsers: ['Chrome', 'Firefox', 'Edge'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the build and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: (Math.ceil(require('os').cpus().length / 2))
  })
};
