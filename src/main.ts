import { AbstractError } from "./AbstractError";
import { defaultRenderer } from "./defaultRenderer";
import { deriveStatusFromStatusCode } from "./lib";

export type ErrorConfig = {
  name: string;
  message?: string;
  code: string;
  statusCode: number;
  template?: string;
};

export type ErrorData = Record<
  string,
  string | number | boolean | null | undefined
>;
export type ErrozOptions = {
  renderMessage: (template: string, data: ErrorData) => string;
  includeStack: boolean;
  toJSON: (this: Erroz) => any;
};

type ErrozFunc = {
  (errorConfig: ErrorConfig): ReturnType<typeof makeError>;
  options: ErrozOptions;
};

export type Status = "success" | "fail" | "error";

const makeError = (errorConfig: ErrorConfig) => {
  class Erroz extends AbstractError {
    data: ErrorData;

    statusCode: number;
    code: string;

    toJSON: () => any;

    static statusCode: number;
    static code: string;

    constructor(data?: ErrorData | string | undefined) {
      super();

      this.name = errorConfig.name;

      if (typeof data === "string") {
        this.message = data;
        this.data = {};
      } else {
        this.message = errorConfig.message ?? "";
        this.data = data ?? {};
      }

      this.message = errorConfig.template
        ? erroz.options.renderMessage(errorConfig.template || "", this.data)
        : this.message;

      this.statusCode = Erroz.statusCode;
      this.code = Erroz.code;
      this.toJSON = erroz.options.toJSON.bind(this);
    }

    toJSend() {
      let data = this.data as Record<string, string>;

      if (erroz.options.includeStack && this.stack) {
        data.stack = this.stack;
      }

      return {
        status: deriveStatusFromStatusCode(this.statusCode),
        code: this.code,
        message: this.message,
        data: data,
      };
    }
  }

  Erroz.code = errorConfig.code;
  Erroz.statusCode = errorConfig.statusCode;

  return Erroz;
};

export const erroz: ErrozFunc = (errorConfig: ErrorConfig) =>
  makeError(errorConfig);

export { AbstractError } from "./AbstractError";

export type Erroz = InstanceType<ReturnType<typeof erroz>>;

erroz.options = {
  renderMessage: defaultRenderer,
  includeStack: true,
  toJSON: function () {
    return this;
  },
};
