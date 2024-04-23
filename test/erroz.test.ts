import { ErrorConfig, Erroz, erroz } from "../src/main";

const errorConfig: ErrorConfig = {
  name: "some-name",
  code: "some-code",
  statusCode: 400,
};

const ogOptions = { ...erroz.options };

describe("erroz", function () {
  let CustomError: ReturnType<typeof erroz>;
  let error: InstanceType<typeof CustomError>;

  beforeEach(() => {
    erroz.options = ogOptions;
    CustomError = erroz(errorConfig);
    error = new CustomError();
  });

  describe("Attributes", function () {
    it("should expose all attributes", function () {
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

    it("should be able to modify attributes via instance", function () {
      error = new CustomError();

      expect(error.statusCode).toEqual(400);

      error.statusCode = 200;

      expect(error.statusCode).toEqual(200);
    });

    it("should be able to modify attributes via static property", function () {
      CustomError.statusCode = 404;

      error = new CustomError();

      expect(error.statusCode).toEqual(404);
    });
  });

  describe("template rendering", function () {
    it("should use message if defined", function () {
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

    it("should use template if defined and render with data", function () {
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

    it("should use template if defined and accept data to be undefined", function () {
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

    it("should not throw if neither template nor message are defined", function () {
      CustomError = erroz({
        name: "some-name",
        message: "some-message",
        statusCode: 210,
        code: "too-fluffy",
      });

      error = new CustomError();

      expect(error.code).toEqual(error.code);
    });

    it("should use a given string as message", function () {
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

    it("should overwrite the default message if an error message as string was passed", function () {
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

  describe("#toJSON", function () {
    it("should contain all custom properties", function () {
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

    it("custom toJSON", function () {
      erroz.options.toJSON = function () {
        return {
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

  describe("#toJSend", function () {
    it("should expose only JSend compatible keys", function () {
      ["status", "message", "code", "data"].forEach((key) => {
        expect(Object.keys(error.toJSend())).toContain(key);
      });
    });

    it("should return status = 'success' if statusCode is 2xx", function () {
      error.statusCode = 201;

      expect(error.toJSend().status).toEqual("success");
    });

    it("should return status = 'fail' if statusCode is 4xx", function () {
      error.statusCode = 404;

      expect(error.toJSend().status).toEqual("fail");
    });

    it("should return status = 'error' if statusCode is 5xx", function () {
      error.statusCode = 500;

      expect(error.toJSend().status).toEqual("error");
    });

    it("should throw an error if the statusCode is not valid for jSend", function () {
      try {
        error.statusCode = 301;

        error.toJSend();
      } catch (error) {
        expect((error as Erroz).message).toEqual(
          "JSend only supports 2xx, 4xx and 5xx as status code"
        );
      }
    });
  });

  describe("options", () => {
    it("should allow global template definition", () => {
      erroz.options.renderMessage = () => "overriden from options";

      const CustomError = erroz({ ...errorConfig, template: "some-template" });
      const error = new CustomError({ key: "value" });

      expect(error.message).toEqual("overriden from options");
    });
  });
});
