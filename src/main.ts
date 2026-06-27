import { AbstractError } from "./AbstractError.ts";
import { defaultRenderer } from "./defaultRenderer.ts";
import { deriveStatusFromStatusCode } from "./lib.ts";

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
  toJSON?: (this: Erroz) => any;
};

export type Status = "success" | "fail" | "error";

export type JSend = {
  status: Status;
  code: string;
  message: string;
  data: Record<string, string>;
};

export type Erroz = AbstractError & {
  data: ErrorData;
  statusCode: number;
  code: string;
  toJSON: () => any;
  toJSend: () => JSend;
};

export type ErrozConstructor = {
  new (data?: ErrorData | string): Erroz;
  statusCode: number;
  code: string;
};

type ErrozFunc = {
  (errorConfig: ErrorConfig): ErrozConstructor;
  options: ErrozOptions;
};

const makeError = (errorConfig: ErrorConfig): ErrozConstructor => {
  class Erroz extends AbstractError {
    data: ErrorData;

    statusCode: number;
    code: string;

    toJSON: () => any;

    static statusCode: number;
    static code: string;

    constructor(data?: ErrorData | string) {
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
      this.toJSON = erroz.options.toJSON
        ? erroz.options.toJSON.bind(this)
        : () => this;
    }

    toJSend(): JSend {
      const data = this.data as Record<string, string>;

      if (erroz.options.includeStack && this.stack) {
        data["stack"] = this.stack;
      }

      return {
        status: deriveStatusFromStatusCode(this.statusCode),
        code: this.code,
        message: this.message,
        data,
      };
    }
  }

  Erroz.code = errorConfig.code;
  Erroz.statusCode = errorConfig.statusCode;

  return Erroz;
};

export const erroz: ErrozFunc = (errorConfig: ErrorConfig) =>
  makeError(errorConfig);

export { AbstractError } from "./AbstractError.ts";

erroz.options = {
  renderMessage: defaultRenderer,
  includeStack: true,
};
