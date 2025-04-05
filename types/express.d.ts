// Define a separate interface to avoid circular references
interface UserData {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName?: string | null;
  provider?: string | null;
  googleId?: string | null;
  facebookId?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

declare global {
  namespace Express {
    interface User extends UserData {}
  }
}