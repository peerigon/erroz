"use strict";

/**
 * Custom error classes.
 * Each of the classes specified below will abstract from a common
 * AbstractError class, as described in this article:
 * http://dustinsenos.com/articles/customErrorsInNode
 */

var util = require("util");

/**
 * AbstractError
 */
function AbstractError(constr) {
    Error.captureStackTrace(this, constr || this);
}
util.inherits(AbstractError, Error);
AbstractError.prototype.name = "AbstractError";

module.exports = AbstractError;