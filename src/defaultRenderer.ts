import { ErrorData } from "./main";

export const defaultRenderer = (template: string, data: ErrorData) => {
  return template.replace(/%\w+/g, (match) => {
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
