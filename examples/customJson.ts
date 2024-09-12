import { erroz } from "../src/main";

erroz.options.toJSON = function () {
  return {
    name: this.name,
    code: this.code,
  };
};

const DuplicateError = erroz({
  name: "Duplicate",
  code: "duplicate",
  statusCode: 409,
  template: "Resource %resource (%id) already exists",
});

const err = new DuplicateError({ resource: "Unicorn", id: 1 });

console.log(JSON.stringify(err));

/*
 {
    "name": "Duplicate",
    "code": "duplicate"
 }
 */
