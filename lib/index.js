"use strict";

var util = require("util");

var AbstractError = require("./AbstractError.js"),
    defaultRenderer = require("./defaultRenderer.js");

/**
 * generate Error-classes based on AbstractError
 *
 * @param error
 * @returns {Function}
 */
function erroz(error) {

    var errorFn = function (data) {

        for (var errKey in errorFn.prototype) {
            if (errorFn.prototype.hasOwnProperty(errKey)) {
                this[errKey] = errorFn.prototype[errKey];
            }
        }

        //add per instance properties
        this.data = data || {};
        this.message = this.message || erroz.options.renderMessage(error.template, data);

        errorFn.super_.call(this, this.constructor);
    };

    util.inherits(errorFn, AbstractError);

    //add static error properties (name, status, etc)
    for (var errKey in error) {
        if (error.hasOwnProperty(errKey)) {
            errorFn.prototype[errKey] = error[errKey];
        }
    }

    errorFn.prototype.toJSend = function () {
        var data = this.data;

        if(erroz.options.includeStack && this.stack) {
            data.stack = this.stack;
        }

        return {
            status: this.status,
            code: this.code,
            message: this.message,
            data: data
        };
    };

    return errorFn;
}

erroz.options = {
    /**
     * overwrite this function for custom rendered messages
     *
     * @param {Object} data
     * @param {String=} template
     * @returns {String}
     */
    renderMessage: defaultRenderer,
    includeStack: true
};

module.exports = erroz;