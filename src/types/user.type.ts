interface History {
  id: string;
  name: string;
}

export interface User {
  name: string;
  email: string;
  address: string;
  password: string;
  role?: "user" | "admin";
}
