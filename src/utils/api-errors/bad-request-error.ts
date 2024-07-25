import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  status = 400;
  constructor(public error: string) {
    super(error);
    Object.setPrototypeOf(this,BadRequestError.prototype);
  }
  serializeError() {
    return [{ message: this.error }];
  }
}
