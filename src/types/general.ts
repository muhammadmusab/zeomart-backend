import { UserData, UserType, VendorData } from "./model-types";

export interface IAuthAttrs {
  id?: number;
  email: string;
  password: string;
  verified: boolean;
  User?: UserData;
  Vendor?: VendorData;
}

export interface IAuthModel extends IAuthAttrs {
  verified: boolean;
  type: UserType;
}

export interface CustomError extends Error {
  status?: number;
}

declare global {
  namespace Express {
    export interface Request {
      user: IAuthModel;
      formattedFiles?: string[];
      header: object;
      userType: any;
    }
  }
}
export interface MyToken {
  email?: string;
  type?: any;
}

export function verifyDecodedToken(
  data: unknown,
  field = "email"
): asserts data is MyToken {
  if (!(data instanceof Object))
    throw new Error("Decoded token error. Token must be an object");

  if (!(field in data))
    throw new Error(`Decoded token error. Missing required field "${field}"`);

  // other necessary checks
}

export interface AnyObj {
  [key: string]: any;
}

export enum ADRESSTYPE {
  BILLING = "billing",
  shipping = "shipping",
}
