## erroz

Erroz ramazotti the way you like it.

Create abstract errors which render speaking error-messages and contain useful meta-data like http-status-codes to be used for your api-happiness.

### Usage

```javascript

var erroz = require("erroz");

var DuplicateError = erroz({
    name: "Duplicate",
    statusCode: 409,
    code: "duplicate",
    message: "'%s' with id '%s' already exists."
});

throw new DuplicateError("User", 1);
```

```
/example/example.js:33
 throw new DuplicateError("User", 1);
       ^
 Duplicate: 'User' with id '1' already exists.
     at Object.<anonymous> (example/example.js:39:7)
     at Module._compile (module.js:456:26)
     at Object.Module._extensions..js (module.js:474:10)
     at Module.load (module.js:356:32)
     at Function.Module._load (module.js:312:12)
     at Function.Module.runMain (module.js:497:10)
     at startup (node.js:119:16)
     at node.js:902:3
```

### Predefined Errors

Erroz ships with predefined errors. You can include them all at once, or individually.

```javascript
var erroz = require("erroz");

//all errors
var errors = require("erroz/errors"),
    DuplicateError = erroz(errors.duplicate);

 //specific error
var notFound = require("errorz/errors/notFound"),
    NotFoundError = erroz(notFound);
```
