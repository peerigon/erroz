# erroz

Descriptive errors through metadata

[![Build Status](https://travis-ci.org/peerigon/erroz.svg?branch=master)](https://travis-ci.org/peerigon/erroz)
[![](https://img.shields.io/npm/v/erroz.svg)](https://www.npmjs.com/package/erroz)
[![](https://img.shields.io/npm/dm/erroz.svg)](https://www.npmjs.com/package/erroz)

Typical strategies of parsing errors are fragile and couple code to the error messages. By defining error objects consistently, working with errors becomes predictable and efficient.

## Features

- arbitrary error metadata
- templated error messages
- stack traces
- [JSend](http://labs.omniti.com/labs/jsend) format errors

## Example

```javascript
var erroz = require("erroz");

var DuplicateError = erroz({
    name: "Duplicate",
    code: "duplicate",
    statusCode: 409,
    template: "Resource %resource (%id) already exists"
});

// ...

throw new DuplicateError({ resource: "Unicorn", id: 1 });

/*
 throw new DuplicateError();
 ^
 Duplicate: Resource Unicorn (1) already exists
 at Object.<anonymous> (/erroz/examples/staticErrorMessage.js:14:7)
 at Module._compile (module.js:456:26)
 at Object.Module._extensions..js (module.js:474:10)
 at Module.load (module.js:356:32)
 at Function.Module._load (module.js:312:12)
 at Function.Module.runMain (module.js:497:10)
 at startup (node.js:119:16)
 at node.js:902:3
 */
```

## Installation

`npm install --save erroz`

## Defining errors

```javascript
var errorDefinition = {
    name: "NotFound",
    template: "%resource (%id) not found"
};

var NotFoundError = erroz(errorDefinition);
```

### errorDefinition _object_

Arbitrary data structure for metadata which will be available on every error instance. Some attributes have a special meaning which is why they are described below: 

#### `name` _string_

The name displayed when the error is thrown.

#### `message` _string_

A static error message.

#### `template` _string_

A dynamic error message. Variable substitution from [the data object](https://github.com/peerigon/erroz#throwing-with-data-object) is done with `%<variable name>`.

## Throwing (with data object)

```javascript
var data = { resource: "Unicorn", id: 1 };
throw new NotFoundError(data);
// Duplicate: Resource Unicorn (1) already exists
```

### data _object_

A set of data to be used with [the `errorDefinition.template` property](https://github.com/peerigon/erroz#template-string).

## Throwing (with error message)

```javascript
var overrideMessage = "You are not authorized to eat my cookies";
throw new ForbiddenError(overrideMessage);
// Forbidden: You are not authorized to eat my cookies
```

### overrideMessage _string_

A message to override `errorDefinition.message` or `errorDefinition.template`. Use of this option will set `error.data` to an empty object.

## JSON

Errors can be converted to JSON with `JSON.stringify()`. 

```javascript 
var err = new DuplicateError({ resource: "Unicorn", id: 1 });
console.log(JSON.stringify(err));

/*
 {
    "name": "Duplicate",
    "code": "duplicate",
    "status": "fail",
    "statusCode": 409,
    "template": "Resource %resource (%id) already exists",
    "data": {
        "resource": "Unicorn",
        "id": 1
    },
    "message": "Resource Unicorn (1) already exists"
 }
 */
```

__Custom JSON format__ 

The `AbstractError.toJSON` method can be defined to customize the JSON format.

```javascript
// Set a custom `toJSON` method for all errors
erroz.AbstractError.prototype.toJSON = function() {
    return {
        name: this.name,
        code: this.code
    };
};

console.log(JSON.stringify(err));
/*
 {
    "name": "Duplicate",
    "code": "duplicate"
 }
 */
```
 
### `error.toJSend()`

Converts the error to a JSend-style object.
The JSend `status` attribute is derived from the statusCode if not passed explicitly. Valid codes are 4xx and 5xx. 
In case of an invalid statusCode, `.toJSend()` will throw an error. 
 
```javascript
var err = new DuplicateError({ resource: "Unicorn", id: 1, status: 409 });

err.toJSend();

/*
 {
    "status": "fail",
    "code": "duplicate",
    "message": "Resource Unicorn (1) already exists",
    "data": {
    	"resource": "Unicorn",
    	"id": 1,
    	"stack": "Duplicate: Resource Unicorn (1) already exists\n    at Object.<anonymous> (/erroz/examples/				  toJson.js:13:11)\n    at Module._compile (module.js:				  456:26)\n    at Object.Module._extensions..js (module.js:474:10)\n    at Module.load 				  (module.js:356:32)\n    at Function.Module._load (module.js:312:12)\n    at 			     Function.Module.runMain (module.js:497:10)\n    at startup (node.js:119:16)\n    at node.js:				  906:3"
    	}
}
*/
```

## Options

### renderMessage _function_

Define a custom error renderer.

```javascript 
erroz.options.renderMessage = function(data, template) {
    return "Ooops";
}
```

### includeStack _boolean_

Whether the stack should be included in errors. Default is true.

```javascript 
erroz.options.includeStack = false;
```

Consider turning this off in production and sending it to a logger instead.

## Pro Tip: Using erroz with Connect / Express error handlers

Define a global error handler which calls `toJSend()` if the error is an instance of `erroz.AbstractError`. 
**why do this?** So you can simply `next` all your errors in your route-handlers.

```javascript
function myAwesomeRoute(req, res, next) {
    if (!req.awesome) {
        next(new NotAwesomeError()); 
        return; 
    }

    next();
}	
```

```javascript
app.use(function errozHandler(err, req, res, next) {
    if (err instanceof erroz.AbstractError) {
        res.status(err.statusCode).send(err.toJSend()); 
        return; 
    } 

    // Pass on all non-erroz errors
    next(err);
});
```

## Licence 

MIT

## Sponsors

[<img src="https://assets.peerigon.com/peerigon/logo/peerigon-logo-flat-spinat.png" width="150" />](https://peerigon.com)
