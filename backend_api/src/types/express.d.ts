export type AuthenticatedUser = {
  userId: string;
  email: string;
  role: "admin" | "manager" | "learner";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
