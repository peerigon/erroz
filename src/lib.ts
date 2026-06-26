import { type Status } from "./main.ts";

export const deriveStatusFromStatusCode = (statusCode: number): Status => {
  if (statusCode >= 200 && statusCode < 300) {
    return "success";
  } else if (statusCode >= 400 && statusCode < 500) {
    return "fail";
  } else if (statusCode >= 500 && statusCode <= 599) {
    return "error";
  }

  throw new Error("JSend only supports 2xx, 4xx and 5xx as status code");
};
