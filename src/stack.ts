const stackPattern = /\s*at.+\r?\n/;

export const cleanupStack = (stack: string): string => stack.replace(stackPattern, "\n");
