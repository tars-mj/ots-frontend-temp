import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }
  interface Session {
    user: User;
  }
}
