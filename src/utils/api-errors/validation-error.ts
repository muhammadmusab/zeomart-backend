import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
  status = 400;
  constructor(
    public errors: { message: string; field?: string; path?: string }[]
  ) {
    super("Invalid request parameters");

    // In TS whenever we extend a built in class we have to use this line
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  serializeError() {
    return this.errors;
  }
}
