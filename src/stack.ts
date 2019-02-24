const stackPattern = /\n\w*at.+\r?\n/;

export const cleanupStack = (stack: string): string => stack.replace(stackPattern, "\n");
