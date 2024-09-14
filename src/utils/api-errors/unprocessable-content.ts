import { CustomError } from "./custom-error";

export class UnprocessableError extends CustomError {
  status = 422;
  constructor(public error: string) {
    super(error);
    Object.setPrototypeOf(this,UnprocessableError.prototype);
  }
  serializeError() {
    return [{ message: this.error }];
  }
}
