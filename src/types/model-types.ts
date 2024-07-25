export interface UserData {
  id?: number;
  uuid?:string;
  name: string;
  email: string;
  mobile?: string;
  gender?:string;
  dob?:string;
}
export interface SellerData {
  id?: number;
  storeName: string;
  address: string;
  email: string;
  contact: string;
}

export enum UserType {
  USER = 'user',
  SELLER = 'seller',
  ADMIN = 'admin',
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