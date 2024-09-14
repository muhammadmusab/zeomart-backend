import { CustomError } from "./custom-error";

export class ServerError extends CustomError {
  status = 500;
  constructor(public error?: string) {
    super(error??"There was some problem in the server.");
    Object.setPrototypeOf(this,ServerError.prototype);
  }
  serializeError() {
    return [{ message: this.error??"There was some problem in the server." }];
  }
}
