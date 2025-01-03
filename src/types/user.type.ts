export interface User {
  _id: string;
  name: string;
  email: string;
  address: string;
  password: string;
  role?: UserRole;
}

export enum UserRole {
  Member = "member",
  Admin = "admin",
  Guest = "guest",
}

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
}
