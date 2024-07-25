export abstract class CustomError extends Error {
    abstract status: number;
    constructor(message:string) {
      super(message);
      // In TS whenever we extend a built in class we have to use this line
      Object.setPrototypeOf(this, CustomError.prototype);
    }
    abstract serializeError(): { message: string,field?:string,path?:string }[];
  }
  