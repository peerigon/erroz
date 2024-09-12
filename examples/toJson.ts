import { erroz } from "../src/main";

var DuplicateError = erroz({
  name: "Duplicate",
  code: "duplicate",
  statusCode: 409,
  template: "Resource %resource (%id) already exists",
});

var err = new DuplicateError({ resource: "Unicorn", id: 1 });

console.log(JSON.stringify(err));

/**
 {
    "name":"Duplicate",
    "message":"Resource Unicorn (1) already exists",
    "data":{
        "resource":"Unicorn",
        "id":1
    },
    "statusCode":409,
    "code":"duplicate"
 }
 **/
