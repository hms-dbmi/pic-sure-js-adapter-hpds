/**
 * Created by nbeni on 5/17/2019.
 */
// NodeJS webserver for testing

const PORT = 8686;

var serveStatic = require('serve-static');
var proxy = require('http-proxy-middleware');
var connect = require('connect');
var path = require('path');

var configuration = {
    endpoint: false,
    token: false,
}

var app = connect();
var relayProxy = proxy("/~proxy", {
    target: "http://localhost/",
    pathRewrite: {'^/~proxy': '/'}
});

// restrict serving of files to browsers on the local machine
app.use(function(req, res, next){
    if (req.connection.remoteAddress === "::1" || req.connection.remoteAddress === "::ffff:127.0.0.1") {
        next();
    } else {
        next(new Error("NON-LOCAL ACCESS ATTEMPT FROM " + req.connection.remoteAddress));
    }
});

// handle proxy for machine to PIC-SURE endpoint
app.use(function(req, res, next){
    relayProxy(req, res, next);
});


// handle API calls to configure the local proxy server
app.use((req, res, next) => {
    switch (req.originalUrl) {
        case "/.well-known/PIC-SURE/proxy_API/config":
            if (req.method == "GET") {
                console.warn("return the current configuration information");
                res.writeHead(200, {'Content-Type':'application/json'});
                res.end(JSON.stringify(configuration));

            } else if (req.method == "POST") {
                console.warn("save the given configuration information");
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString(); // convert Buffer to string
                });
                req.on('end', () => {
                    // save info
                    var temp = JSON.parse(body);
                    if (typeof(temp.endpoint) !== 'undefined') {
                        temp.endpoint = temp.endpoint.trim();
                        if (temp.endpoint.endsWith('/')) {
                            configuration.endpoint = temp.endpoint;
                        } else {
                            configuration.endpoint = temp.endpoint + '/';
                        }
                    }
                    configuration.proxy = "http://" +req.headers.host + "/~proxy"
                    if (typeof(temp.token) !== 'undefined') configuration.token = temp.token;
                    // reinitialize the proxy component
                    relayProxy = proxy("/~proxy", {
                        target: configuration.endpoint,
                        pathRewrite: {'^/~proxy': '/'}
                    });
                    res.end('{"error": "False"}');
                });
            }
            break;
        default:
            next();
    }
});


// serve static content from tests directory
app.use(serveStatic(__dirname));
// also serve static content from 'js' subdirectories
app.use(serveStatic(path.normalize(__dirname + "//..//js//lib//")));
app.use(serveStatic(path.normalize(__dirname + "//..//js//src//")));
app.use(serveStatic(path.normalize(__dirname + "//..//js//src-connector//")));


// start server
app.listen(PORT, function(){
    console.log('Server running at http://localhost:'+String(PORT));
});
