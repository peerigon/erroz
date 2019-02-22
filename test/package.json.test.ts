import {resolve} from "path";

describe("package.json", () => {
    const projectFolder = resolve(__dirname, "..");

    describe("main", () => {
        it("points to the main module with the expected shape", () => {
            const packageJson = require(resolve(projectFolder, "package.json"));
            const exports = require(resolve(projectFolder, packageJson.main));

            expect(exports).toMatchInlineSnapshot(`
Object {
  "__esModule": true,
  "default": [Function],
}
`);
        });
    });
});
