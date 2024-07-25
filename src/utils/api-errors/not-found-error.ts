import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  status = 404;

  constructor(public error: string = "Route not found") {
    super(error);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
  serializeError() {
    return [{ message: this.error }];
  }
}
