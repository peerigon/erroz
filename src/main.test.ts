import { beforeEach, describe, expect, it } from "vitest";
import { erroz, type ErrorConfig } from "./main.ts";

const errorConfig: ErrorConfig = {
  name: "some-name",
  code: "some-code",
  statusCode: 400,
};

const ogOptions = { ...erroz.options };

describe("erroz", () => {
  let CustomError: ReturnType<typeof erroz>;
  let error: InstanceType<typeof CustomError>;

  beforeEach(() => {
    erroz.options = ogOptions;
    CustomError = erroz(errorConfig);
    error = new CustomError();
  });

  describe("Attributes", () => {
    it("should expose all attributes", () => {
      CustomError = erroz({
        name: "some-name",
        code: "some-code",
        statusCode: 400,
      });

      error = new CustomError();

      expect(error.name).toEqual("some-name");
      expect(error.message).toEqual("");
      expect(CustomError.code).toEqual("some-code");
    });

    it("should be able to modify attributes via instance", () => {
      error = new CustomError();

      expect(error.statusCode).toEqual(400);

      error.statusCode = 200;

      expect(error.statusCode).toEqual(200);
    });

    it("should be able to modify attributes via static property", () => {
      CustomError.statusCode = 404;

      error = new CustomError();

      expect(error.statusCode).toEqual(404);
    });
  });

  describe("template rendering", () => {
    it("should use message if defined", () => {
      CustomError = erroz({
        name: "some-name",
        message: "some-message",
        template: "some-template",
        code: "SOME_CODE",
        statusCode: 210,
      });

      error = new CustomError();

      expect(error.message).toEqual(error.message);
    });

    it("should use template if defined and render with data", () => {
      CustomError = erroz({
        name: "some-name",
        message: "some-message",
        code: "SOME_CODE",
        statusCode: 210,
        template: "some-template %fur",
      });

      error = new CustomError({
        fur: "fluffy",
      });

      expect(error.message).toEqual("some-template fluffy");
    });

    it("should use template if defined and accept data to be undefined", () => {
      CustomError = erroz({
        name: "some-name",
        message: "some-message",
        code: "SOME_CODE",
        statusCode: 210,
        template: "yeha %fur",
      });

      error = new CustomError();

      expect(error.message).toEqual("yeha undefined");
    });

    it("should not throw if neither template nor message are defined", () => {
      CustomError = erroz({
        name: "some-name",
        message: "some-message",
        statusCode: 210,
        code: "too-fluffy",
      });

      error = new CustomError();

      expect(error.code).toEqual(error.code);
    });

    it("should use a given string as message", () => {
      CustomError = erroz({
        name: "some-name",
        message: "some-message",
        statusCode: 210,
        code: "too-fluffy",
      });

      error = new CustomError("Not my fault");

      expect(error.code).toEqual(error.code);
      expect(error.message).toEqual("Not my fault");
    });

    it("should overwrite the default message if an error message as string was passed", () => {
      CustomError = erroz({
        name: "some-name",
        statusCode: 210,
        code: "too-fluffy",
        message: "Sooo fluffy",
      });

      error = new CustomError("Not my fault");

      expect(error.code).toEqual(error.code);
      expect(error.message).toEqual("Not my fault");
    });
  });

  describe("#toJSON", () => {
    it("should contain all custom properties", () => {
      error = new CustomError();

      const jsonified = JSON.stringify(error);

      expect(JSON.parse(jsonified)).toEqual({
        name: "some-name",
        code: "some-code",
        message: "",
        statusCode: 400,
        data: {},
      });
    });

    it("custom toJSON", () => {
      erroz.options.toJSON = function () {
        return {
          // eslint-disable-next-line unicorn/no-this-outside-of-class -- bound to error instance in constructor
          name: this.name,
        };
      };

      error = new CustomError();

      const jsonified = JSON.stringify(error);

      expect(JSON.parse(jsonified)).toEqual({
        name: "some-name",
      });
    });
  });

  describe("#toJSend", () => {
    it("should expose only JSend compatible keys", () => {
      ["status", "message", "code", "data"].forEach((key) => {
        expect(Object.keys(error.toJSend())).toContain(key);
      });
    });

    it("should return status = 'success' if statusCode is 2xx", () => {
      error.statusCode = 201;

      expect(error.toJSend().status).toEqual("success");
    });

    it("should return status = 'fail' if statusCode is 4xx", () => {
      error.statusCode = 404;

      expect(error.toJSend().status).toEqual("fail");
    });

    it("should return status = 'error' if statusCode is 5xx", () => {
      error.statusCode = 500;

      expect(error.toJSend().status).toEqual("error");
    });

    it("should throw an error if the statusCode is not valid for jSend", () => {
      error.statusCode = 301;

      expect(() => error.toJSend()).toThrow(
        "JSend only supports 2xx, 4xx and 5xx as status code",
      );
    });
  });

  describe("options", () => {
    it("should allow global template definition", () => {
      erroz.options.renderMessage = () => "overriden from options";

      const TemplateError = erroz({
        ...errorConfig,
        template: "some-template",
      });
      const templateError = new TemplateError({ key: "value" });

      expect(templateError.message).toEqual("overriden from options");
    });
  });

  describe("stack trace", () => {
    it("should expose the call site without leaking the AbstractError frame", () => {
      const createErrorAtKnownSite = () => new CustomError();

      const { stack } = createErrorAtKnownSite();

      // `Error.prototype.stack` is non-standard; only assert when the engine
      // provides it (it does on V8, SpiderMonkey and JavaScriptCore).
      if (stack === undefined) {
        return;
      }

      // The call site must be discoverable in the trace regardless of the
      // engine's stack format.
      expect(stack).toContain("createErrorAtKnownSite");

      // The AbstractError base constructor frame must never leak into the
      // trace. On V8 this is what `Error.captureStackTrace(this, AbstractError)`
      // guarantees; on engines using a different stack format the V8-style
      // frame simply never appears, so the assertion stays valid.
      expect(stack).not.toMatch(/\bat new AbstractError\b/);
    });
  });
});
