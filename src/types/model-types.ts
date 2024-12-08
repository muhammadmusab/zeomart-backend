export interface UserData {
  id?: number;
  uuid?:string;
  firstName: string;
  lastName: string;
  phone?: string;
}
export interface VendorData {
  id?: number;
  uuid?: string;
  name: string;
  description?: string;
  phone?: string;
  coverPhoto?: string;
  stripeConnectId?:string;
}

export enum UserType {
  USER = 'user',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}
export interface AuthData{
  email: string;
  password?: string;
  uuid?: string;
  type: UserType; // vendor or user
  verified?: boolean;
  UserId?: number | null;
  VendorId?: number | null;
  authType?: AuthType; // custom, google, facebook
  status?: AuthStatus;
  avatar?: string;
}
export enum AuthStatus {
  ACTIVATION_PENDING = 'activation_pending',
  USER_VERIFIED = 'user_verified',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum AuthType {
  SOCIAL = 'social',
  CUSTOM = 'custom',
}