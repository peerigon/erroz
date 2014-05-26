'use strict';

var erroz = require("../lib/index.js");

var errors = {
    "Duplicate": {
        name: "Duplicate",
        statusCode: 409,
        code: "duplicate",
        message: "'%s' with id '%s' already exists."
    },
    "NotFound": {
        name: "NotFound",
        statusCode: 404,
        code: "not-found",
        message: "'%s' with id %s does not exist."
    },
    "InvalidFields": {
        name: "InvalidFields",
        statusCode: 400,
        code: "invalid-fields",
        message: "Invalid fields: %s."
    }
};

/**
 * Generate error classes based on AbstractError
 */
var DuplicateError = erroz(errors.Duplicate),
    NotFoundError = erroz(errors.NotFound),
    InavalidFieldsError = erroz(errors.InvalidFields);

throw new DuplicateError("User", 1);







