import { type ErrorData } from "./main.ts";

export const defaultRenderer = (template: string, data: ErrorData) => {
  return template.replaceAll(/%\w+/g, (match) => {
    const d = data[match.slice(1)];

    if (d === undefined) {
      return "undefined";
    }

    if (d === null) {
      return "null";
    }

    return d.toString();
  });
};
