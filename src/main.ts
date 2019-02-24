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

export type CustomErrorClass<MetaData = unknown> = new (data: MetaData) => CustomError<MetaData>;

export interface CustomError<MetaData = unknown> extends Error {
    code: string;
    statusCode: number;
    data: MetaData;
    toJSON: () => JSendResponse<MetaData>;
}

export const defineError = <MetaData = unknown>(options: DefineErrorOptions<MetaData>): CustomErrorClass<MetaData> => {
    const {name, message, code, status, statusCode} = validateOptions(options);

    return class extends Error implements CustomError<MetaData> {
        name = name;
        code = code === undefined ? dashify(name) : code;
        statusCode = statusCode === undefined ?
            constants.DEFAULT_STATUS_CODE :
            statusCode;

        constructor(public data: MetaData) {
            super(typeof message === "string" ? message : message(data));

            if (typeof this.stack === "string") {
                this.stack = cleanupStack(this.stack);
            }
        }

        toJSON = (): JSendResponse<MetaData> => ({
            status: status === undefined ? deriveStatusFromStatusCode(this.statusCode) : status,
            code: this.code,
            message: this.message,
            data: this.data,
        });
    };
};
