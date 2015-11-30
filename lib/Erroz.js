"use strict";

/**
 * Custom error classes.
 * Each of the classes specified below will abstract from a common
 * Erroz class, as described in this article:
 * http://dustinsenos.com/articles/customErrorsInNode
 */

var util = require("util");

/**
 * ErrozError
 */
function Erroz(constr) {
    Error.captureStackTrace(this, constr || this);
}
util.inherits(Erroz, Error);
Erroz.prototype.name = "Erroz";

module.exports = Erroz;