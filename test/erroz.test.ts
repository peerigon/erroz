import packageJson from "../package.json";
import {AbstractError} from "../src/AbstractError";
// eslint-disable-next-line import/no-dynamic-require
const erroz = require(packageJson.main);

describe("erroz", () => {
    it("is a function", () => {
        expect(typeof erroz).toBe("function");
    });
    describe("when being called with the minimum set of required arguments", () => {
        let ExampleError;

        beforeEach(() => {
            ExampleError = erroz({
                name: "ExampleError",
                code: "example",
                statusCode: 409,
                template: "Resource %resource (%id) already exists",
            });
        });

        it("returns an instance of AbstractError", () => {
            expect(ExampleError);
        });
    });
});
