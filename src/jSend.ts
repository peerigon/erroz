export enum JSendStatus {
    Success = "success",
    Fail = "fail",
    Error = "error"
}

export interface JSendResponse<MetaData> {
    status: JSendStatus;
    code: string;
    message: string;
    data: MetaData;
}

export const isSuccessStatus = (
    httpStatusCode: number,
): boolean =>
    httpStatusCode >= 200 && httpStatusCode < 300;

export const isFailStatus = (
    httpStatusCode: number,
): boolean =>
    httpStatusCode >= 400 && httpStatusCode < 500;

export const isErrorStatus = (
    httpStatusCode: number,
): boolean =>
    httpStatusCode >= 500 && httpStatusCode < 600;

export const statusIsDerivableFromStatusCode = (
    statusCode: number
): boolean =>
    isSuccessStatus(statusCode) || isFailStatus(statusCode) || isErrorStatus(statusCode);

export const deriveStatusFromStatusCode = (
    httpStatusCode: number,
): JSendStatus =>
    isSuccessStatus(httpStatusCode) ?
        JSendStatus.Success :
        isFailStatus(httpStatusCode) ?
            JSendStatus.Fail :
            JSendStatus.Error;
