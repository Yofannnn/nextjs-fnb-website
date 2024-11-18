interface History {
  id: string;
  name: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  address: string;
  password: string;
  role?: "user" | "admin";
}
