"use strict";

var http = require("http"),
    erroz = require("../lib/index.js");

var NotFoundError = erroz({
    name: "NotFound",
    code: "not-found",
    status: "fail",
    statusCode: 404,
    template: "<%= resource %> (<%= id %>) not found"
});

http.createServer(function (req, res) {

    var err = new NotFoundError({ resource: "User", id: 1 });

    res.writeHead(err.statusCode, {"Content-Type": "application/json"});

    res.end(JSON.stringify(err));
    //returns jsend-style JSON
    /*
     {
        status: "fail",
        code: "not-found",
        message: "User (1) not found",
        data: {
            resource: "User",
            id: 1,
            stack: "NotFound: User (1) not found at Server.<anonymous>
                    (/erroz/examples/httpError.js:16:15)
                    at Server.EventEmitter.emit (events.js:98:17)
                    at HTTPParser.parser.onIncoming (http.js:2108:12)
                    at HTTPParser.parserOnHeadersComplete [as onHeadersComplete] (http.js:121:23)
                    at Socket.socket.ondata (http.js:1966:22)
                    at TCP.onread (net.js:527:27)"
            }
     }
     */


}).listen(1337, "127.0.0.1");
console.log("Server running at http://127.0.0.1:1337/");