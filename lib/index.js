"use strict";

var util = require("util");

var AbstractError = require("./AbstractError.js");

/**
 * generate Error-classes based on AbstractError
 *
 * @param error
 * @returns {Function}
 */
function erroz(error) {

    var errorFn = function () {
        //we pass the args on to util.format to render the message
        var args = Array.prototype.slice.call(arguments);

        if (args.length > 0) {
            args.unshift(error.message);
            this.message = util.format.apply(this, args);
        }

        errorFn.super_.call(this, this.constructor);
    };

    util.inherits(errorFn, AbstractError);

    //add error properties
    errorFn.prototype.name = error.name;
    errorFn.prototype.statusCode = error.statusCode;
    errorFn.prototype.code = error.code;
    errorFn.prototype.message = error.message;

    return errorFn;
}

module.exports = erroz;