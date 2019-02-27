import dashify from "dashify";
import {cleanupStack} from "./stack";
import {deriveStatusFromStatusCode, statusIsDerivableFromStatusCode, JSendResponse, JSendStatus} from "./jSend";
import constants from "./constants";

type TemplateFunction<MetaData = unknown> = (data: MetaData) => string;

export interface DefineErrorOptions<MetaData = unknown> {
    name: string;
    message: string | TemplateFunction<MetaData>;
    code?: string;
    status?: JSendStatus;
    statusCode?: number;
}

const validateOptions = (options: unknown): DefineErrorOptions => {
    if (!options) {
        throw new TypeError("Missing options for defineError()");
    }

    const {name, message, status, statusCode} = options as DefineErrorOptions;

    if (name === undefined) {
        throw new TypeError("Missing \"name\" property in defineError() options");
    }

    if (message === undefined) {
        throw new TypeError("Missing \"message\" property in defineError() options");
    }

    if (status === undefined && statusCode !== undefined && statusIsDerivableFromStatusCode(statusCode) === false) {
        throw new TypeError(`Cannot derive status from status code ${statusCode}. When the status code is not 2xx, 4xx or 5xx, you need to specify an explicit status like "success", "fail" or "error".`);
    }

    return options as DefineErrorOptions;
};

// Type checkers need to take any type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isCustomError = (anything: any): anything is JSendResponse =>
    Boolean(anything) &&
    typeof anything.status === "string" &&
    typeof anything.code === "string" &&
    typeof anything.message === "string" &&
    typeof anything.data === "object";

export interface CustomErrorClass<MetaData = unknown> {
    new (data: MetaData): CustomError<MetaData>;
    matches(anything: unknown): anything is JSendResponse<MetaData>;
}

export interface CustomError<MetaData = unknown> extends Error, JSendResponse<MetaData> {
    statusCode: number;
    toJSON: () => JSendResponse<MetaData>;
}

export const defineError = <MetaData = unknown>(options: DefineErrorOptions<MetaData>): CustomErrorClass<MetaData> => {
    const validatedOptions = validateOptions(options);
    const {name, message} = validatedOptions;
    const {code = dashify(name), statusCode = constants.DEFAULT_STATUS_CODE} = validatedOptions;
    const {status = deriveStatusFromStatusCode(statusCode)} = validatedOptions;

    class CustomErrorClass extends Error implements CustomError<MetaData> {
        name = name;
        code = code;
        statusCode = statusCode;
        status = status;

        constructor(public data: MetaData) {
            super(typeof message === "string" ? message : message(data));

            if (typeof this.stack === "string") {
                this.stack = cleanupStack(this.stack);
            }
        }

        toJSON = (): JSendResponse<MetaData> => ({
            status: this.status,
            code: this.code,
            message: this.message,
            data: this.data,
        });

        static matches = (anything: unknown): anything is JSendResponse<MetaData> => {
            return isCustomError(anything) &&
                anything.code === code &&
                anything.status === status;
        };
    }

    // Configure the static .name property of the function explicitly
    // https://stackoverflow.com/a/46132163
    Object.defineProperty(CustomErrorClass, "name", {value: name});

    return CustomErrorClass;
};
