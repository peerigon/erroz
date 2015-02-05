"use strict";

var erroz = require("../lib");

//provide a custom `toJSON` method for all inherited errors
erroz.AbstractError.prototype.toJSON = function() {
    return {
        name: this.name,
        code: this.code
    };
};

var DuplicateError = erroz({
    name: "Duplicate",
    code: "duplicate",
    status: "fail",
    statusCode: 409,
    template: "Resource %resource (%id) already exists"
});

var err = new DuplicateError({ resource: "Unicorn", id: 1 });

console.log(JSON.stringify(err));

/*
 {
    "name": "Duplicate",
    "code": "duplicate"
 }
 */