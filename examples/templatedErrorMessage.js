'use strict';

var erroz = require("../lib/index.js");

var NotFoundError = erroz({
    name: "NotFound",
    code: "not-found",
    status: "fail",
    statusCode: 404,
    template: "%resource (%id) not found"
});

throw new NotFoundError({ resource: "User", id: 1 });

/*
 throw new NotFoundError({ resource: "User", id: 1 });
 ^
 NotFound: User (1) not found
 at Object.<anonymous> (/erroz/examples/templatedErrorMessage.js:14:7)
 at Module._compile (module.js:456:26)
 at Object.Module._extensions..js (module.js:474:10)
 at Module.load (module.js:356:32)
 at Function.Module._load (module.js:312:12)
 at Function.Module.runMain (module.js:497:10)
 at startup (node.js:119:16)
 at node.js:902:3
 */