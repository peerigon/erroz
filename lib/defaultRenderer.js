"use strict";

/**
 * replaces all %placeHolder with data.placeHolder
 *
 * @param {String} template
 * @param {Object} data
 * @returns {String}
 */
function defaultRenderer(template, data) {
    return template.replace(/%\w+/g, function (match) {
        return data[match.slice(1)];
    });
}

module.exports = defaultRenderer