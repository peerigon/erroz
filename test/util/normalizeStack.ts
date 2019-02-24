import {resolve} from "path";

type Replacer = Parameters<typeof String.prototype.replace>[1];

const projectFolder = resolve(__dirname, "..", "..");
const removeProjectFolderFromMatch: Replacer = (
    match: string,
    path: string,
    lineAndColumn: string
): string =>
    ` (${path.slice(projectFolder.length) + lineAndColumn})`;
const normalizeStack = (
    stack: string
): string =>
    stack.replace(/ \((.+)(:\d+:\d+)\)/gi, removeProjectFolderFromMatch);

export default normalizeStack;
