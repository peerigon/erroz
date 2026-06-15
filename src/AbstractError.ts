export class AbstractError extends Error {
  name = "AbstractError";
  stack?: string | undefined;

  constructor(message?: string) {
    super(message);

    const captureStackTrace = (
      Error as ErrorConstructor & {
        captureStackTrace?: (
          targetObject: object,
          constructorOpt?: Function,
        ) => void;
      }
    ).captureStackTrace;

    if (captureStackTrace) {
      captureStackTrace(this, AbstractError);
    }
  }
}
