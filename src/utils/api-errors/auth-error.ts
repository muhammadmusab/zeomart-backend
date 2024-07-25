import { CustomError } from "./custom-error";

export class AuthError extends CustomError {
  status = 401;
  reason = "Unauthorized";

  constructor(error?: string) {
    super("Unauthorized");
    if (error) {
      this.reason = error;
    }
    Object.setPrototypeOf(this, AuthError.prototype);
  }
  serializeError() {
    return [{ message: this.reason }];
  }
}
