'use strict';

var erroz = require("../lib/index.js");

var DuplicateError = erroz({
    name: "Duplicate",
    code: "duplicate",
    status: "fail",
    statusCode: 409,
    message: "Resource already exists"
});

throw new DuplicateError();

/*
 throw new DuplicateError();
 ^
 Duplicate: Resource already exists
 at Object.<anonymous> (/erroz/example/staticErrorMessage.js:14:7)
 at Module._compile (module.js:456:26)
 at Object.Module._extensions..js (module.js:474:10)
 at Module.load (module.js:356:32)
 at Function.Module._load (module.js:312:12)
 at Function.Module.runMain (module.js:497:10)
 at startup (node.js:119:16)
 at node.js:902:3
 */