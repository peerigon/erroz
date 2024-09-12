export class AbstractError extends Error {
  name = "AbstractError";
  stack?: string | undefined;

  constructor(message?: string) {
    super(message);

    Error.captureStackTrace(this, AbstractError);
  }
}
